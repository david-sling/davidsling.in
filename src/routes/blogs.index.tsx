import { createFileRoute } from "@tanstack/react-router";
import { PostList, SiteFooter } from "@/components/home/sections";
import { SiteHeader } from "@/components/home/site-header";
import { getPosts } from "@/lib/posts";

export const Route = createFileRoute("/blogs/")({
  loader: () => getPosts(),
  head: () => ({
    meta: [
      { title: "Writing — David Sling" },
      {
        name: "description",
        content:
          "Notes on building with AI agents, and the odd thought that isn't about code.",
      },
    ],
  }),
  component: BlogIndex,
});

function BlogIndex() {
  const posts = Route.useLoaderData();
  return (
    <>
      <SiteHeader />
      <main
        id="main"
        className="mx-auto max-w-[1240px] px-4 pt-12 sm:px-6 sm:pt-16"
      >
        <h1 className="text-[clamp(2.6rem,6vw,4.4rem)] font-semibold tracking-[-0.04em]">
          Writing
        </h1>
        <p className="mt-4 max-w-[48ch] text-[1.1rem] text-ink-2">
          Notes on building with AI agents, and the odd thought that isn't about
          code.
        </p>
        <PostList posts={posts} className="mt-12 -mx-5 sm:-mx-7" />
      </main>
      <SiteFooter />
    </>
  );
}
