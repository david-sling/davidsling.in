import { HeadContent, Scripts, createRootRoute } from "@tanstack/react-router";
import { seo } from "@/lib/seo";
import { lazy, Suspense } from "react";

import { themeScript } from "@/components/theme-toggle";
import appCss from "../styles.css?url";

const Devtools = import.meta.env.DEV
  ? lazy(async () => {
      const [{ TanStackDevtools }, { TanStackRouterDevtoolsPanel }] =
        await Promise.all([
          import("@tanstack/react-devtools"),
          import("@tanstack/react-router-devtools"),
        ]);
      return {
        default: () => (
          <TanStackDevtools
            config={{ position: "bottom-right" }}
            plugins={[
              {
                name: "Tanstack Router",
                render: <TanStackRouterDevtoolsPanel />,
              },
            ]}
          />
        ),
      };
    })
  : () => null;

const description =
  "David Sling is a frontend lead and engineer with a designer’s eye, building real products with AI agents. Wave, Equanim, offlyn.love, AI Protect and writing.";

export const Route = createRootRoute({
  head: () => ({
    meta: [
      { charSet: "utf-8" },
      { name: "viewport", content: "width=device-width, initial-scale=1" },
      { name: "theme-color", content: "#67D0E8" },
      ...seo({
        title: "David Sling — Engineer with a designer’s eye",
        description,
        path: "/",
        image: "home",
      }),
    ],
    links: [
      { rel: "stylesheet", href: appCss },
      { rel: "icon", href: "/icon.svg", type: "image/svg+xml" },
      ...[500, 600].map((w) => ({
        rel: "preload",
        href: `/fonts/general-sans-${w}.woff2`,
        as: "font",
        type: "font/woff2",
        crossOrigin: "anonymous" as const,
      })),
    ],
  }),
  shellComponent: RootDocument,
});

function RootDocument({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <script dangerouslySetInnerHTML={{ __html: themeScript }} />
        <HeadContent />
      </head>
      <body>
        <a
          href="#main"
          className="sr-only focus:not-sr-only focus:fixed focus:left-4 focus:top-4 focus:z-50 focus:rounded-full focus:bg-ink focus:px-4 focus:py-2 focus:text-sheet"
        >
          Skip to content
        </a>
        {children}
        <Suspense>
          <Devtools />
        </Suspense>
        <Scripts />
      </body>
    </html>
  );
}
