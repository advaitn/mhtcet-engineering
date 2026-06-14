import type { InstituteMatch } from "@/types/engineering";

function escapeCsv(value: string | number): string {
  const text = String(value);
  if (/[",\n]/.test(text)) {
    return `"${text.replace(/"/g, '""')}"`;
  }
  return text;
}

export function instituteMatchesToCsv(matches: InstituteMatch[]): string {
  const headers = [
    "Institute",
    "Course",
    "Match",
    "Chance %",
    "Trend",
    "Avg Median %",
    "2024 Chance %",
    "2024 Median %",
    "2024 Cohort Size",
    "2025 Chance %",
    "2025 Median %",
    "2025 Cohort Size",
  ];

  const rows = matches.map((match) => {
    const byYear = Object.fromEntries(match.years.map((y) => [y.year, y]));

    return [
      match.instituteName,
      match.courseName,
      match.matchLabel,
      match.chancePercent.toFixed(2),
      match.trend,
      match.avgMedian > 0 ? match.avgMedian.toFixed(2) : "",
      byYear[2024]?.hasData ? byYear[2024].yearProb?.toFixed(2) : "",
      byYear[2024]?.hasData ? byYear[2024].median.toFixed(2) : "",
      byYear[2024]?.hasData ? byYear[2024].waitlistCount : "",
      byYear[2025]?.hasData ? byYear[2025].yearProb?.toFixed(2) : "",
      byYear[2025]?.hasData ? byYear[2025].median.toFixed(2) : "",
      byYear[2025]?.hasData ? byYear[2025].waitlistCount : "",
    ];
  });

  return [headers, ...rows]
    .map((row) => row.map((cell) => escapeCsv(cell as string | number)).join(","))
    .join("\n");
}

export function downloadCsv(filename: string, content: string): void {
  const blob = new Blob([content], { type: "text/csv;charset=utf-8;" });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = filename;
  link.click();
  URL.revokeObjectURL(url);
}

export function rankedInstitutesToCsv(
  rows: Array<{
    instituteName: string;
    courseName: string;
    year: number;
    cutoff: number;
    median: number;
    top: number;
    waitlistCount: number;
  }>,
): string {
  const headers = [
    "Rank",
    "Institute",
    "Course",
    "Year",
    "Median %",
    "Cutoff %",
    "Top %",
    "Waitlist Count",
  ];

  const data = rows.map((row, index) => [
    index + 1,
    row.instituteName,
    row.courseName,
    row.year || "2-yr avg",
    row.median.toFixed(2),
    row.cutoff.toFixed(2),
    row.top.toFixed(2),
    row.waitlistCount,
  ]);

  return [headers, ...data]
    .map((row) => row.map((cell) => escapeCsv(cell as string | number)).join(","))
    .join("\n");
}
