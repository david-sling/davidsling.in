import { createFileRoute } from "@tanstack/react-router";
import { SiteFooter } from "@/components/home/sections";
import { SiteHeader } from "@/components/home/site-header";
import {
  Chain,
  Foundation,
  InfraHero,
  Next,
  Principle,
} from "@/components/infra/page";
import { seo } from "@/lib/seo";

const infraSummary =
  "Wave, Valet and cmd-facts: three tools for people who work with AI agents, built to share one foundation.";

export const Route = createFileRoute("/ai-infrastructure")({
  head: () => ({
    meta: seo({
      title: "Infrastructure for AI — David Sling",
      description: infraSummary,
      path: "/ai-infrastructure",
      image: "ai-infrastructure",
    }),
  }),
  component: InfraPage,
});

function InfraPage() {
  return (
    <>
      <SiteHeader />
      <main id="main" className="pt-4">
        <InfraHero />
        <Chain />
        <Foundation />
        <Principle />
        <Next />
      </main>
      <SiteFooter />
    </>
  );
}
