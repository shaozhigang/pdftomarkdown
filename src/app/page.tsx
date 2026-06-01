import type { Metadata } from "next";
import { LandingPage } from "@/components/LandingPage";
import { getLanding } from "@/lib/landing";
import { landingMetadata } from "@/lib/seo";

const content = getLanding("")!;

export const metadata: Metadata = landingMetadata(content);

export default function Home() {
  return <LandingPage content={content} />;
}
