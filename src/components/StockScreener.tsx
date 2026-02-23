import { useCallback, useEffect, useMemo, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Filter,
  RotateCcw,
  LayoutGrid,
  List,
  TrendingUp,
  TrendingDown,
  Activity,
  Gauge,
  BarChart2,
  ChevronDown,
  ChevronUp,
  Check,
  Search,
} from "lucide-react";
import { useNavigate } from "react-router-dom";
import { stocks, Stock, formatRupiah } from "@/data/stockData";
import { Badge } from "@/components/ui/badge";

type Category = "Semua" | "Blue Chip" | "High Dividend" | "Growth" | "Value";
type Valuation = "All" | "Undervalued" | "Fair Value" | "Overvalued";
type Verdict = "All" | "Strong Buy" | "Buy" | "Hold" | "Sell" | "Strong Sell";

// Derive screening data from stock fundamentals
function getVerdict(stock: Stock): Verdict {
  let score = 0;
  if (stock.pe > 0 && stock.pe < 12) score += 2;
  else if (stock.pe > 0 && stock.pe < 18) score += 1;
  if (stock.roe > 18) score += 2;
  else if (stock.roe > 12) score += 1;
  if (stock.dividendYield > 4) score += 2;
  else if (stock.dividendYield > 2) score += 1;
  if (stock.changePercent > 2) score += 1;
  if (stock.debtToEquity < 1) score += 1;
  if (stock.beta < 1) score += 1;

  if (score >= 8) return "Strong Buy";
  if (score >= 6) return "Buy";
  if (score >= 4) return "Hold";
  if (score >= 2) return "Sell";
  return "Strong Sell";
}

function getValuation(stock: Stock): Valuation {
  if (stock.pe <= 0) return "Overvalued";
  if (stock.pe < 12 && stock.pbv < 2) return "Undervalued";
  if (stock.pe < 22 && stock.pbv < 5) return "Fair Value";
  return "Overvalued";
}

function getCategory(stock: Stock): Category[] {
  const cats: Category[] = ["Semua"];
  if (stock.marketCap > 100e12 && stock.pe > 0) cats.push("Blue Chip");
  if (stock.dividendYield > 3) cats.push("High Dividend");
  if (stock.changePercent > 1 && stock.roe > 15) cats.push("Growth");
  if (stock.pe > 0 && stock.pe < 15 && stock.pbv < 2) cats.push("Value");
  return cats;
}

function getRSI(stock: Stock, period: number): number {
  // Simulated RSI based on stock metrics
  const base =
    50 +
    stock.changePercent * 5 -
    (stock.beta - 1) * 10 +
    (period === 12 ? 2 : 0);
  return Math.max(10, Math.min(90, base + (stock.ticker.charCodeAt(2) % 15)));
}

function getMACD(stock: Stock): number {
  return +(
    stock.changePercent * 0.8 +
    (stock.roe > 15 ? 0.5 : -0.3) +
    (stock.beta - 1) * -0.2
  ).toFixed(2);
}

function getVolRatio(stock: Stock): number {
  return +(
    0.8 +
    Math.abs(stock.changePercent) * 0.15 +
    (stock.volume > 50e6 ? 0.3 : 0)
  ).toFixed(2);
}

function getPriceTargets(stock: Stock) {
  const conservative = Math.round(
    stock.price * (1 + (stock.roe > 15 ? 0.05 : 0.02)),
  );
  const moderate = Math.round(
    stock.price * (1 + (stock.roe > 15 ? 0.12 : 0.07)),
  );
  const aggressive = Math.round(
    stock.price * (1 + (stock.roe > 15 ? 0.22 : 0.15)),
  );
  return {
    conservative: {
      price: conservative,
      upside: +((conservative / stock.price - 1) * 100).toFixed(1),
    },
    moderate: {
      price: moderate,
      upside: +((moderate / stock.price - 1) * 100).toFixed(1),
    },
    aggressive: {
      price: aggressive,
      upside: +((aggressive / stock.price - 1) * 100).toFixed(1),
    },
  };
}

