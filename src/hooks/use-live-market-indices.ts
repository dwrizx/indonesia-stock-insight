import { useEffect, useMemo, useState } from "react";
import { marketIndices, type MarketIndex } from "@/data/stockData";
import { yahooSnapshot } from "@/data/yahooSnapshot";
import {
  MARKET_INDEX_QUOTES,
  getMarketIndexQuoteCandidates,
  getMarketIndexQuoteSymbols,
} from "@/lib/marketIndex";

type LiveState = {
  indices: MarketIndex[];
  updatedAt: string;
  source: "yahoo-live" | "snapshot";
  loading: boolean;
};

function asNumber(value: unknown): number | undefined {
  return typeof value === "number" && Number.isFinite(value)
    ? value
    : undefined;
}

function formatTime(value: Date | string): string {
  const date = value instanceof Date ? value : new Date(value);
  if (Number.isNaN(date.getTime())) return "-";

  return date.toLocaleTimeString("id-ID", {
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
  });
}

const SNAPSHOT_UPDATED_AT = formatTime(yahooSnapshot.generatedAt);

export function useLiveMarketIndices(refreshMs: number = 60000): LiveState {
  const [indices, setIndices] = useState<MarketIndex[]>(marketIndices);
  const [updatedAt, setUpdatedAt] = useState<string>(SNAPSHOT_UPDATED_AT);
  const [source, setSource] = useState<"yahoo-live" | "snapshot">("snapshot");
  const [loading, setLoading] = useState<boolean>(false);

  useEffect(() => {
    let canceled = false;

    const fetchLive = async () => {
      setLoading(true);
      try {
        const symbols = getMarketIndexQuoteSymbols().join(",");
        const url = `https://query1.finance.yahoo.com/v7/finance/quote?symbols=${encodeURIComponent(symbols)}`;
        const res = await fetch(url);
        if (!res.ok) throw new Error(`Yahoo quote failed: ${res.status}`);

        const raw = await res.json();
        const result: any[] = raw?.quoteResponse?.result ?? [];
        if (!result.length) throw new Error("No quote result");

        const bySymbol = new Map<string, any>(
          result
            .filter((q) => typeof q?.symbol === "string")
            .map((q) => [q.symbol as string, q]),
        );

        if (!canceled) {
          setIndices((current) =>
            MARKET_INDEX_QUOTES.map(({ name }, i) => {
              const fallback = current[i] ?? marketIndices[i];
              const quote = getMarketIndexQuoteCandidates(name)
                .map((symbol) => bySymbol.get(symbol))
                .find(Boolean);
              if (!quote) return fallback;

              return {
                name,
                value: asNumber(quote.regularMarketPrice) ?? fallback.value,
                change: asNumber(quote.regularMarketChange) ?? fallback.change,
                changePercent:
                  asNumber(quote.regularMarketChangePercent) ??
                  fallback.changePercent,
              };
            }),
          );
          setSource("yahoo-live");
          setUpdatedAt(formatTime(new Date()));
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
    () => ({ indices, updatedAt, source, loading }),
    [indices, updatedAt, source, loading],
  );
}
