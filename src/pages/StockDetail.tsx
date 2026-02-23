import { useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { ArrowLeft, BarChart3, TrendingUp, TrendingDown, ExternalLink, Activity, DollarSign, PieChart, BarChart2, Shield, Target, LineChart, Gauge } from "lucide-react";
import { motion } from "framer-motion";
import { stocks, formatRupiah, formatVolume } from "@/data/stockData";
import StockChart from "@/components/StockChart";
import TechnicalAnalysis from "@/components/TechnicalAnalysis";
import PeerComparison from "@/components/PeerComparison";
import StockNewsList from "@/components/StockNewsList";

const StockDetail = () => {
  const [activeTab, setActiveTab] = useState<"chart" | "teknikal">("chart");
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
  const dayRange = ((stock.price - stock.low) / (stock.high - stock.low)) * 100;

  const tradingInfo = [
    { label: "Open", value: `Rp${stock.open.toLocaleString("id-ID")}`, icon: Activity },
    { label: "High", value: `Rp${stock.high.toLocaleString("id-ID")}`, icon: TrendingUp },
    { label: "Low", value: `Rp${stock.low.toLocaleString("id-ID")}`, icon: TrendingDown },
    { label: "Prev Close", value: `Rp${stock.prevClose.toLocaleString("id-ID")}`, icon: BarChart2 },
    { label: "Volume", value: formatVolume(stock.volume), icon: BarChart2 },
    { label: "Market Cap", value: formatRupiah(stock.marketCap), icon: DollarSign },
  ];

  const fundamentals = [
    { label: "P/E Ratio", value: stock.pe > 0 ? stock.pe.toFixed(1) : "N/A", highlight: stock.pe > 0 && stock.pe < 15 },
    { label: "P/BV", value: stock.pbv.toFixed(1), highlight: stock.pbv < 2 },
    { label: "EPS", value: `Rp${stock.eps.toLocaleString("id-ID")}`, highlight: stock.eps > 0 },
    { label: "ROE", value: `${stock.roe.toFixed(1)}%`, highlight: stock.roe > 15 },
    { label: "Div. Yield", value: `${stock.dividendYield.toFixed(1)}%`, highlight: stock.dividendYield > 3 },
    { label: "Beta", value: stock.beta.toFixed(2) },
    { label: "D/E Ratio", value: stock.debtToEquity.toFixed(1) },
    { label: "52W High", value: `Rp${stock.high52w.toLocaleString("id-ID")}` },
    { label: "52W Low", value: `Rp${stock.low52w.toLocaleString("id-ID")}` },
    { label: "Sektor", value: stock.sector },
  ];

  return (
    <div className="min-h-screen bg-background noise-bg">
      {/* Header */}
      <header className="border-b border-border bg-card/60 backdrop-blur-xl sticky top-0 z-40">
        <div className="container mx-auto flex items-center gap-4 px-4 py-3">
          <button onClick={() => navigate("/")} className="flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground transition-colors rounded-lg hover:bg-accent px-2.5 py-1.5">
            <ArrowLeft className="h-4 w-4" />
            <span className="hidden sm:inline">Dashboard</span>
          </button>
          <div className="h-5 w-px bg-border" />
          <div className="flex items-center gap-2">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-gradient-to-br from-primary to-primary/60 shadow-lg shadow-primary/20">
              <BarChart3 className="h-4 w-4 text-primary-foreground" />
            </div>
            <span className="text-sm font-extrabold gradient-text">IDX Saham</span>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 py-8">
        {/* Stock Hero */}
        <motion.div
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="mb-8"
        >
          <div className="relative rounded-2xl overflow-hidden border border-border">
            <div className="absolute inset-0 grid-pattern opacity-20" />
            <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-transparent to-transparent" />
            <div className="relative p-6 md:p-8">
              <div className="flex flex-wrap items-start justify-between gap-6">
                <div className="space-y-2">
                  <div className="flex items-center gap-3">
                    <h1 className="text-4xl md:text-5xl font-extrabold text-foreground">{stock.ticker.replace(".JK", "")}</h1>
                    <span className="rounded-lg bg-primary/10 border border-primary/20 px-3 py-1 text-xs font-bold text-primary uppercase tracking-wider">{stock.sector}</span>
                  </div>
                  <p className="text-sm text-muted-foreground">{stock.name}</p>
                </div>
                <div className="text-right">
                  <p className="font-mono text-4xl md:text-5xl font-extrabold text-foreground">Rp{stock.price.toLocaleString("id-ID")}</p>
                  <div className={`mt-2 inline-flex items-center gap-2 rounded-lg px-4 py-2 text-sm font-bold ${isGain ? "bg-gain/10 border border-gain/20 text-gain" : "bg-loss/10 border border-loss/20 text-loss"}`}>
                    {isGain ? <TrendingUp className="h-4 w-4" /> : <TrendingDown className="h-4 w-4" />}
                    <span>{isGain ? "+" : ""}{stock.change.toLocaleString("id-ID")}</span>
                    <span className="opacity-70">({isGain ? "+" : ""}{stock.changePercent.toFixed(2)}%)</span>
                  </div>
                </div>
              </div>

              {/* Range Bars */}
              <div className="mt-6 grid gap-4 md:grid-cols-2">
                {/* Day Range */}
                <div className="rounded-xl bg-card/50 border border-border/50 p-4">
                  <p className="text-[10px] font-bold text-muted-foreground mb-3 uppercase tracking-wider">Rentang Hari Ini</p>
                  <div className="flex items-center gap-3">
                    <span className="font-mono text-[11px] text-loss font-semibold">Rp{stock.low.toLocaleString("id-ID")}</span>
                    <div className="relative flex-1 h-2 rounded-full bg-secondary overflow-hidden">
                      <div className="absolute inset-0 rounded-full bg-gradient-to-r from-loss/40 via-primary/20 to-gain/40" />
                      <div
                        className="absolute top-1/2 -translate-y-1/2 h-4 w-1.5 rounded-full bg-primary shadow-lg shadow-primary/50"
                        style={{ left: `${Math.min(Math.max(dayRange, 3), 97)}%` }}
                      />
                    </div>
                    <span className="font-mono text-[11px] text-gain font-semibold">Rp{stock.high.toLocaleString("id-ID")}</span>
                  </div>
                </div>

                {/* 52W Range */}
                <div className="rounded-xl bg-card/50 border border-border/50 p-4">
                  <p className="text-[10px] font-bold text-muted-foreground mb-3 uppercase tracking-wider">Rentang 52 Minggu</p>
                  <div className="flex items-center gap-3">
                    <span className="font-mono text-[11px] text-loss font-semibold">Rp{stock.low52w.toLocaleString("id-ID")}</span>
                    <div className="relative flex-1 h-2 rounded-full bg-secondary overflow-hidden">
                      <div className="absolute inset-0 rounded-full bg-gradient-to-r from-loss/40 via-primary/20 to-gain/40" />
                      <div
                        className="absolute top-1/2 -translate-y-1/2 h-4 w-1.5 rounded-full bg-primary shadow-lg shadow-primary/50"
                        style={{ left: `${Math.min(Math.max(pricePosition, 3), 97)}%` }}
                      />
                    </div>
                    <span className="font-mono text-[11px] text-gain font-semibold">Rp{stock.high52w.toLocaleString("id-ID")}</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </motion.div>

        <div className="grid gap-6 lg:grid-cols-3">
          {/* Charts with Tabs */}
          <motion.div
            className="lg:col-span-2 space-y-4"
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.5, delay: 0.1 }}
          >
            {/* Tab Selector */}
            <div className="flex items-center gap-1 rounded-lg bg-secondary/50 p-1 w-fit">
              <button
                onClick={() => setActiveTab("chart")}
                className={`flex items-center gap-1.5 rounded-md px-4 py-2 text-xs font-bold transition-all ${
                  activeTab === "chart"
                    ? "bg-primary text-primary-foreground shadow-lg shadow-primary/20"
                    : "text-muted-foreground hover:text-foreground"
                }`}
              >
                <BarChart2 className="h-3.5 w-3.5" />
                Grafik Harga
              </button>
              <button
                onClick={() => setActiveTab("teknikal")}
                className={`flex items-center gap-1.5 rounded-md px-4 py-2 text-xs font-bold transition-all ${
                  activeTab === "teknikal"
                    ? "bg-primary text-primary-foreground shadow-lg shadow-primary/20"
                    : "text-muted-foreground hover:text-foreground"
                }`}
              >
                <LineChart className="h-3.5 w-3.5" />
                Analisis Teknikal
              </button>
            </div>

            {activeTab === "chart" ? (
              <StockChart basePrice={stock.price} ticker={stock.ticker} />
            ) : (
              <TechnicalAnalysis basePrice={stock.price} ticker={stock.ticker} />
            )}
          </motion.div>

          {/* Sidebar */}
          <motion.div
            className="space-y-4"
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.5, delay: 0.2 }}
          >
            {/* Trading Info */}
            <div className="rounded-xl border border-border bg-card p-5 gradient-border">
              <h3 className="mb-4 flex items-center gap-2 text-xs font-bold text-foreground uppercase tracking-wider">
                <Activity className="h-4 w-4 text-primary" />
                Info Perdagangan
              </h3>
              <div className="grid grid-cols-2 gap-2">
                {tradingInfo.map((m) => (
                  <div key={m.label} className="rounded-lg bg-secondary/40 p-3">
                    <p className="text-[9px] text-muted-foreground mb-1 uppercase tracking-wider">{m.label}</p>
                    <p className="font-mono text-xs font-bold text-foreground">{m.value}</p>
                  </div>
                ))}
              </div>
            </div>

            {/* Fundamentals */}
            <div className="rounded-xl border border-border bg-card p-5 gradient-border">
              <h3 className="mb-4 flex items-center gap-2 text-xs font-bold text-foreground uppercase tracking-wider">
                <Shield className="h-4 w-4 text-primary" />
                Fundamental
              </h3>
              <div className="space-y-3">
                {fundamentals.map((m) => (
                  <div key={m.label} className="flex items-center justify-between pb-2.5 border-b border-border/30 last:border-0 last:pb-0">
                    <span className="text-xs text-muted-foreground">{m.label}</span>
                    <span className={`font-mono text-xs font-bold ${m.highlight ? "text-gain" : "text-foreground"}`}>{m.value}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Quick Score */}
            <div className="rounded-xl border border-border bg-card p-5 gradient-border">
              <h3 className="mb-3 flex items-center gap-2 text-xs font-bold text-foreground uppercase tracking-wider">
                <Target className="h-4 w-4 text-primary" />
                Skor Cepat
              </h3>
              <div className="space-y-3">
                {[
                  { label: "Valuasi", score: stock.pe > 0 && stock.pe < 20 ? 75 : 40, color: stock.pe > 0 && stock.pe < 20 ? "bg-gain" : "bg-loss" },
                  { label: "Profitabilitas", score: stock.roe > 0 ? Math.min(stock.roe * 4, 100) : 10, color: stock.roe > 15 ? "bg-gain" : "bg-primary" },
                  { label: "Dividen", score: Math.min(stock.dividendYield * 15, 100), color: stock.dividendYield > 3 ? "bg-gain" : "bg-primary" },
                  { label: "Momentum", score: isGain ? 70 : 35, color: isGain ? "bg-gain" : "bg-loss" },
                  { label: "Risiko", score: Math.max(100 - stock.beta * 50, 10), color: stock.beta < 1 ? "bg-gain" : "bg-loss" },
                ].map((item) => (
                  <div key={item.label}>
                    <div className="flex justify-between mb-1">
                      <span className="text-[10px] text-muted-foreground">{item.label}</span>
                      <span className="font-mono text-[10px] font-bold text-foreground">{Math.round(item.score)}/100</span>
                    </div>
                    <div className="h-1.5 rounded-full bg-secondary overflow-hidden">
                      <div className={`h-full rounded-full ${item.color} transition-all`} style={{ width: `${item.score}%` }} />
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Yahoo Finance Link */}
            <a
              href={`https://finance.yahoo.com/quote/${stock.ticker}`}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-primary to-primary/70 px-4 py-3.5 text-sm font-bold text-primary-foreground transition-all hover:shadow-lg hover:shadow-primary/25 hover:scale-[1.02] active:scale-[0.98]"
            >
              Lihat di Yahoo Finance
              <ExternalLink className="h-4 w-4" />
            </a>
          </motion.div>
        </div>

        {/* Bottom Section: Peer Comparison + News */}
        <div className="grid gap-6 lg:grid-cols-2 mt-6">
          <PeerComparison currentTicker={stock.ticker} sector={stock.sector} />
          <StockNewsList ticker={stock.ticker} />
        </div>
      </main>
    </div>
  );
};

export default StockDetail;
