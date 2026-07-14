/**
 * WHY THIS FILE EXISTS
 * -------------------
 * First-time flow after sign-up. The user creates their first Clerk Organization
 * (which becomes the workspace) and we redirect to the dashboard. This page is the
 * ONLY place we call `useOrganizationList().createOrganization` — a deliberately
 * narrow write scope so onboarding is a self-contained surface that's easy to reason
 * about and test.
 */
"use client";

import { useOrganizationList, useUser } from "@clerk/nextjs";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { AuthCardShell } from "@/components/auth/auth-card-shell";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "@/hooks/use-toast";
import { Loader2 } from "lucide-react";

export default function OnboardingPage() {
  const router = useRouter();
  const { user } = useUser();
  const { createOrganization, isLoaded } = useOrganizationList();
  const [orgName, setOrgName] = useState(user?.firstName ?? "");
  const [loading, setLoading] = useState(false);

  async function handleCreate(e: React.FormEvent) {
    e.preventDefault();
    if (!isLoaded || !createOrganization || !orgName.trim()) return;

    setLoading(true);
    try {
      await createOrganization({ name: orgName.trim() });
      toast({
        title: "Workspace created",
        description: "Welcome to SupportIQ! Setting up your dashboard…",
        variant: "success",
      });
      // Redirect to dashboard; Clerk will set the new org as active.
      router.push("/dashboard");
    } catch (err) {
      console.error(err);
      toast({
        title: "Could not create workspace",
        description: "Something went wrong. Please try again.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  }

  return (
    <AuthCardShell
      title="Create your workspace"
      subtitle="This is your team's home on SupportIQ. You can rename it later."
    >
      <form onSubmit={handleCreate} className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="orgName">Workspace name</Label>
          <Input
            id="orgName"
            placeholder="Acme Inc."
            value={orgName}
            onChange={(e) => setOrgName(e.target.value)}
            required
            autoFocus
          />
        </div>

        <Button
          type="submit"
          className="w-full"
          size="lg"
          disabled={loading || !isLoaded || !orgName.trim()}
        >
          {loading ? (
            <>
              <Loader2 className="animate-spin" />
              Creating…
            </>
          ) : (
            "Continue to Dashboard →"
          )}
        </Button>
      </form>
    </AuthCardShell>
  );
}
