import { NextResponse } from "next/server";
import { searchInstitutes } from "@/lib/search-queries";
import type { CandidateProfile } from "@/types/engineering";

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);

    const percentile = Number.parseFloat(searchParams.get("percentile") || "0");
    const gender = searchParams.get("gender") as "M" | "F";
    const category = searchParams.get("category");
    const homeState = searchParams.get("homeState") as "MS" | "OMS";

    if (!percentile || !gender || !category || !homeState) {
      return NextResponse.json(
        { error: "Missing required parameters" },
        { status: 400 }
      );
    }

    if (percentile < 0 || percentile > 100) {
      return NextResponse.json(
        { error: "Percentile must be between 0 and 100" },
        { status: 400 }
      );
    }

    const profile: CandidateProfile = {
      percentile,
      gender,
      category: category as any,
      homeState,
    };

    const matches = await searchInstitutes(profile);

    return NextResponse.json({
      count: matches.length,
      matches,
    });
  } catch (error) {
    console.error("Search error:", error);
    return NextResponse.json(
      { error: "Failed to search institutes" },
      { status: 500 }
    );
  }
}
