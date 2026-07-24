/**
 * WHY THIS FILE EXISTS
 * -------------------
 * JSON-LD structured data component for the landing page. Embeds schema.org
 * structured data (SoftwareApplication + Organization + FAQPage) that search
 * engines use to generate rich results. This improves how SupportIQ appears
 * in Google search results — showing ratings, pricing, and FAQ snippets.
 */
import { publicEnv } from "@/lib/env-client";

interface JsonLdProps {
  type: "landing" | "pricing" | "faq";
}

export function JsonLd({ type }: JsonLdProps) {
  const APP_URL = publicEnv.APP_URL;

  const softwareApplication = {
    "@context": "https://schema.org",
    "@type": "SoftwareApplication",
    name: "SupportIQ",
    applicationCategory: "BusinessApplication",
    applicationSubCategory: "Customer Support Software",
    operatingSystem: "Web",
    offers: [
      {
        "@type": "Offer",
        name: "Free",
        price: "0",
        priceCurrency: "USD",
      },
      {
        "@type": "Offer",
        name: "Pro",
        price: "49",
        priceCurrency: "USD",
      },
    ],
    description:
      "AI-powered customer support platform. Create, train, and embed intelligent chatbots trained on your content.",
    url: APP_URL,
  };

  const organization = {
    "@context": "https://schema.org",
    "@type": "Organization",
    name: "SupportIQ",
    url: APP_URL,
    logo: `${APP_URL}/logo.png`,
    sameAs: [],
  };

  const faqPage = {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: [
      {
        "@type": "Question",
        name: "How does SupportIQ train AI on my content?",
        acceptedAnswer: {
          "@type": "Answer",
          text: "Upload PDFs, add website URLs, or paste text and FAQs. SupportIQ chunks and embeds your content using vector embeddings, then retrieves the most relevant passages during each conversation to ground the AI's answers.",
        },
      },
      {
        "@type": "Question",
        name: "Can I customize the chatbot's appearance?",
        acceptedAnswer: {
          "@type": "Answer",
          text: "Yes. You can customize colors, position, greeting message, and quick replies to match your brand. The widget loads as a single script tag on any website.",
        },
      },
      {
        "@type": "Question",
        name: "Which AI providers are supported?",
        acceptedAnswer: {
          "@type": "Answer",
          text: "SupportIQ supports OpenAI, Anthropic, and Groq. You can choose a different provider per bot depending on your needs for cost, speed, and quality.",
        },
      },
      {
        "@type": "Question",
        name: "Do I need to know how to code?",
        acceptedAnswer: {
          "@type": "Answer",
          text: "No. SupportIQ is fully no-code. Create a bot, add your content, grab the embed snippet, and paste it into your website.",
        },
      },
    ],
  };

  const data =
    type === "landing"
      ? [softwareApplication, organization]
      : type === "pricing"
        ? [softwareApplication]
        : [faqPage];

  return (
    <>
      {data.map((item, i) => (
        <script
          key={i}
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(item) }}
        />
      ))}
    </>
  );
}
