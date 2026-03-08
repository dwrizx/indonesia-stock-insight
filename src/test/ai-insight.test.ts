import { describe, expect, it } from "vitest";
import {
  buildBrokerConsensus,
  buildTechnicalInsight,
  getActionSignal,
} from "@/lib/aiInsight";
import type { Stock } from "@/data/stockData";

function stockOf(partial: Partial<Stock>): Stock {
  return {
    ticker: "TEST.JK",
    name: "Test",
    sector: "Keuangan",
    price: 1000,
    change: 10,
    changePercent: 1,
    volume: 10_000_000,
    marketCap: 50_000_000_000_000,
    pe: 12,
    pbv: 1.8,
    dividendYield: 3,
    high52w: 1300,
    low52w: 800,
    open: 990,
    high: 1020,
    low: 980,
    prevClose: 990,
    eps: 100,
    roe: 16,
    beta: 1,
    debtToEquity: 0.8,
    ...partial,
  };
}

describe("aiInsight", () => {
  it("builds technical score in 0-100 and valid action signal", () => {
    const insight = buildTechnicalInsight(stockOf({ changePercent: -1.2 }));
    expect(insight.totalScore).toBeGreaterThanOrEqual(0);
    expect(insight.totalScore).toBeLessThanOrEqual(100);
    expect(["Strong Buy", "Buy", "Hold", "Sell", "Strong Sell"]).toContain(
      getActionSignal(insight.totalScore),
    );
  });

  it("builds broker consensus with non-negative counts and analysts total", () => {
    const consensus = buildBrokerConsensus(stockOf({ marketCap: 5e14 }));
    const sum =
      consensus.strongBuy +
      consensus.buy +
      consensus.hold +
      consensus.sell +
      consensus.strongSell;
    expect(sum).toBe(consensus.analysts);
    expect(consensus.analysts).toBeGreaterThan(0);
  });
});
