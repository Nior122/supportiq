/**
 * WHY THIS FILE EXISTS
 * -------------------
 * Team management page. Shows workspace members with their roles and provides
 * actions to:
 *  - View current members (synced from Clerk organization memberships)
 *  - Role information display
 *  - Link to Clerk's organization management for invites/role changes
 *
 * Since we use Clerk Organizations for membership management, the actual
 * invite/remove operations happen through Clerk's components. This page
 * provides the SupportIQ-specific view of the team with role badges and
 * activity data.
 */
import { requireSession } from "@/lib/auth/session";
import { prisma } from "@/lib/prisma";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Shield, UserCog } from "lucide-react";

const roleConfig: Record<string, { label: string; variant: "default" | "secondary" | "outline" }> = {
  OWNER: { label: "Owner", variant: "default" },
  ADMIN: { label: "Admin", variant: "secondary" },
  MEMBER: { label: "Member", variant: "outline" },
};

async function getTeamMembers(workspaceId: string) {
  return prisma.user.findMany({
    where: { workspaceId },
    orderBy: { createdAt: "asc" },
  });
}

export default async function TeamPage() {
  const session = await requireSession();
  const members = await getTeamMembers(session.workspaceId!);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Team</h1>
          <p className="text-muted-foreground">
            Manage your workspace members and roles.
          </p>
        </div>
        <Button>
          <UserCog className="mr-2 h-4 w-4" />
          Manage in Clerk
        </Button>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="text-base">Members ({members.length})</CardTitle>
          <CardDescription>
            Members are synced from your Clerk organization. Use the button above
            to invite new members or change roles.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {members.map((member) => {
              const role = roleConfig[member.role] ?? roleConfig.MEMBER!;
              return (
                <div
                  key={member.id}
                  className="flex items-center justify-between rounded-lg border p-3"
                >
                  <div className="flex items-center gap-3">
                    <Avatar className="h-9 w-9">
                      <AvatarFallback>
                        {(member.email ?? "U").slice(0, 2).toUpperCase()}
                      </AvatarFallback>
                    </Avatar>
                    <div>
                      <p className="text-sm font-medium">{member.email ?? "Unknown"}</p>
                      <p className="text-xs text-muted-foreground">
                        Joined {new Date(member.createdAt).toLocaleDateString()}
                      </p>
                    </div>
                  </div>

                  <Badge variant={role.variant}>{role.label}</Badge>
                </div>
              );
            })}
          </div>
        </CardContent>
      </Card>

      {/* Role info */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-base">
            <Shield className="h-4 w-4" />
            Role Permissions
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 sm:grid-cols-3">
            <div className="rounded-lg border p-3">
              <Badge className="mb-2">Owner</Badge>
              <p className="text-xs text-muted-foreground">
                Full access. Can manage billing, delete workspace, and assign
                any role.
              </p>
            </div>
            <div className="rounded-lg border p-3">
              <Badge variant="secondary" className="mb-2">
                Admin
              </Badge>
              <p className="text-xs text-muted-foreground">
                Can manage bots, team members, integrations, and API keys.
                Cannot delete workspace.
              </p>
            </div>
            <div className="rounded-lg border p-3">
              <Badge variant="outline" className="mb-2">
                Member
              </Badge>
              <p className="text-xs text-muted-foreground">
                Can view and interact with bots, conversations, and analytics.
                Cannot change settings.
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
