/**
 * WHY THIS FILE EXISTS
 * -------------------
 * Client-side knowledge base management components. Handles:
 *  - Document list with live status (fetches from server action on mount + after mutations)
 *  - File upload (PDF, TXT, CSV)
 *  - Website URL submission
 *  - FAQ entry creation
 *  - Document deletion
 *
 * Separated from the server page component so interactive elements (state, event
 * handlers, effects) don't conflict with the server component boundary.
 */
"use client";

import { useState, useCallback, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "@/hooks/use-toast";
import {
  uploadDocumentAction,
  addWebsiteAction,
  addFaqAction,
  deleteDocumentAction,
  listDocumentsAction,
} from "./actions";
import {
  Upload,
  Globe,
  HelpCircle,
  Trash2,
  FileText,
  Loader2,
  CheckCircle2,
  XCircle,
} from "lucide-react";

const statusIcons: Record<string, React.ReactNode> = {
  PENDING: <Loader2 className="h-4 w-4 animate-spin text-muted-foreground" />,
  PROCESSING: <Loader2 className="h-4 w-4 animate-spin text-primary" />,
  READY: <CheckCircle2 className="h-4 w-4 text-success" />,
  FAILED: <XCircle className="h-4 w-4 text-destructive" />,
};

const statusLabels: Record<string, string> = {
  PENDING: "Queued",
  PROCESSING: "Processing",
  READY: "Ready",
  FAILED: "Failed",
};

export function KnowledgeBaseContent({
  botPublicId,
}: {
  botPublicId: string;
}) {
  const [refreshKey, setRefreshKey] = useState(0);

  const refresh = useCallback(() => setRefreshKey((k) => k + 1), []);

  return (
    <div className="grid gap-6 lg:grid-cols-3">
      {/* Main content area — document list */}
      <div className="lg:col-span-2">
        <DocumentList botPublicId={botPublicId} refreshKey={refreshKey} />
      </div>

      {/* Sidebar — upload tools */}
      <div className="space-y-4">
        <FileUploadCard botPublicId={botPublicId} onUploaded={refresh} />
        <WebsiteUrlCard botPublicId={botPublicId} onAdded={refresh} />
        <FaqCard botPublicId={botPublicId} />
      </div>
    </div>
  );
}

/* ─── Document List ─── */

interface DocItem {
  id: string;
  title: string;
  type: string;
  status: string;
  progress: number;
  chunkCount: number | null;
  createdAt: string;
}

function DocumentList({
  botPublicId,
  refreshKey,
}: {
  botPublicId: string;
  refreshKey: number;
}) {
  const [documents, setDocuments] = useState<DocItem[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchDocs = useCallback(async () => {
    setLoading(true);
    try {
      const result = await listDocumentsAction(botPublicId);
      if (result.ok && result.data) {
        setDocuments(
          result.data.map((d) => ({
            ...d,
            createdAt:
              d.createdAt instanceof Date
                ? d.createdAt.toISOString()
                : String(d.createdAt),
          }))
        );
      }
    } catch {
      // Silently fail — list is best-effort
    } finally {
      setLoading(false);
    }
  }, [botPublicId]);

  useEffect(() => {
    fetchDocs();
  }, [fetchDocs, refreshKey]);

  async function handleDelete(docId: string) {
    const result = await deleteDocumentAction(docId);
    if (result.ok) {
      toast({ title: "Document deleted", variant: "success" });
      fetchDocs();
    } else {
      toast({
        title: "Failed to delete",
        description: result.error,
        variant: "destructive",
      });
    }
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-base">Documents</CardTitle>
      </CardHeader>
      <CardContent>
        {loading ? (
          <div className="flex items-center justify-center py-8">
            <Loader2 className="h-5 w-5 animate-spin text-muted-foreground" />
          </div>
        ) : documents.length === 0 ? (
          <div className="py-8 text-center text-sm text-muted-foreground">
            No documents yet. Upload a file or add a website to get started.
          </div>
        ) : (
          <div className="space-y-2">
            {documents.map((doc) => (
              <div
                key={doc.id}
                className="flex items-center gap-3 rounded-lg border p-3"
              >
                {statusIcons[doc.status] ?? statusIcons.PENDING}
                <div className="min-w-0 flex-1">
                  <p className="truncate text-sm font-medium">{doc.title}</p>
                  <p className="text-xs text-muted-foreground">
                    {doc.type} · {doc.chunkCount ?? 0} chunks ·{" "}
                    {statusLabels[doc.status] ?? doc.status}
                    {doc.status === "PROCESSING" && ` (${doc.progress}%)`}
                  </p>
                </div>
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-8 w-8 text-muted-foreground hover:text-destructive"
                  onClick={() => handleDelete(doc.id)}
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
}

/* ─── File Upload Card ─── */

function FileUploadCard({
  botPublicId,
  onUploaded,
}: {
  botPublicId: string;
  onUploaded: () => void;
}) {
  const [uploading, setUploading] = useState(false);

  async function handleUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploading(true);
    const formData = new FormData();
    formData.set("file", file);

    try {
      const result = await uploadDocumentAction(botPublicId, formData);
      if (result.ok) {
        toast({
          title: "Document uploaded",
          description: `"${file.name}" is being processed.`,
          variant: "success",
        });
        onUploaded();
      } else {
        toast({
          title: "Upload failed",
          description: result.error,
          variant: "destructive",
        });
      }
    } catch {
      toast({
        title: "Upload failed",
        description: "An unexpected error occurred.",
        variant: "destructive",
      });
    } finally {
      setUploading(false);
      e.target.value = "";
    }
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-base">
          <Upload className="h-4 w-4" />
          Upload File
        </CardTitle>
      </CardHeader>
      <CardContent>
        <p className="mb-3 text-xs text-muted-foreground">
          PDF, TXT, or CSV up to 20MB
        </p>
        <label>
          <input
            type="file"
            accept=".pdf,.txt,.csv,.md"
            onChange={handleUpload}
            disabled={uploading}
            className="hidden"
          />
          <Button
            variant="outline"
            className="w-full"
            disabled={uploading}
            asChild
          >
            <span className="cursor-pointer">
              {uploading ? (
                <>
                  <Loader2 className="animate-spin" />
                  Uploading…
                </>
              ) : (
                <>
                  <FileText className="mr-2 h-4 w-4" />
                  Choose File
                </>
              )}
            </span>
          </Button>
        </label>
      </CardContent>
    </Card>
  );
}

/* ─── Website URL Card ─── */

function WebsiteUrlCard({
  botPublicId,
  onAdded,
}: {
  botPublicId: string;
  onAdded: () => void;
}) {
  const [url, setUrl] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!url.trim()) return;

    setLoading(true);
    try {
      const result = await addWebsiteAction(botPublicId, url);
      if (result.ok) {
        toast({
          title: "Website added",
          description: "The page is being crawled and processed.",
          variant: "success",
        });
        setUrl("");
        onAdded();
      } else {
        toast({
          title: "Failed to add website",
          description: result.error,
          variant: "destructive",
        });
      }
    } finally {
      setLoading(false);
    }
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-base">
          <Globe className="h-4 w-4" />
          Add Website
        </CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-3">
          <Input
            placeholder="https://example.com/docs"
            value={url}
            onChange={(e) => setUrl(e.target.value)}
            disabled={loading}
          />
          <Button
            type="submit"
            variant="outline"
            className="w-full"
            disabled={loading || !url.trim()}
          >
            {loading ? (
              <>
                <Loader2 className="animate-spin" />
                Adding…
              </>
            ) : (
              "Add URL"
            )}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}

/* ─── FAQ Card ─── */

function FaqCard({ botPublicId }: { botPublicId: string }) {
  const [question, setQuestion] = useState("");
  const [answer, setAnswer] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!question.trim() || !answer.trim()) return;

    setLoading(true);
    try {
      const result = await addFaqAction(botPublicId, question, answer);
      if (result.ok) {
        toast({
          title: "FAQ added",
          variant: "success",
        });
        setQuestion("");
        setAnswer("");
      } else {
        toast({
          title: "Failed to add FAQ",
          description: result.error,
          variant: "destructive",
        });
      }
    } finally {
      setLoading(false);
    }
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-base">
          <HelpCircle className="h-4 w-4" />
          Add FAQ
        </CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-3">
          <div className="space-y-1">
            <Label htmlFor="faq-q" className="text-xs">
              Question
            </Label>
            <Input
              id="faq-q"
              placeholder="What is your return policy?"
              value={question}
              onChange={(e) => setQuestion(e.target.value)}
              disabled={loading}
            />
          </div>
          <div className="space-y-1">
            <Label htmlFor="faq-a" className="text-xs">
              Answer
            </Label>
            <Textarea
              id="faq-a"
              placeholder="We accept returns within 30 days..."
              value={answer}
              onChange={(e) => setAnswer(e.target.value)}
              rows={3}
              disabled={loading}
            />
          </div>
          <Button
            type="submit"
            variant="outline"
            className="w-full"
            disabled={loading || !question.trim() || !answer.trim()}
          >
            {loading ? (
              <>
                <Loader2 className="animate-spin" />
                Adding…
              </>
            ) : (
              "Add FAQ"
            )}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}
