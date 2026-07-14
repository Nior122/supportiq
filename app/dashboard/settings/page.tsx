/**
 * WHY THIS FILE EXISTS
 * -------------------
 * Workspace settings page. Allows workspace owners/admins to:
 *  - Update workspace name
 *  - View workspace ID and plan
 *  - Manage API keys
 *  - Configure webhook integrations
 *  - Danger zone (delete workspace)
 *
 * This is a settings page — not a creative UI. It follows the standard
 * settings layout: sections with clear labels, inline editing, and
 * destructive actions behind confirmation dialogs.
 */
import { requireSession } from "@/lib/auth/session";
import { prisma } from "@/lib/prisma";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { SettingsForm } from "./settings-form";
import { Key, Webhook, AlertTriangle } from "lucide-react";

async function getWorkspace(workspaceId: string) {
  return prisma.workspace.findUnique({
    where: { id: workspaceId },
    include: {
      _count: {
        select: {
          bots: true,
          members: true,
        },
      },
      apiKeys: {
        select: {
          id: true,
          keyPrefix: true,
          createdAt: true,
          revokedAt: true,
        },
      },
      webhooks: {
        select: {
          id: true,
          url: true,
          events: true,
          active: true,
        },
      },
    },
  });
}

export default async function SettingsPage() {
  const session = await requireSession();
  const workspace = await getWorkspace(session.workspaceId!);

  if (!workspace) return null;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Settings</h1>
        <p className="text-muted-foreground">
          Manage your workspace configuration and integrations.
        </p>
      </div>

      {/* General settings */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base">General</CardTitle>
          <CardDescription>Basic workspace information.</CardDescription>
        </CardHeader>
        <CardContent>
          <SettingsForm
            workspaceId={workspace.id}
            initialName={workspace.name}
            slug={workspace.slug}
            plan={workspace.plan}
          />
        </CardContent>
      </Card>

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
                    {key.revokedAt && (
                      <Badge variant="destructive">Revoked</Badge>
                    )}
                  </div>
                  <span className="text-xs text-muted-foreground">
                    Created {new Date(key.createdAt).toLocaleDateString()}
                  </span>
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
            <p className="py-4 text-sm text-muted-foreground">
              No webhooks configured. Add one to receive conversation events.
            </p>
          ) : (
            <div className="space-y-2">
              {workspace.webhooks.map((wh) => (
                <div
                  key={wh.id}
                  className="flex items-center justify-between rounded-lg border p-3"
                >
                  <div className="min-w-0 flex-1">
                    <code className="text-sm break-all">{wh.url}</code>
                    <div className="mt-1 flex gap-1">
                      {wh.events.map((event) => (
                        <Badge key={event} variant="secondary" className="text-xs">
                          {event}
                        </Badge>
                      ))}
                    </div>
                  </div>
                  <Badge variant={wh.active ? "success" : "secondary"}>
                    {wh.active ? "Active" : "Inactive"}
                  </Badge>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Danger zone */}
      <Card className="border-destructive/50">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-base text-destructive">
            <AlertTriangle className="h-4 w-4" />
            Danger Zone
          </CardTitle>
          <CardDescription>
            Irreversible actions. Please be certain.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-between rounded-lg border border-destructive/20 p-4">
            <div>
              <p className="text-sm font-medium">Delete Workspace</p>
              <p className="text-xs text-muted-foreground">
                Permanently delete this workspace and all its data. This cannot
                be undone.
              </p>
            </div>
            <Button variant="destructive" size="sm">
              Delete Workspace
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
