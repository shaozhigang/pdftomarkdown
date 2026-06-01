import type { Metadata } from "next";
import { LandingPage } from "@/components/LandingPage";
import { getLanding } from "@/lib/landing";
import { landingMetadata } from "@/lib/seo";

const content = getLanding("pdf-to-markdown-for-chatgpt")!;

export const metadata: Metadata = landingMetadata(content);

export default function Page() {
  return <LandingPage content={content} />;
}
