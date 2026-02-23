import { stocks } from "@/data/stockData";
import { TrendingUp, TrendingDown } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import Sparkline from "@/components/Sparkline";

const TopMovers = () => {
  const navigate = useNavigate();
  const sorted = [...stocks].sort((a, b) => b.changePercent - a.changePercent);
  const gainers = sorted.filter(s => s.change >= 0).slice(0, 5);
  const losers = sorted.filter(s => s.change < 0).reverse().slice(0, 5);

  const renderList = (items: typeof stocks, label: string, isGainer: boolean) => (
    <motion.div
      initial={{ opacity: 0, x: isGainer ? -20 : 20 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ duration: 0.5 }}
      className="rounded-xl border border-border bg-card p-5"
    >
      <div className="flex items-center gap-2 mb-4">
        {isGainer ? <TrendingUp className="h-4 w-4 text-gain" /> : <TrendingDown className="h-4 w-4 text-loss" />}
        <h3 className="text-sm font-bold text-foreground">{label}</h3>
      </div>
      <div className="space-y-1">
        {items.map((stock, i) => (
          <button
            key={stock.ticker}
            onClick={() => navigate(`/stock/${stock.ticker}`)}
            className="flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-sm transition-colors hover:bg-accent group"
          >
            <span className="font-mono text-xs font-bold text-primary w-10 text-left">{stock.ticker.replace(".JK", "")}</span>
            <span className="text-xs text-muted-foreground flex-1 text-left hidden sm:block">{stock.name}</span>
            <div className="w-16 h-5 opacity-50 group-hover:opacity-100 transition-opacity">
              <Sparkline basePrice={stock.price} isGain={isGainer} seed={i * 3 + (isGainer ? 0 : 50)} height={20} />
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
    <div className="grid gap-3 md:grid-cols-2">
      {renderList(gainers, "Top Gainers 🚀", true)}
      {renderList(losers, "Top Losers 📉", false)}
    </div>
  );
};

export default TopMovers;
