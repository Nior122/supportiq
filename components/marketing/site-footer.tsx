/**
 * SupportIQ Site Footer - Premium AI Blue
 */
import Link from "next/link";
import { ZapIcon } from "lucide-react";

const footerSections = [
  {
    title: "Product",
    links: [
      { label: "Features", href: "#features" },
      { label: "Pricing", href: "#pricing" },
      { label: "AI Models", href: "#" },
      { label: "Enterprise", href: "#" },
    ],
  },
  {
    title: "Resources",
    links: [
      { label: "Documentation", href: "#" },
      { label: "API Reference", href: "#" },
      { label: "Guides", href: "#" },
      { label: "Support", href: "#" },
    ],
  },
  {
    title: "Company",
    links: [
      { label: "About Us", href: "#" },
      { label: "Blog", href: "#" },
      { label: "Careers", href: "#" },
      { label: "Legal", href: "#" },
    ],
  },
];

export function SiteFooter() {
  return (
    <footer className="border-t border-slate-200 bg-white pt-24 pb-12 dark:bg-[#020617] dark:border-slate-800">
      <div className="mx-auto max-w-screen-2xl px-8">
        <div className="grid gap-16 lg:grid-cols-5">
          {/* Brand Column */}
          <div className="lg:col-span-2">
            <Link href="/" className="flex items-center gap-2.5 mb-8">
               <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-blue-600 shadow-glow">
                  <ZapIcon className="h-5 w-5 text-white fill-white" />
               </div>
               <span className="text-2xl font-bold tracking-tighter text-slate-900 dark:text-white uppercase">SupportIQ</span>
            </Link>
            <p className="text-lg text-slate-600 leading-relaxed max-w-md dark:text-slate-400">
               Delivering world-class customer service with AI infrastructure designed for scale, reliability, and security.
            </p>
          </div>

          {/* Links Columns */}
          {footerSections.map((section) => (
            <div key={section.title}>
              <h3 className="text-xs font-bold uppercase tracking-[0.2em] text-slate-400 mb-8 dark:text-slate-500">
                {section.title}
              </h3>
              <ul className="space-y-4">
                {section.links.map((link) => (
                  <li key={link.label}>
                    <Link
                      href={link.href}
                      className="text-base text-slate-600 transition-colors hover:text-blue-600 dark:text-slate-400 dark:hover:text-blue-400"
                    >
                      {link.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        <div className="mt-24 pt-12 border-t border-slate-100 flex flex-col md:flex-row items-center justify-between gap-6 dark:border-slate-800">
          <div className="text-xs font-medium text-slate-500 uppercase tracking-widest dark:text-slate-500">
            © {new Date().getFullYear()} SupportIQ. Enterprise System v4.0.
          </div>
          <div className="flex gap-8">
             <Link href="#" className="text-xs font-bold text-slate-400 hover:text-blue-600 uppercase tracking-widest transition-colors dark:text-slate-600">Privacy</Link>
             <Link href="#" className="text-xs font-bold text-slate-400 hover:text-blue-600 uppercase tracking-widest transition-colors dark:text-slate-600">Terms</Link>
          </div>
        </div>
      </div>
    </footer>
  );
}
