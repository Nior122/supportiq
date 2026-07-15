"use client";

/**
 * WHY THIS FILE EXISTS
 * -------------------
 * Interactive client component for the Integrations page. Wraps the server-rendered
 * data with client-side interactivity: dialogs for creating API keys and webhooks,
 * buttons for revoking keys, toggling/deleting webhooks. Uses server actions for
 * all mutations and calls router.refresh() to re-fetch server data after changes.
 */
import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import {
  generateApiKeyAction,
  revokeApiKeyAction,
  createWebhookAction,
  toggleWebhookAction,
  deleteWebhookAction,
} from "./actions";
import { ExternalLink, Trash2, Power } from "lucide-react";

// ── Types matching the server-rendered data ──────────────────────────────────

interface ApiKeyRow {
  id: string;
  keyPrefix: string;
  createdAt: Date;
}

interface WebhookRow {
  id: string;
  url: string;
  events: string[];
  active: boolean;
  createdAt: Date;
}

interface IntegrationsClientProps {
  apiKeys: ApiKeyRow[];
  webhooks: WebhookRow[];
}

// ── Webhook event options ────────────────────────────────────────────────────

const WEBHOOK_EVENT_OPTIONS = [
  { value: "conversation.created", label: "Conversation Created" },
  { value: "conversation.updated", label: "Conversation Updated" },
  { value: "message.created", label: "Message Created" },
  { value: "lead.captured", label: "Lead Captured" },
];

// ── Main Component ───────────────────────────────────────────────────────────

