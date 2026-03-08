export type MarketIndexName = "IHSG" | "LQ45" | "IDX30" | "JII";

type MarketIndexQuoteMeta = {
  name: MarketIndexName;
  primarySymbol: string;
  fallbackSymbols?: string[];
};

export const MARKET_INDEX_QUOTES: MarketIndexQuoteMeta[] = [
  { name: "IHSG", primarySymbol: "^JKSE" },
  { name: "LQ45", primarySymbol: "^JKLQ45" },
  {
    name: "IDX30",
    primarySymbol: "IDX30.JK",
    fallbackSymbols: ["^JKIDX30"],
  },
  { name: "JII", primarySymbol: "^JKII" },
];

function getQuoteMeta(name: string): MarketIndexQuoteMeta | undefined {
  return MARKET_INDEX_QUOTES.find((item) => item.name === name);
}

export function getMarketIndexQuoteCandidates(name: string): string[] {
  const meta = getQuoteMeta(name);
  if (!meta) return [];
  return [meta.primarySymbol, ...(meta.fallbackSymbols ?? [])];
}

export function getMarketIndexQuoteSymbols(): string[] {
  return [
    ...new Set(
      MARKET_INDEX_QUOTES.flatMap((item) =>
        getMarketIndexQuoteCandidates(item.name),
      ),
    ),
  ];
}

export function getMarketIndexUrl(name: string): string {
  const symbol = getMarketIndexQuoteCandidates(name)[0];
  if (!symbol) {
    return `https://finance.yahoo.com/lookup?s=${encodeURIComponent(name)}`;
  }

  return `https://finance.yahoo.com/quote/${encodeURIComponent(symbol)}`;
}
