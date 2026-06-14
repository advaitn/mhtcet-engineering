// Common seat types in MHT-CET engineering admissions
export const SEAT_TYPES = [
  "GOPENS", // General Open (any gender)
  "LOPENS", // Ladies Open (female)
  "GSCS", // General SC
  "LSCS", // Ladies SC
  "GSTS", // General ST
  "LSTS", // Ladies ST
  "GOBCS", // General OBC
  "LOBCS", // Ladies OBC
  "GNT1S", // General NT1
  "LNT1S", // Ladies NT1
  "GNT2S", // General NT2
  "LNT2S", // Ladies NT2
  "GNT3S", // General NT3
  "LNT3S", // Ladies NT3
  "GVJDTS", // General VJ/DT
  "LVJDTS", // Ladies VJ/DT
  "TFWS", // Tuition Fee Waiver Scheme
  "EWS", // Economically Weaker Section
  "DEFOPENS", // Defense Open
  "DEFOBCS", // Defense OBC
  "DEFSCS", // Defense SC
  "DEFSTS", // Defense ST
] as const;

export type SeatType = (typeof SEAT_TYPES)[number];

export const CATEGORIES = ["OPEN", "SC", "ST", "OBC", "NT1", "NT2", "NT3", "VJDT", "EWS"] as const;
export type Category = (typeof CATEGORIES)[number];

export const CATEGORY_LABELS: Record<Category, string> = {
  OPEN: "Open",
  SC: "SC (Scheduled Caste)",
  ST: "ST (Scheduled Tribe)",
  OBC: "OBC (Other Backward Class)",
  NT1: "NT-B (Nomadic Tribe - B)",
  NT2: "NT-C (Nomadic Tribe - C)",
  NT3: "NT-D (Nomadic Tribe - D)",
  VJDT: "VJ/DT (Vimukta Jati / Denotified Tribes)",
  EWS: "EWS (Economically Weaker Section)",
};

export const GENDERS = ["M", "F"] as const;
export type Gender = (typeof GENDERS)[number];

export const HOME_STATES = ["MS", "OMS"] as const; // Maharashtra / Outside Maharashtra
export type HomeState = (typeof HOME_STATES)[number];

// Popular engineering courses for the landing page
export const POPULAR_COURSES = [
  { code: "Computer Engineering", label: "Computer Engineering" },
  { code: "Information Technology", label: "Information Technology" },
  { code: "Electronics and Telecommunication Engineering", label: "Electronics & Telecom" },
  { code: "Mechanical Engineering", label: "Mechanical Engineering" },
  { code: "Civil Engineering", label: "Civil Engineering" },
  { code: "Electrical Engineering", label: "Electrical Engineering" },
];
