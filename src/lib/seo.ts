export const siteUrl = "https://davidsling.in";

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
  const img = `${siteUrl}/og/${image}.png`;
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
    { name: "twitter:card", content: "summary_large_image" },
    { name: "twitter:title", content: title },
    { name: "twitter:description", content: description },
    { name: "twitter:image", content: img },
  ];
}
