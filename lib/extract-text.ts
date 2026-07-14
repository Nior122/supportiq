/**
 * WHY THIS FILE EXISTS
 * -------------------
 * Text extraction from various source formats for the RAG ingestion pipeline.
 * Each function returns clean, readable text that can be chunked and embedded.
 *
 * PDF: Uses pdf-parse to extract real text (not raw binary UTF-8).
 * URLs: Fetches HTML, strips scripts/styles/nav/footer/ads via cheerio.
 * TXT/CSV/Markdown: Passthrough — just decode the buffer.
 *
 * Cheerio v1+ is ESM-only; Next.js handles the CJS/ESM interop at compile time
 * in server components and server actions, so `import * as cheerio from "cheerio"`
 * works in this server-side code. (Don't import this file from a client component.)
 */
// Import pdf-parse/lib/pdf-parse.js directly to bypass pdf-parse's index.js
// which contains test code (Fs.readFileSync('./test/data/...')) that runs when
// module.parent is undefined — the case in webpack/serverless (Vercel) bundles,
// causing ENOENT crashes on upload.
// eslint-disable-next-line @typescript-eslint/no-require-imports
const pdfParse = require("pdf-parse/lib/pdf-parse.js") as (
  buffer: Buffer,
) => Promise<{ text: string }>;
import * as cheerio from "cheerio";

/** Maximum content length returned by fetchUrlText (chars). Safety cap. */
const MAX_URL_CONTENT = 500_000;

/**
 * Extract text from a PDF buffer.
 * Returns the full extracted text with pages separated by form-feeds (\f).
 */
export async function extractPdfText(buffer: Buffer): Promise<string> {
  const result = await pdfParse(buffer);
  // pdf-parse adds \f between pages — preserve for chunk page detection.
  return result.text ?? "";
}

/**
 * Extract readable text from a URL by fetching its HTML and cleaning it with cheerio.
 * Strips non-content elements (nav, footer, scripts, forms, etc.) and returns
 * the visible text as clean paragraphs.
 */
export async function fetchUrlText(url: string): Promise<{ text: string; title: string }> {
  const res = await fetch(url, {
    headers: {
      "User-Agent": "SupportIQ-Bot/1.0 (https://supportiq.dev; crawler)",
      Accept: "text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8",
    },
    signal: AbortSignal.timeout(30_000),
  });

  if (!res.ok) {
    throw new Error(`Failed to fetch URL: ${res.status} ${res.statusText}`);
  }

  const contentType = res.headers.get("content-type") ?? "";
  if (!contentType.includes("text/html") && !contentType.includes("xhtml")) {
    throw new Error(`URL returned unsupported content type: ${contentType}. Only HTML pages are supported.`);
  }

  const html = await res.text();
  const $ = cheerio.load(html);

  // Remove non-content elements
  $(
    "script, style, noscript, iframe, svg, nav, footer, header, aside, " +
    ".sidebar, .footer, .header, .nav, .menu, .cookie-banner, .popup, " +
    "#cookie, #sidebar, #footer, #header, #nav, #menu",
  ).remove();

  const title = $("title").first().text().trim() || new URL(url).hostname;

  // Extract from <article>, <main>, or fall back to <body>
  let contentEl = $("article").first();
  if (!contentEl.length) contentEl = $("main").first();
  if (!contentEl.length) contentEl = $("body");

  // Clean up whitespace, collapse multiple blank lines
  let text = contentEl
    .text()
    .replace(/\t/g, " ")
    .replace(/[ ]{2,}/g, " ")
    .split("\n")
    .map((line) => line.trim())
    .filter((line) => line.length > 0)
    .join("\n\n");

  // Safety cap
  if (text.length > MAX_URL_CONTENT) {
    text = text.slice(0, MAX_URL_CONTENT);
  }

  return { text, title };
}

/**
 * Extract text from a plain text buffer (TXT, CSV, Markdown).
 * Just decode — no transformation needed.
 */
export async function extractPlainText(buffer: Buffer): Promise<string> {
  return buffer.toString("utf-8");
}
