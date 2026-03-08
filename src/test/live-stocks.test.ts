import { describe, expect, it } from "vitest";
import type { Stock } from "@/data/stockData";
import {
  collectQuoteRowsFromSettled,
  mergeStocksWithQuotes,
} from "@/lib/liveStocks";

function makeStock(partial: Partial<Stock>): Stock {
  return {
    ticker: "TEST.JK",
    name: "Test",
    sector: "Keuangan",
    price: 1000,
    change: 10,
    changePercent: 1,
    volume: 1_000_000,
    marketCap: 10_000_000_000_000,
    pe: 10,
    pbv: 1,
    dividendYield: 1,
    high52w: 1200,
    low52w: 800,
    open: 990,
    high: 1010,
    low: 980,
    prevClose: 990,
    eps: 100,
    roe: 10,
    beta: 1,
    debtToEquity: 0.8,
    ...partial,
  };
}

describe("collectQuoteRowsFromSettled", () => {
  it("collects rows from fulfilled batches and ignores rejected ones", () => {
    const rows = collectQuoteRowsFromSettled([
      {
        status: "fulfilled",
        value: [{ symbol: "AAA.JK", regularMarketPrice: 123 }],
      },
      {
        status: "rejected",
        reason: new Error("rate limited"),
      },
      {
        status: "fulfilled",
        value: [{ symbol: "BBB.JK", regularMarketPrice: 456 }],
      },
    ]);

    expect(rows).toHaveLength(2);
    expect(rows.map((row) => row.symbol)).toEqual(["AAA.JK", "BBB.JK"]);
  });
});

describe("mergeStocksWithQuotes", () => {
  it("updates available tickers while keeping non-updated tickers intact", () => {
    const base: Stock[] = [
      makeStock({ ticker: "AAA.JK", price: 100, prevClose: 95 }),
      makeStock({ ticker: "BBB.JK", price: 200, prevClose: 190 }),
    ];

    const merged = mergeStocksWithQuotes(base, [
      {
        symbol: "AAA.JK",
        regularMarketPrice: 110,
        regularMarketPreviousClose: 100,
        regularMarketChange: 10,
        regularMarketChangePercent: 10,
        regularMarketVolume: 12345,
      },
    ]);

    expect(merged[0]?.ticker).toBe("AAA.JK");
    expect(merged[0]?.price).toBe(110);
    expect(merged[0]?.volume).toBe(12345);
    expect(merged[1]?.ticker).toBe("BBB.JK");
    expect(merged[1]?.price).toBe(200);
    expect(merged[1]?.prevClose).toBe(190);
  });
});
