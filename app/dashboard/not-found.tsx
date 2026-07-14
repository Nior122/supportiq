/**
 * WHY THIS FILE EXISTS
 * -------------------
 * 404 page specific to the dashboard route group. Kept simple — a user who hits
 * a non-existent dashboard URL is likely authenticated, so we offer a "back to
 * dashboard" link rather than the marketing CTA in the root not-found.
 */
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Compass } from "lucide-react";

export default function DashboardNotFound() {
  return (
    <div className="flex min-h-[400px] items-center justify-center p-4">
      <Card className="w-full max-w-md">
        <CardContent className="flex flex-col items-center gap-4 py-8 text-center">
          <div className="flex h-12 w-12 items-center justify-center rounded-full bg-muted">
            <Compass className="h-6 w-6 text-muted-foreground" />
          </div>
          <div>
            <h2 className="text-lg font-semibold">Page Not Found</h2>
            <p className="mt-1 text-sm text-muted-foreground">
              This dashboard page doesn&apos;t exist or you don&apos;t have access.
            </p>
          </div>
          <Button asChild>
            <Link href="/dashboard">Back to Dashboard</Link>
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}
