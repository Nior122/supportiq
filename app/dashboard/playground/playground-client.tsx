/**
 * WHY THIS FILE EXISTS
 * -------------------
 * Client component for the playground page. Manages:
 *  - Bot selection dropdown (when workspace has multiple bots)
 *  - ChatWidget rendering with the selected bot's config
 *  - Bot info panel showing model, temperature, status
 *
 * Separated from the server component so interactive elements don't
 * block the initial server render.
 */
"use client";

import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { ChatWidget } from "@/components/chat/chat-widget";
import { Bot, Thermometer, Cpu, Info } from "lucide-react";
import { cn } from "@/lib/utils";

interface BotData {
  id: string;
  publicId: string;
  name: string;
  status: string;
  modelProvider: string;
  modelId: string;
  temperature: number;
  greeting: string | null;
  persona: string | null;
}

interface PlaygroundClientProps {
  bots: BotData[];
}

export function PlaygroundClient({ bots }: PlaygroundClientProps) {
  const [selectedBotId, setSelectedBotId] = useState(bots[0]?.publicId ?? "");

  const selectedBot = bots.find((b) => b.publicId === selectedBotId);

  if (bots.length === 0) {
    return (
      <Card className="border-border/40 bg-background shadow-sm">
        <CardContent className="flex flex-col items-center justify-center py-24 text-center">
          <div className="flex h-16 w-16 items-center justify-center rounded-full bg-muted/20">
            <Bot className="h-8 w-8 text-muted-foreground/40" />
          </div>
          <h3 className="mt-6 text-[15px] font-bold">No bots to test</h3>
          <p className="mt-2 max-w-sm text-[14px] text-muted-foreground">
            Create an assistant first, then come back to the playground to start testing.
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="grid gap-10 lg:grid-cols-12">
      {/* Bot info panel */}
      <div className="space-y-6 lg:col-span-4">
        {/* Bot selector */}
        <div className="space-y-2">
          <label className="text-[11px] font-bold uppercase tracking-wider text-muted-foreground/60">Active Assistant</label>
          <Select value={selectedBotId} onValueChange={setSelectedBotId}>
            <SelectTrigger className="h-11 rounded-xl border-border/40 bg-background shadow-sm">
              <SelectValue />
            </SelectTrigger>
            <SelectContent className="rounded-xl border-border/40 shadow-elevated">
              {bots.map((bot) => (
                <SelectItem key={bot.publicId} value={bot.publicId} className="rounded-lg">
                  {bot.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {/* Bot details */}
        {selectedBot && (
          <Card className="border-border/40 bg-background shadow-sm overflow-hidden">
            <CardHeader className="bg-muted/10 border-b border-border/40 pb-4">
              <CardTitle className="text-[13px] font-bold uppercase tracking-wider text-foreground/70">Configuration</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4 p-6">
              <div className="flex items-center justify-between">
                <span className="text-[13px] font-medium text-muted-foreground">Status</span>
                <Badge
                  variant="secondary"
                  className={cn(
                    "rounded-full px-2 py-0.5 text-[9px] font-bold uppercase tracking-widest",
                    selectedBot.status === "ACTIVE" ? "bg-success/10 text-success" : "bg-muted text-muted-foreground"
                  )}
                >
                  {selectedBot.status.toLowerCase()}
                </Badge>
              </div>

              <div className="flex items-center justify-between">
                <span className="flex items-center gap-2 text-[13px] font-medium text-muted-foreground">
                  <Cpu className="h-3.5 w-3.5 text-muted-foreground/40" />
                  Provider
                </span>
                <span className="text-[13px] font-bold text-foreground/80">
                  {selectedBot.modelProvider}
                </span>
              </div>

              <div className="flex items-center justify-between">
                <span className="text-[13px] font-medium text-muted-foreground">Model</span>
                <span className="text-[13px] font-bold text-foreground/80">
                  {selectedBot.modelId}
                </span>
              </div>

              <div className="flex items-center justify-between">
                <span className="flex items-center gap-2 text-[13px] font-medium text-muted-foreground">
                  <Thermometer className="h-3.5 w-3.5 text-muted-foreground/40" />
                  Temperature
                </span>
                <span className="text-[13px] font-bold text-foreground/80">
                  {selectedBot.temperature}
                </span>
              </div>

              <div className="rounded-xl border border-border/40 bg-muted/20 p-4">
                <div className="flex gap-2">
                  <Info className="h-4 w-4 shrink-0 text-primary/60" />
                  <p className="text-[12px] leading-relaxed text-muted-foreground/80">
                    Playground responses are grounded in your Knowledge Base context.
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        )}
      </div>

      {/* Chat area */}
      <div className="lg:col-span-8 flex justify-center">
        <div className="w-full max-w-2xl">
          <Card className="h-[700px] overflow-hidden rounded-[32px] border-[8px] border-muted/20 bg-background shadow-elevated">
            <CardContent className="h-full p-0">
              {selectedBot && (
                <ChatWidget
                  key={selectedBot.publicId}
                  botPublicId={selectedBot.publicId}
                  botName={selectedBot.name}
                  greeting={
                    selectedBot.greeting ??
                    `Hi! I'm ${selectedBot.name}. How can I help you today?`
                  }
                />
              )}
            </CardContent>
          </Card>
          <div className="mt-6 flex items-center justify-center gap-2">
             <div className="h-1.5 w-1.5 rounded-full bg-success animate-pulse" />
             <span className="text-[11px] font-bold uppercase tracking-[0.2em] text-muted-foreground/40">Real-time Simulation</span>
          </div>
        </div>
      </div>
    </div>
  );
}