function getSignals(stock: Stock) {
  const w1 =
    stock.changePercent > 0
      ? "bullish"
      : stock.changePercent < -1
        ? "bearish"
        : "neutral";
  const m1 = stock.roe > 15 ? "bullish" : stock.roe < 5 ? "bearish" : "neutral";
  const m3 = stock.pe > 0 && stock.pe < 20 ? "bullish" : "bearish";
  return { "1W": w1, "1M": m1, "3M+": m3 } as Record<
    string,
    "bullish" | "bearish" | "neutral"
  >;
}

const verdictColors: Record<Verdict, string> = {
  "Strong Buy": "bg-gain/20 text-gain border-gain/30",
  Buy: "bg-gain/15 text-gain border-gain/20",
  Hold: "bg-primary/15 text-primary border-primary/20",
  Sell: "bg-loss/15 text-loss border-loss/20",
  "Strong Sell": "bg-loss/20 text-loss border-loss/30",
  All: "",
};

const signalColors = {
  bullish: "bg-gain/15 text-gain border-gain/25",
  bearish: "bg-loss/15 text-loss border-loss/25",
  neutral: "bg-muted text-muted-foreground border-border",
};

const categories: Category[] = [
  "Semua",
  "Blue Chip",
  "High Dividend",
  "Growth",
  "Value",
];
const valuations: Valuation[] = [
  "All",
  "Undervalued",
  "Fair Value",
  "Overvalued",
];
const verdicts: Verdict[] = [
  "All",
  "Strong Buy",
  "Buy",
  "Hold",
  "Sell",
  "Strong Sell",
];
const pageSizeOptions = [10, 20, 50, 100] as const;

