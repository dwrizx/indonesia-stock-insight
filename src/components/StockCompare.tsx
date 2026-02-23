import { useState, useMemo } from "react";
import { TrendingUp, TrendingDown, ArrowRight, X, Search, ChevronDown } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { stocks, Stock, formatRupiah, formatVolume } from "@/data/stockData";
import Sparkline from "@/components/Sparkline";

interface ComparisonPair {
  label: string;
  description: string;
  tickers: [string, string];
}

const prebuiltComparisons: ComparisonPair[] = [
  { label: "BBCA vs BBRI", description: "Bank swasta terbesar vs Bank BUMN terbesar", tickers: ["BBCA.JK", "BBRI.JK"] },
  { label: "BBCA vs BMRI", description: "Perbandingan dua raksasa perbankan", tickers: ["BBCA.JK", "BMRI.JK"] },
  { label: "BBRI vs BBNI", description: "Head-to-head bank BUMN", tickers: ["BBRI.JK", "BBNI.JK"] },
  { label: "TLKM vs GOTO", description: "Telko tradisional vs Teknologi baru", tickers: ["TLKM.JK", "GOTO.JK"] },
  { label: "UNVR vs ICBP", description: "Duel saham konsumsi unggulan", tickers: ["UNVR.JK", "ICBP.JK"] },
  { label: "ASII vs INDF", description: "Konglomerat industri vs Konglomerat makanan", tickers: ["ASII.JK", "INDF.JK"] },
  { label: "GOTO vs EMTK", description: "Pertarungan sektor teknologi", tickers: ["GOTO.JK", "EMTK.JK"] },
  { label: "ACES vs MAPI", description: "Kompetisi sektor ritel", tickers: ["ACES.JK", "MAPI.JK"] },
];

const metricRows: { key: keyof Stock | "score"; label: string; format: (v: any, s: Stock) => string; higherBetter: boolean }[] = [
  { key: "price", label: "Harga", format: (v) => `Rp${v.toLocaleString("id-ID")}`, higherBetter: true },
  { key: "changePercent", label: "Perubahan %", format: (v) => `${v >= 0 ? "+" : ""}${v.toFixed(2)}%`, higherBetter: true },
  { key: "marketCap", label: "Market Cap", format: (v) => formatRupiah(v), higherBetter: true },
  { key: "pe", label: "P/E Ratio", format: (v) => v > 0 ? v.toFixed(1) : "N/A", higherBetter: false },
  { key: "pbv", label: "P/BV", format: (v) => v.toFixed(1), higherBetter: false },
  { key: "eps", label: "EPS", format: (v) => `Rp${v.toLocaleString("id-ID")}`, higherBetter: true },
  { key: "roe", label: "ROE", format: (v) => `${v.toFixed(1)}%`, higherBetter: true },
  { key: "dividendYield", label: "Div. Yield", format: (v) => `${v.toFixed(1)}%`, higherBetter: true },
  { key: "beta", label: "Beta", format: (v) => v.toFixed(2), higherBetter: false },
  { key: "debtToEquity", label: "D/E Ratio", format: (v) => v.toFixed(1), higherBetter: false },
  { key: "volume", label: "Volume", format: (v) => formatVolume(v), higherBetter: true },
];

