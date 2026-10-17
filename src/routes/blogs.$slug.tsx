import { Link, createFileRoute, notFound } from "@tanstack/react-router";
import { ArrowLeft } from "lucide-react";
import { SiteFooter } from "@/components/home/sections";
import { SiteHeader } from "@/components/home/site-header";
import { formatDate } from "@/lib/content";
import { getPost } from "@/lib/posts";
import { seo } from "@/lib/seo";

// Same /blogs/<slug> URLs as the old site; the text lives in content/blog/<slug>.md.
export const Route = createFileRoute("/blogs/$slug")({
  loader: async ({ params }) => {
    const post = await getPost({ data: params.slug });
    if (!post) throw notFound();
    return post;
  },
  head: ({ loaderData }) => ({
    meta: loaderData
      ? [
          ...seo({
            title: `${loaderData.title} — David Sling`,
            description: loaderData.summary,
            path: `/blogs/${loaderData.slug}`,
            image: `blogs/${loaderData.slug}`,
            type: "article",
          }),
          { property: "article:published_time", content: loaderData.date },
        ]
      : [],
  }),
  component: PostPage,
});

function PostPage() {
  const post = Route.useLoaderData();
  return (
    <>
      <SiteHeader />
      <main
        id="main"
        className="mx-auto max-w-[720px] px-4 pb-8 pt-12 sm:px-6 sm:pt-16"
      >
        <BackLink />
        <article className="mt-8">
          <header>
            <p className="tabular flex flex-wrap gap-x-3 text-[0.95rem] text-ink-3">
              <time dateTime={post.date}>{formatDate(post.date)}</time>
              <span aria-hidden>·</span>
              <span>{post.minutes} min read</span>
            </p>
            <h1 className="mt-3 text-[clamp(2.2rem,5vw,3.4rem)] font-semibold leading-[1.05] tracking-[-0.035em]">
              {post.title}
            </h1>
            <p className="mt-5 text-[1.2rem] leading-snug text-ink-2">
              {post.summary}
            </p>
          </header>
          <div
            className="post-prose mt-12 border-t border-line pt-10"
            dangerouslySetInnerHTML={{ __html: post.html }}
          />
        </article>
        <div className="mt-16 border-t border-line pt-8">
          <BackLink />
        </div>
      </main>
      <SiteFooter />
    </>
  );
}

function BackLink() {
  return (
    <Link
      to="/blogs"
      className="group/back -ml-4 inline-flex min-h-11 items-center gap-2 rounded-full pl-4 pr-4 font-semibold text-ink-2 no-underline transition-colors duration-150 hover:bg-sheet hover:text-ink"
    >
      <ArrowLeft
        aria-hidden
        className="size-4 transition-transform duration-300 ease-out-expo group-hover/back:-translate-x-1"
      />
      All writing
    </Link>
  );
}
