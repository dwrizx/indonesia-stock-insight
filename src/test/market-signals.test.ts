import { describe, expect, it } from "vitest";
import { generateMarketSignals } from "@/lib/marketSignals";
import type { Stock } from "@/data/stockData";

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

describe("generateMarketSignals", () => {
  it("returns breakout and rebound candidates from stock set", () => {
    const stocks: Stock[] = [
      makeStock({
        ticker: "BRK.JK",
        name: "Breakout",
        price: 1185,
        high52w: 1200,
        changePercent: 2.4,
      }),
      makeStock({
        ticker: "RBD.JK",
        name: "Rebound",
        price: 840,
        low52w: 800,
        changePercent: 1.2,
      }),
      makeStock({
        ticker: "ACT.JK",
        name: "Active",
        price: 2000,
        volume: 50_000_000,
        changePercent: -2.1,
      }),
    ];

    const result = generateMarketSignals(stocks, 3);

    expect(result.breakout.some((s) => s.ticker === "BRK.JK")).toBe(true);
    expect(result.rebound.some((s) => s.ticker === "RBD.JK")).toBe(true);
    expect(result.active.some((s) => s.ticker === "ACT.JK")).toBe(true);
  });
});
