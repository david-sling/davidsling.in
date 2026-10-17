import { createFileRoute, notFound } from "@tanstack/react-router";
import { SiteFooter } from "@/components/home/sections";
import { SiteHeader } from "@/components/home/site-header";
import { AiProtectCase } from "@/components/work/ai-protect";
import { EquanimCase } from "@/components/work/equanim";
import { OfflynCase } from "@/components/work/offlyn";
import { WaveCase } from "@/components/work/wave";
import { allProjects } from "@/lib/content";

export const Route = createFileRoute("/work/$slug")({
  loader: ({ params }) => {
    const project = allProjects.find((p) => p.slug === params.slug);
    if (!project) throw notFound();
    return project;
  },
  head: ({ loaderData }) => ({
    meta: loaderData
      ? [
          { title: `${loaderData.name} — David Sling` },
          { name: "description", content: loaderData.summary },
          { property: "og:title", content: `${loaderData.name} — David Sling` },
          { property: "og:description", content: loaderData.summary },
        ]
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
