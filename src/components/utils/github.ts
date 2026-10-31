import type { GithubData } from "../../../api/github";

let pending: Promise<GithubData> | null = null;

/** One request per page view, shared by every widget that needs it. */
export const getGithub = () =>
  (pending ??= fetch("/api/github")
    .then((r) => (r.ok ? (r.json() as Promise<GithubData>) : Promise.reject(new Error(String(r.status)))))
    .catch((e) => {
      pending = null; // allow a retry later
      throw e;
    }));
