import { useEffect, useMemo, useState } from "react";
import { marketIndices, type MarketIndex } from "@/data/stockData";

type LiveState = {
  indices: MarketIndex[];
  updatedAt: string;
  source: "yahoo-live" | "snapshot";
  loading: boolean;
};

const INDEX_SYMBOLS: Array<{ name: string; symbol: string }> = [
  { name: "IHSG", symbol: "^JKSE" },
  { name: "LQ45", symbol: "^JKLQ45" },
  { name: "IDX30", symbol: "^JKIDX30" },
  { name: "JII", symbol: "^JKII" },
];

function asNumber(value: unknown): number | undefined {
  return typeof value === "number" && Number.isFinite(value)
    ? value
    : undefined;
}

export function useLiveMarketIndices(refreshMs: number = 60000): LiveState {
  const [indices, setIndices] = useState<MarketIndex[]>(marketIndices);
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

    const fetchLive = async () => {
      setLoading(true);
      try {
        const symbols = INDEX_SYMBOLS.map((s) => s.symbol).join(",");
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

        const next = INDEX_SYMBOLS.map(({ name, symbol }, i) => {
          const fallback = marketIndices[i];
          const quote = bySymbol.get(symbol);
          if (!quote) return fallback;

          return {
            name,
            value: asNumber(quote.regularMarketPrice) ?? fallback.value,
            change: asNumber(quote.regularMarketChange) ?? fallback.change,
            changePercent:
              asNumber(quote.regularMarketChangePercent) ??
              fallback.changePercent,
          };
        });

        if (!canceled) {
          setIndices(next);
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
          setIndices(marketIndices);
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
    () => ({ indices, updatedAt, source, loading }),
    [indices, updatedAt, source, loading],
  );
}
