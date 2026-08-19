/**
 * Public API connectors — no-key endpoints from public-apis catalog.
 * https://github.com/public-apis/public-apis
 */

export type PublicApiAttribution = {
  name: string;
  docs_url: string;
  public_apis_section: string;
};

export type FetchJson = (
  url: string,
  init?: RequestInit,
) => Promise<{ ok: boolean; status: number; json: unknown }>;

export type PublicApiClientOptions = {
  fetchJson?: FetchJson;
  /** Default 8000 */
  timeout_ms?: number;
};

async function defaultFetchJson(
  url: string,
  init?: RequestInit,
): Promise<{ ok: boolean; status: number; json: unknown }> {
  const res = await fetch(url, init);
  let json: unknown = null;
  const text = await res.text();
  try {
    json = text ? JSON.parse(text) : null;
  } catch {
    json = { raw: text };
  }
  return { ok: res.ok, status: res.status, json };
}

export class PublicApiError extends Error {
  constructor(
    message: string,
    readonly attribution: PublicApiAttribution,
    readonly status?: number,
  ) {
    super(message);
    this.name = "PublicApiError";
  }
}

export class PublicApiClient {
  private readonly fetchJson: FetchJson;
  private readonly timeout_ms: number;

  constructor(opts: PublicApiClientOptions = {}) {
    this.fetchJson = opts.fetchJson ?? defaultFetchJson;
    this.timeout_ms = opts.timeout_ms ?? 8_000;
  }

  private async get(url: string, attribution: PublicApiAttribution): Promise<unknown> {
    const ctrl = new AbortController();
    const t = setTimeout(() => ctrl.abort(), this.timeout_ms);
    try {
      const res = await this.fetchJson(url, { signal: ctrl.signal });
      if (!res.ok) {
        throw new PublicApiError(
          `${attribution.name} HTTP ${res.status}`,
          attribution,
          res.status,
        );
      }
      return res.json;
    } finally {
      clearTimeout(t);
    }
  }

  /** Frankfurter — FX rates (Currency Exchange). */
  async frankfurterLatest(from: string, to: string[]): Promise<{
    attribution: PublicApiAttribution;
    base: string;
    date: string;
    rates: Record<string, number>;
  }> {
    const attribution: PublicApiAttribution = {
      name: "Frankfurter",
      docs_url: "https://www.frankfurter.app/docs",
      public_apis_section: "Currency Exchange",
    };
    const q = to.map((c) => c.toUpperCase()).join(",");
    const json = (await this.get(
      `https://api.frankfurter.app/latest?from=${encodeURIComponent(from.toUpperCase())}&to=${encodeURIComponent(q)}`,
      attribution,
    )) as { base?: string; date?: string; rates?: Record<string, number> };
    return {
      attribution,
      base: json.base ?? from.toUpperCase(),
      date: json.date ?? "UNKNOWN",
      rates: json.rates ?? {},
    };
  }

  /** Free Dictionary API — definitions. */
  async defineWord(word: string): Promise<{
    attribution: PublicApiAttribution;
    word: string;
    definitions: string[];
  }> {
    const attribution: PublicApiAttribution = {
      name: "Free Dictionary API",
      docs_url: "https://dictionaryapi.dev/",
      public_apis_section: "Dictionaries",
    };
    const json = (await this.get(
      `https://api.dictionaryapi.dev/api/v2/entries/en/${encodeURIComponent(word)}`,
      attribution,
    )) as Array<{
      meanings?: Array<{ definitions?: Array<{ definition?: string }> }>;
    }>;
    const definitions: string[] = [];
    if (Array.isArray(json)) {
      for (const entry of json) {
        for (const m of entry.meanings ?? []) {
          for (const d of m.definitions ?? []) {
            if (d.definition) definitions.push(d.definition);
          }
        }
      }
    }
    return { attribution, word, definitions: definitions.slice(0, 5) };
  }

  /** Open Library search — books. */
  async openLibrarySearch(query: string, limit = 3): Promise<{
    attribution: PublicApiAttribution;
    results: { title: string; authors: string[] }[];
  }> {
    const attribution: PublicApiAttribution = {
      name: "Open Library",
      docs_url: "https://openlibrary.org/developers/api",
      public_apis_section: "Books",
    };
    const json = (await this.get(
      `https://openlibrary.org/search.json?q=${encodeURIComponent(query)}&limit=${limit}`,
      attribution,
    )) as { docs?: Array<{ title?: string; author_name?: string[] }> };
    const results = (json.docs ?? []).map((d) => ({
      title: d.title ?? "UNKNOWN",
      authors: d.author_name ?? [],
    }));
    return { attribution, results };
  }

  /** CoinGecko simple price — crypto market signal (not advice). */
  async coinGeckoSimplePrice(ids: string[], vs: string[]): Promise<{
    attribution: PublicApiAttribution;
    prices: Record<string, Record<string, number>>;
  }> {
    const attribution: PublicApiAttribution = {
      name: "CoinGecko",
      docs_url: "http://www.coingecko.com/api",
      public_apis_section: "Cryptocurrency",
    };
    const json = (await this.get(
      `https://api.coingecko.com/api/v3/simple/price?ids=${encodeURIComponent(ids.join(","))}&vs_currencies=${encodeURIComponent(vs.join(","))}`,
      attribution,
    )) as Record<string, Record<string, number>>;
    return { attribution, prices: json ?? {} };
  }

  /** ZenQuotes random — inspirational quote. */
  async zenQuoteRandom(): Promise<{
    attribution: PublicApiAttribution;
    quote: string;
    author: string;
  }> {
    const attribution: PublicApiAttribution = {
      name: "Zen Quotes",
      docs_url: "https://zenquotes.io/",
      public_apis_section: "Personality / Quotes",
    };
    const json = (await this.get("https://zenquotes.io/api/random", attribution)) as Array<{
      q?: string;
      a?: string;
    }>;
    const row = Array.isArray(json) ? json[0] : null;
    return {
      attribution,
      quote: row?.q ?? "UNKNOWN",
      author: row?.a ?? "UNKNOWN",
    };
  }

  /** Hacker News top story titles — lightweight market/tech signals. */
  async hackerNewsTopTitles(limit = 5): Promise<{
    attribution: PublicApiAttribution;
    titles: { id: number; title: string; url?: string }[];
  }> {
    const attribution: PublicApiAttribution = {
      name: "HackerNews",
      docs_url: "https://github.com/HackerNews/API",
      public_apis_section: "Social / News",
    };
    const ids = (await this.get(
      "https://hacker-news.firebaseio.com/v0/topstories.json",
      attribution,
    )) as number[];
    const titles: { id: number; title: string; url?: string }[] = [];
    for (const id of (ids ?? []).slice(0, limit)) {
      const item = (await this.get(
        `https://hacker-news.firebaseio.com/v0/item/${id}.json`,
        attribution,
      )) as { title?: string; url?: string };
      if (item?.title) titles.push({ id, title: item.title, url: item.url });
    }
    return { attribution, titles };
  }
}
