import { prisma } from "./prisma";

/**
 * Refresh the cutoff_stats materialized view after data import
 */
export async function refreshCutoffStats(): Promise<void> {
  await prisma.$executeRawUnsafe("REFRESH MATERIALIZED VIEW cutoff_stats");
}

/**
 * Initialize the cutoff_stats materialized view (run once after schema setup)
 */
export async function initializeCutoffView(): Promise<void> {
  const sql = `
    CREATE MATERIALIZED VIEW IF NOT EXISTS cutoff_stats AS
    SELECT
      e.cycle_id,
      c.year,
      e.institute_code,
      e.institute_name,
      e.course_code,
      e.course_name,
      e.seat_type,
      COUNT(*) as waitlist_count,
      MIN(e.mht_cet_score) as min_percentile,
      PERCENTILE_CONT(0.5) WITHIN GROUP (ORDER BY e.mht_cet_score) as median_percentile,
      MAX(e.mht_cet_score) as max_percentile
    FROM engineering_entries e
    JOIN admission_cycles c ON e.cycle_id = c.id
    WHERE e.mht_cet_score IS NOT NULL
    GROUP BY 
      e.cycle_id,
      c.year,
      e.institute_code,
      e.institute_name,
      e.course_code,
      e.course_name,
      e.seat_type;

    CREATE INDEX IF NOT EXISTS idx_cutoff_stats_lookup 
      ON cutoff_stats (institute_code, course_code, seat_type, year);

    CREATE INDEX IF NOT EXISTS idx_cutoff_stats_course
      ON cutoff_stats (course_code, seat_type, year);

    CREATE INDEX IF NOT EXISTS idx_cutoff_stats_median
      ON cutoff_stats (seat_type, median_percentile DESC);
  `;

  await prisma.$executeRawUnsafe(sql);
}
