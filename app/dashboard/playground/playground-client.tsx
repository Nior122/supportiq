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
      <Card>
        <CardContent className="flex flex-col items-center justify-center py-16 text-center">
          <Bot className="h-12 w-12 text-muted-foreground" />
          <h3 className="mt-4 text-lg font-semibold">No bots to test</h3>
          <p className="mt-1 text-sm text-muted-foreground">
            Create a bot first, then come back to the playground.
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="grid gap-6 lg:grid-cols-4">
      {/* Bot info panel */}
      <div className="space-y-4 lg:col-span-1">
        {/* Bot selector */}
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Select Bot</CardTitle>
          </CardHeader>
          <CardContent>
            <Select value={selectedBotId} onValueChange={setSelectedBotId}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {bots.map((bot) => (
                  <SelectItem key={bot.publicId} value={bot.publicId}>
                    {bot.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </CardContent>
        </Card>

        {/* Bot details */}
        {selectedBot && (
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Bot Info</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-sm text-muted-foreground">Status</span>
                <Badge
                  variant={
                    selectedBot.status === "ACTIVE"
                      ? "success"
                      : selectedBot.status === "PAUSED"
                        ? "warning"
                        : "secondary"
                  }
                >
                  {selectedBot.status.toLowerCase()}
                </Badge>
              </div>

              <div className="flex items-center justify-between">
                <span className="flex items-center gap-1 text-sm text-muted-foreground">
                  <Cpu className="h-3 w-3" />
                  Provider
                </span>
                <span className="text-sm font-medium">
                  {selectedBot.modelProvider}
                </span>
              </div>

              <div className="flex items-center justify-between">
                <span className="text-sm text-muted-foreground">Model</span>
                <span className="text-sm font-medium">
                  {selectedBot.modelId}
                </span>
              </div>

              <div className="flex items-center justify-between">
                <span className="flex items-center gap-1 text-sm text-muted-foreground">
                  <Thermometer className="h-3 w-3" />
                  Temperature
                </span>
                <span className="text-sm font-medium">
                  {selectedBot.temperature}
                </span>
              </div>

              {selectedBot.persona && (
                <div className="flex items-center justify-between">
                  <span className="text-sm text-muted-foreground">Persona</span>
                  <span className="max-w-[120px] truncate text-sm font-medium">
                    {selectedBot.persona}
                  </span>
                </div>
              )}

              <div className="rounded-lg bg-muted/50 p-3">
                <p className="flex items-center gap-1 text-xs text-muted-foreground">
                  <Info className="h-3 w-3" />
                  This bot is running in playground mode. Responses may use
                  knowledge base data if documents are uploaded.
                </p>
              </div>
            </CardContent>
          </Card>
        )}
      </div>

      {/* Chat area */}
      <div className="lg:col-span-3">
        <Card className="h-[calc(100dvh-220px)]">
          <CardContent className="h-full p-0">
            {selectedBot && (
              <ChatWidget
                key={selectedBot.publicId}
                botPublicId={selectedBot.publicId}
                greeting={
                  selectedBot.greeting ??
                  `Hi! I'm ${selectedBot.name}. How can I help you today?`
                }
              />
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
