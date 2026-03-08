import type { Stock } from "@/data/stockData";

export type WeightedScore = {
  value: number;
  weight: number;
};

export type TechnicalInsight = {
  movingAverage: WeightedScore;
  rsiMomentum: WeightedScore;
  macdSignal: WeightedScore;
  volumeAnalysis: WeightedScore;
  brokerConsensus: WeightedScore;
  totalScore: number;
};

export type BrokerConsensus = {
  analysts: number;
  strongBuy: number;
  buy: number;
  hold: number;
  sell: number;
  strongSell: number;
  consensus: "Strong Buy" | "Buy" | "Hold" | "Sell" | "Strong Sell";
};

function clamp(value: number, min: number, max: number): number {
  return Math.max(min, Math.min(max, value));
}

function scoreToConsensus(score: number): BrokerConsensus["consensus"] {
  if (score >= 80) return "Strong Buy";
  if (score >= 65) return "Buy";
  if (score >= 45) return "Hold";
  if (score >= 30) return "Sell";
  return "Strong Sell";
}

export function getActionSignal(score: number): BrokerConsensus["consensus"] {
  return scoreToConsensus(score);
}

export function buildBrokerConsensus(stock: Stock): BrokerConsensus {
  const baseAnalysts = clamp(
    Math.round(8 + Math.log10(Math.max(stock.marketCap, 1)) * 3),
    8,
    30,
  );
  const momentumBias =
    stock.changePercent > 0 ? 2 : stock.changePercent < -2 ? -2 : 0;
  const qualityBias = stock.roe > 15 ? 2 : stock.roe < 5 ? -2 : 0;
  const score = clamp(
    50 + momentumBias * 8 + qualityBias * 7 - stock.beta * 3,
    0,
    100,
  );

  let strongBuy = clamp(
    Math.round((score / 100) * 0.15 * baseAnalysts),
    0,
    baseAnalysts,
  );
  let buy = clamp(
    Math.round((score / 100) * 0.45 * baseAnalysts),
    0,
    baseAnalysts,
  );
  let hold = clamp(
    Math.round((1 - Math.abs(score - 50) / 50) * 0.3 * baseAnalysts),
    0,
    baseAnalysts,
  );
  let sell = clamp(
    Math.round(((100 - score) / 100) * 0.08 * baseAnalysts),
    0,
    baseAnalysts,
  );
  let strongSell = clamp(
    Math.round(((100 - score) / 100) * 0.02 * baseAnalysts),
    0,
    baseAnalysts,
  );

  let used = strongBuy + buy + hold + sell + strongSell;
  while (used < baseAnalysts) {
    if (score >= 55) {
      if (buy <= strongBuy + 4) buy += 1;
      else hold += 1;
    } else if (score <= 40) {
      if (sell <= strongSell + 4) sell += 1;
      else hold += 1;
    } else {
      hold += 1;
    }
    used += 1;
  }

  while (used > baseAnalysts) {
    if (hold > 0) hold -= 1;
    else if (buy > 0) buy -= 1;
    else if (sell > 0) sell -= 1;
    else if (strongBuy > 0) strongBuy -= 1;
    else if (strongSell > 0) strongSell -= 1;
    used -= 1;
  }

  return {
    analysts: baseAnalysts,
    strongBuy,
    buy,
    hold,
    sell,
    strongSell,
    consensus: scoreToConsensus(score),
  };
}

export function buildTechnicalInsight(stock: Stock): TechnicalInsight {
  const movingAverage = clamp(
    50 + stock.changePercent * 7 + (stock.price > stock.open ? 8 : -8),
    0,
    100,
  );
  const rsiApprox = clamp(
    50 + stock.changePercent * 5 - (stock.beta - 1) * 10,
    0,
    100,
  );
  const rsiMomentum = rsiApprox > 70 || rsiApprox < 30 ? 35 : 65;
  const macdSignal = clamp(
    50 + stock.changePercent * 9 + (stock.roe > 12 ? 8 : -4),
    0,
    100,
  );
  const volumeAnalysis = clamp(
    35 +
      Math.log10(Math.max(stock.volume, 1)) * 6 +
      Math.abs(stock.changePercent) * 5,
    0,
    100,
  );
  const consensus = buildBrokerConsensus(stock);
  const consensusMap: Record<BrokerConsensus["consensus"], number> = {
    "Strong Buy": 90,
    Buy: 75,
    Hold: 55,
    Sell: 35,
    "Strong Sell": 20,
  };

  const weighted = {
    movingAverage: { value: movingAverage, weight: 30 },
    rsiMomentum: { value: rsiMomentum, weight: 25 },
    macdSignal: { value: macdSignal, weight: 25 },
    volumeAnalysis: { value: volumeAnalysis, weight: 10 },
    brokerConsensus: { value: consensusMap[consensus.consensus], weight: 10 },
  };

  const totalScore = Math.round(
    (weighted.movingAverage.value * weighted.movingAverage.weight +
      weighted.rsiMomentum.value * weighted.rsiMomentum.weight +
      weighted.macdSignal.value * weighted.macdSignal.weight +
      weighted.volumeAnalysis.value * weighted.volumeAnalysis.weight +
      weighted.brokerConsensus.value * weighted.brokerConsensus.weight) /
      100,
  );

  return { ...weighted, totalScore };
}
