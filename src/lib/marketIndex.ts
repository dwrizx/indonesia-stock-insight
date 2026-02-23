const MARKET_INDEX_SYMBOLS: Record<string, string> = {
  IHSG: "^JKSE",
  LQ45: "^JKLQ45",
  IDX30: "^JKIDX30",
  JII: "^JKII",
};

export function getMarketIndexUrl(name: string): string {
  const symbol = MARKET_INDEX_SYMBOLS[name];
  if (!symbol) {
    return `https://finance.yahoo.com/lookup?s=${encodeURIComponent(name)}`;
  }

  return `https://finance.yahoo.com/quote/${encodeURIComponent(symbol)}`;
}
