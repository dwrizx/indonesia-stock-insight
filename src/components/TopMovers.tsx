import { stocks as defaultStocks, type Stock } from "@/data/stockData";
import {
  TrendingUp,
  TrendingDown,
  Flame,
  AlertTriangle,
  Trophy,
  Medal,
} from "lucide-react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import Sparkline from "@/components/Sparkline";

const rankColors = [
  "bg-yellow-500/20 text-yellow-400 border-yellow-500/30",
  "bg-gray-400/20 text-gray-300 border-gray-400/30",
  "bg-orange-500/20 text-orange-400 border-orange-500/30",
];

interface TopMoversProps {
  stocks?: Stock[];
}

const TopMovers = ({ stocks = defaultStocks }: TopMoversProps) => {
  const navigate = useNavigate();
  const sorted = [...stocks].sort((a, b) => b.changePercent - a.changePercent);
  const gainers = sorted.filter((s) => s.change >= 0).slice(0, 5);
  const losers = sorted
    .filter((s) => s.change < 0)
    .reverse()
    .slice(0, 5);

  const renderList = (
    items: typeof stocks,
    label: string,
    icon: React.ReactNode,
    isGainer: boolean,
  ) => (
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
          <motion.button
            key={stock.ticker}
            initial={{ opacity: 0, x: isGainer ? -10 : 10 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.3, delay: i * 0.08 }}
            onClick={() => navigate(`/stock/${stock.ticker}`)}
            className={`flex w-full items-center gap-3 rounded-lg px-3 py-3 text-sm transition-all hover:bg-accent group ${
              i % 2 === 0 ? "bg-secondary/20" : ""
            }`}
          >
            {/* Rank badge */}
            <span
              className={`flex items-center justify-center h-6 w-6 rounded-full text-[10px] font-extrabold border flex-shrink-0 ${
                i < 3
                  ? rankColors[i]
                  : "bg-secondary text-muted-foreground border-border"
              }`}
            >
              {i + 1}
            </span>
            <span className="font-mono text-[11px] font-extrabold text-primary w-12 text-left">
              {stock.ticker.replace(".JK", "")}
            </span>
            <span className="text-xs text-muted-foreground flex-1 text-left hidden sm:block truncate">
              {stock.name}
            </span>
            <div className="w-20 h-6 opacity-40 group-hover:opacity-90 transition-opacity">
              <Sparkline
                basePrice={stock.price}
                isGain={isGainer}
                seed={i * 3 + (isGainer ? 0 : 50)}
                height={24}
              />
            </div>
            <span
              className={`font-mono text-xs font-bold rounded-md px-2 py-1 ${
                isGainer ? "bg-gain/10 text-gain" : "bg-loss/10 text-loss"
              }`}
            >
              {stock.change >= 0 ? "+" : ""}
              {stock.changePercent.toFixed(2)}%
            </span>
          </motion.button>
        ))}
      </div>
    </motion.div>
  );

  return (
    <div className="grid gap-4 md:grid-cols-2">
      {renderList(
        gainers,
        "Top Gainers",
        <Flame className="h-4 w-4 text-gain" />,
        true,
      )}
      {renderList(
        losers,
        "Top Losers",
        <AlertTriangle className="h-4 w-4 text-loss" />,
        false,
      )}
    </div>
  );
};

export default TopMovers;
