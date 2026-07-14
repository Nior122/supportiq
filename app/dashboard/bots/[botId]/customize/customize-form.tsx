/**
 * WHY THIS FILE EXISTS
 * -------------------
 * Client form for the bot Customize page. Edits the appearance-facing Bot fields:
 * greeting, welcome message, quick replies, avatar/logo URLs, and the `appearance`
 * JSON (primary/accent color, border radius, position, size).
 *
 * Mirrors the patterns in bot-settings-form.tsx: `useTransition` for non-blocking
 * submit, `router.refresh()` after success, toast feedback. Quick replies are
 * edited as a newline-separated textarea and split into a String[] on save.
 */
"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { toast } from "@/hooks/use-toast";
import { Loader2 } from "lucide-react";
import { updateAppearanceAction } from "../../actions";
import type { Bot } from "@prisma/client";

// The shape of the `appearance` JSON on the Bot model. Optional everywhere —
// the column is nullable and partially-populated is fine.
interface Appearance {
  primaryColor?: string;
  accentColor?: string;
  borderRadius?: number;
  position?: "bottom-right" | "bottom-left";
  size?: "small" | "medium" | "large";
}

function parseAppearance(raw: unknown): Appearance {
  if (!raw || typeof raw !== "object") return {};
  const obj = raw as Record<string, unknown>;
  return {
    primaryColor: typeof obj.primaryColor === "string" ? obj.primaryColor : "",
    accentColor: typeof obj.accentColor === "string" ? obj.accentColor : "",
    borderRadius:
      typeof obj.borderRadius === "number" ? obj.borderRadius : undefined,
    position: obj.position === "bottom-left" ? "bottom-left" : "bottom-right",
    size:
      obj.size === "small" || obj.size === "large"
        ? obj.size
        : obj.size === "medium"
          ? "medium"
          : "medium",
  };
}

