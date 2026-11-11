import { createServerFn } from "@tanstack/react-start";

export type RegistryCode = { demo: string; install: string };

/**
 * The cmd-facts registry demo's source, trimmed (content/code/), and its
 * install command, highlighted on the server so the page ships no grammar.
 */
export const getRegistryCode = createServerFn({ method: "GET" }).handler(
  async (): Promise<RegistryCode> => {
    const { registryCode } = await import("@/lib/registry-code.server");
    return registryCode();
  },
);
