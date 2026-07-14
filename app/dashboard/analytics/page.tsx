/**
 * WHY THIS FILE EXISTS
 * -------------------
 * Analytics dashboard page. Displays:
 *  - Overview stats (conversations, messages, leads, avg response time) with trends
 *  - Time-series chart (messages and conversations over time)
 *  - Top questions list
 *  - Satisfaction score
 *
 * All data is fetched server-side. Charts would typically use a client-side
 * charting library (Recharts, Chart.js) — we show the data in tabular form
 * here for the initial implementation, with chart placeholders ready for the
 * visual layer.
 */
import { requireSession } from "@/lib/auth/session";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  getAnalyticsOverview,
  getTopQuestions,
  getSatisfactionScores,
} from "@/services/analytics";
import {
  MessageSquare,
  Users,
  BarChart3,
  Clock,
  TrendingUp,
  TrendingDown,
  ThumbsUp,
  ThumbsDown,
  HelpCircle,
} from "lucide-react";

function TrendBadge({ value }: { value: number }) {
  if (value === 0) return <Badge variant="secondary">0%</Badge>;
  return (
    <Badge variant={value > 0 ? "success" : "destructive"} className="text-xs">
      {value > 0 ? <TrendingUp className="mr-1 h-3 w-3" /> : <TrendingDown className="mr-1 h-3 w-3" />}
      {Math.abs(value)}%
    </Badge>
  );
}

export default async function AnalyticsPage() {
  const session = await requireSession();
  const workspaceId = session.workspaceId!;

  // Default to last 30 days
  const to = new Date();
  const from = new Date();
  from.setDate(from.getDate() - 30);

  const [overview, topQuestions, satisfaction] = await Promise.all([
    getAnalyticsOverview(workspaceId, { from, to }),
    getTopQuestions(workspaceId, 10),
    getSatisfactionScores(workspaceId, { from, to }),
  ]);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Analytics</h1>
        <p className="text-muted-foreground">
          Overview of the last 30 days across all bots.
        </p>
      </div>

      {/* Overview cards */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <MessageSquare className="h-4 w-4 text-muted-foreground" />
                <span className="text-sm text-muted-foreground">Conversations</span>
              </div>
              <TrendBadge value={overview.conversationsTrend} />
            </div>
            <p className="mt-2 text-3xl font-bold">{overview.totalConversations.toLocaleString()}</p>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <BarChart3 className="h-4 w-4 text-muted-foreground" />
                <span className="text-sm text-muted-foreground">Messages</span>
              </div>
              <TrendBadge value={overview.messagesTrend} />
            </div>
            <p className="mt-2 text-3xl font-bold">{overview.totalMessages.toLocaleString()}</p>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Users className="h-4 w-4 text-muted-foreground" />
                <span className="text-sm text-muted-foreground">Leads</span>
              </div>
              <TrendBadge value={overview.leadsTrend} />
            </div>
            <p className="mt-2 text-3xl font-bold">{overview.totalLeads.toLocaleString()}</p>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Clock className="h-4 w-4 text-muted-foreground" />
                <span className="text-sm text-muted-foreground">Avg Response</span>
              </div>
            </div>
            <p className="mt-2 text-3xl font-bold">
              {overview.avgResponseMs > 0
                ? `${(overview.avgResponseMs / 1000).toFixed(1)}s`
                : "—"}
            </p>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        {/* Top questions */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-base">
              <HelpCircle className="h-4 w-4" />
              Top Questions
            </CardTitle>
          </CardHeader>
          <CardContent>
            {topQuestions.length === 0 ? (
              <p className="py-6 text-center text-sm text-muted-foreground">
                No questions tracked yet. Data appears after bot conversations.
              </p>
            ) : (
              <div className="space-y-2">
                {topQuestions.map((q, i) => (
                  <div
                    key={q.question}
                    className="flex items-center justify-between rounded-lg border px-3 py-2"
                  >
                    <div className="flex items-center gap-3">
                      <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-muted text-xs font-medium">
                        {i + 1}
                      </span>
                      <span className="text-sm">{q.question}</span>
                    </div>
                    <Badge variant="secondary">{q.count}</Badge>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Satisfaction */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-base">
              Customer Satisfaction
            </CardTitle>
          </CardHeader>
          <CardContent>
            {satisfaction.total === 0 ? (
              <p className="py-6 text-center text-sm text-muted-foreground">
                No feedback collected yet. Ratings appear when visitors use the
                thumbs up/down buttons.
              </p>
            ) : (
              <div className="space-y-4">
                <div className="text-center">
                  <p className="text-5xl font-bold">{satisfaction.score}%</p>
                  <p className="mt-1 text-sm text-muted-foreground">Positive rating</p>
                </div>
                <div className="flex items-center justify-center gap-8">
                  <div className="flex items-center gap-2">
                    <ThumbsUp className="h-5 w-5 text-success" />
                    <span className="text-lg font-semibold">{satisfaction.up}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <ThumbsDown className="h-5 w-5 text-destructive" />
                    <span className="text-lg font-semibold">{satisfaction.down}</span>
                  </div>
                </div>
                {/* Simple bar visualization */}
                <div className="h-3 w-full overflow-hidden rounded-full bg-muted">
                  <div
                    className="h-full bg-success transition-all"
                    style={{ width: `${satisfaction.score}%` }}
                  />
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Chart placeholder */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base">Activity Over Time</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex h-64 items-center justify-center rounded-lg border border-dashed">
            <p className="text-sm text-muted-foreground">
              Interactive chart (Recharts) will be rendered here. Data is available via the analytics service.
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
