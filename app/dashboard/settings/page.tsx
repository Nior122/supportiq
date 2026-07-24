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
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { SettingsForm } from "./settings-form";
import { cn } from "@/lib/utils";


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
    <div className="space-y-10">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Settings</h1>
        <p className="mt-1 text-sm text-muted-foreground/80">
          Manage your workspace configuration and developer resources.
        </p>
      </div>

      <div className="flex flex-col gap-10 lg:flex-row lg:items-start">
        {/* Local Nav */}
        <aside className="lg:w-48 shrink-0">
          <nav className="flex flex-col gap-1">
            {["General", "API Keys", "Webhooks", "Billing", "Danger Zone"].map((item) => (
              <a
                key={item}
                href={`#${item.toLowerCase().replace(" ", "-")}`}
                className="rounded-md px-3 py-1.5 text-[13px] font-medium text-muted-foreground transition-colors hover:bg-muted/50 hover:text-foreground"
              >
                {item}
              </a>
            ))}
          </nav>
        </aside>

        {/* Content */}
        <div className="flex-1 max-w-3xl space-y-12">
          {/* General settings */}
          <section id="general" className="scroll-mt-24 space-y-4">
            <div>
              <h2 className="text-[15px] font-bold">General</h2>
              <p className="text-[13px] text-muted-foreground">Basic workspace identity and preferences.</p>
            </div>
            <Card className="border-border/40 bg-background shadow-sm">
              <CardContent className="p-6">
                <SettingsForm
                  workspaceId={workspace.id}
                  initialName={workspace.name}
                  slug={workspace.slug}
                  plan={workspace.plan}
                />
              </CardContent>
            </Card>
          </section>

          {/* API Keys */}
          <section id="api-keys" className="scroll-mt-24 space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-[15px] font-bold">API Keys</h2>
                <p className="text-[13px] text-muted-foreground">Access the SupportIQ API programmatically.</p>
              </div>
              <Button variant="secondary" size="sm" className="h-8 rounded-full px-4 text-xs font-semibold">
                Generate Key
              </Button>
            </div>
            <Card className="border-border/40 bg-background shadow-sm">
              <CardContent className="p-0">
                {workspace.apiKeys.length === 0 ? (
                  <p className="p-8 text-center text-sm text-muted-foreground">
                    No API keys yet.
                  </p>
                ) : (
                  <div className="divide-y divide-border/40">
                    {workspace.apiKeys.map((key) => (
                      <div
                        key={key.id}
                        className="flex items-center justify-between px-6 py-4"
                      >
                        <div className="flex items-center gap-3">
                          <code className="text-xs font-mono bg-muted px-1.5 py-0.5 rounded text-foreground/70">
                            {key.keyPrefix}••••••••
                          </code>
                          {key.revokedAt && (
                            <Badge variant="destructive" className="text-[9px] uppercase tracking-widest">Revoked</Badge>
                          )}
                        </div>
                        <span className="text-[11px] font-medium text-muted-foreground/50">
                          {new Date(key.createdAt).toLocaleDateString()}
                        </span>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </section>

          {/* Webhooks */}
          <section id="webhooks" className="scroll-mt-24 space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-[15px] font-bold">Webhooks</h2>
                <p className="text-[13px] text-muted-foreground">Real-time event synchronization.</p>
              </div>
              <Button variant="secondary" size="sm" className="h-8 rounded-full px-4 text-xs font-semibold">
                Add Webhook
              </Button>
            </div>
            <Card className="border-border/40 bg-background shadow-sm">
              <CardContent className="p-0">
                {workspace.webhooks.length === 0 ? (
                  <p className="p-8 text-center text-sm text-muted-foreground">
                    No webhooks configured.
                  </p>
                ) : (
                  <div className="divide-y divide-border/40">
                    {workspace.webhooks.map((wh) => (
                      <div
                        key={wh.id}
                        className="flex items-center justify-between px-6 py-4"
                      >
                        <div className="min-w-0 flex-1">
                          <code className="text-[12px] font-mono text-foreground/80 break-all">{wh.url}</code>
                          <div className="mt-2 flex gap-1">
                            {wh.events.map((event) => (
                              <Badge key={event} variant="outline" className="text-[9px] font-bold uppercase tracking-wider bg-muted/30">
                                {event}
                              </Badge>
                            ))}
                          </div>
                        </div>
                        <Badge 
                          variant="secondary"
                          className={cn(
                            "ml-4 rounded-full px-2 py-0.5 text-[10px] font-bold uppercase",
                            wh.active ? "bg-success/10 text-success" : "bg-muted text-muted-foreground"
                          )}
                        >
                          {wh.active ? "Active" : "Inactive"}
                        </Badge>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </section>

          {/* Danger zone */}
          <section id="danger-zone" className="scroll-mt-24 space-y-4 pt-12 border-t border-border/40">
            <div>
              <h2 className="text-[15px] font-bold text-destructive">Danger Zone</h2>
              <p className="text-[13px] text-muted-foreground">Irreversible actions that affect your entire workspace.</p>
            </div>
            <div className="flex items-center justify-between rounded-xl border border-destructive/20 bg-destructive/[0.02] p-6">
              <div>
                <p className="text-[14px] font-bold text-foreground">Delete Workspace</p>
                <p className="mt-1 text-[13px] text-muted-foreground">
                  Permanently delete this workspace and all its data. 
                </p>
              </div>
              <Button variant="destructive" size="sm" className="h-9 rounded-lg font-semibold">
                Delete Workspace
              </Button>
            </div>
          </section>
        </div>
      </div>
    </div>
  );
}
