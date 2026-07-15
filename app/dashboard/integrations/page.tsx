/**
 * WHY THIS FILE EXISTS
 * -------------------
 * Integrations management page. Allows users to:
 *  - View and configure webhook endpoints
 *  - Manage API keys
 *  - View integration status
 *
 * Webhooks are configured here and stored on the workspace via the `webhooks`
 * relation (WebhookConfig model). API keys are managed via the `apiKeys` relation.
 *
 * The interactive parts (Generate Key, Add Webhook, Revoke, Toggle, Delete)
 * are delegated to `IntegrationsClient` — a client component that calls server
 * actions and refreshes the page data via router.refresh().
 */
import { requireSession } from "@/lib/auth/session";
import { prisma } from "@/lib/prisma";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { IntegrationsClient } from "./integrations-client";

export default async function IntegrationsPage() {
  let apiKeys: Array<{ id: string; keyPrefix: string; createdAt: Date }> = [];
  let webhooks: Array<{
    id: string;
    url: string;
    events: string[];
    active: boolean;
    createdAt: Date;
  }> = [];

  try {
    const session = await requireSession();

    const workspace = await prisma.workspace.findUnique({
      where: { id: session.workspaceId! },
      include: {
        apiKeys: {
          where: { revokedAt: null },
          select: {
            id: true,
            keyPrefix: true,
            createdAt: true,
          },
        },
        webhooks: {
          select: {
            id: true,
            url: true,
            events: true,
            active: true,
            createdAt: true,
          },
        },
      },
    });

    if (workspace) {
      apiKeys = workspace.apiKeys;
      webhooks = workspace.webhooks;
    }
  } catch (err) {
    console.error("IntegrationsPage data fetch error:", err);
    // Render with empty data — the interactive buttons still work
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Integrations</h1>
        <p className="text-muted-foreground">
          Connect SupportIQ with your existing tools and workflows.
        </p>
      </div>

      {/* API Keys + Webhooks — interactive client component */}
      <Card>
        <CardContent className="space-y-6 pt-6">
          <IntegrationsClient apiKeys={apiKeys} webhooks={webhooks} />
        </CardContent>
      </Card>

      {/* Third-party integrations */}
      <Card>
        <CardContent className="pt-6">
          <h2 className="text-lg font-semibold mb-4">Third-Party Integrations</h2>
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="rounded-lg border p-4">
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-muted">
                  <span className="text-lg">💬</span>
                </div>
                <div>
                  <p className="font-medium">Slack</p>
                  <p className="text-xs text-muted-foreground">
                    Forward conversations to Slack channels
                  </p>
                </div>
              </div>
              <Button variant="outline" size="sm" className="mt-3 w-full" disabled>
                Coming Soon
              </Button>
            </div>

            <div className="rounded-lg border p-4">
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-muted">
                  <span className="text-lg">📧</span>
                </div>
                <div>
                  <p className="font-medium">Email</p>
                  <p className="text-xs text-muted-foreground">
                    Send conversation summaries via email
                  </p>
                </div>
              </div>
              <Button variant="outline" size="sm" className="mt-3 w-full" disabled>
                Coming Soon
              </Button>
            </div>

            <div className="rounded-lg border p-4">
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-muted">
                  <span className="text-lg">📊</span>
                </div>
                <div>
                  <p className="font-medium">Zapier</p>
                  <p className="text-xs text-muted-foreground">
                    Connect to 5000+ apps via Zapier
                  </p>
                </div>
              </div>
              <Button variant="outline" size="sm" className="mt-3 w-full" disabled>
                Coming Soon
              </Button>
            </div>

            <div className="rounded-lg border p-4">
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-muted">
                  <span className="text-lg">🔄</span>
                </div>
                <div>
                  <p className="font-medium">Make</p>
                  <p className="text-xs text-muted-foreground">
                    Automate workflows with Make
                  </p>
                </div>
              </div>
              <Button variant="outline" size="sm" className="mt-3 w-full" disabled>
                Coming Soon
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
