import {
  stocks as defaultStocks,
  formatVolume,
  type Stock,
} from "@/data/stockData";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { Zap, TrendingUp, TrendingDown } from "lucide-react";

interface MostActiveProps {
  stocks?: Stock[];
}

const MostActive = ({ stocks = defaultStocks }: MostActiveProps) => {
  const navigate = useNavigate();
  const sorted = [...stocks].sort((a, b) => b.volume - a.volume).slice(0, 5);
  const maxVol = sorted[0]?.volume || 1;

  return (
    <motion.div
      initial={{ opacity: 0, y: 15 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay: 0.1 }}
      className="rounded-xl border border-border bg-card p-5 gradient-border"
    >
      <div className="flex items-center gap-2 mb-4">
        <Zap className="h-4 w-4 text-primary" />
        <h3 className="text-sm font-bold text-foreground">Paling Aktif</h3>
      </div>
      <div className="space-y-1">
        {sorted.map((stock, i) => {
          const isGain = stock.change >= 0;
          const volPercent = (stock.volume / maxVol) * 100;
          return (
            <motion.button
              key={stock.ticker}
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: i * 0.08, duration: 0.3 }}
              onClick={() => navigate(`/stock/${stock.ticker}`)}
              className={`flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-sm transition-all hover:bg-accent group ${
                i % 2 === 0 ? "bg-secondary/20" : ""
              }`}
            >
              <span className="font-mono text-[11px] font-extrabold text-primary w-12 text-left">
                {stock.ticker.replace(".JK", "")}
              </span>
              <div className="flex-1 min-w-0">
                <div className="h-1.5 rounded-full bg-secondary/50 overflow-hidden">
                  <motion.div
                    className="h-full rounded-full bg-primary/50"
                    initial={{ width: 0 }}
                    animate={{ width: `${volPercent}%` }}
                    transition={{ duration: 0.8, delay: 0.3 + i * 0.1 }}
                  />
                </div>
              </div>
              <span className="font-mono text-[11px] font-bold text-muted-foreground w-14 text-right">
                {formatVolume(stock.volume)}
              </span>
              <span
                className={`font-mono text-[10px] font-bold w-14 text-right ${isGain ? "text-gain" : "text-loss"}`}
              >
                {isGain ? "+" : ""}
                {stock.changePercent.toFixed(2)}%
              </span>
            </motion.button>
          );
        })}
      </div>
    </motion.div>
  );
};

export default MostActive;
