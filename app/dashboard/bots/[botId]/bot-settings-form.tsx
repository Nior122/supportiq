/**
 * WHY THIS FILE EXISTS
 * -------------------
 * Client component for the bot settings form. Extracted from the server-rendered
 * bot detail page so it can handle form state and server action calls.
 *
 * The form uses `useTransition` for non-blocking submission — the user can still
 * see the page while the update is processing. On success, it shows a toast and
 * the page data refreshes via `router.refresh()`.
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
import { updateBotAction, deleteBotAction } from "../actions";
import type { Bot } from "@prisma/client";

interface BotSettingsFormProps {
  bot: Bot;
}

export function BotSettingsForm({ bot }: BotSettingsFormProps) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();

  const [name, setName] = useState(bot.name);
  const [status, setStatus] = useState(bot.status);
  const [provider, setProvider] = useState(bot.modelProvider);
  const [modelId, setModelId] = useState(bot.modelId);
  const [temperature, setTemperature] = useState(bot.temperature);
  const [greeting, setGreeting] = useState(bot.greeting ?? "");
  const [systemPrompt, setSystemPrompt] = useState(bot.systemPrompt ?? "");
  const [persona, setPersona] = useState(bot.persona ?? "");
  const [language, setLanguage] = useState(bot.language);
  const [rateLimit, setRateLimit] = useState(bot.rateLimitPerMinute);

  const modelProviders = [
    {
      value: "OPENAI",
      label: "OpenAI",
      models: [
        { value: "gpt-4o", label: "GPT-4o" },
        { value: "gpt-4o-mini", label: "GPT-4o Mini" },
      ],
    },
    {
      value: "ANTHROPIC",
      label: "Anthropic",
      models: [
        { value: "claude-sonnet-4-20250514", label: "Claude Sonnet 4" },
        { value: "claude-3-5-haiku-20241022", label: "Claude 3.5 Haiku" },
      ],
    },
    {
      value: "GROQ",
      label: "Groq",
      models: [
        { value: "llama-3.3-70b-versatile", label: "Llama 3.3 70B" },
        { value: "llama-3.1-70b-versatile", label: "Llama 3.1 70B" },
        { value: "llama-3.1-8b-instant", label: "Llama 3.1 8B (fast)" },
      ],
    },
  ];

  const selectedProvider = modelProviders.find((p) => p.value === provider);

  function handleSave() {
    startTransition(async () => {
      const result = await updateBotAction(bot.publicId, {
        name,
        status: status as "ACTIVE" | "PAUSED" | "ARCHIVED",
        modelProvider: provider as "OPENAI" | "ANTHROPIC" | "GROQ",
        modelId,
        temperature,
        greeting: greeting || undefined,
        systemPrompt: systemPrompt || undefined,
        persona: persona || undefined,
        language,
        rateLimitPerMinute: rateLimit,
      });

      if (result.ok) {
        toast({
          title: "Settings saved",
          variant: "success",
        });
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

  function handleDelete() {
    if (
      !confirm(
        `Delete "${bot.name}"? This will permanently remove all conversations, documents, and settings.`,
      )
    ) {
      return;
    }

    startTransition(async () => {
      const result = await deleteBotAction(bot.publicId);

      if (result.ok) {
        toast({
          title: "Bot deleted",
          variant: "success",
        });
        router.push("/dashboard/bots");
      } else {
        toast({
          title: "Failed to delete",
          description: result.error,
          variant: "destructive",
        });
      }
    });
  }

  return (
    <div className="space-y-6">
      {/* General settings */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base">General</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="name">Bot Name</Label>
              <Input
                id="name"
                value={name}
                onChange={(e) => setName(e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Label>Status</Label>
              <Select
                value={status}
                onValueChange={(val) => setStatus(val as typeof status)}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="ACTIVE">Active</SelectItem>
                  <SelectItem value="PAUSED">Paused</SelectItem>
                  <SelectItem value="ARCHIVED">Archived</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="greeting">Greeting Message</Label>
            <Input
              id="greeting"
              value={greeting}
              onChange={(e) => setGreeting(e.target.value)}
              placeholder="Hi! How can I help you today?"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="persona">Bot Persona</Label>
            <Input
              id="persona"
              value={persona}
              onChange={(e) => setPersona(e.target.value)}
              placeholder="Friendly, professional support agent"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="language">Language</Label>
            <Input
              id="language"
              value={language}
              onChange={(e) => setLanguage(e.target.value)}
              placeholder="en"
            />
          </div>
        </CardContent>
      </Card>

      {/* Model settings */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base">AI Model</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-2">
              <Label>Provider</Label>
              <Select
                value={provider}
                onValueChange={(val) => {
                  setProvider(val as typeof provider);
                  const p = modelProviders.find((mp) => mp.value === val);
                  if (p?.models[0]) setModelId(p.models[0].value);
                }}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {modelProviders.map((mp) => (
                    <SelectItem key={mp.value} value={mp.value}>
                      {mp.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label>Model</Label>
              <Select value={modelId} onValueChange={setModelId}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {selectedProvider?.models.map((m) => (
                    <SelectItem key={m.value} value={m.value}>
                      {m.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-2">
              <Label>Temperature: {temperature}</Label>
              <input
                type="range"
                min="0"
                max="2"
                step="0.1"
                value={temperature}
                onChange={(e) => setTemperature(parseFloat(e.target.value))}
                className="w-full"
              />
              <p className="text-xs text-muted-foreground">
                Lower = more focused, Higher = more creative
              </p>
            </div>
            <div className="space-y-2">
              <Label htmlFor="rateLimit">Rate Limit (per minute)</Label>
              <Input
                id="rateLimit"
                type="number"
                min="0"
                max="1000"
                value={rateLimit}
                onChange={(e) => setRateLimit(parseInt(e.target.value) || 0)}
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="systemPrompt">System Prompt</Label>
            <Textarea
              id="systemPrompt"
              value={systemPrompt}
              onChange={(e) => setSystemPrompt(e.target.value)}
              rows={4}
              placeholder="You are a helpful support agent..."
            />
          </div>
        </CardContent>
      </Card>

      {/* Actions */}
      <div className="flex items-center justify-between">
        <Button variant="destructive" size="sm" onClick={handleDelete} disabled={isPending}>
          Delete Bot
        </Button>
        <Button onClick={handleSave} disabled={isPending || !name.trim()}>
          {isPending ? (
            <>
              <Loader2 className="animate-spin" />
              Saving…
            </>
          ) : (
            "Save Changes"
          )}
        </Button>
      </div>
    </div>
  );
}
