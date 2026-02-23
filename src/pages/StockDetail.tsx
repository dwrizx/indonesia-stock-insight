import { useParams, useNavigate } from "react-router-dom";
import { ArrowLeft, BarChart3, TrendingUp, TrendingDown, ExternalLink } from "lucide-react";
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

  const metrics = [
    { label: "Open", value: `Rp${stock.open.toLocaleString("id-ID")}` },
    { label: "High", value: `Rp${stock.high.toLocaleString("id-ID")}` },
    { label: "Low", value: `Rp${stock.low.toLocaleString("id-ID")}` },
    { label: "Prev Close", value: `Rp${stock.prevClose.toLocaleString("id-ID")}` },
    { label: "Volume", value: formatVolume(stock.volume) },
    { label: "Market Cap", value: formatRupiah(stock.marketCap) },
    { label: "P/E Ratio", value: stock.pe > 0 ? stock.pe.toFixed(1) : "N/A" },
    { label: "P/BV", value: stock.pbv.toFixed(1) },
    { label: "Dividend Yield", value: `${stock.dividendYield.toFixed(1)}%` },
    { label: "52W High", value: `Rp${stock.high52w.toLocaleString("id-ID")}` },
    { label: "52W Low", value: `Rp${stock.low52w.toLocaleString("id-ID")}` },
    { label: "Sektor", value: stock.sector },
  ];

  const pricePosition = ((stock.price - stock.low52w) / (stock.high52w - stock.low52w)) * 100;

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b border-border bg-card/50 backdrop-blur-sm sticky top-0 z-40">
        <div className="container mx-auto flex items-center gap-4 px-4 py-3">
          <button onClick={() => navigate("/")} className="flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground transition-colors">
            <ArrowLeft className="h-4 w-4" />
            <span className="hidden sm:inline">Dashboard</span>
          </button>
          <div className="flex items-center gap-2">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary">
              <BarChart3 className="h-4 w-4 text-primary-foreground" />
            </div>
            <span className="text-sm font-bold text-foreground">IDX Saham</span>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 py-6">
        {/* Stock Header */}
        <div className="mb-6 animate-slide-up">
          <div className="flex flex-wrap items-start justify-between gap-4">
            <div>
              <div className="flex items-center gap-3 mb-1">
                <h1 className="text-2xl font-bold text-foreground">{stock.ticker.replace(".JK", "")}</h1>
                <span className="rounded-full bg-secondary px-3 py-1 text-xs text-muted-foreground">{stock.sector}</span>
              </div>
              <p className="text-sm text-muted-foreground">{stock.name}</p>
            </div>
            <div className="text-right">
              <p className="font-mono text-3xl font-bold text-foreground">Rp{stock.price.toLocaleString("id-ID")}</p>
              <div className={`mt-1 flex items-center justify-end gap-1 text-sm font-semibold ${isGain ? "text-gain" : "text-loss"}`}>
                {isGain ? <TrendingUp className="h-4 w-4" /> : <TrendingDown className="h-4 w-4" />}
                <span>{isGain ? "+" : ""}{stock.change.toLocaleString("id-ID")}</span>
                <span>({isGain ? "+" : ""}{stock.changePercent.toFixed(2)}%)</span>
              </div>
            </div>
          </div>

          {/* 52 Week Range Bar */}
          <div className="mt-4 card-shine rounded-xl border border-border p-4">
            <p className="text-xs text-muted-foreground mb-2">Rentang 52 Minggu</p>
            <div className="flex items-center gap-3">
              <span className="font-mono text-xs text-muted-foreground">Rp{stock.low52w.toLocaleString("id-ID")}</span>
              <div className="relative flex-1 h-2 rounded-full bg-secondary">
                <div className="absolute top-0 left-0 h-full rounded-full bg-gradient-to-r from-loss to-gain" style={{ width: "100%" }} />
                <div
                  className="absolute top-1/2 -translate-y-1/2 h-4 w-1 rounded-full bg-primary shadow-lg"
                  style={{ left: `${Math.min(Math.max(pricePosition, 2), 98)}%` }}
                />
              </div>
              <span className="font-mono text-xs text-muted-foreground">Rp{stock.high52w.toLocaleString("id-ID")}</span>
            </div>
          </div>
        </div>

        <div className="grid gap-6 lg:grid-cols-3">
          {/* Chart */}
          <div className="lg:col-span-2">
            <StockChart basePrice={stock.price} ticker={stock.ticker} />
          </div>

          {/* Metrics */}
          <div className="card-shine rounded-xl border border-border p-4 h-fit animate-slide-up" style={{ animationDelay: "100ms" }}>
            <h3 className="mb-4 text-sm font-semibold text-foreground">📋 Detail Saham</h3>
            <div className="space-y-3">
              {metrics.map((m) => (
                <div key={m.label} className="flex items-center justify-between border-b border-border/50 pb-2 last:border-0">
                  <span className="text-xs text-muted-foreground">{m.label}</span>
                  <span className="font-mono text-xs font-medium text-foreground">{m.value}</span>
                </div>
              ))}
            </div>

            <a
              href={`https://finance.yahoo.com/quote/${stock.ticker}`}
              target="_blank"
              rel="noopener noreferrer"
              className="mt-4 flex items-center justify-center gap-2 rounded-lg bg-primary px-4 py-2 text-xs font-semibold text-primary-foreground transition-all hover:opacity-90"
            >
              Lihat di Yahoo Finance
              <ExternalLink className="h-3 w-3" />
            </a>
          </div>
        </div>
      </main>
    </div>
  );
};

export default StockDetail;
