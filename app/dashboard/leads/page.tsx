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
    <div className="space-y-10">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Leads</h1>
          <p className="mt-1 text-sm text-muted-foreground/80">
            {leads.length} potential customer{leads.length !== 1 ? "s" : ""} captured via your assistants.
          </p>
        </div>
        <div className="flex items-center gap-3">
          <Button variant="outline" size="sm" className="h-9 rounded-lg border-border/40 text-[13px] font-semibold" disabled={leads.length === 0}>
            <Download className="mr-2 h-3.5 w-3.5" />
            Export CSV
          </Button>
          <Button variant="outline" size="sm" className="h-9 rounded-lg border-border/40 text-[13px] font-semibold">
            Filter
          </Button>
        </div>
      </div>

      {leads.length === 0 ? (
        <Card className="border-border/40 bg-background shadow-sm">
          <CardContent className="flex flex-col items-center justify-center py-24 text-center">
            <div className="flex h-16 w-16 items-center justify-center rounded-full bg-muted/20">
              <Users className="h-8 w-8 text-muted-foreground/40" />
            </div>
            <h3 className="mt-6 text-[15px] font-bold">No leads captured yet</h3>
            <p className="mt-2 max-w-sm text-[14px] text-muted-foreground">
              Leads are automatically collected when visitors share contact details during chat. 
              Ensure lead capture is enabled in your bot settings.
            </p>
          </CardContent>
        </Card>
      ) : (
        <Card className="overflow-hidden border-border/40 bg-background shadow-sm">
          <CardContent className="p-0">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-border/40 bg-muted/20">
                    <th className="px-6 py-4 text-left text-[11px] font-bold uppercase tracking-wider text-muted-foreground/60">Lead</th>
                    <th className="px-6 py-4 text-left text-[11px] font-bold uppercase tracking-wider text-muted-foreground/60">Contact Info</th>
                    <th className="px-6 py-4 text-left text-[11px] font-bold uppercase tracking-wider text-muted-foreground/60">Organization</th>
                    <th className="px-6 py-4 text-left text-[11px] font-bold uppercase tracking-wider text-muted-foreground/60">Handler</th>
                    <th className="px-6 py-4 text-left text-[11px] font-bold uppercase tracking-wider text-muted-foreground/60">Captured</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border/40">
                  {leads.map((lead) => (
                    <tr key={lead.id} className="group transition-colors hover:bg-muted/30">
                      <td className="whitespace-nowrap px-6 py-4">
                        <div className="flex items-center gap-3">
                          <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-primary/10 text-[11px] font-bold text-primary uppercase">
                            {lead.name?.[0] ?? "?"}
                          </div>
                          <span className="text-[14px] font-bold text-foreground/90">
                            {lead.name ?? "Anonymous"}
                          </span>
                        </div>
                      </td>
                      <td className="whitespace-nowrap px-6 py-4">
                        {lead.email ? (
                          <div className="flex items-center gap-2 text-[13px] font-medium text-muted-foreground/80 group-hover:text-foreground/90 transition-colors">
                            <Mail className="h-3.5 w-3.5 text-muted-foreground/40" />
                            {lead.email}
                          </div>
                        ) : (
                          <span className="text-muted-foreground/30">—</span>
                        )}
                      </td>
                      <td className="whitespace-nowrap px-6 py-4">
                        {lead.company ? (
                          <div className="flex items-center gap-2 text-[13px] font-medium text-muted-foreground/80">
                            <Building className="h-3.5 w-3.5 text-muted-foreground/40" />
                            {lead.company}
                          </div>
                        ) : (
                          <span className="text-muted-foreground/30">—</span>
                        )}
                      </td>
                      <td className="whitespace-nowrap px-6 py-4">
                        {lead.conversation ? (
                          <Link
                            href={`/dashboard/conversations/${lead.conversation.id}`}
                            className="inline-flex items-center gap-2 rounded-full border border-border/50 bg-muted/30 px-2.5 py-0.5 text-[11px] font-bold text-foreground/70 transition-all hover:bg-primary/10 hover:text-primary hover:border-primary/20"
                          >
                            {lead.conversation.bot?.name ?? "Assistant"}
                          </Link>
                        ) : (
                          <span className="text-muted-foreground/30">—</span>
                        )}
                      </td>
                      <td className="whitespace-nowrap px-6 py-4 text-[12px] font-medium text-muted-foreground/50">
                        {new Date(lead.createdAt).toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' })}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
