import { useMemo, useState } from "react";
import { Link } from "react-router-dom";
import {
  ArrowLeft,
  Bot,
  BarChart3,
  Search,
  PanelLeftClose,
  PanelLeftOpen,
} from "lucide-react";
import AIStockAnalysis from "@/components/AIStockAnalysis";
import { stocks } from "@/data/stockData";

const AIAnalysis = () => {
  const [quickQuery, setQuickQuery] = useState("");
  const [showSidebar, setShowSidebar] = useState(true);
  const quickMatches = useMemo(() => {
    const q = quickQuery.trim().toLowerCase();
    if (!q) return stocks.slice(0, 24);
    return stocks
      .filter(
        (item) =>
          item.ticker.toLowerCase().includes(q) ||
          item.name.toLowerCase().includes(q),
      )
      .slice(0, 24);
  }, [quickQuery]);

  return (
    <div className="min-h-screen bg-background noise-bg">
      <header className="sticky top-0 z-40 border-b border-border bg-card/70 backdrop-blur-xl">
        <div className="container mx-auto flex items-center justify-between px-4 py-3">
          <div className="flex items-center gap-3">
            <Link
              to="/"
              className="inline-flex items-center gap-1 rounded-lg border border-border bg-secondary/30 px-2.5 py-1.5 text-xs text-foreground"
            >
              <ArrowLeft className="h-3.5 w-3.5" />
              Dashboard
            </Link>
            <div className="inline-flex items-center gap-2">
              <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-gradient-to-br from-primary to-primary/70">
                <Bot className="h-4 w-4 text-primary-foreground" />
              </div>
              <div>
                <p className="text-sm font-bold text-foreground">AI Analysis</p>
                <p className="text-[10px] text-muted-foreground">
                  Full page mode
                </p>
              </div>
            </div>
          </div>
          <div className="hidden md:block text-[11px] text-muted-foreground">
            AI chat + history + compare + rekomendasi saham
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 py-6">
        <div
          className={`grid gap-4 ${showSidebar ? "lg:grid-cols-[300px_minmax(0,1fr)]" : "lg:grid-cols-1"}`}
        >
          {showSidebar && (
            <aside className="space-y-4">
              <div className="rounded-xl border border-border bg-card p-4">
                <div className="mb-2 flex items-center gap-2">
                  <Search className="h-3.5 w-3.5 text-primary" />
                  <p className="text-xs font-semibold text-foreground">
                    Quick Ticker Finder
                  </p>
                </div>
                <input
                  value={quickQuery}
                  onChange={(e) => setQuickQuery(e.target.value)}
                  className="w-full rounded-lg border border-border bg-secondary/30 px-3 py-2 text-xs text-foreground"
                  placeholder="Cari saham untuk referensi cepat..."
                />
                <div className="mt-3 max-h-60 space-y-1.5 overflow-y-auto">
                  {quickMatches.map((item) => (
                    <Link
                      key={item.ticker}
                      to={`/stock/${item.ticker}`}
                      className="block rounded-md border border-border bg-secondary/20 px-2.5 py-1.5 text-[11px] text-foreground hover:border-primary/30"
                    >
                      <span className="font-mono font-semibold">
                        {item.ticker.replace(".JK", "")}
                      </span>{" "}
                      <span className="text-muted-foreground">{item.name}</span>
                    </Link>
                  ))}
                </div>
              </div>

              <div className="rounded-xl border border-border bg-card p-4 text-[11px] text-muted-foreground">
                <p className="mb-1 inline-flex items-center gap-1">
                  <BarChart3 className="h-3.5 w-3.5" />
                  Saran tanya AI:
                </p>
                <p>
                  "Apakah minggu ini lebih baik HOLD atau BUY?", "Buat
                  entry/SL/TP mode swing", "Bandingkan BBCA vs BBRI untuk 6
                  bulan".
                </p>
              </div>
            </aside>
          )}

          <section>
            <div className="mb-3 flex justify-end">
              <button
                onClick={() => setShowSidebar((v) => !v)}
                className="inline-flex items-center gap-1 rounded-lg border border-border bg-card px-2.5 py-1.5 text-xs text-foreground"
              >
                {showSidebar ? (
                  <>
                    <PanelLeftClose className="h-3.5 w-3.5" />
                    Hide Sidebar
                  </>
                ) : (
                  <>
                    <PanelLeftOpen className="h-3.5 w-3.5" />
                    Show Sidebar
                  </>
                )}
              </button>
            </div>
            <AIStockAnalysis className="w-full" />
          </section>
        </div>
      </main>
    </div>
  );
};

export default AIAnalysis;
