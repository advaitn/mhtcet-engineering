"use client";

import { useState, useTransition } from "react";
import { Search, Loader2 } from "lucide-react";

import { AppFrame } from "@/components/app-frame";
import { Button } from "@/components/ui/button";
import { Field, Input, Label, Select } from "@/components/ui/input";
import { Alert, PageShell, PageHeader } from "@/components/ui/page-shell";
import { Card, CardContent } from "@/components/ui/card";
import { CATEGORIES, CATEGORY_LABELS, GENDERS, HOME_STATES } from "@/lib/constants";
import type { InstituteMatch } from "@/types/engineering";

type SearchResponse = {
  count: number;
  matches: InstituteMatch[];
  error?: string;
};

export default function FinderPage() {
  const [percentile, setPercentile] = useState("");
  const [gender, setGender] = useState<"M" | "F">("M");
  const [category, setCategory] = useState("OPEN");
  const [homeState, setHomeState] = useState<"MS" | "OMS">("MS");
  const [results, setResults] = useState<InstituteMatch[] | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  const handleSearch = () => {
    const p = Number.parseFloat(percentile);
    if (!p || p < 0 || p > 100) {
      setError("Please enter a valid percentile between 0 and 100");
      return;
    }

    startTransition(async () => {
      try {
        const params = new URLSearchParams({
          percentile: percentile,
          gender,
          category,
          homeState,
        });

        const response = await fetch(`/api/search?${params}`);
        const data: SearchResponse = await response.json();

        if (data.error) {
          setError(data.error);
          setResults(null);
        } else {
          setResults(data.matches);
          setError(null);
        }
      } catch (err) {
        setError("Failed to search. Please try again.");
        setResults(null);
      }
    });
  };

  return (
    <AppFrame>
      <PageShell>
        <PageHeader
          eyebrow="College Finder"
          title="Find Your Engineering College"
          description="Enter your MHT-CET percentile and profile to find eligible engineering institutes"
        />
        <Card className="mb-8">
          <CardContent className="p-6">
            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
              <Field>
                <Label htmlFor="percentile">MHT-CET Percentile *</Label>
                <Input
                  id="percentile"
                  type="number"
                  min="0"
                  max="100"
                  step="0.01"
                  placeholder="85.50"
                  value={percentile}
                  onChange={(e) => setPercentile(e.target.value)}
                />
              </Field>

              <Field>
                <Label htmlFor="gender">Gender *</Label>
                <Select
                  id="gender"
                  value={gender}
                  onChange={(e) => setGender(e.target.value as "M" | "F")}
                >
                  <option value="M">Male</option>
                  <option value="F">Female</option>
                </Select>
              </Field>

              <Field>
                <Label htmlFor="category">Category *</Label>
                <Select
                  id="category"
                  value={category}
                  onChange={(e) => setCategory(e.target.value)}
                >
                  {CATEGORIES.map((cat) => (
                    <option key={cat} value={cat}>
                      {CATEGORY_LABELS[cat]}
                    </option>
                  ))}
                </Select>
              </Field>

              <Field>
                <Label htmlFor="homeState">Home State *</Label>
                <Select
                  id="homeState"
                  value={homeState}
                  onChange={(e) => setHomeState(e.target.value as "MS" | "OMS")}
                >
                  <option value="MS">Maharashtra</option>
                  <option value="OMS">Outside Maharashtra</option>
                </Select>
              </Field>
            </div>

            <div className="mt-6">
              <Button
                onClick={handleSearch}
                disabled={isPending || !percentile}
                size="lg"
              >
                {isPending ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin" />
                    Searching...
                  </>
                ) : (
                  <>
                    <Search className="h-4 w-4" />
                    Search Colleges
                  </>
                )}
              </Button>
            </div>
          </CardContent>
        </Card>

        {error && <Alert variant="error">{error}</Alert>}

        {results && (
          <div className="space-y-4">
            <p className="text-sm text-muted-foreground">
              Found {results.length} matching institutes
            </p>

            <div className="space-y-3">
              {results.map((match) => (
                <Card key={`${match.instituteCode}-${match.courseCode}`}>
                  <CardContent className="p-4">
                    <h3 className="font-semibold text-base">{match.instituteName}</h3>
                    <p className="text-sm text-muted-foreground">{match.courseName}</p>
                    <div className="mt-2 flex gap-3 text-sm">
                      <span className={`px-2 py-0.5 rounded ${
                        match.matchLabel === "safe" ? "bg-green-100 text-green-800" :
                        match.matchLabel === "good" ? "bg-emerald-100 text-emerald-800" :
                        match.matchLabel === "borderline" ? "bg-amber-100 text-amber-800" :
                        match.matchLabel === "reach" ? "bg-orange-100 text-orange-800" :
                        "bg-red-100 text-red-800"
                      }`}>
                        {match.matchLabel.toUpperCase()}
                      </span>
                      <span className="text-muted-foreground">
                        {match.chancePercent.toFixed(0)}% chance
                      </span>
                      <span className="text-muted-foreground">
                        Avg Median: {match.avgMedian.toFixed(2)}
                      </span>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        )}
      </PageShell>
    </AppFrame>
  );
}
