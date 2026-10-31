/**
 * GET /api/github
 * Contribution calendar (last year) + most recently pushed repos for the
 * portfolio's GitHub activity widget.
 *
 * - With GITHUB_TOKEN set (a classic token with no scopes is enough), the
 *   calendar comes from the GraphQL API.
 * - Without it, the public contributions page is parsed instead.
 * Responses are cached by Vercel's CDN for an hour.
 */

const USER = "miheer2003";
const HIDE = new Set([USER.toLowerCase()]); // profile README repo

export type Day = { d: string; c: number; l: 0 | 1 | 2 | 3 | 4 };
export type Repo = { name: string; desc: string; lang: string | null; url: string; pushed: string; stars: number };
export type GithubData = {
  user: string;
  total: number;
  weeks: Day[][];
  repos: Repo[];
  updated: string;
};

const env =
  (globalThis as unknown as { process?: { env: Record<string, string | undefined> } }).process?.env ?? {};

const headers = (): Record<string, string> => {
  const h: Record<string, string> = { "User-Agent": "miheerjangale.co.in", Accept: "application/vnd.github+json" };
  if (env.GITHUB_TOKEN) h.Authorization = `Bearer ${env.GITHUB_TOKEN}`;
  return h;
};

const LEVEL: Record<string, Day["l"]> = {
  NONE: 0,
  FIRST_QUARTILE: 1,
  SECOND_QUARTILE: 2,
  THIRD_QUARTILE: 3,
  FOURTH_QUARTILE: 4,
};

async function calendarFromGraphQL(): Promise<Day[][]> {
  const query = `query($u:String!){user(login:$u){contributionsCollection{contributionCalendar{
    weeks{contributionDays{date contributionCount contributionLevel}}}}}}`;
  const r = await fetch("https://api.github.com/graphql", {
    method: "POST",
    headers: { ...headers(), "Content-Type": "application/json" },
    body: JSON.stringify({ query, variables: { u: USER } }),
  });
  if (!r.ok) throw new Error(`graphql ${r.status}`);
  const j = (await r.json()) as {
    data?: { user?: { contributionsCollection: { contributionCalendar: { weeks: { contributionDays: { date: string; contributionCount: number; contributionLevel: string }[] }[] } } } };
  };
  const weeks = j.data?.user?.contributionsCollection.contributionCalendar.weeks;
  if (!weeks) throw new Error("graphql: no calendar");
  return weeks.map((w) =>
    w.contributionDays.map((d) => ({ d: d.date, c: d.contributionCount, l: LEVEL[d.contributionLevel] ?? 0 }))
  );
}

async function calendarFromPage(): Promise<Day[][]> {
  const r = await fetch(`https://github.com/users/${USER}/contributions`, {
    headers: { "User-Agent": "miheerjangale.co.in", "X-Requested-With": "XMLHttpRequest" },
  });
  if (!r.ok) throw new Error(`contributions page ${r.status}`);
  const html = await r.text();

  // Tooltips hold the counts: <tool-tip for="contribution-day-component-0-3">2 contributions on …</tool-tip>
  const counts = new Map<string, number>();
  for (const m of html.matchAll(/<tool-tip[^>]*for="([^"]+)"[^>]*>([^<]*)<\/tool-tip>/g)) {
    const n = /^(\d+)\s+contribution/.exec(m[2].trim());
    counts.set(m[1], n ? Number(n[1]) : 0);
  }

  const days: Day[] = [];
  for (const m of html.matchAll(/<td[^>]*class="ContributionCalendar-day"[^>]*>/g)) {
    const tag = m[0];
    const d = /data-date="([\d-]+)"/.exec(tag)?.[1];
    const l = Number(/data-level="(\d)"/.exec(tag)?.[1] ?? 0) as Day["l"];
    const id = /id="([^"]+)"/.exec(tag)?.[1] ?? "";
    if (d) days.push({ d, c: counts.get(id) ?? (l > 0 ? 1 : 0), l });
  }
  if (!days.length) throw new Error("contributions page: no days");

  // The page lists days row by row (weekday-major); regroup into weeks.
  days.sort((a, b) => a.d.localeCompare(b.d));
  const weeks: Day[][] = [];
  for (const day of days) {
    const dow = new Date(`${day.d}T00:00:00Z`).getUTCDay();
    if (!weeks.length || dow === 0) weeks.push([]);
    weeks[weeks.length - 1].push(day);
  }
  return weeks;
}

async function recentRepos(): Promise<Repo[]> {
  const r = await fetch(`https://api.github.com/users/${USER}/repos?sort=pushed&per_page=20`, { headers: headers() });
  if (!r.ok) throw new Error(`repos ${r.status}`);
  const list = (await r.json()) as {
    name: string;
    description: string | null;
    language: string | null;
    html_url: string;
    pushed_at: string;
    stargazers_count: number;
    fork: boolean;
    size: number;
  }[];
  return list
    .filter((x) => !x.fork && x.size > 0 && !HIDE.has(x.name.toLowerCase()))
    .slice(0, 4)
    .map((x) => ({
      name: x.name,
      desc: x.description ?? "",
      lang: x.language,
      url: x.html_url,
      pushed: x.pushed_at,
      stars: x.stargazers_count,
    }));
}

export async function loadGithub(): Promise<GithubData> {
  const calendar = env.GITHUB_TOKEN
    ? calendarFromGraphQL().catch(calendarFromPage)
    : calendarFromPage();
  const [weeks, repos] = await Promise.all([calendar, recentRepos().catch(() => [] as Repo[])]);
  const total = weeks.flat().reduce((s, d) => s + d.c, 0);
  return { user: USER, total, weeks, repos, updated: new Date().toISOString() };
}

export async function GET(): Promise<Response> {
  try {
    const data = await loadGithub();
    return new Response(JSON.stringify(data), {
      headers: {
        "Content-Type": "application/json; charset=utf-8",
        "Cache-Control": "public, s-maxage=3600, stale-while-revalidate=86400",
      },
    });
  } catch (e) {
    return new Response(JSON.stringify({ error: String(e) }), {
      status: 502,
      headers: { "Content-Type": "application/json", "Cache-Control": "public, s-maxage=300" },
    });
  }
}