const StockScreener = () => {
  const navigate = useNavigate();
  const [category, setCategory] = useState<Category>("Semua");
  const [sector, setSector] = useState<string>("Semua");
  const [valuation, setValuation] = useState<Valuation>("All");
  const [verdict, setVerdict] = useState<Verdict>("All");
  const [shariaOnly, setShariaOnly] = useState(false);
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid");
  const [selectedTickers, setSelectedTickers] = useState<Set<string>>(
    new Set(),
  );
  const [showFilters, setShowFilters] = useState(true);
  const [showTickers, setShowTickers] = useState(false);
  const [tickerQuery, setTickerQuery] = useState("");
  const [pageSize, setPageSize] = useState<number>(20);
  const [currentPage, setCurrentPage] = useState<number>(1);

  const sectorOptions = useMemo(
    () => ["Semua", ...Array.from(new Set(stocks.map((s) => s.sector))).sort()],
    [],
  );

  const toggleTicker = (ticker: string) => {
    setSelectedTickers((prev) => {
      const next = new Set(prev);
      if (next.has(ticker)) next.delete(ticker);
      else next.add(ticker);
      return next;
    });
  };

  const passSharedFilters = useCallback(
    (
      stock: Stock,
      options?: { ignoreCategory?: boolean; ignoreSector?: boolean },
    ) => {
      const ignoreCategory = options?.ignoreCategory ?? false;
      const ignoreSector = options?.ignoreSector ?? false;

      if (
        !ignoreCategory &&
        category !== "Semua" &&
        !getCategory(stock).includes(category)
      )
        return false;
      if (!ignoreSector && sector !== "Semua" && stock.sector !== sector)
        return false;
      if (valuation !== "All" && getValuation(stock) !== valuation)
        return false;
      if (verdict !== "All" && getVerdict(stock) !== verdict) return false;
      if (shariaOnly && stock.debtToEquity > 1) return false;
      if (selectedTickers.size > 0 && !selectedTickers.has(stock.ticker))
        return false;
      return true;
    },
    [category, sector, valuation, verdict, shariaOnly, selectedTickers],
  );

  const filteredStocks = useMemo(() => {
    return stocks.filter((stock) => passSharedFilters(stock));
  }, [passSharedFilters]);

  const categoryCounts = useMemo(() => {
    const counts: Record<string, number> = {};
    for (const c of categories) {
      counts[c] = stocks.filter((stock) => {
        if (!passSharedFilters(stock, { ignoreCategory: true })) return false;
        return c === "Semua" ? true : getCategory(stock).includes(c);
      }).length;
    }
    return counts;
  }, [passSharedFilters]);

  const sectorCounts = useMemo(() => {
    const counts: Record<string, number> = {};
    for (const s of sectorOptions) {
      counts[s] = stocks.filter((stock) => {
        if (!passSharedFilters(stock, { ignoreSector: true })) return false;
        return s === "Semua" ? true : stock.sector === s;
      }).length;
    }
    return counts;
  }, [passSharedFilters, sectorOptions]);

  const tickerCandidates = useMemo(() => {
    const query = tickerQuery.trim().toLowerCase();
    const matches = stocks.filter((stock) => {
      if (!query) return true;
      return (
        stock.ticker.toLowerCase().includes(query) ||
        stock.name.toLowerCase().includes(query)
      );
    });
    return matches.slice(0, 180);
  }, [tickerQuery]);

  const totalPages = Math.max(1, Math.ceil(filteredStocks.length / pageSize));
  const paginatedStocks = useMemo(() => {
    const start = (currentPage - 1) * pageSize;
    return filteredStocks.slice(start, start + pageSize);
  }, [filteredStocks, currentPage, pageSize]);

  useEffect(() => {
    setCurrentPage(1);
  }, [
    category,
    sector,
    valuation,
    verdict,
    shariaOnly,
    selectedTickers,
    pageSize,
  ]);

  useEffect(() => {
    if (currentPage > totalPages) {
      setCurrentPage(totalPages);
    }
  }, [currentPage, totalPages]);

  const resetFilters = () => {
    setCategory("Semua");
    setSector("Semua");
    setValuation("All");
    setVerdict("All");
    setShariaOnly(false);
    setSelectedTickers(new Set());
    setTickerQuery("");
    setCurrentPage(1);
  };

  const cacheTime = new Date().toLocaleString("id-ID", {
    day: "2-digit",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });

  return (
    <div className="space-y-5">
      {/* Filter Bar */}
      <div className="rounded-xl border border-border bg-card p-4 space-y-4">
        <div className="flex items-center justify-between">
          <button
            onClick={() => setShowFilters((f) => !f)}
            className="flex items-center gap-2 text-sm font-bold text-foreground"
          >
            <Filter className="h-4 w-4 text-primary" />
            Filter & Screening
            {showFilters ? (
              <ChevronUp className="h-3.5 w-3.5" />
            ) : (
              <ChevronDown className="h-3.5 w-3.5" />
            )}
          </button>
          <div className="flex items-center gap-2">
            <div className="flex items-center rounded-lg bg-secondary/50 p-0.5 border border-border">
              <button
                onClick={() => setViewMode("grid")}
                className={`rounded-md p-2 transition-all ${viewMode === "grid" ? "bg-primary text-primary-foreground shadow" : "text-muted-foreground hover:text-foreground"}`}
              >
                <LayoutGrid className="h-3.5 w-3.5" />
              </button>
              <button
                onClick={() => setViewMode("list")}
                className={`rounded-md p-2 transition-all ${viewMode === "list" ? "bg-primary text-primary-foreground shadow" : "text-muted-foreground hover:text-foreground"}`}
              >
                <List className="h-3.5 w-3.5" />
              </button>
            </div>
            <button
              onClick={resetFilters}
              className="flex items-center gap-1.5 rounded-lg px-3 py-2 text-xs font-semibold text-muted-foreground hover:text-foreground bg-secondary/50 border border-border transition-colors"
            >
              <RotateCcw className="h-3 w-3" />
              Reset
            </button>
          </div>
        </div>

        <AnimatePresence>
          {showFilters && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: "auto" }}
              exit={{ opacity: 0, height: 0 }}
              transition={{ duration: 0.2 }}
              className="overflow-hidden"
            >
              <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-5 pt-2">
                {/* Categories */}
                <div>
                  <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider mb-2">
                    Kategori
                  </p>
                  <div className="flex flex-wrap gap-1.5">
                    {categories.map((c) => (
                      <button
                        key={c}
                        onClick={() => setCategory(c)}
                        className={`inline-flex items-center gap-1.5 rounded-lg px-2.5 py-1.5 text-[11px] font-semibold transition-all border ${
                          category === c
                            ? "bg-primary/15 border-primary/40 text-primary"
                            : "bg-secondary/30 border-border text-muted-foreground hover:text-foreground"
                        }`}
                      >
                        {c}
                        <span className="rounded-full bg-secondary/80 px-1.5 py-0.5 text-[10px] font-bold">
                          {categoryCounts[c] ?? 0}
                        </span>
                      </button>
                    ))}
                  </div>
                </div>

                {/* Sector */}
                <div>
                  <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider mb-2">
                    Sektor
                  </p>
                  <div className="flex flex-wrap gap-1.5">
                    {sectorOptions.map((s) => (
                      <button
                        key={s}
                        onClick={() => setSector(s)}
                        className={`inline-flex items-center gap-1.5 rounded-lg px-2.5 py-1.5 text-[11px] font-semibold transition-all border ${
                          sector === s
                            ? "bg-primary/15 border-primary/40 text-primary"
                            : "bg-secondary/30 border-border text-muted-foreground hover:text-foreground"
                        }`}
                      >
                        {s}
                        <span className="rounded-full bg-secondary/80 px-1.5 py-0.5 text-[10px] font-bold">
                          {sectorCounts[s] ?? 0}
                        </span>
                      </button>
                    ))}
                  </div>
                </div>

                {/* Valuation */}
                <div>
                  <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider mb-2">
                    Valuasi
                  </p>
                  <div className="flex flex-wrap gap-1.5">
                    {valuations.map((v) => (
                      <button
                        key={v}
                        onClick={() => setValuation(v)}
                        className={`rounded-lg px-2.5 py-1.5 text-[11px] font-semibold transition-all border ${
                          valuation === v
                            ? "bg-primary/15 border-primary/40 text-primary"
                            : "bg-secondary/30 border-border text-muted-foreground hover:text-foreground"
                        }`}
                      >
                        {v}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Verdict */}
                <div>
                  <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider mb-2">
                    Verdict
                  </p>
                  <div className="flex flex-wrap gap-1.5">
                    {verdicts.map((v) => (
                      <button
                        key={v}
                        onClick={() => setVerdict(v)}
                        className={`rounded-lg px-2.5 py-1.5 text-[11px] font-semibold transition-all border ${
                          verdict === v
                            ? "bg-primary/15 border-primary/40 text-primary"
                            : "bg-secondary/30 border-border text-muted-foreground hover:text-foreground"
                        }`}
                      >
                        {v}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Sharia */}
                <div>
                  <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider mb-2">
                    Opsi
                  </p>
                  <label className="flex items-center gap-2 cursor-pointer group">
                    <div
                      className={`flex h-5 w-5 items-center justify-center rounded-md border-2 transition-all ${
                        shariaOnly
                          ? "bg-primary border-primary"
                          : "border-border group-hover:border-primary/50"
                      }`}
                    >
                      {shariaOnly && (
                        <Check className="h-3 w-3 text-primary-foreground" />
                      )}
                    </div>
                    <span className="text-xs text-muted-foreground group-hover:text-foreground transition-colors">
                      Syariah only
                    </span>
                  </label>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Available Tickers */}
      <div className="rounded-xl border border-border bg-card p-4">
        <div className="flex flex-wrap items-center justify-between gap-2">
          <button
            onClick={() => setShowTickers((s) => !s)}
            className="flex items-center gap-2 text-xs font-bold text-foreground"
          >
            Available Tickers ({stocks.length})
            {showTickers ? (
              <ChevronUp className="h-3.5 w-3.5" />
            ) : (
              <ChevronDown className="h-3.5 w-3.5" />
            )}
          </button>
          {selectedTickers.size > 0 && (
            <button
              onClick={() => setSelectedTickers(new Set())}
              className="rounded-lg px-2.5 py-1.5 text-[11px] font-semibold text-loss hover:bg-loss/10 transition-colors"
            >
              Clear Selected ({selectedTickers.size})
            </button>
          )}
        </div>

        <AnimatePresence>
          {showTickers && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: "auto" }}
              exit={{ opacity: 0, height: 0 }}
              transition={{ duration: 0.2 }}
              className="overflow-hidden"
            >
              <div className="mt-3 space-y-3">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-muted-foreground" />
                  <input
                    value={tickerQuery}
                    onChange={(e) => setTickerQuery(e.target.value)}
                    placeholder="Cari ticker / nama emiten..."
                    className="w-full rounded-lg border border-border bg-secondary/30 py-2 pl-9 pr-3 text-xs text-foreground outline-none focus:border-primary/40"
                  />
                </div>
                <div className="flex flex-wrap gap-1.5">
                  {tickerCandidates.map((stock) => {
                    const isActive = selectedTickers.has(stock.ticker);
                    return (
                      <button
                        key={stock.ticker}
                        onClick={() => toggleTicker(stock.ticker)}
                        className={`rounded-lg px-2.5 py-1.5 text-[11px] font-bold transition-all border ${
                          isActive
                            ? "bg-gain/15 border-gain/40 text-gain"
                            : "bg-secondary/30 border-border text-muted-foreground hover:text-foreground hover:border-primary/30"
                        }`}
                      >
                        {stock.ticker.replace(".JK", "")}
                      </button>
                    );
                  })}
                </div>
                {tickerCandidates.length < stocks.length && (
                  <p className="text-[11px] text-muted-foreground">
                    Menampilkan {tickerCandidates.length} ticker. Gunakan
                    pencarian untuk mempersempit.
                  </p>
                )}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Results */}
      {filteredStocks.length > 0 && (
        <div className="flex flex-wrap items-center justify-between gap-3 rounded-xl border border-border bg-card px-3 py-2">
          <p className="text-xs text-muted-foreground">
            Menampilkan {paginatedStocks.length} dari {filteredStocks.length}{" "}
            hasil
          </p>
          <div className="flex items-center gap-2">
            <label className="flex items-center gap-2 text-xs text-muted-foreground">
              Per Halaman
              <select
                value={pageSize}
                onChange={(e) => setPageSize(Number(e.target.value))}
                className="rounded-md border border-border bg-secondary/40 px-2 py-1 text-foreground outline-none"
              >
                {pageSizeOptions.map((size) => (
                  <option key={size} value={size}>
                    {size}
                  </option>
                ))}
              </select>
            </label>
            <button
              onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
              disabled={currentPage === 1}
              className="rounded-md border border-border px-2 py-1 text-xs font-semibold disabled:cursor-not-allowed disabled:opacity-50"
            >
              Prev
            </button>
            <span className="text-xs text-muted-foreground">
              {currentPage}/{totalPages}
            </span>
            <button
              onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
              disabled={currentPage === totalPages}
              className="rounded-md border border-border px-2 py-1 text-xs font-semibold disabled:cursor-not-allowed disabled:opacity-50"
            >
              Next
            </button>
          </div>
        </div>
      )}
      <AnimatePresence mode="popLayout">
        {filteredStocks.length === 0 ? (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="text-center py-16"
          >
            <p className="text-sm text-muted-foreground">
              Tidak ada saham yang sesuai filter.
            </p>
            <button
              onClick={resetFilters}
              className="mt-2 text-xs text-primary hover:underline"
            >
              Reset Filter
            </button>
          </motion.div>
        ) : viewMode === "grid" ? (
          <div className="grid gap-4 grid-cols-1 md:grid-cols-2 xl:grid-cols-3">
            {paginatedStocks.map((stock, i) => (
              <ScreeningCard
                key={stock.ticker}
                stock={stock}
                index={(currentPage - 1) * pageSize + i}
                cacheTime={cacheTime}
                onNavigate={() => navigate(`/stock/${stock.ticker}`)}
              />
            ))}
          </div>
        ) : (
          <div className="space-y-3">
            {paginatedStocks.map((stock, i) => (
              <ScreeningListItem
                key={stock.ticker}
                stock={stock}
                index={(currentPage - 1) * pageSize + i}
                cacheTime={cacheTime}
                onNavigate={() => navigate(`/stock/${stock.ticker}`)}
              />
            ))}
          </div>
        )}
      </AnimatePresence>
    </div>
  );
};

