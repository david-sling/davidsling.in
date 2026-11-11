import demo from "../../content/code/sentence-by-role-demo.txt?raw";
import { highlight, loadHighlighter } from "@/lib/highlight.server";

/** One command per line, so it reads without scrolling sideways. */
const INSTALL = `npx shadcn@latest add \\
  https://cmd-facts.davidsling.in/r/command-line.json \\
  https://cmd-facts.davidsling.in/r/sentence.json \\
  https://cmd-facts.davidsling.in/r/use-explain.json`;

export async function registryCode() {
  await loadHighlighter();
  return { demo: highlight(demo, "tsx"), install: highlight(INSTALL, "bash") };
}
