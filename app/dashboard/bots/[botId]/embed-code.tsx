/**
 * WHY THIS FILE EXISTS
 * -------------------
 * Embed code generator component. Shows the user the script tag they need to
 * paste into their website, with:
 *  - Copy-to-clipboard functionality
 *  - Position selector (bottom-right, bottom-left)
 *  - Theme selector (light, dark, auto)
 *  - A live preview of the embed widget
 *
 * This is a client component because it handles clipboard API, state, and
 * preview rendering.
 */
"use client";

import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { toast } from "@/hooks/use-toast";
import { Copy, Check } from "lucide-react";

interface EmbedCodeProps {
  botPublicId: string;
}

export function EmbedCode({ botPublicId }: EmbedCodeProps) {
  const [position, setPosition] = useState("bottom-right");
  const [theme, setTheme] = useState("light");
  const [copied, setCopied] = useState(false);

  const baseUrl =
    typeof window !== "undefined"
      ? window.location.origin
      : "https://supportiq.app";

  const scriptTag = `<script
  src="${baseUrl}/embed.js"
  data-bot-id="${botPublicId}"
  data-position="${position}"
  data-theme="${theme}"
></script>`;

  async function copyToClipboard() {
    try {
      await navigator.clipboard.writeText(scriptTag);
      setCopied(true);
      toast({
        title: "Copied to clipboard",
        variant: "success",
      });
      setTimeout(() => setCopied(false), 2000);
    } catch {
      toast({
        title: "Failed to copy",
        description: "Please select and copy manually.",
        variant: "destructive",
      });
    }
  }

  return (
    <div className="space-y-4">
      <Card>
        <CardHeader>
          <CardTitle className="text-base">Embed Configuration</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-2">
              <Label>Position</Label>
              <Select value={position} onValueChange={setPosition}>
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
              <Label>Theme</Label>
              <Select value={theme} onValueChange={setTheme}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="light">Light</SelectItem>
                  <SelectItem value="dark">Dark</SelectItem>
                  <SelectItem value="auto">Auto (System)</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="text-base">Your Embed Code</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <p className="text-sm text-muted-foreground">
            Copy this snippet and paste it into your website&apos;s HTML, just before
            the closing <code className="rounded bg-muted px-1 py-0.5 text-xs">&lt;/body&gt;</code> tag.
          </p>

          <div className="relative">
            <pre className="overflow-x-auto rounded-lg bg-muted p-4 text-xs leading-relaxed">
              <code>{scriptTag}</code>
            </pre>
          </div>

          <Button onClick={copyToClipboard} className="w-full">
            {copied ? (
              <>
                <Check className="mr-2 h-4 w-4" />
                Copied!
              </>
            ) : (
              <>
                <Copy className="mr-2 h-4 w-4" />
                Copy to Clipboard
              </>
            )}
          </Button>

          <div className="rounded-lg bg-muted/50 p-3">
            <p className="text-xs text-muted-foreground">
              <strong>Platform-specific instructions:</strong>
            </p>
            <ul className="mt-1 space-y-1 text-xs text-muted-foreground">
              <li>• <strong>WordPress:</strong> Add to Appearance → Theme Editor → footer.php</li>
              <li>• <strong>Shopify:</strong> Add to Online Store → Themes → Edit Code → theme.liquid</li>
              <li>• <strong>Webflow:</strong> Add to Project Settings → Custom Code → Footer Code</li>
              <li>• <strong>Next.js:</strong> Add to app/layout.tsx inside a &lt;Script&gt; component</li>
            </ul>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