// === Screening Card (Grid View) ===
function ScreeningCard({
  stock,
  index,
  cacheTime,
  onNavigate,
}: {
  stock: Stock;
  index: number;
  cacheTime: string;
  onNavigate: () => void;
}) {
  const verdict = getVerdict(stock);
  const signals = getSignals(stock);
  const targets = getPriceTargets(stock);
  const rsi14 = getRSI(stock, 14);
  const rsi12 = getRSI(stock, 12);
  const macd = getMACD(stock);
  const volRatio = getVolRatio(stock);
  const isGain = stock.change >= 0;

  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, scale: 0.95 }}
      transition={{ duration: 0.25, delay: index * 0.03 }}
      onClick={onNavigate}
      className="rounded-xl border border-border bg-card overflow-hidden cursor-pointer hover:border-primary/30 hover:shadow-lg hover:shadow-primary/5 transition-all group"
    >
      {/* Header */}
      <div className="flex items-center justify-between px-4 py-2.5 bg-secondary/30 border-b border-border/50">
        <span className="text-[9px] text-muted-foreground font-mono">
          Cache: {cacheTime}
        </span>
        <span
          className={`rounded-full px-2.5 py-0.5 text-[10px] font-bold border ${verdictColors[verdict]}`}
        >
          {verdict.toUpperCase()}
        </span>
      </div>

      {/* Main Info */}
      <div className="p-4 space-y-4">
        <div className="flex items-start justify-between">
          <div>
            <h3 className="text-lg font-extrabold text-foreground group-hover:text-primary transition-colors">
              {stock.ticker.replace(".JK", "")}
            </h3>
            <p className="text-[11px] text-muted-foreground mt-0.5">
              {stock.name}
            </p>
          </div>
          <div className="text-right">
            <p className="font-mono text-base font-extrabold text-foreground">
              Rp{stock.price.toLocaleString("id-ID")}
            </p>
            <p
              className={`font-mono text-xs font-bold ${isGain ? "text-gain" : "text-loss"}`}
            >
              {isGain ? "+" : ""}
              {stock.changePercent.toFixed(2)}%
            </p>
          </div>
        </div>

        {/* Signals */}
        <div>
          <p className="text-[9px] font-bold text-muted-foreground uppercase tracking-wider mb-1.5">
            Signals
          </p>
          <div className="flex gap-1.5">
            {Object.entries(signals).map(([period, signal]) => (
              <span
                key={period}
                className={`rounded-md px-2 py-1 text-[10px] font-bold border ${signalColors[signal]}`}
              >
                {period}
              </span>
            ))}
          </div>
        </div>

        {/* Price Targets */}
        <div>
          <p className="text-[9px] font-bold text-muted-foreground uppercase tracking-wider mb-2">
            Price Targets
          </p>
          <div className="grid grid-cols-3 gap-2">
            {(
              [
                { label: "Conservative", data: targets.conservative },
                { label: "Moderate", data: targets.moderate },
                { label: "Aggressive", data: targets.aggressive },
              ] as const
            ).map((t) => (
              <div
                key={t.label}
                className="rounded-lg bg-secondary/40 p-2 text-center"
              >
                <p className="text-[8px] text-muted-foreground uppercase tracking-wider mb-1">
                  {t.label}
                </p>
                <p className="font-mono text-[11px] font-bold text-foreground">
                  Rp{t.data.price.toLocaleString("id-ID")}
                </p>
                <p className="font-mono text-[10px] font-bold text-gain">
                  +{t.data.upside}%
                </p>
              </div>
            ))}
          </div>
        </div>

        {/* Key Indicators */}
        <div>
          <p className="text-[9px] font-bold text-muted-foreground uppercase tracking-wider mb-2">
            Key Indicators
          </p>
          <div className="grid grid-cols-4 gap-1.5">
            <IndicatorChip
              label="RSI(14)"
              value={rsi14.toFixed(0)}
              warn={rsi14 > 70 || rsi14 < 30}
            />
            <IndicatorChip
              label="RSI(12)"
              value={rsi12.toFixed(0)}
              warn={rsi12 > 70 || rsi12 < 30}
            />
            <IndicatorChip
              label="MACD"
              value={macd > 0 ? `+${macd}` : `${macd}`}
              positive={macd > 0}
            />
            <IndicatorChip
              label="Vol Ratio"
              value={`${volRatio}x`}
              positive={volRatio > 1}
            />
          </div>
        </div>
      </div>
    </motion.div>
  );
}

