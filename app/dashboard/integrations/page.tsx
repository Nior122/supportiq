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
 */
import { requireSession } from "@/lib/auth/session";
import { prisma } from "@/lib/prisma";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Webhook, Key, ExternalLink } from "lucide-react";

export default async function IntegrationsPage() {
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

  if (!workspace) return null;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Integrations</h1>
        <p className="text-muted-foreground">
          Connect SupportIQ with your existing tools and workflows.
        </p>
      </div>

      {/* API Keys */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <div>
            <CardTitle className="flex items-center gap-2 text-base">
              <Key className="h-4 w-4" />
              API Keys
            </CardTitle>
            <CardDescription>
              Use API keys to access the SupportIQ API programmatically.
            </CardDescription>
          </div>
          <Button size="sm">Generate Key</Button>
        </CardHeader>
        <CardContent>
          {workspace.apiKeys.length === 0 ? (
            <p className="py-4 text-sm text-muted-foreground">
              No API keys yet. Generate one to get started.
            </p>
          ) : (
            <div className="space-y-2">
              {workspace.apiKeys.map((key) => (
                <div
                  key={key.id}
                  className="flex items-center justify-between rounded-lg border p-3"
                >
                  <div className="flex items-center gap-3">
                    <code className="text-sm">{key.keyPrefix}••••••••</code>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-xs text-muted-foreground">
                      Created {new Date(key.createdAt).toLocaleDateString()}
                    </span>
                    <Button variant="ghost" size="sm">
                      Revoke
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Webhooks */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <div>
            <CardTitle className="flex items-center gap-2 text-base">
              <Webhook className="h-4 w-4" />
              Webhooks
            </CardTitle>
            <CardDescription>
              Send real-time events to your backend when conversations happen.
            </CardDescription>
          </div>
          <Button size="sm">Add Webhook</Button>
        </CardHeader>
        <CardContent>
          {workspace.webhooks.length === 0 ? (
            <div className="py-8 text-center">
              <Webhook className="mx-auto h-8 w-8 text-muted-foreground" />
              <p className="mt-2 text-sm text-muted-foreground">
                No webhooks configured.
              </p>
              <p className="text-xs text-muted-foreground">
                Add a webhook to receive events like new conversations, messages, and lead captures.
              </p>
            </div>
          ) : (
            <div className="space-y-2">
              {workspace.webhooks.map((wh) => (
                <div
                  key={wh.id}
                  className="flex items-center justify-between rounded-lg border p-3"
                >
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-2">
                      <code className="text-sm break-all">{wh.url}</code>
                      <ExternalLink className="h-3 w-3 text-muted-foreground" />
                    </div>
                    <div className="mt-1 flex flex-wrap gap-1">
                      {wh.events.map((event) => (
                        <Badge key={event} variant="secondary" className="text-xs">
                          {event}
                        </Badge>
                      ))}
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <Badge variant={wh.active ? "success" : "secondary"}>
                      {wh.active ? "Active" : "Inactive"}
                    </Badge>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Third-party integrations */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base">Third-Party Integrations</CardTitle>
          <CardDescription>
            Connect with popular platforms and services.
          </CardDescription>
        </CardHeader>
        <CardContent>
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