export function CustomizeForm({ bot }: { bot: Bot }) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();

  const initial = parseAppearance(bot.appearance);

  const [greeting, setGreeting] = useState(bot.greeting ?? "");
  const [welcomeMessage, setWelcomeMessage] = useState(bot.welcomeMessage ?? "");
  const [quickRepliesText, setQuickRepliesText] = useState(
    bot.quickReplies.join("\n"),
  );
  const [avatarUrl, setAvatarUrl] = useState(bot.avatarUrl ?? "");
  const [logoUrl, setLogoUrl] = useState(bot.logoUrl ?? "");
  const [primaryColor, setPrimaryColor] = useState(initial.primaryColor ?? "");
  const [accentColor, setAccentColor] = useState(initial.accentColor ?? "");
  const [borderRadius, setBorderRadius] = useState(
    initial.borderRadius ?? 8,
  );
  const [position, setPosition] = useState<
    "bottom-right" | "bottom-left"
  >(initial.position ?? "bottom-right");
  const [size, setSize] = useState<"small" | "medium" | "large">(
    initial.size ?? "medium",
  );

  function handleSave() {
    startTransition(async () => {
      const quickReplies = quickRepliesText
        .split("\n")
        .map((r) => r.trim())
        .filter(Boolean);

      const result = await updateAppearanceAction(bot.publicId, {
        greeting: greeting || undefined,
        welcomeMessage: welcomeMessage || undefined,
        quickReplies,
        avatarUrl: avatarUrl || "",
        logoUrl: logoUrl || "",
        appearance: {
          primaryColor: primaryColor || undefined,
          accentColor: accentColor || undefined,
          borderRadius,
          position,
          size,
        },
      });

      if (result.ok) {
        toast({ title: "Appearance saved", variant: "success" });
        router.refresh();
      } else {
        toast({
          title: "Failed to save",
          description: result.error,
          variant: "destructive",
        });
      }
    });
  }

  return (
    <div className="space-y-6">
      {/* Conversation messaging */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base">Conversation</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="greeting">Greeting Message</Label>
            <Input
              id="greeting"
              value={greeting}
              onChange={(e) => setGreeting(e.target.value)}
              placeholder="Hi! How can I help you today?"
            />
            <p className="text-xs text-muted-foreground">
              The first message the bot shows when a chat opens.
            </p>
          </div>

          <div className="space-y-2">
            <Label htmlFor="welcomeMessage">Welcome Message</Label>
            <Textarea
              id="welcomeMessage"
              value={welcomeMessage}
              onChange={(e) => setWelcomeMessage(e.target.value)}
              rows={3}
              placeholder="Welcome! Ask me anything about our product."
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="quickReplies">Quick Replies</Label>
            <Textarea
              id="quickReplies"
              value={quickRepliesText}
              onChange={(e) => setQuickRepliesText(e.target.value)}
              rows={4}
              placeholder={"How do I reset my password?\nWhat are your prices?\nTalk to a human"}
            />
            <p className="text-xs text-muted-foreground">
              One reply per line. Shown as clickable buttons in the widget.
            </p>
          </div>
        </CardContent>
      </Card>

      {/* Branding assets */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base">Branding</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="avatarUrl">Avatar URL</Label>
              <Input
                id="avatarUrl"
                value={avatarUrl}
                onChange={(e) => setAvatarUrl(e.target.value)}
                placeholder="https://…/avatar.png"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="logoUrl">Logo URL</Label>
              <Input
                id="logoUrl"
                value={logoUrl}
                onChange={(e) => setLogoUrl(e.target.value)}
                placeholder="https://…/logo.png"
              />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Layout & colors */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base">Layout & Colors</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="primaryColor">Primary Color</Label>
              <div className="flex items-center gap-2">
                <Input
                  id="primaryColor"
                  value={primaryColor}
                  onChange={(e) => setPrimaryColor(e.target.value)}
                  placeholder="#6366f1"
                />
                {primaryColor && (
                  <span
                    className="h-9 w-9 shrink-0 rounded-md border"
                    style={{ backgroundColor: primaryColor }}
                    aria-hidden
                  />
                )}
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="accentColor">Accent Color</Label>
              <div className="flex items-center gap-2">
                <Input
                  id="accentColor"
                  value={accentColor}
                  onChange={(e) => setAccentColor(e.target.value)}
                  placeholder="#ec4899"
                />
                {accentColor && (
                  <span
                    className="h-9 w-9 shrink-0 rounded-md border"
                    style={{ backgroundColor: accentColor }}
                    aria-hidden
                  />
                )}
              </div>
            </div>
          </div>

          <div className="grid gap-4 sm:grid-cols-3">
            <div className="space-y-2">
              <Label htmlFor="borderRadius">Border Radius (px)</Label>
              <Input
                id="borderRadius"
                type="number"
                min={0}
                max={32}
                value={borderRadius}
                onChange={(e) =>
                  setBorderRadius(parseInt(e.target.value) || 0)
                }
              />
            </div>
            <div className="space-y-2">
              <Label>Position</Label>
              <Select
                value={position}
                onValueChange={(v) =>
                  setPosition(v as "bottom-right" | "bottom-left")
                }
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="bottom-right">Bottom Right</SelectItem>
                  <SelectItem value="bottom-left">Bottom Left</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label>Size</Label>
              <Select
                value={size}
                onValueChange={(v) =>
                  setSize(v as "small" | "medium" | "large")
                }
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="small">Small</SelectItem>
                  <SelectItem value="medium">Medium</SelectItem>
                  <SelectItem value="large">Large</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Actions */}
      <div className="flex justify-end">
        <Button onClick={handleSave} disabled={isPending}>
          {isPending ? (
            <>
              <Loader2 className="animate-spin" />
              Saving…
            </>
          ) : (
            "Save Appearance"
          )}
        </Button>
      </div>
    </div>
  );
}
