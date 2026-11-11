import { createFileRoute, notFound } from "@tanstack/react-router";
import { SiteFooter } from "@/components/home/sections";
import { SiteHeader } from "@/components/home/site-header";
import { AiProtectCase } from "@/components/work/ai-protect";
import { CmdFactsCase } from "@/components/work/cmd-facts";
import { EquanimCase } from "@/components/work/equanim";
import { OfflynCase } from "@/components/work/offlyn";
import { ValetCase } from "@/components/work/valet";
import { WaveCase } from "@/components/work/wave";
import { projects } from "@/lib/content";
import { getRegistryCode } from "@/lib/registry-code";
import { seo } from "@/lib/seo";

export const Route = createFileRoute("/work/$slug")({
  loader: async ({ params }) => {
    const project = projects.find((p) => p.slug === params.slug);
    if (!project) throw notFound();
    // Only cmd-facts shows source; without it the page still renders, minus the code panel.
    const code =
      project.slug === "cmd-facts"
        ? await getRegistryCode().catch(() => null)
        : null;
    return { project, code };
  },
  head: ({ loaderData }) => ({
    meta: loaderData
      ? seo({
          title: `${loaderData.project.name} — David Sling`,
          description: loaderData.project.summary,
          path: `/work/${loaderData.project.slug}`,
          image: `work/${loaderData.project.slug}`,
        })
      : [],
  }),
  component: ProjectPage,
});

const cases = {
  wave: WaveCase,
  equanim: EquanimCase,
  offlyn: OfflynCase,
  "ai-protect": AiProtectCase,
  valet: ValetCase,
  "cmd-facts": CmdFactsCase,
};

function ProjectPage() {
  const { project } = Route.useLoaderData();
  const Case = cases[project.slug];
  return (
    <>
      <SiteHeader />
      <main id="main" className="pt-4">
        <Case project={project} />
      </main>
      <SiteFooter />
    </>
  );
}
