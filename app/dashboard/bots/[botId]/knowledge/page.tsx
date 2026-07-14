/**
 * WHY THIS FILE EXISTS
 * -------------------
 * Knowledge base management page for a specific bot. Server component that
 * renders the client-side KnowledgeBaseContent component.
 */
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { ArrowLeft } from "lucide-react";
import { KnowledgeBaseContent } from "./knowledge-content";

export default async function KnowledgeBasePage({
  params,
}: {
  params: Promise<{ botId: string }>;
}) {
  const { botId } = await params;

  return (
    <div className="space-y-6">
      <div>
        <Button variant="ghost" size="sm" asChild className="mb-2">
          <Link href={`/dashboard/bots/${botId}`}>
            <ArrowLeft className="mr-1 h-4 w-4" />
            Back to Bot
          </Link>
        </Button>
        <h1 className="text-2xl font-bold tracking-tight">Knowledge Base</h1>
        <p className="text-muted-foreground">
          Add documents, websites, and FAQs to train your bot.
        </p>
      </div>

      <KnowledgeBaseContent botPublicId={botId} />
    </div>
  );
}
