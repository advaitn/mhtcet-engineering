import Link from "next/link";
import { ArrowRight, Lightbulb, Zap, TrendingUp, Database } from "lucide-react";

import { AppFrame } from "@/components/app-frame";
import { ButtonLink } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { POPULAR_COURSES } from "@/lib/constants";

export default async function HomePage() {
  const features = [
    {
      icon: Zap,
      title: "Instant Search",
      description:
        "Find eligible engineering colleges instantly by entering your MHT-CET percentile, gender, category, and home state across 2 years of data.",
    },
    {
      icon: TrendingUp,
      title: "Smart Rankings",
      description:
        "View top engineering institutes by course and seat type—accurate cutoff analysis for informed decisions.",
    },
    {
      icon: Database,
      title: "Real-time Data",
      description:
        "Built on 1M+ admission records with pre-calculated cutoff statistics for lightning-fast performance.",
    },
  ];

  return (
    <AppFrame>
      <PageHero />

      <section className="mx-auto max-w-6xl px-4 sm:px-6">
        <div className="grid gap-6 md:grid-cols-3">
          {features.map((feature, index) => (
            <Card
              key={feature.title}
              className="animate-fade-up border-0 shadow-sm hover:shadow-md transition-shadow"
              style={{ animationDelay: `${index * 80}ms` }}
            >
              <CardContent className="space-y-4 p-6">
                <div className="inline-flex h-12 w-12 items-center justify-center rounded-lg bg-accent-soft text-accent">
                  <feature.icon className="h-6 w-6" />
                </div>
                <div className="space-y-2">
                  <h3 className="text-base font-semibold text-foreground">{feature.title}</h3>
                  <p className="text-sm leading-6 text-muted-foreground">
                    {feature.description}
                  </p>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </section>
    </AppFrame>
  );
}

function PageHero() {
  return (
    <section className="mx-auto max-w-6xl px-4 pb-16 pt-10 sm:px-6 sm:pb-20 sm:pt-14">
      <div className="animate-fade-up space-y-8">
        <div className="space-y-4">
          <Badge variant="accent" className="gap-1.5 px-3.5 py-1.5 text-xs font-medium">
            <Lightbulb className="h-3.5 w-3.5" />
            Engineering Admission Intelligence Platform
          </Badge>

          <div className="space-y-6">
            <h1 className="text-5xl font-bold tracking-tight text-foreground sm:text-6xl lg:text-7xl leading-tight">
              Find your ideal engineering college with confidence
            </h1>
            <p className="max-w-2xl text-xl leading-8 text-muted-foreground">
              Access 2 years of real MHT-CET First Year Engineering admission data. Compare institutes by percentile, gender, category, and home state to make informed decisions.
            </p>
          </div>

          <div className="flex flex-wrap gap-3 pt-4">
            <ButtonLink href="/finder" size="lg">
              Search Colleges
              <ArrowRight className="h-4 w-4" />
            </ButtonLink>
            <ButtonLink href="/rankings" variant="secondary" size="lg">
              View Rankings
            </ButtonLink>
          </div>

          <div className="pt-8">
            <p className="text-sm font-medium text-muted-foreground mb-3">Popular Courses:</p>
            <div className="flex flex-wrap gap-2">
              {POPULAR_COURSES.map((course) => (
                <Link
                  key={course.code}
                  href={`/finder?course=${encodeURIComponent(course.code)}`}
                  className="px-3 py-1.5 text-sm rounded-md bg-muted hover:bg-accent-soft hover:text-accent transition-colors"
                >
                  {course.label}
                </Link>
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
