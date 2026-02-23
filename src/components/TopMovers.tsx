import { stocks } from "@/data/stockData";
import { TrendingUp, TrendingDown } from "lucide-react";
import { useNavigate } from "react-router-dom";

const TopMovers = () => {
  const navigate = useNavigate();
  const sorted = [...stocks].sort((a, b) => b.changePercent - a.changePercent);
  const gainers = sorted.filter(s => s.change >= 0).slice(0, 5);
  const losers = sorted.filter(s => s.change < 0).reverse().slice(0, 5);

  const renderList = (items: typeof stocks, label: string, isGainer: boolean) => (
    <div className="card-shine rounded-xl border border-border p-4">
      <div className="flex items-center gap-2 mb-3">
        {isGainer ? <TrendingUp className="h-4 w-4 text-gain" /> : <TrendingDown className="h-4 w-4 text-loss" />}
        <h3 className="text-sm font-semibold text-foreground">{label}</h3>
      </div>
      <div className="space-y-2">
        {items.map((stock) => (
          <button
            key={stock.ticker}
            onClick={() => navigate(`/stock/${stock.ticker}`)}
            className="flex w-full items-center justify-between rounded-lg px-2 py-1.5 text-sm transition-colors hover:bg-accent"
          >
            <div className="flex items-center gap-2">
              <span className="font-mono text-xs font-bold text-primary">{stock.ticker.replace(".JK", "")}</span>
              <span className="text-xs text-muted-foreground hidden sm:inline">{stock.name}</span>
            </div>
            <span className={`font-mono text-xs font-semibold ${isGainer ? "text-gain" : "text-loss"}`}>
              {stock.change >= 0 ? "+" : ""}{stock.changePercent.toFixed(2)}%
            </span>
          </button>
        ))}
      </div>
    </div>
  );

  return (
    <div className="grid gap-3 md:grid-cols-2">
      {renderList(gainers, "Top Gainers 🚀", true)}
      {renderList(losers, "Top Losers 📉", false)}
    </div>
  );
};

export default TopMovers;
