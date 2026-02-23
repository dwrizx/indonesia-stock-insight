import { BarChart3, TrendingUp } from "lucide-react";
import SearchBar from "@/components/SearchBar";
import MarketTicker from "@/components/MarketTicker";
import MarketOverview from "@/components/MarketOverview";
import TopMovers from "@/components/TopMovers";
import StockCard from "@/components/StockCard";
import { stocks } from "@/data/stockData";

const Index = () => {
  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b border-border bg-card/50 backdrop-blur-sm sticky top-0 z-40">
        <div className="container mx-auto flex items-center justify-between px-4 py-3">
          <div className="flex items-center gap-2">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary">
              <BarChart3 className="h-4 w-4 text-primary-foreground" />
            </div>
            <div>
              <h1 className="text-sm font-bold text-foreground tracking-tight">IDX Saham</h1>
              <p className="text-[10px] text-muted-foreground">Indonesia Stock Analysis</p>
            </div>
          </div>
          <SearchBar />
          <div className="hidden md:flex items-center gap-1 text-xs text-muted-foreground">
            <TrendingUp className="h-3 w-3 text-gain" />
            <span>Market Buka</span>
          </div>
        </div>
      </header>

      {/* Ticker */}
      <MarketTicker />

      <main className="container mx-auto px-4 py-6 space-y-6">
        {/* Market Overview */}
        <section>
          <h2 className="mb-3 text-lg font-bold text-foreground">📊 Ringkasan Pasar</h2>
          <MarketOverview />
        </section>

        {/* Top Movers */}
        <section>
          <h2 className="mb-3 text-lg font-bold text-foreground">🔥 Penggerak Utama</h2>
          <TopMovers />
        </section>

        {/* All Stocks */}
        <section>
          <h2 className="mb-3 text-lg font-bold text-foreground">💹 Daftar Saham Populer</h2>
          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            {stocks.map((stock, i) => (
              <StockCard key={stock.ticker} stock={stock} index={i} />
            ))}
          </div>
        </section>
      </main>

      {/* Footer */}
      <footer className="border-t border-border py-6 mt-8">
        <div className="container mx-auto px-4 text-center">
          <p className="text-xs text-muted-foreground">
            Data disediakan oleh Yahoo Finance • Hanya untuk edukasi, bukan rekomendasi investasi
          </p>
        </div>
      </footer>
    </div>
  );
};

export default Index;
