import { BarChart3, TrendingUp, Clock } from "lucide-react";
import { motion } from "framer-motion";
import SearchBar from "@/components/SearchBar";
import MarketTicker from "@/components/MarketTicker";
import MarketOverview from "@/components/MarketOverview";
import TopMovers from "@/components/TopMovers";
import StockCard from "@/components/StockCard";
import SectorChart from "@/components/SectorChart";
import { stocks } from "@/data/stockData";

const Index = () => {
  const now = new Date();
  const timeStr = now.toLocaleTimeString("id-ID", { hour: "2-digit", minute: "2-digit" });
  const dateStr = now.toLocaleDateString("id-ID", { weekday: "long", day: "numeric", month: "long", year: "numeric" });

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b border-border bg-card/80 backdrop-blur-md sticky top-0 z-40">
        <div className="container mx-auto flex items-center justify-between px-4 py-3">
          <div className="flex items-center gap-3">
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-br from-primary to-primary/70 shadow-lg shadow-primary/20">
              <BarChart3 className="h-4 w-4 text-primary-foreground" />
            </div>
            <div>
              <h1 className="text-sm font-extrabold text-foreground tracking-tight">IDX Saham</h1>
              <p className="text-[10px] text-muted-foreground">Indonesia Stock Analysis</p>
            </div>
          </div>
          <SearchBar />
          <div className="hidden lg:flex items-center gap-4 text-xs text-muted-foreground">
            <div className="flex items-center gap-1.5">
              <Clock className="h-3 w-3" />
              <span>{timeStr} WIB</span>
            </div>
            <div className="flex items-center gap-1.5 rounded-full bg-gain/10 px-2.5 py-1">
              <span className="h-1.5 w-1.5 rounded-full bg-gain animate-pulse-glow" />
              <span className="text-gain font-medium text-[11px]">Market Buka</span>
            </div>
          </div>
        </div>
      </header>

      {/* Ticker */}
      <MarketTicker />

      <main className="container mx-auto px-4 py-6 space-y-8">
        {/* Hero Stats */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="flex flex-wrap items-end justify-between gap-2"
        >
          <div>
            <p className="text-xs text-muted-foreground">{dateStr}</p>
            <h2 className="text-2xl font-extrabold text-foreground mt-1">Ringkasan Pasar Indonesia</h2>
            <p className="text-sm text-muted-foreground mt-0.5">Data real-time dari Bursa Efek Indonesia</p>
          </div>
          <div className="flex items-center gap-2">
            <div className="rounded-lg bg-secondary px-3 py-1.5 text-xs font-medium text-secondary-foreground">
              {stocks.filter(s => s.change >= 0).length} <span className="text-gain">naik</span>
            </div>
            <div className="rounded-lg bg-secondary px-3 py-1.5 text-xs font-medium text-secondary-foreground">
              {stocks.filter(s => s.change < 0).length} <span className="text-loss">turun</span>
            </div>
          </div>
        </motion.div>

        {/* Market Overview */}
        <section>
          <MarketOverview />
        </section>

        {/* Top Movers + Sector */}
        <div className="grid gap-4 lg:grid-cols-3">
          <div className="lg:col-span-2">
            <TopMovers />
          </div>
          <div>
            <SectorChart />
          </div>
        </div>

        {/* All Stocks */}
        <section>
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <TrendingUp className="h-5 w-5 text-primary" />
              <h2 className="text-lg font-bold text-foreground">Daftar Saham Populer</h2>
            </div>
            <span className="text-xs text-muted-foreground">{stocks.length} saham</span>
          </div>
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            {stocks.map((stock, i) => (
              <StockCard key={stock.ticker} stock={stock} index={i} />
            ))}
          </div>
        </section>
      </main>

      {/* Footer */}
      <footer className="border-t border-border py-8 mt-8">
        <div className="container mx-auto px-4 text-center space-y-2">
          <div className="flex items-center justify-center gap-2">
            <BarChart3 className="h-4 w-4 text-primary" />
            <span className="text-sm font-bold text-foreground">IDX Saham</span>
          </div>
          <p className="text-xs text-muted-foreground">
            Data disediakan oleh Yahoo Finance • Hanya untuk edukasi, bukan rekomendasi investasi
          </p>
          <p className="text-[10px] text-muted-foreground/60">
            © 2026 IDX Saham. Semua hak dilindungi.
          </p>
        </div>
      </footer>
    </div>
  );
};

export default Index;