export function IntegrationsClient({
  apiKeys,
  webhooks,
}: IntegrationsClientProps) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();

  // Dialog states
  const [showKeyDialog, setShowKeyDialog] = useState(false);
  const [showWebhookDialog, setShowWebhookDialog] = useState(false);
  const [showKeyReveal, setShowKeyReveal] = useState<string | null>(null);
  const [confirmRevoke, setConfirmRevoke] = useState<string | null>(null);
  const [confirmDeleteWebhook, setConfirmDeleteWebhook] = useState<string | null>(null);

  // Form states
  const [keyName, setKeyName] = useState("");
  const [webhookUrl, setWebhookUrl] = useState("");
  const [webhookEvents, setWebhookEvents] = useState<string[]>([]);
  const [keyError, setKeyError] = useState("");
  const [webhookError, setWebhookError] = useState("");
  const [isGenerating, setIsGenerating] = useState(false);
  const [isCreatingWebhook, setIsCreatingWebhook] = useState(false);

  const refresh = () => startTransition(() => router.refresh());

  // ── API Key Handlers ─────────────────────────────────────────────────────

  async function handleGenerateKey() {
    if (!keyName.trim()) return;
    setIsGenerating(true);
    setKeyError("");

    const fd = new FormData();
    fd.set("name", keyName.trim());

    const result = await generateApiKeyAction(fd);
    setIsGenerating(false);

    if (result.ok) {
      setShowKeyDialog(false);
      setKeyName("");
      // Show the raw key ONCE
      setShowKeyReveal(result.data.rawKey);
      refresh();
    } else {
      setKeyError(result.error);
    }
  }

  async function handleRevokeKey(keyId: string) {
    const result = await revokeApiKeyAction(keyId);
    setConfirmRevoke(null);
    if (result.ok) {
      refresh();
    }
  }

  // ── Webhook Handlers ─────────────────────────────────────────────────────

  async function handleCreateWebhook() {
    if (!webhookUrl.trim() || webhookEvents.length === 0) return;
    setIsCreatingWebhook(true);
    setWebhookError("");

    const fd = new FormData();
    fd.set("url", webhookUrl.trim());
    webhookEvents.forEach((e) => fd.append("events", e));

    const result = await createWebhookAction(fd);
    setIsCreatingWebhook(false);

    if (result.ok) {
      setShowWebhookDialog(false);
      setWebhookUrl("");
      setWebhookEvents([]);
      refresh();
    } else {
      setWebhookError(result.error);
    }
  }

  async function handleToggleWebhook(webhookId: string) {
    await toggleWebhookAction(webhookId);
    refresh();
  }

  async function handleDeleteWebhook(webhookId: string) {
    await deleteWebhookAction(webhookId);
    setConfirmDeleteWebhook(null);
    refresh();
  }

  function toggleEvent(event: string) {
    setWebhookEvents((prev) =>
      prev.includes(event) ? prev.filter((e) => e !== event) : [...prev, event],
    );
  }

  // ── Render ───────────────────────────────────────────────────────────────

  return (
    <>
      {/* ── API Keys Section ──────────────────────────────────────────────── */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="flex items-center gap-2 text-lg font-semibold">
            API Keys
          </h2>
          <p className="text-sm text-muted-foreground">
            Use API keys to access the SupportIQ API programmatically.
          </p>
        </div>
        <Button size="sm" onClick={() => setShowKeyDialog(true)}>
          Generate Key
        </Button>
      </div>

      {apiKeys.length === 0 ? (
        <p className="py-4 text-sm text-muted-foreground">
          No API keys yet. Generate one to get started.
        </p>
      ) : (
        <div className="space-y-2">
          {apiKeys.map((key) => (
            <div
              key={key.id}
              className="flex items-center justify-between rounded-lg border p-3"
            >
              <div className="flex items-center gap-3">
                <code className="text-sm">{key.keyPrefix}••••••••</code>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-xs text-muted-foreground">
                  Created{" "}
                  {new Date(key.createdAt).toLocaleDateString()}
                </span>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setConfirmRevoke(key.id)}
                >
                  Revoke
                </Button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* ── Webhooks Section ──────────────────────────────────────────────── */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="flex items-center gap-2 text-lg font-semibold">
            Webhooks
          </h2>
          <p className="text-sm text-muted-foreground">
            Send real-time events to your backend when conversations happen.
          </p>
        </div>
        <Button size="sm" onClick={() => setShowWebhookDialog(true)}>
          Add Webhook
        </Button>
      </div>

      {webhooks.length === 0 ? (
        <div className="py-8 text-center">
          <p className="text-sm text-muted-foreground">
            No webhooks configured.
          </p>
          <p className="text-xs text-muted-foreground">
            Add a webhook to receive events like new conversations, messages,
            and lead captures.
          </p>
        </div>
      ) : (
        <div className="space-y-2">
          {webhooks.map((wh) => (
            <div
              key={wh.id}
              className="flex items-center justify-between rounded-lg border p-3"
            >
              <div className="min-w-0 flex-1">
                <div className="flex items-center gap-2">
                  <code className="text-sm break-all">{wh.url}</code>
                  <ExternalLink className="h-3 w-3 shrink-0 text-muted-foreground" />
                </div>
                <div className="mt-1 flex flex-wrap gap-1">
                  {wh.events.map((event) => (
                    <Badge
                      key={event}
                      variant="secondary"
                      className="text-xs"
                    >
                      {event}
                    </Badge>
                  ))}
                </div>
              </div>
              <div className="flex items-center gap-2">
                <Badge variant={wh.active ? "success" : "secondary"}>
                  {wh.active ? "Active" : "Inactive"}
                </Badge>
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-7 w-7"
                  onClick={() => handleToggleWebhook(wh.id)}
                  title={wh.active ? "Deactivate" : "Activate"}
                >
                  <Power className="h-3.5 w-3.5" />
                </Button>
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-7 w-7 text-destructive"
                  onClick={() => setConfirmDeleteWebhook(wh.id)}
                  title="Delete"
                >
                  <Trash2 className="h-3.5 w-3.5" />
                </Button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* ── Generate API Key Dialog ───────────────────────────────────────── */}
      <Dialog open={showKeyDialog} onOpenChange={setShowKeyDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Generate API Key</DialogTitle>
            <DialogDescription>
              Give your key a name so you can identify it later. The key will
              only be shown once.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-2">
            <div className="space-y-2">
              <Label htmlFor="key-name">Key Name</Label>
              <Input
                id="key-name"
                placeholder="e.g. Production Server"
                value={keyName}
                onChange={(e) => setKeyName(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter") handleGenerateKey();
                }}
              />
            </div>
            {keyError && (
              <p className="text-sm text-destructive">{keyError}</p>
            )}
          </div>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => {
                setShowKeyDialog(false);
                setKeyName("");
                setKeyError("");
              }}
            >
              Cancel
            </Button>
            <Button
              onClick={handleGenerateKey}
              disabled={!keyName.trim() || isGenerating}
            >
              {isGenerating ? "Generating…" : "Generate Key"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* ── Key Reveal Dialog (shown ONCE after generation) ───────────────── */}
      <Dialog
        open={showKeyReveal !== null}
        onOpenChange={() => setShowKeyReveal(null)}
      >
        <DialogContent>
          <DialogHeader>
            <DialogTitle>API Key Generated</DialogTitle>
            <DialogDescription>
              Copy your API key now. It will not be shown again.
            </DialogDescription>
          </DialogHeader>
          <div className="rounded-lg border bg-muted p-3">
            <code className="break-all text-sm">{showKeyReveal}</code>
          </div>
          <div className="flex justify-end">
            <Button
              onClick={() => {
                if (showKeyReveal) navigator.clipboard.writeText(showKeyReveal);
                setShowKeyReveal(null);
              }}
            >
              Copy & Close
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* ── Confirm Revoke Dialog ─────────────────────────────────────────── */}
      <Dialog
        open={confirmRevoke !== null}
        onOpenChange={() => setConfirmRevoke(null)}
      >
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Revoke API Key?</DialogTitle>
            <DialogDescription>
              This action cannot be undone. Any applications using this key
              will immediately lose access.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setConfirmRevoke(null)}
            >
              Cancel
            </Button>
            <Button
              variant="destructive"
              onClick={() => confirmRevoke && handleRevokeKey(confirmRevoke)}
            >
              Revoke Key
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* ── Create Webhook Dialog ─────────────────────────────────────────── */}
      <Dialog open={showWebhookDialog} onOpenChange={setShowWebhookDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Add Webhook</DialogTitle>
            <DialogDescription>
              Receive real-time events when conversations happen. Each payload
              is signed with HMAC-SHA256.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-2">
            <div className="space-y-2">
              <Label htmlFor="webhook-url">Endpoint URL</Label>
              <Input
                id="webhook-url"
                placeholder="https://your-server.com/webhook"
                value={webhookUrl}
                onChange={(e) => setWebhookUrl(e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Label>Events</Label>
              <div className="grid grid-cols-2 gap-2">
                {WEBHOOK_EVENT_OPTIONS.map((opt) => (
                  <label
                    key={opt.value}
                    className="flex items-center gap-2 rounded-lg border p-2 text-sm cursor-pointer hover:bg-muted/50"
                  >
                    <input
                      type="checkbox"
                      checked={webhookEvents.includes(opt.value)}
                      onChange={() => toggleEvent(opt.value)}
                      className="rounded"
                    />
                    {opt.label}
                  </label>
                ))}
              </div>
            </div>
            {webhookError && (
              <p className="text-sm text-destructive">{webhookError}</p>
            )}
          </div>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => {
                setShowWebhookDialog(false);
                setWebhookUrl("");
                setWebhookEvents([]);
                setWebhookError("");
              }}
            >
              Cancel
            </Button>
            <Button
              onClick={handleCreateWebhook}
              disabled={
                !webhookUrl.trim() ||
                webhookEvents.length === 0 ||
                isCreatingWebhook
              }
            >
              {isCreatingWebhook ? "Creating…" : "Add Webhook"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* ── Confirm Delete Webhook Dialog ─────────────────────────────────── */}
      <Dialog
        open={confirmDeleteWebhook !== null}
        onOpenChange={() => setConfirmDeleteWebhook(null)}
      >
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Delete Webhook?</DialogTitle>
            <DialogDescription>
              This will permanently remove the webhook endpoint. You can add
              it again later.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setConfirmDeleteWebhook(null)}
            >
              Cancel
            </Button>
            <Button
              variant="destructive"
              onClick={() =>
                confirmDeleteWebhook &&
                handleDeleteWebhook(confirmDeleteWebhook)
              }
            >
              Delete Webhook
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
