import { useEffect, useState } from "react";
import {
  COMMIT_FALLBACK,
  type CommitCounts,
  type CommitRepo,
} from "@/lib/commits";

/** One request per page load, shared by every count on the page. */
let request: Promise<CommitCounts | null> | undefined;
const load = () =>
  (request ??= fetch("/api/commits")
    .then((r) => (r.ok ? (r.json() as Promise<CommitCounts>) : null))
    .catch(() => null));

export function useCommitCount(repo: CommitRepo) {
  const [count, setCount] = useState(COMMIT_FALLBACK[repo]);
  useEffect(() => {
    let alive = true;
    load().then((all) => {
      const live = all?.[repo];
      if (alive && live) setCount(live);
    });
    return () => {
      alive = false;
    };
  }, [repo]);
  return count;
}

/**
 * "240 of 274 commits", read live from GitHub: commits on the repo's default
 * branch, and how many carry a Claude co-author line.
 */
export function CommitCount({
  repo,
  the,
}: {
  repo: CommitRepo;
  /** "240 of the 274 commits" */
  the?: boolean;
}) {
  const { claude, total } = useCommitCount(repo);
  return (
    <span className="tabular">
      {claude} of {the ? "the " : ""}
      {total} commits
    </span>
  );
}
