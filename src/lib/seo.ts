import { createIsomorphicFn } from "@tanstack/react-start";
import { getRequestUrl } from "@tanstack/react-start/server";

export const siteUrl = "https://davidsling.in";

/**
 * Where share cards are served from: the host answering this request, so
 * localhost, Vercel previews and production each preview their own cards.
 */
const origin = createIsomorphicFn()
  .server(() => getRequestUrl().origin)
  .client(() => window.location.origin);

/** The title, description and share card tags every page sets. */
export function seo({
  title,
  description,
  path,
  image,
  type = "website",
}: {
  title: string;
  description: string;
  path: string;
  /** The /og/ path for this page's card, without the extension. */
  image: string;
  type?: "website" | "article";
}) {
  const url = `${siteUrl}${path === "/" ? "" : path}`;
  const img = `${origin()}/og/${image}`;
  return [
    { title },
    { name: "description", content: description },
    { property: "og:title", content: title },
    { property: "og:description", content: description },
    { property: "og:url", content: url },
    { property: "og:type", content: type },
    { property: "og:site_name", content: "David Sling" },
    { property: "og:image", content: img },
    { property: "og:image:width", content: "1200" },
    { property: "og:image:height", content: "630" },
    { property: "og:image:alt", content: title },
    { name: "twitter:card", content: "summary_large_image" },
    { name: "twitter:url", content: url },
    { name: "twitter:title", content: title },
    { name: "twitter:description", content: description },
    { name: "twitter:image", content: img },
  ];
}
