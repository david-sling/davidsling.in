import { createFileRoute } from "@tanstack/react-router";

/** davidsling.in/resume keeps working, as it did on the old site. */
export const Route = createFileRoute("/resume")({
  server: {
    handlers: {
      GET: () =>
        new Response(null, {
          status: 308,
          headers: { Location: "/resume.pdf" },
        }),
    },
  },
});
