import { AppFrame } from "@/components/app-frame";
import { PageShell } from "@/components/ui/page-shell";
import { Card, CardContent } from "@/components/ui/card";

export default function RankingsPage() {
  return (
    <AppFrame>
      <PageShell
        title="College Rankings"
        description="Top engineering institutes ranked by cutoff percentiles and seat types"
      >
        <Card>
          <CardContent className="p-8 text-center">
            <p className="text-muted-foreground">
              Rankings page coming soon. Use the finder to search for colleges based on your profile.
            </p>
          </CardContent>
        </Card>
      </PageShell>
    </AppFrame>
  );
}
