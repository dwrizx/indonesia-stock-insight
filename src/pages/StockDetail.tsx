import { useParams, useNavigate } from "react-router-dom";
import { ArrowLeft, BarChart3, TrendingUp, TrendingDown, ExternalLink, Activity, DollarSign, PieChart, BarChart2 } from "lucide-react";
import { motion } from "framer-motion";
import { stocks, formatRupiah, formatVolume } from "@/data/stockData";
import StockChart from "@/components/StockChart";

const StockDetail = () => {
  const { ticker } = useParams();
  const navigate = useNavigate();
  const stock = stocks.find((s) => s.ticker === ticker);

  if (!stock) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-background">
        <div className="text-center">
          <p className="text-lg font-semibold text-foreground">Saham tidak ditemukan</p>
          <button onClick={() => navigate("/")} className="mt-4 text-sm text-primary hover:underline">
            Kembali ke Dashboard
          </button>
        </div>
      </div>
    );
  }

  const isGain = stock.change >= 0;
  const pricePosition = ((stock.price - stock.low52w) / (stock.high52w - stock.low52w)) * 100;

  const tradingInfo = [
    { label: "Open", value: `Rp${stock.open.toLocaleString("id-ID")}`, icon: Activity },
    { label: "High", value: `Rp${stock.high.toLocaleString("id-ID")}`, icon: TrendingUp },
    { label: "Low", value: `Rp${stock.low.toLocaleString("id-ID")}`, icon: TrendingDown },
    { label: "Prev Close", value: `Rp${stock.prevClose.toLocaleString("id-ID")}`, icon: BarChart2 },
    { label: "Volume", value: formatVolume(stock.volume), icon: BarChart2 },
    { label: "Market Cap", value: formatRupiah(stock.marketCap), icon: DollarSign },
  ];

  const fundamentals = [
    { label: "P/E Ratio", value: stock.pe > 0 ? stock.pe.toFixed(1) : "N/A" },
    { label: "P/BV", value: stock.pbv.toFixed(1) },
    { label: "Dividend Yield", value: `${stock.dividendYield.toFixed(1)}%` },
    { label: "52W High", value: `Rp${stock.high52w.toLocaleString("id-ID")}` },
    { label: "52W Low", value: `Rp${stock.low52w.toLocaleString("id-ID")}` },
    { label: "Sektor", value: stock.sector },
  ];

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b border-border bg-card/80 backdrop-blur-md sticky top-0 z-40">
        <div className="container mx-auto flex items-center gap-4 px-4 py-3">
          <button onClick={() => navigate("/")} className="flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground transition-colors rounded-lg hover:bg-accent px-2 py-1">
            <ArrowLeft className="h-4 w-4" />
            <span className="hidden sm:inline">Dashboard</span>
          </button>
          <div className="h-5 w-px bg-border" />
          <div className="flex items-center gap-2">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-gradient-to-br from-primary to-primary/70">
              <BarChart3 className="h-4 w-4 text-primary-foreground" />
            </div>
            <span className="text-sm font-bold text-foreground">IDX Saham</span>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 py-6">
        {/* Stock Hero */}
        <motion.div
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="mb-6"
        >
          <div className="flex flex-wrap items-start justify-between gap-4 mb-4">
            <div>
              <div className="flex items-center gap-3 mb-1">
                <h1 className="text-3xl font-extrabold text-foreground">{stock.ticker.replace(".JK", "")}</h1>
                <span className="rounded-full bg-primary/10 border border-primary/20 px-3 py-1 text-xs font-medium text-primary">{stock.sector}</span>
              </div>
              <p className="text-sm text-muted-foreground">{stock.name}</p>
            </div>
            <div className="text-right">
              <p className="font-mono text-4xl font-extrabold text-foreground">Rp{stock.price.toLocaleString("id-ID")}</p>
              <div className={`mt-1 inline-flex items-center gap-1.5 rounded-lg px-3 py-1 text-sm font-bold ${isGain ? "bg-gain\/10 text-gain" : "bg-loss\/10 text-loss"}`}>
                {isGain ? <TrendingUp className="h-4 w-4" /> : <TrendingDown className="h-4 w-4" />}
                <span>{isGain ? "+" : ""}{stock.change.toLocaleString("id-ID")}</span>
                <span>({isGain ? "+" : ""}{stock.changePercent.toFixed(2)}%)</span>
              </div>
            </div>
          </div>

          {/* 52 Week Range */}
          <div className="rounded-xl border border-border bg-card p-4">
            <p className="text-xs font-medium text-muted-foreground mb-3">Rentang 52 Minggu</p>
            <div className="flex items-center gap-3">
              <span className="font-mono text-xs text-loss font-medium">Rp{stock.low52w.toLocaleString("id-ID")}</span>
              <div className="relative flex-1 h-3 rounded-full bg-secondary overflow-hidden">
                <div className="absolute inset-0 rounded-full bg-gradient-to-r from-loss/50 via-primary/30 to-gain/50" />
                <div
                  className="absolute top-1/2 -translate-y-1/2 h-5 w-2 rounded-full bg-primary shadow-lg shadow-primary/40 border-2 border-background"
                  style={{ left: `${Math.min(Math.max(pricePosition, 3), 97)}%` }}
                />
              </div>
              <span className="font-mono text-xs text-gain font-medium">Rp{stock.high52w.toLocaleString("id-ID")}</span>
            </div>
          </div>
        </motion.div>

        <div className="grid gap-6 lg:grid-cols-3">
          {/* Charts */}
          <motion.div
            className="lg:col-span-2 space-y-4"
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.5, delay: 0.1 }}
          >
            <StockChart basePrice={stock.price} ticker={stock.ticker} />
          </motion.div>

          {/* Sidebar Metrics */}
          <motion.div
            className="space-y-4"
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.5, delay: 0.2 }}
          >
            {/* Trading Info */}
            <div className="rounded-xl border border-border bg-card p-5">
              <h3 className="mb-4 flex items-center gap-2 text-sm font-bold text-foreground">
                <Activity className="h-4 w-4 text-primary" />
                Info Perdagangan
              </h3>
              <div className="grid grid-cols-2 gap-3">
                {tradingInfo.map((m) => (
                  <div key={m.label} className="rounded-lg bg-secondary/50 p-3">
                    <p className="text-[10px] text-muted-foreground mb-1">{m.label}</p>
                    <p className="font-mono text-xs font-bold text-foreground">{m.value}</p>
                  </div>
                ))}
              </div>
            </div>

            {/* Fundamentals */}
            <div className="rounded-xl border border-border bg-card p-5">
              <h3 className="mb-4 flex items-center gap-2 text-sm font-bold text-foreground">
                <PieChart className="h-4 w-4 text-primary" />
                Fundamental
              </h3>
              <div className="space-y-3">
                {fundamentals.map((m) => (
                  <div key={m.label} className="flex items-center justify-between pb-2 border-b border-border/50 last:border-0 last:pb-0">
                    <span className="text-xs text-muted-foreground">{m.label}</span>
                    <span className="font-mono text-xs font-bold text-foreground">{m.value}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Yahoo Finance Link */}
            <a
              href={`https://finance.yahoo.com/quote/${stock.ticker}`}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-primary to-primary/80 px-4 py-3 text-sm font-bold text-primary-foreground transition-all hover:shadow-lg hover:shadow-primary/20 hover:scale-[1.02] active:scale-[0.98]"
            >
              Lihat di Yahoo Finance
              <ExternalLink className="h-4 w-4" />
            </a>
          </motion.div>
        </div>
      </main>
    </div>
  );
};

export default StockDetail;
