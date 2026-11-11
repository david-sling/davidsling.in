import { createHighlighterCore, type HighlighterCore } from "shiki/core";
import { createJavaScriptRegexEngine } from "shiki/engine/javascript";

/**
 * Code is highlighted on the server with both GitHub themes; CSS picks one
 * (see `.post-prose pre` and `.code-sheet` in styles.css). Pages never ship
 * a grammar.
 */

// Only the grammars the site uses, and the JavaScript regex engine (no WebAssembly on the server).
const grammars = {
  typescript: () => import("shiki/langs/typescript.mjs"),
  tsx: () => import("shiki/langs/tsx.mjs"),
  javascript: () => import("shiki/langs/javascript.mjs"),
  jsx: () => import("shiki/langs/jsx.mjs"),
  sql: () => import("shiki/langs/sql.mjs"),
  bash: () => import("shiki/langs/bash.mjs"),
  json: () => import("shiki/langs/json.mjs"),
  css: () => import("shiki/langs/css.mjs"),
  html: () => import("shiki/langs/html.mjs"),
};
const langs = Object.keys(grammars);
let loading: Promise<HighlighterCore> | undefined;
let ready: HighlighterCore | undefined;

/** Load the highlighter once; `highlight` needs this to have finished. */
export async function loadHighlighter() {
  ready = await (loading ??= createHighlighterCore({
    themes: [
      import("shiki/themes/github-light.mjs"),
      import("shiki/themes/github-dark.mjs"),
    ],
    langs: Object.values(grammars).map((load) => load()),
    engine: createJavaScriptRegexEngine(),
  }));
  return ready;
}

/** Highlighted HTML for `code`; an unknown language comes back as plain text. */
export function highlight(code: string, lang: string) {
  if (!ready) throw new Error("highlight() before loadHighlighter()");
  return ready.codeToHtml(code, {
    lang: langs.includes(lang) ? lang : "text",
    themes: { light: "github-light", dark: "github-dark" },
    defaultColor: false,
  });
}
