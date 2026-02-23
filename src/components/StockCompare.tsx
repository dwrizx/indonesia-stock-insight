import { useState, useMemo } from "react";
import { TrendingUp, TrendingDown, Search, ChevronDown, ArrowRight, ExternalLink, BarChart2, Activity, Shield, Target, LineChart, Award } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { useNavigate } from "react-router-dom";
import { stocks, Stock, formatRupiah, formatVolume, generateChartData } from "@/data/stockData";
import { LineChart as ReLineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from "recharts";
import RadarCompare from "@/components/RadarCompare";

interface ComparisonPair {
  label: string;
  description: string;
  tickers: [string, string];
}

const prebuiltComparisons: ComparisonPair[] = [
  { label: "BBCA vs BBRI", description: "Bank swasta terbesar vs Bank BUMN terbesar", tickers: ["BBCA.JK", "BBRI.JK"] },
  { label: "BBCA vs BMRI", description: "Dua raksasa perbankan Indonesia", tickers: ["BBCA.JK", "BMRI.JK"] },
  { label: "BBRI vs BBNI", description: "Head-to-head bank BUMN", tickers: ["BBRI.JK", "BBNI.JK"] },
  { label: "TLKM vs GOTO", description: "Telko tradisional vs Teknologi baru", tickers: ["TLKM.JK", "GOTO.JK"] },
  { label: "UNVR vs ICBP", description: "Duel saham konsumsi unggulan", tickers: ["UNVR.JK", "ICBP.JK"] },
  { label: "ASII vs INDF", description: "Konglomerat industri vs makanan", tickers: ["ASII.JK", "INDF.JK"] },
  { label: "GOTO vs EMTK", description: "Pertarungan sektor teknologi", tickers: ["GOTO.JK", "EMTK.JK"] },
  { label: "ACES vs MAPI", description: "Kompetisi sektor ritel", tickers: ["ACES.JK", "MAPI.JK"] },
];

function getSignal(stock: Stock): { label: string; color: string } {
  const score =
    (stock.pe > 0 && stock.pe < 15 ? 2 : stock.pe > 0 && stock.pe < 25 ? 1 : 0) +
    (stock.roe > 15 ? 2 : stock.roe > 10 ? 1 : 0) +
    (stock.dividendYield > 3 ? 1 : 0) +
    (stock.changePercent > 0 ? 1 : 0) +
    (stock.beta < 1.2 ? 1 : 0);
  if (score >= 6) return { label: "STRONG BUY", color: "text-gain" };
  if (score >= 4) return { label: "BUY", color: "text-gain" };
  if (score >= 3) return { label: "HOLD", color: "text-primary" };
  if (score >= 2) return { label: "SELL", color: "text-loss" };
  return { label: "STRONG SELL", color: "text-loss" };
}

function getRSI(seed: number): number {
  return 30 + ((seed * 7 + 13) % 45);
}

function getEMA(price: number, period: number, seed: number): number {
  return price * (0.95 + ((seed * period) % 10) / 100);
}

function getMACDValues(seed: number) {
  const histogram = ((seed * 3 + 7) % 30) - 15;
  return {
    trend: histogram > 0 ? "Bullish" : "Bearish",
    line: histogram * 12.5,
    signal: histogram * 10.2,
    histogram,
  };
}

function getAnalystRatings(seed: number) {
  const sb = Math.round(((seed * 3) % 8) + 2);
  const b = Math.round(((seed * 7) % 12) + 4);
  const h = Math.round(((seed * 2) % 5) + 1);
  const s = Math.round(((seed * 4) % 3));
  const ss = Math.round(((seed * 5) % 2));
  const total = sb + b + h + s + ss;
  const avg = ((sb * 1 + b * 2 + h * 3 + s * 4 + ss * 5) / total);
  return { sb, b, h, s, ss, total, avg };
}

const StockSelector = ({ value, onChange, exclude }: { value: string; onChange: (t: string) => void; exclude: string }) => {
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState("");
  const stock = stocks.find(s => s.ticker === value);
  const filtered = stocks.filter(s => s.ticker !== exclude && (
    s.ticker.toLowerCase().includes(query.toLowerCase()) ||
    s.name.toLowerCase().includes(query.toLowerCase())
  ));

  return (
    <div className="relative flex-1">
      <button
        onClick={() => setOpen(!open)}
        className="flex items-center gap-2 rounded-xl border border-border bg-card px-4 py-3 text-sm font-bold text-foreground hover:border-primary/30 transition-all w-full"
      >
        <div className="text-left flex-1 min-w-0">
          <span className="font-mono text-sm font-extrabold text-primary block">{value.replace(".JK", "")}</span>
          <span className="text-[10px] text-muted-foreground truncate block">{stock?.name}</span>
        </div>
        <ChevronDown className={`h-4 w-4 text-muted-foreground shrink-0 transition-transform ${open ? "rotate-180" : ""}`} />
      </button>
      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0, y: -4 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -4 }}
            className="absolute top-full left-0 right-0 z-50 mt-1 rounded-xl border border-border bg-popover shadow-2xl overflow-hidden"
          >
            <div className="p-2 border-b border-border">
              <div className="flex items-center gap-2 rounded-lg bg-secondary/50 px-3 py-2">
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
            <div className="max-h-52 overflow-y-auto p-1">
              {filtered.map(s => (
                <button
                  key={s.ticker}
                  onClick={() => { onChange(s.ticker); setOpen(false); setQuery(""); }}
                  className="flex w-full items-center justify-between rounded-lg px-3 py-2.5 text-xs hover:bg-accent transition-colors"
                >
                  <div className="flex items-center gap-2">
                    <span className="font-mono font-bold text-primary">{s.ticker.replace(".JK", "")}</span>
                    <span className="text-muted-foreground truncate max-w-[140px]">{s.name}</span>
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
  const [chartMode, setChartMode] = useState<"absolute" | "percent">("absolute");
  const navigate = useNavigate();

  const stockA = stocks.find(s => s.ticker === tickerA)!;
  const stockB = stocks.find(s => s.ticker === tickerB)!;

  const signalA = getSignal(stockA);
  const signalB = getSignal(stockB);

  const seedA = stockA.price % 17;
  const seedB = stockB.price % 17;

  // Chart data
  const chartData = useMemo(() => {
    const dataA = generateChartData(stockA.price, 180);
    const dataB = generateChartData(stockB.price, 180);
    const baseA = dataA[0]?.price || stockA.price;
    const baseB = dataB[0]?.price || stockB.price;
    return dataA.map((d, i) => ({
      date: d.date,
      [tickerA.replace(".JK", "")]: chartMode === "absolute" ? d.price : ((d.price - baseA) / baseA * 100),
      [tickerB.replace(".JK", "")]: chartMode === "absolute" ? (dataB[i]?.price || 0) : (((dataB[i]?.price || baseB) - baseB) / baseB * 100),
    }));
  }, [tickerA, tickerB, chartMode, stockA.price, stockB.price]);

  const fundamentals: { label: string; key: keyof Stock | null; description: string; formatA: string; formatB: string; higherBetter: boolean }[] = [
    { label: "Market Cap", key: "marketCap", description: "Total nilai pasar perusahaan", formatA: formatRupiah(stockA.marketCap), formatB: formatRupiah(stockB.marketCap), higherBetter: true },
    { label: "P/E Ratio", key: "pe", description: "Price to Earnings Ratio", formatA: stockA.pe > 0 ? `${stockA.pe.toFixed(1)}x` : "N/A", formatB: stockB.pe > 0 ? `${stockB.pe.toFixed(1)}x` : "N/A", higherBetter: false },
    { label: "P/BV", key: "pbv", description: "Price to Book Value", formatA: stockA.pbv.toFixed(2), formatB: stockB.pbv.toFixed(2), higherBetter: false },
    { label: "ROE", key: "roe", description: "Return on Equity", formatA: `${stockA.roe.toFixed(2)}%`, formatB: `${stockB.roe.toFixed(2)}%`, higherBetter: true },
    { label: "EPS", key: "eps", description: "Earnings Per Share", formatA: `Rp${stockA.eps.toLocaleString("id-ID")}`, formatB: `Rp${stockB.eps.toLocaleString("id-ID")}`, higherBetter: true },
    { label: "Dividend Yield", key: "dividendYield", description: "Yield dividen tahunan", formatA: `${stockA.dividendYield.toFixed(2)}%`, formatB: `${stockB.dividendYield.toFixed(2)}%`, higherBetter: true },
    { label: "Beta", key: "beta", description: "Volatilitas terhadap pasar", formatA: stockA.beta.toFixed(2), formatB: stockB.beta.toFixed(2), higherBetter: false },
    { label: "D/E Ratio", key: "debtToEquity", description: "Debt to Equity Ratio", formatA: stockA.debtToEquity.toFixed(1), formatB: stockB.debtToEquity.toFixed(1), higherBetter: false },
    { label: "52W High", key: "high52w", description: "Harga tertinggi 52 minggu", formatA: `Rp${stockA.high52w.toLocaleString("id-ID")}`, formatB: `Rp${stockB.high52w.toLocaleString("id-ID")}`, higherBetter: true },
    { label: "52W Low", key: "low52w", description: "Harga terendah 52 minggu", formatA: `Rp${stockA.low52w.toLocaleString("id-ID")}`, formatB: `Rp${stockB.low52w.toLocaleString("id-ID")}`, higherBetter: false },
    { label: "Volume", key: "volume", description: "Volume perdagangan harian", formatA: formatVolume(stockA.volume), formatB: formatVolume(stockB.volume), higherBetter: true },
  ];

  const getWinner = (key: keyof Stock | null, higherBetter: boolean): "a" | "b" | "tie" => {
    if (!key) return "tie";
    const a = stockA[key] as number;
    const b = stockB[key] as number;
    if (key === "pe" && (a <= 0 || b <= 0)) return "tie";
    if (a === b) return "tie";
    if (higherBetter) return a > b ? "a" : "b";
    return a < b ? "a" : "b";
  };

  const tA = tickerA.replace(".JK", "");
  const tB = tickerB.replace(".JK", "");

  const rsiA = getRSI(seedA);
  const rsiB = getRSI(seedB);
  const ema20A = getEMA(stockA.price, 20, seedA);
  const ema20B = getEMA(stockB.price, 20, seedB);
  const ema50A = getEMA(stockA.price, 50, seedA);
  const ema50B = getEMA(stockB.price, 50, seedB);
  const macdA = getMACDValues(seedA);
  const macdB = getMACDValues(seedB);
  const ratingsA = getAnalystRatings(seedA);
  const ratingsB = getAnalystRatings(seedB);

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      className="space-y-8"
    >
      {/* Title */}
      <div>
        <h2 className="text-xl sm:text-2xl font-extrabold text-foreground">
          {tA} vs {tB}: <span className="gradient-text">Saham Mana yang Lebih Baik?</span>
        </h2>
        <p className="text-xs text-muted-foreground mt-1">
          Bandingkan <span className="text-foreground font-semibold">{stockA.name}</span> vs{" "}
          <span className="text-foreground font-semibold">{stockB.name}</span> — analisis komprehensif di sektor{" "}
          <span className="text-primary font-semibold">{stockA.sector === stockB.sector ? stockA.sector : `${stockA.sector} & ${stockB.sector}`}</span>
        </p>
      </div>

      {/* Pre-built comparisons */}
      <div>
        <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider mb-3">Perbandingan Populer</p>
        <div className="flex flex-wrap gap-1.5">
          {prebuiltComparisons.map(pair => {
            const isActive = tickerA === pair.tickers[0] && tickerB === pair.tickers[1];
            return (
              <button
                key={pair.label}
                onClick={() => { setTickerA(pair.tickers[0]); setTickerB(pair.tickers[1]); }}
                className={`rounded-lg px-3 py-1.5 text-[11px] font-semibold transition-all border ${
                  isActive
                    ? "bg-primary/15 border-primary/40 text-primary"
                    : "bg-card border-border text-muted-foreground hover:text-foreground hover:border-primary/20"
                }`}
              >
                {pair.label}
              </button>
            );
          })}
        </div>
      </div>

      {/* Selectors */}
      <div className="flex items-center gap-3">
        <StockSelector value={tickerA} onChange={setTickerA} exclude={tickerB} />
        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-primary/10 border border-primary/20 text-primary">
          <span className="text-xs font-extrabold">VS</span>
        </div>
        <StockSelector value={tickerB} onChange={setTickerB} exclude={tickerA} />
      </div>

      {/* Stock Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {[{ stock: stockA, signal: signalA }, { stock: stockB, signal: signalB }].map(({ stock, signal }) => (
          <div key={stock.ticker} className="rounded-xl border border-border bg-card p-5 gradient-border relative overflow-hidden group">
            <div className="absolute inset-0 bg-gradient-to-br from-primary/3 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none" />
            <div className="relative">
              <div className="flex items-start justify-between mb-4">
                <div>
                  <h3 className="font-mono text-lg font-extrabold text-foreground">{stock.ticker.replace(".JK", "")}</h3>
                  <p className="text-xs text-muted-foreground">{stock.name}</p>
                </div>
                <span className="text-[10px] font-bold text-muted-foreground bg-secondary rounded-full px-2 py-0.5 uppercase">{stock.sector}</span>
              </div>
              <div className="grid grid-cols-3 gap-3">
                <div>
                  <p className="text-[9px] text-muted-foreground uppercase tracking-wider mb-1">Harga</p>
                  <p className="font-mono text-sm font-extrabold text-foreground">Rp{stock.price.toLocaleString("id-ID")}</p>
                </div>
                <div>
                  <p className="text-[9px] text-muted-foreground uppercase tracking-wider mb-1">Perubahan</p>
                  <p className={`font-mono text-sm font-bold ${stock.change >= 0 ? "text-gain" : "text-loss"}`}>
                    {stock.change >= 0 ? "+" : ""}{stock.changePercent.toFixed(2)}%
                  </p>
                </div>
                <div>
                  <p className="text-[9px] text-muted-foreground uppercase tracking-wider mb-1">Sinyal</p>
                  <p className={`text-sm font-extrabold ${signal.color}`}>{signal.label}</p>
                </div>
              </div>
              <button
                onClick={() => navigate(`/stock/${stock.ticker}`)}
                className="mt-4 flex items-center gap-1.5 text-[11px] text-primary font-semibold hover:underline"
              >
                Lihat Analisis <ArrowRight className="h-3 w-3" />
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* Price Comparison Chart */}
      <div className="rounded-xl border border-border bg-card p-5">
        <div className="flex flex-wrap items-start justify-between gap-3 mb-1">
          <div>
            <h3 className="text-sm font-bold text-foreground flex items-center gap-2">
              <BarChart2 className="h-4 w-4 text-primary" />
              Perbandingan Harga
            </h3>
            <p className="text-[10px] text-muted-foreground mt-0.5">
              {chartMode === "absolute" ? "Perbandingan harga absolut" : "Perbandingan perubahan persentase"} selama 6 bulan
            </p>
          </div>
          <div className="flex items-center rounded-lg bg-secondary/50 p-0.5 border border-border">
            <button
              onClick={() => setChartMode("absolute")}
              className={`rounded-md px-3 py-1.5 text-[11px] font-bold transition-all ${
                chartMode === "absolute" ? "bg-primary text-primary-foreground shadow" : "text-muted-foreground hover:text-foreground"
              }`}
            >
              Absolut
            </button>
            <button
              onClick={() => setChartMode("percent")}
              className={`rounded-md px-3 py-1.5 text-[11px] font-bold transition-all ${
                chartMode === "percent" ? "bg-primary text-primary-foreground shadow" : "text-muted-foreground hover:text-foreground"
              }`}
            >
              % Perubahan
            </button>
          </div>
        </div>
        <div className="h-72 mt-4">
          <ResponsiveContainer width="100%" height="100%">
            <ReLineChart data={chartData} margin={{ top: 5, right: 10, left: 0, bottom: 5 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--chart-grid))" />
              <XAxis
                dataKey="date"
                tick={{ fontSize: 9, fill: "hsl(var(--muted-foreground))" }}
                tickLine={false}
                axisLine={false}
                interval={Math.floor(chartData.length / 8)}
              />
              <YAxis
                tick={{ fontSize: 9, fill: "hsl(var(--muted-foreground))" }}
                tickLine={false}
                axisLine={false}
                tickFormatter={(v) => chartMode === "absolute" ? `${(v / 1000).toFixed(0)}K` : `${v.toFixed(0)}%`}
              />
              <Tooltip
                contentStyle={{
                  backgroundColor: "hsl(var(--card))",
                  border: "1px solid hsl(var(--border))",
                  borderRadius: "8px",
                  fontSize: "11px",
                  color: "hsl(var(--foreground))",
                }}
                formatter={(value: number) =>
                  chartMode === "absolute" ? `Rp${Math.round(value).toLocaleString("id-ID")}` : `${value.toFixed(2)}%`
                }
              />
              <Legend
                wrapperStyle={{ fontSize: "11px", paddingTop: "8px" }}
                formatter={(value) => <span style={{ color: "hsl(var(--foreground))", fontWeight: 600 }}>{value}</span>}
              />
              <Line type="monotone" dataKey={tA} stroke="hsl(var(--primary))" strokeWidth={2} dot={false} />
              <Line type="monotone" dataKey={tB} stroke="hsl(var(--gain))" strokeWidth={2} dot={false} />
            </ReLineChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Fundamentals Comparison */}
      <div className="rounded-xl border border-border bg-card overflow-hidden">
        <div className="p-5 border-b border-border">
          <h3 className="text-sm font-bold text-foreground flex items-center gap-2">
            <Shield className="h-4 w-4 text-primary" />
            Perbandingan Fundamental
          </h3>
          <p className="text-[10px] text-muted-foreground mt-0.5">Metrik keuangan utama secara berdampingan</p>
        </div>
        {/* Table header */}
        <div className="grid grid-cols-[140px,1fr,auto,1fr,1fr] sm:grid-cols-[160px,1fr,auto,1fr,minmax(120px,1.5fr)] items-center border-b border-border bg-secondary/20 px-4 py-2.5 text-[10px] font-bold text-muted-foreground uppercase tracking-wider">
          <span>Metrik</span>
          <span className="text-right text-primary">{tA}</span>
          <span className="text-center px-2">vs</span>
          <span className="text-primary">{tB}</span>
          <span className="hidden sm:block">Deskripsi</span>
        </div>
        {fundamentals.map((row, i) => {
          const winner = getWinner(row.key, row.higherBetter);
          return (
            <div
              key={row.label}
              className={`grid grid-cols-[140px,1fr,auto,1fr,1fr] sm:grid-cols-[160px,1fr,auto,1fr,minmax(120px,1.5fr)] items-center px-4 py-3 ${
                i < fundamentals.length - 1 ? "border-b border-border/30" : ""
              } hover:bg-accent/20 transition-colors`}
            >
              <span className="text-xs font-semibold text-foreground">{row.label}</span>
              <div className="text-right">
                <span className={`font-mono text-xs font-bold ${winner === "a" ? "text-gain" : "text-foreground"}`}>
                  {row.formatA}
                </span>
                {winner === "a" && <span className="ml-1 text-gain text-[9px]">↑</span>}
                {winner === "b" && <span className="ml-1 text-loss text-[9px]">↓</span>}
              </div>
              <span className="text-[10px] text-muted-foreground px-2 text-center">vs</span>
              <div>
                <span className={`font-mono text-xs font-bold ${winner === "b" ? "text-gain" : "text-foreground"}`}>
                  {row.formatB}
                </span>
                {winner === "b" && <span className="ml-1 text-gain text-[9px]">↑</span>}
                {winner === "a" && <span className="ml-1 text-loss text-[9px]">↓</span>}
              </div>
              <span className="text-[10px] text-muted-foreground hidden sm:block">{row.description}</span>
            </div>
          );
        })}
      </div>

      {/* Technical Indicators */}
      <div className="rounded-xl border border-border bg-card p-5">
        <h3 className="text-sm font-bold text-foreground flex items-center gap-2 mb-1">
          <LineChart className="h-4 w-4 text-primary" />
          Indikator Teknikal
        </h3>
        <p className="text-[10px] text-muted-foreground mb-5">Perbandingan RSI, MACD, dan moving averages</p>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          {/* RSI */}
          <div className="rounded-xl border border-border bg-secondary/20 p-4">
            <p className="text-[10px] text-muted-foreground font-bold uppercase tracking-wider mb-3">RSI (14)</p>
            <div className="grid grid-cols-2 gap-3 mb-2">
              <div className="text-center">
                <p className="text-[9px] text-primary font-bold mb-1">{tA}</p>
                <p className={`font-mono text-lg font-extrabold ${rsiA > 70 ? "text-loss" : rsiA < 30 ? "text-gain" : "text-foreground"}`}>{rsiA.toFixed(1)}%</p>
              </div>
              <div className="text-center">
                <p className="text-[9px] text-gain font-bold mb-1">{tB}</p>
                <p className={`font-mono text-lg font-extrabold ${rsiB > 70 ? "text-loss" : rsiB < 30 ? "text-gain" : "text-foreground"}`}>{rsiB.toFixed(1)}%</p>
              </div>
            </div>
            <p className="text-[9px] text-muted-foreground text-center">&lt;30 Oversold, &gt;70 Overbought</p>
          </div>
          {/* EMA 20 */}
          <div className="rounded-xl border border-border bg-secondary/20 p-4">
            <p className="text-[10px] text-muted-foreground font-bold uppercase tracking-wider mb-3">EMA 20</p>
            <div className="grid grid-cols-2 gap-3 mb-2">
              <div className="text-center">
                <p className="text-[9px] text-primary font-bold mb-1">{tA}</p>
                <p className="font-mono text-sm font-extrabold text-foreground">{ema20A.toFixed(0)}</p>
              </div>
              <div className="text-center">
                <p className="text-[9px] text-gain font-bold mb-1">{tB}</p>
                <p className="font-mono text-sm font-extrabold text-foreground">{ema20B.toFixed(0)}</p>
              </div>
            </div>
            <p className="text-[9px] text-muted-foreground text-center">20-day Exponential Moving Avg</p>
          </div>
          {/* EMA 50 */}
          <div className="rounded-xl border border-border bg-secondary/20 p-4">
            <p className="text-[10px] text-muted-foreground font-bold uppercase tracking-wider mb-3">EMA 50</p>
            <div className="grid grid-cols-2 gap-3 mb-2">
              <div className="text-center">
                <p className="text-[9px] text-primary font-bold mb-1">{tA}</p>
                <p className="font-mono text-sm font-extrabold text-foreground">{ema50A.toFixed(0)}</p>
              </div>
              <div className="text-center">
                <p className="text-[9px] text-gain font-bold mb-1">{tB}</p>
                <p className="font-mono text-sm font-extrabold text-foreground">{ema50B.toFixed(0)}</p>
              </div>
            </div>
            <p className="text-[9px] text-muted-foreground text-center">50-day Exponential Moving Avg</p>
          </div>
          {/* MACD Trend */}
          <div className="rounded-xl border border-border bg-secondary/20 p-4">
            <p className="text-[10px] text-muted-foreground font-bold uppercase tracking-wider mb-3">MACD Trend</p>
            <div className="grid grid-cols-2 gap-3 mb-2">
              <div className="text-center">
                <p className="text-[9px] text-primary font-bold mb-1">{tA}</p>
                <p className={`text-sm font-extrabold ${macdA.trend === "Bullish" ? "text-gain" : "text-loss"}`}>{macdA.trend}</p>
                <p className="font-mono text-[9px] text-muted-foreground">H: {macdA.histogram.toFixed(2)}</p>
              </div>
              <div className="text-center">
                <p className="text-[9px] text-gain font-bold mb-1">{tB}</p>
                <p className={`text-sm font-extrabold ${macdB.trend === "Bullish" ? "text-gain" : "text-loss"}`}>{macdB.trend}</p>
                <p className="font-mono text-[9px] text-muted-foreground">H: {macdB.histogram.toFixed(2)}</p>
              </div>
            </div>
          </div>
          {/* MACD Line */}
          <div className="rounded-xl border border-border bg-secondary/20 p-4">
            <p className="text-[10px] text-muted-foreground font-bold uppercase tracking-wider mb-3">MACD Line</p>
            <div className="grid grid-cols-2 gap-3 mb-2">
              <div className="text-center">
                <p className="text-[9px] text-primary font-bold mb-1">{tA}</p>
                <p className={`font-mono text-sm font-extrabold ${macdA.line >= 0 ? "text-gain" : "text-loss"}`}>{macdA.line.toFixed(2)}</p>
              </div>
              <div className="text-center">
                <p className="text-[9px] text-gain font-bold mb-1">{tB}</p>
                <p className={`font-mono text-sm font-extrabold ${macdB.line >= 0 ? "text-gain" : "text-loss"}`}>{macdB.line.toFixed(2)}</p>
              </div>
            </div>
            <p className="text-[9px] text-muted-foreground text-center">MACD line value</p>
          </div>
          {/* MACD Signal */}
          <div className="rounded-xl border border-border bg-secondary/20 p-4">
            <p className="text-[10px] text-muted-foreground font-bold uppercase tracking-wider mb-3">MACD Signal</p>
            <div className="grid grid-cols-2 gap-3 mb-2">
              <div className="text-center">
                <p className="text-[9px] text-primary font-bold mb-1">{tA}</p>
                <p className={`font-mono text-sm font-extrabold ${macdA.signal >= 0 ? "text-gain" : "text-loss"}`}>{macdA.signal.toFixed(2)}</p>
              </div>
              <div className="text-center">
                <p className="text-[9px] text-gain font-bold mb-1">{tB}</p>
                <p className={`font-mono text-sm font-extrabold ${macdB.signal >= 0 ? "text-gain" : "text-loss"}`}>{macdB.signal.toFixed(2)}</p>
              </div>
            </div>
            <p className="text-[9px] text-muted-foreground text-center">MACD signal line</p>
          </div>
        </div>
      </div>

      {/* Radar Chart */}
      <RadarCompare stockA={stockA} stockB={stockB} />

      {/* Verdict */}
      {(() => {
        const scoreA = 
          (stockA.pe > 0 && stockA.pe < stockB.pe ? 1 : 0) +
          (stockA.roe > stockB.roe ? 1 : 0) +
          (stockA.dividendYield > stockB.dividendYield ? 1 : 0) +
          (stockA.changePercent > stockB.changePercent ? 1 : 0) +
          (stockA.beta < stockB.beta ? 1 : 0) +
          (stockA.debtToEquity < stockB.debtToEquity ? 1 : 0);
        const scoreB = 6 - scoreA;
        const winner = scoreA > scoreB ? stockA : scoreB > scoreA ? stockB : null;
        const winnerScore = Math.max(scoreA, scoreB);
        const reasons: string[] = [];
        if (stockA.roe > stockB.roe) reasons.push(`ROE lebih tinggi (${stockA.roe.toFixed(1)}% vs ${stockB.roe.toFixed(1)}%)`);
        else reasons.push(`ROE lebih tinggi (${stockB.roe.toFixed(1)}% vs ${stockA.roe.toFixed(1)}%)`);
        if (stockA.dividendYield > stockB.dividendYield) reasons.push(`dividen lebih besar`);
        if (stockA.pe > 0 && stockB.pe > 0 && stockA.pe < stockB.pe) reasons.push(`valuasi lebih murah (P/E ${stockA.pe.toFixed(1)}x)`);
        return (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="rounded-xl border border-primary/30 bg-primary/5 p-5"
          >
            <div className="flex items-center gap-2 mb-3">
              <Award className="h-4 w-4 text-primary" />
              <h3 className="text-sm font-bold text-foreground">Kesimpulan</h3>
            </div>
            {winner ? (
              <p className="text-xs text-foreground leading-relaxed">
                <span className="font-mono font-extrabold text-primary">{winner.ticker.replace(".JK", "")}</span> unggul dengan skor{" "}
                <span className="font-bold">{winnerScore}/6</span> dimensi. Keunggulan utama: {reasons.slice(0, 2).join(", ")}.
                Namun, keduanya layak dipertimbangkan sesuai profil risiko investor.
              </p>
            ) : (
              <p className="text-xs text-foreground leading-relaxed">
                Kedua saham memiliki skor yang sama (3/6). Keputusan sebaiknya disesuaikan dengan profil risiko dan tujuan investasi Anda.
              </p>
            )}
          </motion.div>
        );
      })()}

      {/* Analyst Recommendations */}
      <div className="rounded-xl border border-border bg-card p-5">
        <h3 className="text-sm font-bold text-foreground flex items-center gap-2 mb-1">
          <Target className="h-4 w-4 text-primary" />
          Rekomendasi Analis
        </h3>
        <p className="text-[10px] text-muted-foreground mb-5">Konsensus broker dan breakdown rating</p>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {[{ stock: stockA, ratings: ratingsA, signal: signalA }, { stock: stockB, ratings: ratingsB, signal: signalB }].map(({ stock, ratings, signal }) => {
            const t = stock.ticker.replace(".JK", "");
            const total = ratings.total;
            return (
              <div key={stock.ticker} className="rounded-xl border border-border bg-secondary/20 p-4">
                <div className="flex items-center justify-between mb-3">
                  <div>
                    <span className="font-mono text-sm font-extrabold text-foreground">{t}</span>
                    <p className="text-[10px] text-muted-foreground">{total} analis</p>
                  </div>
                  <span className={`text-[10px] font-bold px-2 py-0.5 rounded-md ${
                    signal.label.includes("BUY") ? "bg-gain/15 text-gain" :
                    signal.label === "HOLD" ? "bg-primary/15 text-primary" :
                    "bg-loss/15 text-loss"
                  }`}>
                    {signal.label.includes("STRONG") ? signal.label.split(" ")[1] : signal.label}
                  </span>
                </div>
                {/* Rating bar */}
                <div className="flex h-3 rounded-full overflow-hidden mb-3">
                  <div className="bg-gain" style={{ width: `${(ratings.sb / total) * 100}%` }} />
                  <div className="bg-gain/60" style={{ width: `${(ratings.b / total) * 100}%` }} />
                  <div className="bg-primary/60" style={{ width: `${(ratings.h / total) * 100}%` }} />
                  <div className="bg-loss/60" style={{ width: `${(ratings.s / total) * 100}%` }} />
                  <div className="bg-loss" style={{ width: `${(ratings.ss / total) * 100}%` }} />
                </div>
                {/* Labels */}
                <div className="flex justify-between text-[8px] text-muted-foreground font-mono mb-1">
                  <span>{ratings.sb}<br />SB</span>
                  <span>{ratings.b}<br />B</span>
                  <span>{ratings.h}<br />H</span>
                  <span>{ratings.s}<br />S</span>
                  <span>{ratings.ss}<br />SS</span>
                </div>
                <div className="flex justify-between items-center mt-3 pt-3 border-t border-border/30">
                  <span className="text-[10px] text-muted-foreground">Avg Rating</span>
                  <span className="font-mono text-xs font-bold text-foreground">{ratings.avg.toFixed(2)}</span>
                </div>
              </div>
            );
          })}
        </div>
        <p className="text-[8px] text-muted-foreground mt-4">Legend: SB = Strong Buy, B = Buy, H = Hold, S = Sell, SS = Strong Sell. Average rating: 1.0 = Strong Buy, 5.0 = Strong Sell</p>
      </div>
    </motion.div>
  );
};

export default StockCompare;
