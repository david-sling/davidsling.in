import { createFileRoute } from "@tanstack/react-router";
import { projects, formatDate } from "@/lib/content";

/**
 * /og/<page>: the share card for every page (a trailing .png also works).
 *   /og/home, /og/blogs, /og/blogs/<slug>, /og/work/<slug>
 */
const blue = { field: "#67d0e8", ink: "#0b2530" };
const projectInk: Record<string, { field: string; ink: string }> = {
  wave: { field: "#f8c840", ink: "#2b2208" },
  equanim: { field: "#06b6d4", ink: "#0b1f27" },
  offlyn: { field: "#ff6b9f", ink: "#3a1520" },
  "ai-protect": { field: "#2563eb", ink: "#f8fafc" },
};

async function cardFor(page: string) {
  const { listPosts } = await import("@/lib/posts.server");
  const { marks } = await import("@/lib/og.server");
  if (page === "home")
    return {
      title: "David Sling",
      summary:
        "Engineer with a designer’s eye, building real products with AI agents.",
      path: "/",
      portrait: true,
      ...blue,
    };
  if (page === "blogs")
    return {
      title: "Writing",
      summary:
        "Notes on building with AI agents, and the odd thought that isn’t about code.",
      path: "/blogs",
      ...blue,
    };
  const [kind, slug] = page.split("/");
  if (kind === "blogs") {
    const post = listPosts().find((p) => p.slug === slug);
    if (!post) return null;
    return {
      title: post.title,
      meta: `${formatDate(post.date)} · ${post.minutes} min read`,
      path: `/blogs/${post.slug}`,
      ...blue,
    };
  }
  if (kind === "work") {
    const project = projects.find((p) => p.slug === slug);
    if (!project) return null;
    return {
      title: project.name,
      summary: project.summary,
      path: `/work/${project.slug}`,
      ...projectInk[project.slug],
      mark: marks[project.slug as keyof typeof marks],
    };
  }
  return null;
}

export const Route = createFileRoute("/og/$")({
  server: {
    handlers: {
      GET: async ({ params }) => {
        const page = (params._splat ?? "").replace(/\.png$/, "");
        const card = await cardFor(page);
        if (!card) return new Response("Not found", { status: 404 });
        const { renderCard } = await import("@/lib/og.server");
        const png = await renderCard(card);
        return new Response(new Uint8Array(png), {
          headers: {
            "Content-Type": "image/png",
            "Cache-Control":
              "public, max-age=3600, s-maxage=604800, stale-while-revalidate=86400",
          },
        });
      },
    },
  },
});
