import type { Metadata } from "next";
import "./globals.css";
import { SITE_URL } from "@/lib/landing";

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: {
    default: "PDF to Markdown — Free, Private, Local Converter",
    template: "%s · PDF to Markdown",
  },
  description:
    "Convert PDF to clean Markdown right in your browser. 100% local — files never leave your device. Built for LLM, RAG, Obsidian and Notion workflows.",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className="bg-slate-50 text-slate-900 antialiased">{children}</body>
    </html>
  );
}
