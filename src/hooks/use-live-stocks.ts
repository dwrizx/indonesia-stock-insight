import { useEffect, useMemo, useState } from "react";
import { stocks as baseStocks, type Stock } from "@/data/stockData";

type LiveStocksState = {
  stocks: Stock[];
  updatedAt: string;
  source: "yahoo-live" | "snapshot";
  loading: boolean;
};

const BATCH_SIZE = 80;

function asNumber(value: unknown): number | undefined {
  return typeof value === "number" && Number.isFinite(value)
    ? value
    : undefined;
}

function chunk<T>(items: T[], size: number): T[][] {
  const batches: T[][] = [];
  for (let i = 0; i < items.length; i += size) {
    batches.push(items.slice(i, i + size));
  }
  return batches;
}

export function useLiveStocks(refreshMs: number = 120000): LiveStocksState {
  const [stocks, setStocks] = useState<Stock[]>(baseStocks);
  const [updatedAt, setUpdatedAt] = useState<string>(
    new Date().toLocaleTimeString("id-ID", {
      hour: "2-digit",
      minute: "2-digit",
      second: "2-digit",
    }),
  );
  const [source, setSource] = useState<"yahoo-live" | "snapshot">("snapshot");
  const [loading, setLoading] = useState<boolean>(false);

  useEffect(() => {
    let canceled = false;
    const symbolList = baseStocks.map((s) => s.ticker);
    const batches = chunk(symbolList, BATCH_SIZE);

    const fetchLive = async () => {
      setLoading(true);
      try {
        const results = await Promise.all(
          batches.map(async (symbols) => {
            const url = `https://query1.finance.yahoo.com/v7/finance/quote?symbols=${encodeURIComponent(
              symbols.join(","),
            )}`;
            const response = await fetch(url);
            if (!response.ok)
              throw new Error(`Yahoo quote failed: ${response.status}`);
            const raw = await response.json();
            return raw?.quoteResponse?.result ?? [];
          }),
        );

        const flat = results.flat();
        const byTicker = new Map<string, any>(
          flat
            .filter((row: any) => typeof row?.symbol === "string")
            .map((row: any) => [row.symbol as string, row]),
        );

        const merged = baseStocks.map((stock) => {
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
            name:
              (typeof quote.longName === "string" && quote.longName) ||
              (typeof quote.shortName === "string" && quote.shortName) ||
              stock.name,
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

        if (!canceled) {
          setStocks(merged);
          setSource("yahoo-live");
          setUpdatedAt(
            new Date().toLocaleTimeString("id-ID", {
              hour: "2-digit",
              minute: "2-digit",
              second: "2-digit",
            }),
          );
        }
      } catch {
        if (!canceled) {
          setStocks(baseStocks);
          setSource("snapshot");
        }
      } finally {
        if (!canceled) setLoading(false);
      }
    };

    fetchLive();
    const timer = window.setInterval(fetchLive, refreshMs);
    return () => {
      canceled = true;
      window.clearInterval(timer);
    };
  }, [refreshMs]);

  return useMemo(
    () => ({ stocks, updatedAt, source, loading }),
    [stocks, updatedAt, source, loading],
  );
}
