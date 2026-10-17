import { createServerFn } from "@tanstack/react-start";

export type Post = {
  slug: string;
  title: string;
  date: string;
  summary: string;
  tags: string[];
  minutes: number;
};

/** Every post, newest first. Add one by dropping a file in content/blog/. */
export const getPosts = createServerFn({ method: "GET" }).handler(async () => {
  const { listPosts } = await import("@/lib/posts.server");
  return listPosts();
});

export const getPost = createServerFn({ method: "GET" })
  .validator((slug: string) => slug)
  .handler(async ({ data }) => {
    const { renderPost } = await import("@/lib/posts.server");
    return renderPost(data);
  });
