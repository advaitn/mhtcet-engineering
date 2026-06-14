import { prisma } from "./prisma";
import { getEligibleSeatTypes } from "./seat-eligibility";
import type { CandidateProfile, InstituteMatch, MatchLabel, Trend, YearCutoff } from "@/types/engineering";

type CutoffRow = {
  cycle_id: string;
  year: number;
  institute_code: string;
  institute_name: string;
  course_code: string;
  course_name: string;
  seat_type: string;
  waitlist_count: bigint;
  min_percentile: number;
  median_percentile: number;
  max_percentile: number;
};

function calculateMatchLabel(chancePercent: number): MatchLabel {
  if (chancePercent >= 80) return "safe";
  if (chancePercent >= 60) return "good";
  if (chancePercent >= 40) return "borderline";
  if (chancePercent >= 20) return "reach";
  if (chancePercent > 0) return "unlikely";
  return "unknown";
}

function calculateTrend(years: YearCutoff[]): Trend {
  const validYears = years.filter((y) => y.hasData).sort((a, b) => a.year - b.year);
  if (validYears.length < 2) return "unknown";

  const first = validYears[0].median;
  const last = validYears[validYears.length - 1].median;
  const diff = last - first;

  // If median is increasing, it's getting harder (declining chances)
  // If median is decreasing, it's getting easier (improving chances)
  if (diff > 2) return "declining"; // Getting harder
  if (diff < -2) return "improving"; // Getting easier
  return "stable";
}

/**
 * Search for institutes matching a candidate's profile
 */
export async function searchInstitutes(
  profile: CandidateProfile
): Promise<InstituteMatch[]> {
  const eligibleSeatTypes = getEligibleSeatTypes(profile.gender, profile.category, profile.homeState);

  // Query cutoff stats for matching seat types
  const cutoffRows = await prisma.$queryRaw<CutoffRow[]>`
    SELECT
      cycle_id,
      year,
      institute_code,
      institute_name,
      course_code,
      course_name,
      seat_type,
      waitlist_count,
      min_percentile,
      median_percentile,
      max_percentile
    FROM cutoff_stats
    WHERE seat_type IN (${eligibleSeatTypes.join(",")})
      AND min_percentile IS NOT NULL
    ORDER BY institute_code, course_code, year
  `;

  // Group by institute + course
  const instituteMap = new Map<string, CutoffRow[]>();
  for (const row of cutoffRows) {
    const key = `${row.institute_code}|${row.course_code}`;
    if (!instituteMap.has(key)) {
      instituteMap.set(key, []);
    }
    instituteMap.get(key)!.push(row);
  }

  // Build matches
  const matches: InstituteMatch[] = [];

  for (const [key, rows] of instituteMap.entries()) {
    if (rows.length === 0) continue;

    const firstRow = rows[0];
    
    // Group by year
    const yearMap = new Map<number, CutoffRow[]>();
    for (const row of rows) {
      if (!yearMap.has(row.year)) {
        yearMap.set(row.year, []);
      }
      yearMap.get(row.year)!.push(row);
    }

    const years: YearCutoff[] = [];
    for (const [year, yearRows] of yearMap.entries()) {
      // Calculate probability: what % of admitted students had percentile <= candidate's percentile
      // Use the best seat type's median for this calculation
      const bestMedian = Math.max(...yearRows.map((r) => r.median_percentile));
      const bestMax = Math.max(...yearRows.map((r) => r.max_percentile));
      
      let yearProb: number | null = null;
      if (profile.percentile >= bestMax) {
        yearProb = 100; // Better than everyone
      } else if (profile.percentile >= bestMedian) {
        yearProb = 50 + ((profile.percentile - bestMedian) / (bestMax - bestMedian)) * 50;
      } else {
        const bestMin = Math.min(...yearRows.map((r) => r.min_percentile));
        if (profile.percentile >= bestMin) {
          yearProb = ((profile.percentile - bestMin) / (bestMedian - bestMin)) * 50;
        } else {
          yearProb = Math.max(5, (profile.percentile / bestMin) * 20); // Small chance below minimum
        }
      }

      years.push({
        year,
        yearProb,
        median: bestMedian,
        top: bestMax,
        waitlistCount: Number(yearRows.reduce((sum, r) => sum + r.waitlist_count, 0n)),
        hasData: true,
      });
    }

    const chancePercent = years.reduce((sum, y) => sum + (y.yearProb || 0), 0) / years.length;
    const avgMedian = years.reduce((sum, y) => sum + y.median, 0) / years.length;
    const bestMedian = Math.max(...years.map((y) => y.median));

    matches.push({
      instituteCode: firstRow.institute_code,
      instituteName: firstRow.institute_name,
      courseCode: firstRow.course_code,
      courseName: firstRow.course_name,
      years,
      chancePercent,
      matchLabel: calculateMatchLabel(chancePercent),
      trend: calculateTrend(years),
      avgMedian,
      bestMedian,
    });
  }

  return matches;
}