// === Screening List Item ===
function ScreeningListItem({
  stock,
  index,
  cacheTime,
  onNavigate,
}: {
  stock: Stock;
  index: number;
  cacheTime: string;
  onNavigate: () => void;
}) {
  const verdict = getVerdict(stock);
  const signals = getSignals(stock);
  const targets = getPriceTargets(stock);
  const rsi14 = getRSI(stock, 14);
  const macd = getMACD(stock);
  const volRatio = getVolRatio(stock);
  const isGain = stock.change >= 0;

  return (
    <motion.div
      layout
      initial={{ opacity: 0, x: -10 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ duration: 0.2, delay: index * 0.03 }}
      onClick={onNavigate}
      className="rounded-xl border border-border bg-card p-4 cursor-pointer hover:border-primary/30 hover:shadow-lg hover:shadow-primary/5 transition-all group"
    >
      <div className="flex flex-wrap items-center gap-4">
        {/* Ticker & Name */}
        <div className="min-w-[140px]">
          <div className="flex items-center gap-2">
            <h3 className="text-base font-extrabold text-foreground group-hover:text-primary transition-colors">
              {stock.ticker.replace(".JK", "")}
            </h3>
            <span
              className={`rounded-full px-2 py-0.5 text-[9px] font-bold border ${verdictColors[verdict]}`}
            >
              {verdict.toUpperCase()}
            </span>
          </div>
          <p className="text-[10px] text-muted-foreground mt-0.5">
            {stock.name}
          </p>
        </div>

        {/* Price */}
        <div className="min-w-[100px]">
          <p className="font-mono text-sm font-extrabold text-foreground">
            Rp{stock.price.toLocaleString("id-ID")}
          </p>
          <p
            className={`font-mono text-xs font-bold ${isGain ? "text-gain" : "text-loss"}`}
          >
            {isGain ? "+" : ""}
            {stock.changePercent.toFixed(2)}%
          </p>
        </div>

        {/* Signals */}
        <div className="flex gap-1">
          {Object.entries(signals).map(([period, signal]) => (
            <span
              key={period}
              className={`rounded-md px-2 py-1 text-[10px] font-bold border ${signalColors[signal]}`}
            >
              {period}
            </span>
          ))}
        </div>

        {/* Targets (compact) */}
        <div className="flex gap-3 ml-auto">
          <div className="text-center">
            <p className="text-[8px] text-muted-foreground uppercase">Target</p>
            <p className="font-mono text-[11px] font-bold text-foreground">
              Rp{targets.moderate.price.toLocaleString("id-ID")}
            </p>
            <p className="font-mono text-[9px] font-bold text-gain">
              +{targets.moderate.upside}%
            </p>
          </div>
          <div className="flex items-center gap-2 text-[10px] text-muted-foreground">
            <span>RSI {rsi14.toFixed(0)}</span>
            <span>
              MACD {macd > 0 ? "+" : ""}
              {macd}
            </span>
            <span>Vol {volRatio}x</span>
          </div>
        </div>
      </div>
    </motion.div>
  );
}

// === Indicator Chip ===
function IndicatorChip({
  label,
  value,
  warn,
  positive,
}: {
  label: string;
  value: string;
  warn?: boolean;
  positive?: boolean;
}) {
  return (
    <div
      className={`rounded-lg p-1.5 text-center border ${
        warn
          ? "bg-loss/10 border-loss/20"
          : positive
            ? "bg-gain/10 border-gain/20"
            : "bg-secondary/40 border-border/50"
      }`}
    >
      <p className="text-[8px] text-muted-foreground uppercase tracking-wider">
        {label}
      </p>
      <p
        className={`font-mono text-[11px] font-bold ${
          warn ? "text-loss" : positive ? "text-gain" : "text-foreground"
        }`}
      >
        {value}
      </p>
    </div>
  );
}

export default StockScreener;
