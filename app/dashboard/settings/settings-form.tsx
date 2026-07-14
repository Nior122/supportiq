/**
 * WHY THIS FILE EXISTS
 * -------------------
 * Client component for the workspace settings form. Handles name editing,
 * slug display, and plan information. Server action for updating the workspace
 * name is called on save.
 */
"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { toast } from "@/hooks/use-toast";
import { Loader2 } from "lucide-react";
import { updateWorkspaceAction } from "./actions";

interface SettingsFormProps {
  workspaceId: string;
  initialName: string;
  slug: string;
  plan: string;
}

export function SettingsForm({
  workspaceId,
  initialName,
  slug,
  plan,
}: SettingsFormProps) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [name, setName] = useState(initialName);

  function handleSave() {
    if (!name.trim() || name === initialName) return;

    startTransition(async () => {
      const result = await updateWorkspaceAction(workspaceId, { name: name.trim() });

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

  return (
    <div className="space-y-4">
      <div className="grid gap-4 sm:grid-cols-2">
        <div className="space-y-2">
          <Label htmlFor="name">Workspace Name</Label>
          <Input
            id="name"
            value={name}
            onChange={(e) => setName(e.target.value)}
          />
        </div>
        <div className="space-y-2">
          <Label>Slug</Label>
          <Input value={slug} disabled />
          <p className="text-xs text-muted-foreground">
            Used in URLs. Cannot be changed.
          </p>
        </div>
      </div>

      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <span className="text-sm text-muted-foreground">Plan:</span>
          <Badge variant={plan === "FREE" ? "secondary" : "default"}>
            {plan}
          </Badge>
        </div>

        <Button
          onClick={handleSave}
          disabled={isPending || !name.trim() || name === initialName}
        >
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
