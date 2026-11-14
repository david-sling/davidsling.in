/** The public repos whose commit counts the site quotes. The API route refuses anything else. */
export const COMMIT_REPOS = ['wave', 'valet', 'cmd-facts'] as const
export type CommitRepo = (typeof COMMIT_REPOS)[number]
export type CommitCount = { total: number; claude: number }
export type CommitCounts = Record<CommitRepo, CommitCount | null>

/**
 * What the page says before GitHub answers, and if it never does: the counts
 * on 13 Nov 2026. Server-rendered HTML carries these, so the sentence is
 * always complete.
 */
export const COMMIT_FALLBACK: Record<CommitRepo, CommitCount> = {
  wave: { total: 274, claude: 240 },
  valet: { total: 201, claude: 156 },
  'cmd-facts': { total: 155, claude: 124 },
}
