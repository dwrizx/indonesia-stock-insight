import { stocks } from "@/data/stockData";
import { TrendingUp, TrendingDown, Flame, AlertTriangle } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import Sparkline from "@/components/Sparkline";

const TopMovers = () => {
  const navigate = useNavigate();
  const sorted = [...stocks].sort((a, b) => b.changePercent - a.changePercent);
  const gainers = sorted.filter(s => s.change >= 0).slice(0, 5);
  const losers = sorted.filter(s => s.change < 0).reverse().slice(0, 5);

  const renderList = (items: typeof stocks, label: string, icon: React.ReactNode, isGainer: boolean) => (
    <motion.div
      initial={{ opacity: 0, x: isGainer ? -20 : 20 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ duration: 0.5 }}
      className="rounded-xl border border-border bg-card p-5 gradient-border"
    >
      <div className="flex items-center gap-2 mb-4">
        {icon}
        <h3 className="text-sm font-bold text-foreground">{label}</h3>
      </div>
      <div className="space-y-0.5">
        {items.map((stock, i) => (
          <button
            key={stock.ticker}
            onClick={() => navigate(`/stock/${stock.ticker}`)}
            className="flex w-full items-center gap-3 rounded-lg px-3 py-3 text-sm transition-all hover:bg-accent group"
          >
            <span className="font-mono text-[11px] font-extrabold text-primary w-12 text-left">{stock.ticker.replace(".JK", "")}</span>
            <span className="text-xs text-muted-foreground flex-1 text-left hidden sm:block truncate">{stock.name}</span>
            <div className="w-20 h-6 opacity-40 group-hover:opacity-90 transition-opacity">
              <Sparkline basePrice={stock.price} isGain={isGainer} seed={i * 3 + (isGainer ? 0 : 50)} height={24} />
            </div>
            <span className={`font-mono text-xs font-bold w-16 text-right ${isGainer ? "text-gain" : "text-loss"}`}>
              {stock.change >= 0 ? "+" : ""}{stock.changePercent.toFixed(2)}%
            </span>
          </button>
        ))}
      </div>
    </motion.div>
  );

  return (
    <div className="grid gap-4 md:grid-cols-2">
      {renderList(gainers, "Top Gainers", <Flame className="h-4 w-4 text-gain" />, true)}
      {renderList(losers, "Top Losers", <AlertTriangle className="h-4 w-4 text-loss" />, false)}
    </div>
  );
};

export default TopMovers;
