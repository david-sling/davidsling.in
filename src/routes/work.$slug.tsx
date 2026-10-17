import { createFileRoute, notFound } from "@tanstack/react-router";
import { SiteFooter } from "@/components/home/sections";
import { SiteHeader } from "@/components/home/site-header";
import { AiProtectCase } from "@/components/work/ai-protect";
import { EquanimCase } from "@/components/work/equanim";
import { OfflynCase } from "@/components/work/offlyn";
import { WaveCase } from "@/components/work/wave";
import { allProjects } from "@/lib/content";
import { seo } from "@/lib/seo";

export const Route = createFileRoute("/work/$slug")({
  loader: ({ params }) => {
    const project = allProjects.find((p) => p.slug === params.slug);
    if (!project) throw notFound();
    return project;
  },
  head: ({ loaderData }) => ({
    meta: loaderData
      ? seo({
          title: `${loaderData.name} — David Sling`,
          description: loaderData.summary,
          path: `/work/${loaderData.slug}`,
          image: `work/${loaderData.slug}`,
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
};

function ProjectPage() {
  const project = Route.useLoaderData();
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
