import type { Stock } from "@/data/stockData";

export type YahooQuoteRow = {
  symbol?: unknown;
  longName?: unknown;
  shortName?: unknown;
  regularMarketPrice?: unknown;
  regularMarketPreviousClose?: unknown;
  regularMarketChange?: unknown;
  regularMarketChangePercent?: unknown;
  regularMarketVolume?: unknown;
  marketCap?: unknown;
  regularMarketOpen?: unknown;
  regularMarketDayHigh?: unknown;
  regularMarketDayLow?: unknown;
};

function asNumber(value: unknown): number | undefined {
  return typeof value === "number" && Number.isFinite(value)
    ? value
    : undefined;
}

function asTicker(value: unknown): string | undefined {
  return typeof value === "string" && value.trim() ? value.trim() : undefined;
}

function asName(value: unknown): string | undefined {
  return typeof value === "string" && value.trim() ? value.trim() : undefined;
}

export function collectQuoteRowsFromSettled(
  settled: Array<PromiseSettledResult<unknown>>,
): YahooQuoteRow[] {
  const rows: YahooQuoteRow[] = [];
  for (const item of settled) {
    if (item.status !== "fulfilled" || !Array.isArray(item.value)) continue;
    for (const row of item.value) {
      if (row && typeof row === "object") rows.push(row as YahooQuoteRow);
    }
  }
  return rows;
}

export function mergeStocksWithQuotes(
  currentStocks: Stock[],
  quoteRows: YahooQuoteRow[],
): Stock[] {
  const byTicker = new Map<string, YahooQuoteRow>();
  for (const row of quoteRows) {
    const symbol = asTicker(row.symbol);
    if (!symbol) continue;
    byTicker.set(symbol, row);
  }

  return currentStocks.map((stock) => {
    const quote = byTicker.get(stock.ticker);
    if (!quote) return stock;

    const price = asNumber(quote.regularMarketPrice) ?? stock.price;
    const prevClose =
      asNumber(quote.regularMarketPreviousClose) ?? stock.prevClose;
    const change = asNumber(quote.regularMarketChange) ?? stock.change;
    const changePercent =
      asNumber(quote.regularMarketChangePercent) ??
      (prevClose > 0
        ? ((price - prevClose) / prevClose) * 100
        : stock.changePercent);

    return {
      ...stock,
      name: asName(quote.longName) ?? asName(quote.shortName) ?? stock.name,
      price,
      change,
      changePercent,
      volume: asNumber(quote.regularMarketVolume) ?? stock.volume,
      marketCap: asNumber(quote.marketCap) ?? stock.marketCap,
      open: asNumber(quote.regularMarketOpen) ?? stock.open,
      high: asNumber(quote.regularMarketDayHigh) ?? stock.high,
      low: asNumber(quote.regularMarketDayLow) ?? stock.low,
      prevClose,
    };
  });
}
