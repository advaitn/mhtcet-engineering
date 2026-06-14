import type { Category, Gender, HomeState } from "@/lib/constants";

export type CandidateProfile = {
  percentile: number;
  gender: Gender;
  category: Category;
  homeState: HomeState;
};

/** Probability label derived from admission chances */
export type MatchLabel = "safe" | "good" | "borderline" | "reach" | "unlikely" | "unknown";

/** Trend in admission difficulty over time */
export type Trend = "improving" | "declining" | "stable" | "unknown";

export type YearCutoff = {
  year: number;
  /** Probability of admission based on historical data (0-100) */
  yearProb: number | null;
  /** Median cutoff percentile for this year */
  median: number;
  /** Highest percentile admitted */
  top: number;
  /** Number of admissions in this cohort */
  waitlistCount: number;
  hasData: boolean;
};

export type InstituteMatch = {
  instituteCode: string;
  instituteName: string;
  courseCode: string;
  courseName: string;
  years: YearCutoff[];
  /** Average probability across years (0-100) */
  chancePercent: number;
  matchLabel: MatchLabel;
  trend: Trend;
  avgMedian: number;
  bestMedian: number;
};

export type RankedInstitute = {
  instituteCode: string;
  instituteName: string;
  courseCode: string;
  courseName: string;
  year: number;
  cutoff: number;
  median: number;
  top: number;
  waitlistCount: number;
};
