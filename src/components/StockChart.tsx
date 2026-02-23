import { useEffect, useMemo, useRef, useState } from "react";
import {
  ColorType,
  createChart,
  HistogramSeries,
  LineSeries,
  type IChartApi,
  type ISeriesApi,
  type UTCTimestamp,
} from "lightweight-charts";
import { motion } from "framer-motion";
import { generateChartData } from "@/data/stockData";
import { getMarketSession } from "@/lib/marketSession";

interface StockChartProps {
  basePrice: number;
  ticker: string;
}

type PeriodOption = {
  label: "1D" | "5D" | "1M" | "6M" | "YTD" | "1Y" | "5Y" | "All";
  range: string;
  interval: string;
  fallbackDays: number;
  tickMode: "time" | "date";
};

type ChartPoint = {
  timestamp: number;
  date: string;
  price: number;
  volume: number;
};

const periods: PeriodOption[] = [
  {
    label: "1D",
    range: "1d",
    interval: "5m",
    fallbackDays: 1,
    tickMode: "time",
  },
  {
    label: "5D",
    range: "5d",
    interval: "30m",
    fallbackDays: 5,
    tickMode: "date",
  },
  {
    label: "1M",
    range: "1mo",
    interval: "1d",
    fallbackDays: 30,
    tickMode: "date",
  },
  {
    label: "6M",
    range: "6mo",
    interval: "1d",
    fallbackDays: 180,
    tickMode: "date",
  },
  {
    label: "YTD",
    range: "ytd",
    interval: "1d",
    fallbackDays: 365,
    tickMode: "date",
  },
  {
    label: "1Y",
    range: "1y",
    interval: "1d",
    fallbackDays: 365,
    tickMode: "date",
  },
  {
    label: "5Y",
    range: "5y",
    interval: "1wk",
    fallbackDays: 1825,
    tickMode: "date",
  },
  {
    label: "All",
    range: "max",
    interval: "1mo",
    fallbackDays: 3650,
    tickMode: "date",
  },
];

function formatTick(timestamp: number, mode: PeriodOption["tickMode"]): string {
  const date = new Date(timestamp * 1000);
  if (mode === "time") {
    return date.toLocaleTimeString("id-ID", {
      hour: "2-digit",
      minute: "2-digit",
    });
  }
  return date.toLocaleDateString("id-ID", {
    day: "2-digit",
    month: "short",
  });
}

function toYahooChartData(
  raw: any,
  mode: PeriodOption["tickMode"],
): ChartPoint[] {
  const result = raw?.chart?.result?.[0];
  const timestamps: number[] = result?.timestamp ?? [];
  const quote = result?.indicators?.quote?.[0];
  const closes: Array<number | null> = quote?.close ?? [];
  const volumes: Array<number | null> = quote?.volume ?? [];

  return timestamps
    .map((ts, i) => {
      const close = closes[i];
      if (typeof close !== "number" || !Number.isFinite(close)) return null;
      return {
        timestamp: ts,
        date: formatTick(ts, mode),
        price: Math.round(close),
        volume:
          typeof volumes[i] === "number" && Number.isFinite(volumes[i])
            ? volumes[i]
            : 0,
      };
    })
    .filter((point): point is ChartPoint => point !== null);
}

function toFallbackData(basePrice: number, days: number): ChartPoint[] {
  const nowTs = Math.floor(Date.now() / 1000);
  return generateChartData(basePrice, days).map((point, i) => ({
    ...point,
    timestamp: nowTs - (days - i) * 86400,
  }));
}

