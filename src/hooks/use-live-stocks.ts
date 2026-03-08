import { useEffect, useMemo, useState } from "react";
import { stocks as baseStocks, type Stock } from "@/data/stockData";
import { yahooSnapshot } from "@/data/yahooSnapshot";
import {
  collectQuoteRowsFromSettled,
  mergeStocksWithQuotes,
} from "@/lib/liveStocks";

type LiveStocksState = {
  stocks: Stock[];
  updatedAt: string;
  source: "yahoo-live" | "snapshot";
  loading: boolean;
};

const BATCH_SIZE = 80;

function formatTime(value: Date | string): string {
  const date = value instanceof Date ? value : new Date(value);
  if (Number.isNaN(date.getTime())) return "-";

  return date.toLocaleTimeString("id-ID", {
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
  });
}

function chunk<T>(items: T[], size: number): T[][] {
  const batches: T[][] = [];
  for (let i = 0; i < items.length; i += size) {
    batches.push(items.slice(i, i + size));
  }
  return batches;
}

const SNAPSHOT_UPDATED_AT = formatTime(yahooSnapshot.generatedAt);

export function useLiveStocks(refreshMs: number = 120000): LiveStocksState {
  const [stocks, setStocks] = useState<Stock[]>(baseStocks);
  const [updatedAt, setUpdatedAt] = useState<string>(SNAPSHOT_UPDATED_AT);
  const [source, setSource] = useState<"yahoo-live" | "snapshot">("snapshot");
  const [loading, setLoading] = useState<boolean>(false);

  useEffect(() => {
    let canceled = false;
    const symbolList = baseStocks.map((s) => s.ticker);
    const batches = chunk(symbolList, BATCH_SIZE);

    const fetchLive = async () => {
      setLoading(true);
      try {
        const settled = await Promise.allSettled(
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

        const quoteRows = collectQuoteRowsFromSettled(settled);

        if (!canceled) {
          if (quoteRows.length > 0) {
            setStocks((current) => mergeStocksWithQuotes(current, quoteRows));
            setSource("yahoo-live");
            setUpdatedAt(formatTime(new Date()));
          } else {
            setSource("snapshot");
            setUpdatedAt(SNAPSHOT_UPDATED_AT);
          }
        }
      } catch {
        if (!canceled) {
          setSource("snapshot");
          setUpdatedAt(SNAPSHOT_UPDATED_AT);
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
