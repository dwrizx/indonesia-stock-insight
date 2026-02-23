import { useState, useMemo } from "react";
import { BarChart3, TrendingUp, TrendingDown, Clock, Activity, Zap, Globe, Filter, ArrowUpDown, X, LayoutGrid, List, Layers, Sun, Moon, PieChart, Table2 } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import SearchBar from "@/components/SearchBar";
import MarketTicker from "@/components/MarketTicker";
import MarketOverview from "@/components/MarketOverview";
import TopMovers from "@/components/TopMovers";
import StockCard from "@/components/StockCard";
import StockTable from "@/components/StockTable";
import HeatMap from "@/components/HeatMap";
import SectorChart from "@/components/SectorChart";
import MobileNav from "@/components/MobileNav";
import { useTheme } from "@/components/ThemeProvider";
import { stocks, marketIndices, sectorData } from "@/data/stockData";

type SortKey = "changePercent" | "pe" | "dividendYield" | "marketCap" | "price";
type SortDir = "asc" | "desc";

const sortOptions: { key: SortKey; label: string }[] = [
  { key: "changePercent", label: "Perubahan %" },
  { key: "price", label: "Harga" },
  { key: "pe", label: "P/E Ratio" },
  { key: "dividendYield", label: "Div. Yield" },
  { key: "marketCap", label: "Market Cap" },
];