const StockChart = ({ basePrice, ticker }: StockChartProps) => {
  const [activePeriod, setActivePeriod] = useState(2);
  const [data, setData] = useState<ChartPoint[]>(
    toFallbackData(basePrice, periods[2].fallbackDays),
  );
  const [isLoading, setIsLoading] = useState(false);
  const [source, setSource] = useState<"yahoo" | "fallback">("fallback");
  const [updatedAt, setUpdatedAt] = useState("-");

  const marketSession = getMarketSession();

  const priceContainerRef = useRef<HTMLDivElement>(null);
  const volumeContainerRef = useRef<HTMLDivElement>(null);

  const priceChartRef = useRef<IChartApi | null>(null);
  const volumeChartRef = useRef<IChartApi | null>(null);

  const priceSeriesRef = useRef<ISeriesApi<"Line"> | null>(null);
  const maSeriesRef = useRef<ISeriesApi<"Line"> | null>(null);
  const volumeSeriesRef = useRef<ISeriesApi<"Histogram"> | null>(null);

  const dataWithMA = useMemo(() => {
    const window = activePeriod <= 1 ? 5 : 7;
    return data.map((d, i) => {
      if (i < window - 1) return { ...d, ma: null as number | null };
      const slice = data.slice(i - window + 1, i + 1);
      const avg = slice.reduce((acc, item) => acc + item.price, 0) / window;
      return { ...d, ma: Math.round(avg) };
    });
  }, [data, activePeriod]);

  const isGain = data[data.length - 1]?.price >= data[0]?.price;

  useEffect(() => {
    let canceled = false;
    const period = periods[activePeriod];

    const load = async () => {
      setIsLoading(true);
      try {
        const url = `https://query1.finance.yahoo.com/v8/finance/chart/${encodeURIComponent(
          ticker,
        )}?range=${period.range}&interval=${period.interval}`;
        const response = await fetch(url);
        if (!response.ok)
          throw new Error(`Yahoo chart request failed: ${response.status}`);

        const raw = await response.json();
        const parsed = toYahooChartData(raw, period.tickMode);
        if (!parsed.length) throw new Error("No chart data returned");

        if (!canceled) {
          setData(parsed);
          setSource("yahoo");
          setUpdatedAt(
            new Date().toLocaleTimeString("id-ID", {
              hour: "2-digit",
              minute: "2-digit",
            }),
          );
        }
      } catch {
        if (!canceled) {
          setData(toFallbackData(basePrice, period.fallbackDays));
          setSource("fallback");
          setUpdatedAt(
            new Date().toLocaleTimeString("id-ID", {
              hour: "2-digit",
              minute: "2-digit",
            }),
          );
        }
      } finally {
        if (!canceled) setIsLoading(false);
      }
    };

    load();
    const refreshMs = activePeriod <= 1 ? 30000 : 120000;
    const timer = window.setInterval(load, refreshMs);
    return () => {
      canceled = true;
      window.clearInterval(timer);
    };
  }, [activePeriod, basePrice, ticker]);

  useEffect(() => {
    if (!priceContainerRef.current || !volumeContainerRef.current) return;

    const priceChart = createChart(priceContainerRef.current, {
      width: priceContainerRef.current.clientWidth,
      height: 320,
      layout: {
        textColor: "hsl(215, 15%, 60%)",
        background: { type: ColorType.Solid, color: "transparent" },
      },
      grid: {
        vertLines: { color: "hsl(222, 14%, 12%)" },
        horzLines: { color: "hsl(222, 14%, 12%)" },
      },
      rightPriceScale: {
        borderColor: "hsl(222, 14%, 16%)",
      },
      timeScale: {
        borderColor: "hsl(222, 14%, 16%)",
        timeVisible: activePeriod <= 1,
        secondsVisible: false,
      },
    });

    const volumeChart = createChart(volumeContainerRef.current, {
      width: volumeContainerRef.current.clientWidth,
      height: 140,
      layout: {
        textColor: "hsl(215, 15%, 60%)",
        background: { type: ColorType.Solid, color: "transparent" },
      },
      grid: {
        vertLines: { color: "hsl(222, 14%, 12%)" },
        horzLines: { color: "hsl(222, 14%, 12%)" },
      },
      rightPriceScale: {
        borderColor: "hsl(222, 14%, 16%)",
      },
      timeScale: {
        borderColor: "hsl(222, 14%, 16%)",
        timeVisible: activePeriod <= 1,
        secondsVisible: false,
      },
    });

    const priceSeries = priceChart.addSeries(LineSeries, {
      color: "hsl(152, 69%, 46%)",
      lineWidth: 2,
      priceLineVisible: false,
      lastValueVisible: true,
    });

    const maSeries = priceChart.addSeries(LineSeries, {
      color: "hsl(45, 93%, 58%)",
      lineWidth: 1,
      lineStyle: 2,
      priceLineVisible: false,
      lastValueVisible: false,
    });

    const volumeSeries = volumeChart.addSeries(HistogramSeries, {
      priceFormat: { type: "volume" },
      color: "hsl(45, 93%, 58%)",
    });

    priceChartRef.current = priceChart;
    volumeChartRef.current = volumeChart;
    priceSeriesRef.current = priceSeries;
    maSeriesRef.current = maSeries;
    volumeSeriesRef.current = volumeSeries;

    const resize = () => {
      if (priceContainerRef.current) {
        priceChart.applyOptions({
          width: priceContainerRef.current.clientWidth,
        });
      }
      if (volumeContainerRef.current) {
        volumeChart.applyOptions({
          width: volumeContainerRef.current.clientWidth,
        });
      }
    };

    const observer = new ResizeObserver(resize);
    observer.observe(priceContainerRef.current);
    observer.observe(volumeContainerRef.current);

    return () => {
      observer.disconnect();
      priceChart.remove();
      volumeChart.remove();
      priceChartRef.current = null;
      volumeChartRef.current = null;
      priceSeriesRef.current = null;
      maSeriesRef.current = null;
      volumeSeriesRef.current = null;
    };
  }, [activePeriod]);

  useEffect(() => {
    if (
      !priceSeriesRef.current ||
      !maSeriesRef.current ||
      !volumeSeriesRef.current
    )
      return;

    priceSeriesRef.current.applyOptions({
      color: isGain ? "hsl(152, 69%, 46%)" : "hsl(0, 72%, 55%)",
    });

    priceSeriesRef.current.setData(
      dataWithMA.map((point) => ({
        time: point.timestamp as UTCTimestamp,
        value: point.price,
      })),
    );

    maSeriesRef.current.setData(
      dataWithMA
        .filter((point) => typeof point.ma === "number")
        .map((point) => ({
          time: point.timestamp as UTCTimestamp,
          value: point.ma as number,
        })),
    );

    volumeSeriesRef.current.setData(
      dataWithMA.map((point) => ({
        time: point.timestamp as UTCTimestamp,
        value: point.volume,
        color:
          point.price >= (point.ma ?? point.price)
            ? "hsl(152, 69%, 46%)"
            : "hsl(0, 72%, 55%)",
      })),
    );

    priceChartRef.current?.timeScale().fitContent();
    volumeChartRef.current?.timeScale().fitContent();
  }, [dataWithMA, isGain]);

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <div className="flex flex-wrap items-center gap-1 rounded-lg bg-secondary/50 p-1 w-fit">
          {periods.map((p, i) => (
            <button
              key={p.label}
              onClick={() => setActivePeriod(i)}
              className={`rounded-md px-3 py-1.5 text-xs font-bold transition-all ${
                activePeriod === i
                  ? "bg-primary text-primary-foreground shadow-lg shadow-primary/20"
                  : "text-muted-foreground hover:text-foreground"
              }`}
            >
              {p.label}
            </button>
          ))}
        </div>
        <div className="text-[10px] text-muted-foreground">
          Sumber: {source === "yahoo" ? "Yahoo Live" : "Fallback"} · Update{" "}
          {updatedAt} · Pasar {marketSession.shortLabel}
        </div>
      </div>

      <motion.div
        key={`lw-price-${activePeriod}`}
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.2 }}
        className="card-shine rounded-xl border border-border p-5"
      >
        <div className="mb-4 flex items-center justify-between">
          <h3 className="text-xs font-bold text-muted-foreground uppercase tracking-wider">
            Harga Saham - {periods[activePeriod].label}
          </h3>
          {isLoading && (
            <span className="text-[10px] text-muted-foreground">Memuat...</span>
          )}
        </div>
        <div ref={priceContainerRef} className="h-[320px] w-full" />
      </motion.div>

      <div className="card-shine rounded-xl border border-border p-5">
        <h3 className="mb-4 text-xs font-bold text-muted-foreground uppercase tracking-wider">
          Volume Perdagangan
        </h3>
        <div ref={volumeContainerRef} className="h-[140px] w-full" />
      </div>
    </div>
  );
};

export default StockChart;
