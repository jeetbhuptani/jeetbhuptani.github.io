/**
 * GitHub activity (plan U14/R19) for `jeetbhuptani`.
 * With a GITHUB_TOKEN: official GraphQL v4 — contribution calendar + pinned
 * repos. Without one: the token-free jogruber contributions API for the calendar
 * (no pins). Pure normalizers exported for tests.
 */

export type Contribution = { date: string; count: number; level: number };
export type Repo = {
  name: string;
  description?: string;
  url: string;
  stars: number;
  language?: string;
  languageColor?: string;
};
export type GithubResult = {
  status: "ok" | "empty" | "error";
  total: number;
  contributions: Contribution[];
  repos: Repo[];
};

const USER = "jeetbhuptani";

const LEVEL: Record<string, number> = {
  NONE: 0,
  FIRST_QUARTILE: 1,
  SECOND_QUARTILE: 2,
  THIRD_QUARTILE: 3,
  FOURTH_QUARTILE: 4,
};

// ---- pure normalizers ----

export function normalizeGraphql(data: any): Omit<GithubResult, "status"> {
  const cal = data?.user?.contributionsCollection?.contributionCalendar;
  const contributions: Contribution[] = (cal?.weeks ?? []).flatMap((w: any) =>
    (w.contributionDays ?? []).map((d: any) => ({
      date: d.date,
      count: d.contributionCount ?? 0,
      level: LEVEL[d.contributionLevel] ?? 0,
    }))
  );
  const repos: Repo[] = (data?.user?.pinnedItems?.nodes ?? [])
    .filter(Boolean)
    .map((r: any) => ({
      name: r.name,
      description: r.description ?? undefined,
      url: r.url,
      stars: r.stargazerCount ?? 0,
      language: r.primaryLanguage?.name,
      languageColor: r.primaryLanguage?.color,
    }));
  return { total: cal?.totalContributions ?? 0, contributions, repos };
}

export function normalizeJogruber(data: any): Omit<GithubResult, "status"> {
  const contributions: Contribution[] = (data?.contributions ?? []).map((c: any) => ({
    date: c.date,
    count: c.count ?? 0,
    level: typeof c.level === "number" ? c.level : 0,
  }));
  const total = contributions.reduce((s, c) => s + c.count, 0);
  return { total, contributions, repos: [] };
}

// ---- network ----

const QUERY = `query($login: String!) {
  user(login: $login) {
    contributionsCollection {
      contributionCalendar {
        totalContributions
        weeks { contributionDays { date contributionCount contributionLevel } }
      }
    }
    pinnedItems(first: 6, types: REPOSITORY) {
      nodes { ... on Repository {
        name description url stargazerCount
        primaryLanguage { name color }
      } }
    }
  }
}`;

export async function getGithub(): Promise<GithubResult> {
  const token = process.env.GITHUB_TOKEN;
  try {
    if (token) {
      const res = await fetch("https://api.github.com/graphql", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ query: QUERY, variables: { login: USER } }),
        next: { revalidate: 86400 },
      });
      if (!res.ok) throw new Error(`GitHub ${res.status}`);
      const json = await res.json();
      if (json.errors) throw new Error("GitHub GraphQL error");
      return { status: "ok", ...normalizeGraphql(json.data) };
    }
    // No token — token-free calendar only.
    const res = await fetch(`https://github-contributions-api.jogruber.de/v4/${USER}?y=last`, {
      next: { revalidate: 86400 },
    });
    if (!res.ok) throw new Error(`jogruber ${res.status}`);
    return { status: "ok", ...normalizeJogruber(await res.json()) };
  } catch {
    return { status: "error", total: 0, contributions: [], repos: [] };
  }
}