const StockSelector = ({ value, onChange, exclude }: { value: string; onChange: (t: string) => void; exclude: string }) => {
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState("");
  const filtered = stocks.filter(s => s.ticker !== exclude && (
    s.ticker.toLowerCase().includes(query.toLowerCase()) ||
    s.name.toLowerCase().includes(query.toLowerCase())
  ));

  return (
    <div className="relative">
      <button
        onClick={() => setOpen(!open)}
        className="flex items-center gap-2 rounded-lg border border-border bg-secondary/50 px-3 py-2 text-sm font-bold text-foreground hover:bg-accent transition-colors w-full"
      >
        <span className="font-mono text-primary">{value.replace(".JK", "")}</span>
        <span className="text-muted-foreground text-xs truncate flex-1 text-left">
          {stocks.find(s => s.ticker === value)?.name}
        </span>
        <ChevronDown className={`h-3.5 w-3.5 text-muted-foreground transition-transform ${open ? "rotate-180" : ""}`} />
      </button>
      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0, y: -4 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -4 }}
            className="absolute top-full left-0 right-0 z-50 mt-1 rounded-lg border border-border bg-popover shadow-xl overflow-hidden"
          >
            <div className="p-2 border-b border-border">
              <div className="flex items-center gap-2 rounded-md bg-secondary/50 px-2 py-1.5">
                <Search className="h-3.5 w-3.5 text-muted-foreground" />
                <input
                  type="text"
                  placeholder="Cari saham..."
                  className="text-xs bg-transparent outline-none w-full text-foreground placeholder:text-muted-foreground"
                  value={query}
                  onChange={e => setQuery(e.target.value)}
                  autoFocus
                />
              </div>
            </div>
            <div className="max-h-48 overflow-y-auto p-1">
              {filtered.map(s => (
                <button
                  key={s.ticker}
                  onClick={() => { onChange(s.ticker); setOpen(false); setQuery(""); }}
                  className="flex w-full items-center justify-between rounded-md px-3 py-2 text-xs hover:bg-accent transition-colors"
                >
                  <div className="flex items-center gap-2">
                    <span className="font-mono font-bold text-primary">{s.ticker.replace(".JK", "")}</span>
                    <span className="text-muted-foreground truncate max-w-[120px]">{s.name}</span>
                  </div>
                  <span className={`font-mono ${s.change >= 0 ? "text-gain" : "text-loss"}`}>
                    {s.change >= 0 ? "+" : ""}{s.changePercent.toFixed(2)}%
                  </span>
                </button>
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

const StockCompare = () => {
  const [tickerA, setTickerA] = useState("BBCA.JK");
  const [tickerB, setTickerB] = useState("BBRI.JK");

  const stockA = stocks.find(s => s.ticker === tickerA)!;
  const stockB = stocks.find(s => s.ticker === tickerB)!;

  const getWinner = (key: keyof Stock, higherBetter: boolean): "a" | "b" | "tie" => {
    const a = stockA[key] as number;
    const b = stockB[key] as number;
    if (key === "pe" && (a <= 0 || b <= 0)) return "tie";
    if (a === b) return "tie";
    if (higherBetter) return a > b ? "a" : "b";
    return a < b ? "a" : "b";
  };

  const winsA = metricRows.filter(m => getWinner(m.key as keyof Stock, m.higherBetter) === "a").length;
  const winsB = metricRows.filter(m => getWinner(m.key as keyof Stock, m.higherBetter) === "b").length;

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      className="space-y-6"
    >
      {/* Pre-built comparisons */}
      <div>
        <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider mb-3">Perbandingan Populer</p>
        <div className="flex flex-wrap gap-2">
          {prebuiltComparisons.map(pair => {
            const isActive = (tickerA === pair.tickers[0] && tickerB === pair.tickers[1]);
            return (
              <button
                key={pair.label}
                onClick={() => { setTickerA(pair.tickers[0]); setTickerB(pair.tickers[1]); }}
                className={`rounded-lg px-3 py-2 text-xs font-semibold transition-all border ${
                  isActive
                    ? "bg-primary/15 border-primary/40 text-primary"
                    : "bg-card border-border text-muted-foreground hover:text-foreground hover:border-primary/20"
                }`}
              >
                <span className="font-mono font-bold">{pair.label}</span>
                <span className="hidden sm:inline text-muted-foreground ml-1.5">— {pair.description}</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Custom selector */}
      <div className="grid grid-cols-[1fr,auto,1fr] items-center gap-3">
        <StockSelector value={tickerA} onChange={setTickerA} exclude={tickerB} />
        <div className="flex h-9 w-9 items-center justify-center rounded-full bg-primary/10 border border-primary/20 text-primary">
          <span className="text-xs font-extrabold">VS</span>
        </div>
        <StockSelector value={tickerB} onChange={setTickerB} exclude={tickerA} />
      </div>

      {/* Score summary */}
      <div className="rounded-xl border border-border bg-card p-4">
        <div className="grid grid-cols-3 items-center text-center gap-2">
          <div>
            <p className="font-mono text-2xl font-extrabold text-primary">{winsA}</p>
            <p className="text-[10px] text-muted-foreground font-bold uppercase tracking-wider">{tickerA.replace(".JK", "")} Wins</p>
          </div>
          <div>
            <div className="relative h-2 rounded-full bg-secondary overflow-hidden">
              <div
                className="absolute inset-y-0 left-0 rounded-full bg-primary transition-all"
                style={{ width: `${(winsA / (winsA + winsB || 1)) * 100}%` }}
              />
            </div>
            <p className="text-[10px] text-muted-foreground mt-1.5">{metricRows.length - winsA - winsB} Seri</p>
          </div>
          <div>
            <p className="font-mono text-2xl font-extrabold text-primary">{winsB}</p>
            <p className="text-[10px] text-muted-foreground font-bold uppercase tracking-wider">{tickerB.replace(".JK", "")} Wins</p>
          </div>
        </div>
      </div>

      {/* Sparkline comparison */}
      <div className="grid grid-cols-2 gap-4">
        {[stockA, stockB].map(stock => (
          <div key={stock.ticker} className="rounded-xl border border-border bg-card p-4">
            <div className="flex items-center justify-between mb-2">
              <span className="font-mono text-sm font-extrabold text-primary">{stock.ticker.replace(".JK", "")}</span>
              <span className={`font-mono text-xs font-bold ${stock.change >= 0 ? "text-gain" : "text-loss"}`}>
                {stock.change >= 0 ? "+" : ""}{stock.changePercent.toFixed(2)}%
              </span>
            </div>
            <div className="h-16 opacity-70">
              <Sparkline basePrice={stock.price} isGain={stock.change >= 0} seed={stock.price % 17} height={64} />
            </div>
            <p className="font-mono text-lg font-extrabold text-foreground mt-2">Rp{stock.price.toLocaleString("id-ID")}</p>
          </div>
        ))}
      </div>

      {/* Detailed comparison table */}
      <div className="rounded-xl border border-border bg-card overflow-hidden">
        <div className="grid grid-cols-[1fr,auto,1fr] text-center border-b border-border bg-secondary/30 px-4 py-3">
          <span className="font-mono text-xs font-extrabold text-primary">{tickerA.replace(".JK", "")}</span>
          <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider px-4">Metrik</span>
          <span className="font-mono text-xs font-extrabold text-primary">{tickerB.replace(".JK", "")}</span>
        </div>
        {metricRows.map((row, i) => {
          const winner = getWinner(row.key as keyof Stock, row.higherBetter);
          return (
            <div
              key={row.key}
              className={`grid grid-cols-[1fr,auto,1fr] items-center px-4 py-3 ${
                i < metricRows.length - 1 ? "border-b border-border/30" : ""
              }`}
            >
              <div className="text-right pr-4">
                <span className={`font-mono text-xs font-bold ${
                  winner === "a" ? "text-gain" : "text-foreground"
                }`}>
                  {row.format(stockA[row.key as keyof Stock], stockA)}
                </span>
                {winner === "a" && <span className="ml-1.5 text-[9px] text-gain">✓</span>}
              </div>
              <span className="text-[10px] text-muted-foreground font-semibold whitespace-nowrap px-3 min-w-[80px] text-center">{row.label}</span>
              <div className="text-left pl-4">
                {winner === "b" && <span className="mr-1.5 text-[9px] text-gain">✓</span>}
                <span className={`font-mono text-xs font-bold ${
                  winner === "b" ? "text-gain" : "text-foreground"
                }`}>
                  {row.format(stockB[row.key as keyof Stock], stockB)}
                </span>
              </div>
            </div>
          );
        })}
      </div>
    </motion.div>
  );
};

export default StockCompare;
