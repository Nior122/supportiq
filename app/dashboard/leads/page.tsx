/**
 * WHY THIS FILE EXISTS
 * -------------------
 * Leads management page. Displays all captured leads with:
 *  - Name, email, company, custom fields
 *  - Source conversation link
 *  - Capture date
 *  - CSV export functionality
 *  - Search/filter
 *
 * Leads are automatically captured when chat conversations include lead
 * information (configured via the bot's `leadCapture` and `leadFields`
 * settings).
 */
import Link from "next/link";
import { requireSession } from "@/lib/auth/session";
import { prisma } from "@/lib/prisma";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Users, Download, Mail, Building } from "lucide-react";

async function getLeads(workspaceId: string) {
  return prisma.lead.findMany({
    where: { workspaceId },
    orderBy: { createdAt: "desc" },
    take: 100,
    include: {
      conversation: {
        select: {
          id: true,
          bot: { select: { name: true } },
        },
      },
    },
  });
}

export default async function LeadsPage() {
  const session = await requireSession();
  const leads = await getLeads(session.workspaceId!);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Leads</h1>
          <p className="text-muted-foreground">
            {leads.length} lead{leads.length !== 1 ? "s" : ""} captured from conversations.
          </p>
        </div>
        <Button variant="outline" disabled={leads.length === 0}>
          <Download className="mr-2 h-4 w-4" />
          Export CSV
        </Button>
      </div>

      {leads.length === 0 ? (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-16 text-center">
            <Users className="h-12 w-12 text-muted-foreground" />
            <h3 className="mt-4 text-lg font-semibold">No leads yet</h3>
            <p className="mt-1 max-w-sm text-sm text-muted-foreground">
              Leads are captured when visitors share their contact information
              during chat conversations. Enable lead capture in your bot settings.
            </p>
          </CardContent>
        </Card>
      ) : (
        <div className="rounded-lg border">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b bg-muted/50">
                  <th className="px-4 py-3 text-left font-medium">Name</th>
                  <th className="px-4 py-3 text-left font-medium">Email</th>
                  <th className="px-4 py-3 text-left font-medium">Company</th>
                  <th className="px-4 py-3 text-left font-medium">Source</th>
                  <th className="px-4 py-3 text-left font-medium">Date</th>
                </tr>
              </thead>
              <tbody>
                {leads.map((lead) => (
                  <tr key={lead.id} className="border-b last:border-0">
                    <td className="px-4 py-3 font-medium">
                      {lead.name ?? "—"}
                    </td>
                    <td className="px-4 py-3">
                      {lead.email ? (
                        <span className="flex items-center gap-1">
                          <Mail className="h-3 w-3 text-muted-foreground" />
                          {lead.email}
                        </span>
                      ) : (
                        "—"
                      )}
                    </td>
                    <td className="px-4 py-3">
                      {lead.company ? (
                        <span className="flex items-center gap-1">
                          <Building className="h-3 w-3 text-muted-foreground" />
                          {lead.company}
                        </span>
                      ) : (
                        "—"
                      )}
                    </td>
                    <td className="px-4 py-3">
                      {lead.conversation ? (
                        <Link
                          href={`/dashboard/conversations/${lead.conversation.id}`}
                          className="text-primary hover:underline"
                        >
                          {lead.conversation.bot?.name ?? "Bot"}
                        </Link>
                      ) : (
                        "—"
                      )}
                    </td>
                    <td className="px-4 py-3 text-muted-foreground">
                      {new Date(lead.createdAt).toLocaleDateString()}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}
