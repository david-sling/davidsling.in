import { Marked } from "marked";
import { highlight, loadHighlighter } from "@/lib/highlight.server";
import type { Post } from "@/lib/posts";

/**
 * Blog posts live as Markdown in content/blog/<slug>.md. Vite bundles the
 * raw files into the server build only; pages get rendered HTML through
 * the server functions in posts.ts.
 */
const files = import.meta.glob("/content/blog/*.md", {
  query: "?raw",
  import: "default",
  eager: true,
}) as Record<string, string>;

/** Front matter is a small YAML subset: `key: value`, quoted strings, `[a, b]` lists. */
function parse(path: string, raw: string): Post & { body: string } {
  const slug = path.split("/").pop()!.replace(/\.md$/, "");
  const match = raw.match(/^---\n([\s\S]*?)\n---\n?([\s\S]*)$/);
  if (!match) throw new Error(`${slug}.md is missing its front matter`);
  const meta: Record<string, string | string[]> = {};
  for (const line of match[1].split("\n")) {
    const m = line.match(/^(\w+):\s*(.*)$/);
    if (!m) continue;
    const value = m[2].trim();
    meta[m[1]] = value.startsWith("[")
      ? value
          .slice(1, -1)
          .split(",")
          .map((t) => t.trim())
          .filter(Boolean)
      : value.replace(/^"(.*)"$/, "$1");
  }
  for (const key of ["title", "date", "summary"])
    if (typeof meta[key] !== "string")
      throw new Error(`${slug}.md needs a "${key}" in its front matter`);
  const body = match[2].trim();
  return {
    slug,
    title: meta.title as string,
    date: meta.date as string,
    summary: meta.summary as string,
    tags: Array.isArray(meta.tags) ? meta.tags : [],
    minutes: Math.max(1, Math.round(body.split(/\s+/).length / 220)),
    body,
  };
}

const all = Object.entries(files)
  .map(([path, raw]) => parse(path, raw))
  .filter((p) => !p.slug.startsWith("_"))
  .sort((a, b) => b.date.localeCompare(a.date));

export const listPosts = (): Post[] => all.map(({ body: _, ...p }) => p);

const slugify = (s: string) =>
  s
    .toLowerCase()
    .replace(/<[^>]+>/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "");

export async function renderPost(slug: string) {
  const post = all.find((p) => p.slug === slug);
  if (!post) return null;
  await loadHighlighter();
  const marked = new Marked({
    renderer: {
      // Code is highlighted at render time with both themes; CSS picks one.
      code({ text, lang }) {
        return highlight(text, (lang ?? "").split(/\s/)[0]);
      },
      heading({ tokens, depth }) {
        const html = this.parser.parseInline(tokens);
        return `<h${depth} id="${slugify(html)}">${html}</h${depth}>\n`;
      },
      link({ href, title, tokens }) {
        const text = this.parser.parseInline(tokens);
        const external = /^https?:\/\//.test(href);
        return `<a href="${href}"${title ? ` title="${title}"` : ""}${
          external ? ' target="_blank" rel="noreferrer"' : ""
        }>${text}</a>`;
      },
    },
  });
  const { body, ...meta } = post;
  return { ...meta, html: await marked.parse(body) };
}
