import type { Category, Gender, HomeState, SeatType } from "./constants";

/**
 * Determine which seat types a candidate is eligible for based on their profile.
 * 
 * Seat type naming convention:
 * - G prefix = General (any gender, but typically male in practice)
 * - L prefix = Ladies (female only)
 * - Suffix = Category (OPENS, SCS, OBCS, etc.)
 * 
 * Examples:
 * - GOPENS = General Open
 * - LOPENS = Ladies Open
 * - GSCS = General SC
 * - TFWS = Tuition Fee Waiver Scheme (all candidates eligible)
 */
export function getEligibleSeatTypes(
  gender: Gender,
  category: Category,
  homeState: HomeState
): SeatType[] {
  const seatTypes: SeatType[] = [];

  // All candidates can compete for general seats of their gender
  if (gender === "F") {
    seatTypes.push("LOPENS"); // Ladies always get L seats
  }
  seatTypes.push("GOPENS"); // General open is available to all

  // Category-specific seats
  if (category === "SC") {
    if (gender === "F") seatTypes.push("LSCS");
    seatTypes.push("GSCS");
  } else if (category === "ST") {
    if (gender === "F") seatTypes.push("LSTS");
    seatTypes.push("GSTS");
  } else if (category === "OBC") {
    if (gender === "F") seatTypes.push("LOBCS");
    seatTypes.push("GOBCS");
  } else if (category === "NT1") {
    if (gender === "F") seatTypes.push("LNT1S");
    seatTypes.push("GNT1S");
  } else if (category === "NT2") {
    if (gender === "F") seatTypes.push("LNT2S");
    seatTypes.push("GNT2S");
  } else if (category === "NT3") {
    if (gender === "F") seatTypes.push("LNT3S");
    seatTypes.push("GNT3S");
  } else if (category === "VJDT") {
    if (gender === "F") seatTypes.push("LVJDTS");
    seatTypes.push("GVJDTS");
  } else if (category === "EWS") {
    seatTypes.push("EWS");
  }

  // TFWS is available to all Maharashtra state candidates
  if (homeState === "MS") {
    seatTypes.push("TFWS");
  }

  return seatTypes;
}

/**
 * Get a human-readable description of a seat type
 */
export function getSeatTypeLabel(seatType: SeatType): string {
  const labels: Record<SeatType, string> = {
    GOPENS: "General Open",
    LOPENS: "Ladies Open",
    GSCS: "General SC",
    LSCS: "Ladies SC",
    GSTS: "General ST",
    LSTS: "Ladies ST",
    GOBCS: "General OBC",
    LOBCS: "Ladies OBC",
    GNT1S: "General NT-B",
    LNT1S: "Ladies NT-B",
    GNT2S: "General NT-C",
    LNT2S: "Ladies NT-C",
    GNT3S: "General NT-D",
    LNT3S: "Ladies NT-D",
    GVJDTS: "General VJ/DT",
    LVJDTS: "Ladies VJ/DT",
    TFWS: "TFWS",
    EWS: "EWS",
    DEFOPENS: "Defense Open",
    DEFOBCS: "Defense OBC",
    DEFSCS: "Defense SC",
    DEFSTS: "Defense ST",
  };

  return labels[seatType] || seatType;
}