const Index = () => {
  const { theme, toggleTheme } = useTheme();
  const [sectorFilter, setSectorFilter] = useState<string>("Semua");
  const [sortKey, setSortKey] = useState<SortKey>("changePercent");
  const [sortDir, setSortDir] = useState<SortDir>("desc");
  const [showFilters, setShowFilters] = useState(false);
  const [viewMode, setViewMode] = useState<"grid" | "table">("grid");
  const [activeTab, setActiveTab] = useState<"overview" | "stocks" | "heatmap" | "sectors">("overview");
  const sectors = useMemo(() => ["Semua", ...sectorData.map(s => s.name)], []);

  const filteredStocks = useMemo(() => {
    let result = [...stocks];
    if (sectorFilter !== "Semua") {
      result = result.filter(s => s.sector === sectorFilter);
    }
    result.sort((a, b) => {
      const aVal = a[sortKey];
      const bVal = b[sortKey];
      return sortDir === "desc" ? (bVal as number) - (aVal as number) : (aVal as number) - (bVal as number);
    });
    return result;
  }, [sectorFilter, sortKey, sortDir]);

  const now = new Date();
  const timeStr = now.toLocaleTimeString("id-ID", { hour: "2-digit", minute: "2-digit" });
  const dateStr = now.toLocaleDateString("id-ID", { weekday: "long", day: "numeric", month: "long", year: "numeric" });
  const gainCount = stocks.filter(s => s.change >= 0).length;
  const lossCount = stocks.filter(s => s.change < 0).length;
  const ihsg = marketIndices[0];

  const toggleSort = (key: SortKey) => {
    if (sortKey === key) {
      setSortDir(d => d === "desc" ? "asc" : "desc");
    } else {
      setSortKey(key);
      setSortDir("desc");
    }
  };

  return (
    <div className="min-h-screen bg-background noise-bg">
      {/* Header */}
      <header className="border-b border-border bg-card/60 backdrop-blur-xl sticky top-0 z-40">
        <div className="container mx-auto flex items-center justify-between px-4 py-3">
          <div className="flex items-center gap-3">
            <div className="relative">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-primary to-primary/60 shadow-lg shadow-primary/25">
                <BarChart3 className="h-5 w-5 text-primary-foreground" />
              </div>
              <div className="absolute -top-0.5 -right-0.5 h-2.5 w-2.5 rounded-full bg-gain border-2 border-background animate-pulse-glow" />
            </div>
            <div>
              <h1 className="text-base font-extrabold tracking-tight gradient-text">IDX Saham</h1>
              <p className="text-[10px] text-muted-foreground tracking-wide uppercase hidden sm:block">Indonesia Stock Analysis</p>
            </div>
          </div>
          <div className="hidden md:block flex-1 max-w-md mx-4">
            <SearchBar />
          </div>
          <div className="flex items-center gap-2">
            <div className="hidden lg:flex items-center gap-2">
              <div className="flex items-center gap-1.5 text-xs text-muted-foreground bg-secondary/50 rounded-lg px-3 py-1.5">
                <Clock className="h-3 w-3" />
                <span className="font-mono">{timeStr}</span>
                <span className="text-muted-foreground/60">WIB</span>
              </div>
              <div className="flex items-center gap-1.5 rounded-lg bg-gain/10 border border-gain/20 px-3 py-1.5">
                <span className="h-2 w-2 rounded-full bg-gain animate-pulse-glow" />
                <span className="text-gain font-semibold text-[11px]">Pasar Buka</span>
              </div>
            </div>
            <button
              onClick={toggleTheme}
              className="flex h-9 w-9 items-center justify-center rounded-lg border border-border bg-secondary/50 text-foreground transition-colors hover:bg-accent"
              aria-label="Toggle theme"
            >
              {theme === "dark" ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
            </button>
            <MobileNav />
          </div>
        </div>
      </header>

      <MarketTicker />

      <main className="container mx-auto px-4 py-6 space-y-6">
        {/* Hero Section */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6 }}>
          <div className="relative rounded-2xl overflow-hidden border border-border">
            <div className="absolute inset-0 grid-pattern opacity-30" />
            <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-transparent to-gain/5" />
            <div className="relative p-5 md:p-8">
              <div className="flex flex-wrap items-start justify-between gap-4 md:gap-6">
                <div className="space-y-2 md:space-y-3">
                  <p className="text-[10px] sm:text-xs text-muted-foreground font-medium uppercase tracking-widest">{dateStr}</p>
                  <h2 className="text-2xl sm:text-3xl md:text-4xl font-extrabold text-foreground leading-tight">
                    Ringkasan<br />
                    <span className="gradient-text">Pasar Indonesia</span>
                  </h2>
                  <div className="flex items-center gap-2 pt-1">
                    <div className="flex items-center gap-1.5 rounded-lg bg-gain/10 border border-gain/20 px-2.5 py-1.5">
                      <TrendingUp className="h-3 w-3 text-gain" />
                      <span className="text-xs font-bold text-gain">{gainCount}</span>
                      <span className="text-[10px] text-gain/70">Naik</span>
                    </div>
                    <div className="flex items-center gap-1.5 rounded-lg bg-loss/10 border border-loss/20 px-2.5 py-1.5">
                      <TrendingDown className="h-3 w-3 text-loss" />
                      <span className="text-xs font-bold text-loss">{lossCount}</span>
                      <span className="text-[10px] text-loss/70">Turun</span>
                    </div>
                  </div>
                </div>
                <motion.div
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: 0.3, duration: 0.5 }}
                  className="rounded-2xl card-glass border border-primary/20 p-5 min-w-[180px] gradient-border"
                >
                  <div className="flex items-center gap-2 mb-1.5">
                    <Globe className="h-3.5 w-3.5 text-primary" />
                    <span className="text-[10px] font-bold text-primary uppercase tracking-wider">IHSG</span>
                  </div>
                  <p className="font-mono text-2xl sm:text-3xl font-extrabold text-foreground">{ihsg.value.toLocaleString("id-ID")}</p>
                  <div className={`mt-1.5 flex items-center gap-1.5 ${ihsg.change >= 0 ? "text-gain" : "text-loss"}`}>
                    {ihsg.change >= 0 ? <TrendingUp className="h-3.5 w-3.5" /> : <TrendingDown className="h-3.5 w-3.5" />}
                    <span className="font-mono text-xs font-bold">{ihsg.change >= 0 ? "+" : ""}{ihsg.change.toFixed(2)}</span>
                    <span className="font-mono text-[10px] opacity-70">({ihsg.change >= 0 ? "+" : ""}{ihsg.changePercent.toFixed(2)}%)</span>
                  </div>
                </motion.div>
              </div>
            </div>
          </div>
        </motion.div>

        {/* Tab Navigation Bar */}
        <div className="flex items-center gap-1 rounded-xl bg-card border border-border p-1.5 overflow-x-auto scrollbar-hide">
          {([
            { key: "overview" as const, label: "Ringkasan", icon: Activity },
            { key: "stocks" as const, label: "Saham", icon: Zap },
            { key: "heatmap" as const, label: "Peta Pasar", icon: Layers },
            { key: "sectors" as const, label: "Sektor", icon: PieChart },
          ]).map(tab => (
            <button
              key={tab.key}
              onClick={() => setActiveTab(tab.key)}
              className={`relative flex items-center gap-2 rounded-lg px-4 py-2.5 text-xs font-bold whitespace-nowrap transition-all ${
                activeTab === tab.key
                  ? "bg-primary text-primary-foreground shadow-lg shadow-primary/20"
                  : "text-muted-foreground hover:text-foreground hover:bg-accent/50"
              }`}
            >
              <tab.icon className="h-4 w-4" />
              {tab.label}
            </button>
          ))}
        </div>

        {/* Tab Content */}
        <AnimatePresence mode="wait">
          {activeTab === "overview" && (
            <motion.div
              key="overview"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.25 }}
              className="space-y-6"
            >
              <MarketOverview />
              <div className="grid gap-6 lg:grid-cols-3">
                <div className="lg:col-span-2">
                  <TopMovers />
                </div>
                <div>
                  <SectorChart />
                </div>
              </div>
            </motion.div>
          )}

          {activeTab === "stocks" && (
            <motion.div
              key="stocks"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.25 }}
            >
              {/* Controls */}
              <div className="flex flex-wrap items-center justify-between gap-3 mb-5">
                <p className="text-xs text-muted-foreground">{filteredStocks.length} dari {stocks.length} saham</p>
                <div className="flex items-center gap-2">
                  <div className="flex items-center rounded-lg bg-secondary/50 p-0.5 border border-border">
                    <button
                      onClick={() => setViewMode("grid")}
                      className={`rounded-md p-2 transition-all ${viewMode === "grid" ? "bg-primary text-primary-foreground shadow" : "text-muted-foreground hover:text-foreground"}`}
                    >
                      <LayoutGrid className="h-3.5 w-3.5" />
                    </button>
                    <button
                      onClick={() => setViewMode("table")}
                      className={`rounded-md p-2 transition-all ${viewMode === "table" ? "bg-primary text-primary-foreground shadow" : "text-muted-foreground hover:text-foreground"}`}
                    >
                      <List className="h-3.5 w-3.5" />
                    </button>
                  </div>
                  <button
                    onClick={() => setShowFilters(f => !f)}
                    className={`flex items-center gap-2 rounded-lg px-3 py-2 text-xs font-bold transition-all border ${
                      showFilters || sectorFilter !== "Semua"
                        ? "bg-primary/10 border-primary/30 text-primary"
                        : "bg-secondary/50 border-border text-muted-foreground hover:text-foreground"
                    }`}
                  >
                    <Filter className="h-3.5 w-3.5" />
                    <span className="hidden sm:inline">Filter & Sort</span>
                    {sectorFilter !== "Semua" && (
                      <span className="rounded-full bg-primary px-1.5 py-0.5 text-[9px] text-primary-foreground">1</span>
                    )}
                  </button>
                </div>
              </div>

              {/* Filter Panel */}
              <AnimatePresence>
                {showFilters && (
                  <motion.div
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: "auto" }}
                    exit={{ opacity: 0, height: 0 }}
                    transition={{ duration: 0.3 }}
                    className="overflow-hidden mb-5"
                  >
                    <div className="rounded-xl border border-border bg-card p-4 space-y-4">
                      <div>
                        <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider mb-2">Sektor</p>
                        <div className="flex flex-wrap gap-1.5">
                          {sectors.map(s => (
                            <button
                              key={s}
                              onClick={() => setSectorFilter(s)}
                              className={`rounded-lg px-2.5 py-1.5 text-[11px] font-semibold transition-all border ${
                                sectorFilter === s
                                  ? "bg-primary/15 border-primary/40 text-primary"
                                  : "bg-secondary/30 border-border text-muted-foreground hover:text-foreground"
                              }`}
                            >
                              {s}
                            </button>
                          ))}
                          {sectorFilter !== "Semua" && (
                            <button onClick={() => setSectorFilter("Semua")} className="flex items-center gap-1 rounded-lg px-2 py-1.5 text-[11px] text-loss hover:bg-loss/10 transition-colors">
                              <X className="h-3 w-3" /> Reset
                            </button>
                          )}
                        </div>
                      </div>
                      <div>
                        <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider mb-2">Urutkan</p>
                        <div className="flex flex-wrap gap-1.5">
                          {sortOptions.map(opt => (
                            <button
                              key={opt.key}
                              onClick={() => toggleSort(opt.key)}
                              className={`flex items-center gap-1 rounded-lg px-2.5 py-1.5 text-[11px] font-semibold transition-all border ${
                                sortKey === opt.key
                                  ? "bg-primary/15 border-primary/40 text-primary"
                                  : "bg-secondary/30 border-border text-muted-foreground hover:text-foreground"
                              }`}
                            >
                              {opt.label}
                              {sortKey === opt.key && <ArrowUpDown className={`h-3 w-3 ${sortDir === "asc" ? "rotate-180" : ""}`} />}
                            </button>
                          ))}
                        </div>
                      </div>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>

              {viewMode === "table" ? (
                <StockTable stocks={filteredStocks} />
              ) : (
                <div className="grid gap-4 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
                  <AnimatePresence mode="popLayout">
                    {filteredStocks.map((stock, i) => (
                      <motion.div
                        key={stock.ticker}
                        layout
                        initial={{ opacity: 0, scale: 0.95 }}
                        animate={{ opacity: 1, scale: 1 }}
                        exit={{ opacity: 0, scale: 0.95 }}
                        transition={{ duration: 0.2, delay: i * 0.02 }}
                      >
                        <StockCard stock={stock} index={i} />
                      </motion.div>
                    ))}
                  </AnimatePresence>
                </div>
              )}

              {filteredStocks.length === 0 && (
                <div className="text-center py-12">
                  <p className="text-sm text-muted-foreground">Tidak ada saham ditemukan.</p>
                  <button onClick={() => setSectorFilter("Semua")} className="mt-2 text-xs text-primary hover:underline">Reset Filter</button>
                </div>
              )}
            </motion.div>
          )}

          {activeTab === "heatmap" && (
            <motion.div
              key="heatmap"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.25 }}
            >
              <HeatMap />
            </motion.div>
          )}

          {activeTab === "sectors" && (
            <motion.div
              key="sectors"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.25 }}
              className="max-w-2xl"
            >
              <SectorChart />
            </motion.div>
          )}
        </AnimatePresence>
      </main>

      {/* Footer */}
      <footer className="border-t border-border mt-12">
        <div className="container mx-auto px-4 py-10">
          <div className="flex flex-col items-center gap-4">
            <div className="flex items-center gap-2">
              <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-gradient-to-br from-primary to-primary/60">
                <BarChart3 className="h-4 w-4 text-primary-foreground" />
              </div>
              <span className="text-sm font-extrabold gradient-text">IDX Saham</span>
            </div>
            <p className="text-xs text-muted-foreground text-center max-w-sm">
              Data disediakan oleh Yahoo Finance • Hanya untuk edukasi, bukan rekomendasi investasi
            </p>
            <p className="text-[10px] text-muted-foreground/40">© 2026 IDX Saham. Semua hak dilindungi.</p>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default Index;
