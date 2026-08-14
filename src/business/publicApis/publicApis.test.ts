import { describe, expect, it, vi } from "vitest";
import { PublicApiClient } from "./client";

function mockFetch(map: Record<string, unknown>) {
  return vi.fn(async (url: string) => {
    for (const [key, value] of Object.entries(map)) {
      if (url.includes(key)) {
        return { ok: true, status: 200, json: value };
      }
    }
    return { ok: false, status: 404, json: { error: "missing mock", url } };
  });
}

describe("PublicApiClient", () => {
  it("fetches Frankfurter FX with attribution", async () => {
    const client = new PublicApiClient({
      fetchJson: mockFetch({
        "api.frankfurter.app": {
          base: "USD",
          date: "2026-08-14",
          rates: { EUR: 0.86 },
        },
      }),
    });
    const fx = await client.frankfurterLatest("USD", ["EUR"]);
    expect(fx.rates.EUR).toBe(0.86);
    expect(fx.attribution.name).toBe("Frankfurter");
    expect(fx.attribution.public_apis_section).toBe("Currency Exchange");
  });

  it("parses Free Dictionary definitions", async () => {
    const client = new PublicApiClient({
      fetchJson: mockFetch({
        "dictionaryapi.dev": [
          {
            meanings: [
              { definitions: [{ definition: "A fee paid for borrowing money" }] },
            ],
          },
        ],
      }),
    });
    const def = await client.defineWord("interest");
    expect(def.definitions[0]).toMatch(/fee/i);
  });

  it("searches Open Library", async () => {
    const client = new PublicApiClient({
      fetchJson: mockFetch({
        "openlibrary.org": {
          docs: [{ title: "Personal Finance For Dummies", author_name: ["Eric Tyson"] }],
        },
      }),
    });
    const books = await client.openLibrarySearch("personal finance", 1);
    expect(books.results[0]?.title).toMatch(/Personal Finance/i);
  });

  it("reads CoinGecko and HN", async () => {
    const client = new PublicApiClient({
      fetchJson: mockFetch({
        "simple/price": { bitcoin: { usd: 60000 } },
        "topstories.json": [1, 2],
        "item/1.json": { title: "Story One", url: "https://example.com" },
        "item/2.json": { title: "Story Two" },
      }),
    });
    const prices = await client.coinGeckoSimplePrice(["bitcoin"], ["usd"]);
    expect(prices.prices.bitcoin?.usd).toBe(60000);
    const hn = await client.hackerNewsTopTitles(2);
    expect(hn.titles).toHaveLength(2);
  });

  it("reads ZenQuotes", async () => {
    const client = new PublicApiClient({
      fetchJson: mockFetch({
        "zenquotes.io": [{ q: "Be curious", a: "Someone" }],
      }),
    });
    const q = await client.zenQuoteRandom();
    expect(q.quote).toBe("Be curious");
  });
});
