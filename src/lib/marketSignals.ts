import type { Stock } from "@/data/stockData";

export type SignalItem = {
  ticker: string;
  name: string;
  price: number;
  changePercent: number;
  reason: string;
  score: number;
};

export type MarketSignals = {
  breakout: SignalItem[];
  rebound: SignalItem[];
  active: SignalItem[];
};

function byScore(a: SignalItem, b: SignalItem): number {
  return b.score - a.score;
}

export function generateMarketSignals(
  stocks: Stock[],
  limit: number = 5,
): MarketSignals {
  const liquid = stocks.filter((s) => s.marketCap >= 2_000_000_000_000);

  const breakout = liquid
    .filter((stock) => stock.high52w > 0)
    .map((stock) => {
      const proximity = stock.price / stock.high52w;
      const score = proximity * 70 + Math.max(stock.changePercent, 0) * 8;
      return {
        ticker: stock.ticker,
        name: stock.name,
        price: stock.price,
        changePercent: stock.changePercent,
        reason: `Dekat high 52W (${(proximity * 100).toFixed(1)}%)`,
        score,
      };
    })
    .filter((signal) => signal.changePercent >= 1 && signal.score >= 72)
    .sort(byScore)
    .slice(0, limit);

  const rebound = liquid
    .filter((stock) => stock.low52w > 0)
    .map((stock) => {
      const fromLow = stock.price / stock.low52w;
      const score = (1.12 - fromLow) * 90 + Math.max(stock.changePercent, 0) * 7;
      return {
        ticker: stock.ticker,
        name: stock.name,
        price: stock.price,
        changePercent: stock.changePercent,
        reason: `Dekat low 52W (${(fromLow * 100).toFixed(1)}%)`,
        score,
      };
    })
    .filter((signal) => signal.changePercent > 0 && signal.score >= 6)
    .sort(byScore)
    .slice(0, limit);

  const active = liquid
    .map((stock) => {
      const turnover = stock.price * stock.volume;
      const score =
        Math.log10(Math.max(turnover, 1)) * 10 + Math.abs(stock.changePercent) * 4;
      return {
        ticker: stock.ticker,
        name: stock.name,
        price: stock.price,
        changePercent: stock.changePercent,
        reason: `Aktivitas tinggi (value ${Math.round(turnover / 1e9)}B)`,
        score,
      };
    })
    .filter((signal) => Math.abs(signal.changePercent) >= 1)
    .sort(byScore)
    .slice(0, limit);

  return { breakout, rebound, active };
}

