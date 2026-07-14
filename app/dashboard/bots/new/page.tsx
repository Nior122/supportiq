/**
 * WHY THIS FILE EXISTS
 * -------------------
 * "Create new bot" page. A single form that collects the bot's name, model
 * provider, model ID, and optional greeting. On submit, it calls the
 * `createBotAction` server action and redirects to the bot's settings page.
 *
 * The model dropdown options are hardcoded here but could be fetched from an
 * API endpoint in the future. The key UX decision: the user picks a model
 * provider first, which filters the available models. This two-step selection
 * avoids overwhelming new users with a single massive dropdown.
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
import { Loader2, ArrowLeft } from "lucide-react";
import Link from "next/link";
import { createBotAction } from "../actions";

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

export default function NewBotPage() {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();

  const [name, setName] = useState("");
  const [provider, setProvider] = useState("GROQ");
  const [modelId, setModelId] = useState("llama-3.3-70b-versatile");
  const [greeting, setGreeting] = useState("");
  const [systemPrompt, setSystemPrompt] = useState("");

  const selectedProvider = modelProviders.find((p) => p.value === provider);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();

    const formData = new FormData();
    formData.set("name", name);
    formData.set("modelProvider", provider);
    formData.set("modelId", modelId);
    if (greeting) formData.set("greeting", greeting);
    if (systemPrompt) formData.set("systemPrompt", systemPrompt);

    startTransition(async () => {
      const result = await createBotAction(formData);

      if (result.ok) {
        toast({
          title: "Bot created",
          description: `"${name}" is ready to be configured.`,
          variant: "success",
        });
        router.push(`/dashboard/bots/${result.data.publicId}`);
      } else {
        toast({
          title: "Failed to create bot",
          description: result.error,
          variant: "destructive",
        });
      }
    });
  }

  return (
    <div className="mx-auto max-w-2xl space-y-6">
      <div>
        <Button variant="ghost" size="sm" asChild className="mb-2">
          <Link href="/dashboard/bots">
            <ArrowLeft className="mr-1 h-4 w-4" />
            Back to Bots
          </Link>
        </Button>
        <h1 className="text-2xl font-bold tracking-tight">Create New Bot</h1>
        <p className="text-muted-foreground">
          Set up your AI support bot. You can customize it further after creation.
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="text-base">Bot Configuration</CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Bot name */}
            <div className="space-y-2">
              <Label htmlFor="name">Bot Name *</Label>
              <Input
                id="name"
                placeholder="e.g. Support Bot, Sales Assistant"
                value={name}
                onChange={(e) => setName(e.target.value)}
                required
                autoFocus
              />
              <p className="text-xs text-muted-foreground">
                Internal name. Customers won&apos;t see this.
              </p>
            </div>

            {/* Model provider */}
            <div className="space-y-2">
              <Label>AI Provider</Label>
              <Select
                value={provider}
                onValueChange={(val) => {
                  setProvider(val);
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

            {/* Model ID */}
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

            {/* Greeting */}
            <div className="space-y-2">
              <Label htmlFor="greeting">Greeting Message</Label>
              <Input
                id="greeting"
                placeholder="Hi! How can I help you today?"
                value={greeting}
                onChange={(e) => setGreeting(e.target.value)}
              />
              <p className="text-xs text-muted-foreground">
                The first message visitors see when they open the chat.
              </p>
            </div>

            {/* System prompt */}
            <div className="space-y-2">
              <Label htmlFor="systemPrompt">System Prompt</Label>
              <Textarea
                id="systemPrompt"
                placeholder="You are a helpful support agent for Acme Inc..."
                value={systemPrompt}
                onChange={(e) => setSystemPrompt(e.target.value)}
                rows={4}
              />
              <p className="text-xs text-muted-foreground">
                Instructions for how the bot should behave. Leave empty for defaults.
              </p>
            </div>

            {/* Submit */}
            <div className="flex justify-end gap-3">
              <Button type="button" variant="outline" asChild>
                <Link href="/dashboard/bots">Cancel</Link>
              </Button>
              <Button type="submit" disabled={isPending || !name.trim()}>
                {isPending ? (
                  <>
                    <Loader2 className="animate-spin" />
                    Creating…
                  </>
                ) : (
                  "Create Bot"
                )}
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
