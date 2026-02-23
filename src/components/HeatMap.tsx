import { stocks, formatRupiah, formatVolume } from "@/data/stockData";
import { TrendingUp, TrendingDown } from "lucide-react";
import { motion } from "framer-motion";

const HeatMap = () => {
  const maxAbsChange = Math.max(...stocks.map(s => Math.abs(s.changePercent)));

  return (
    <motion.div
      initial={{ opacity: 0, y: 15 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="rounded-xl border border-border bg-card p-5"
    >
      <h3 className="text-xs font-bold text-muted-foreground uppercase tracking-wider mb-4">Heatmap Pasar</h3>
      <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 lg:grid-cols-7 gap-1.5">
        {stocks.map(stock => {
          const intensity = Math.min(Math.abs(stock.changePercent) / maxAbsChange, 1);
          const isGain = stock.change >= 0;
          const bg = isGain
            ? `hsla(152, 69%, 46%, ${0.1 + intensity * 0.35})`
            : `hsla(0, 72%, 55%, ${0.1 + intensity * 0.35})`;
          const border = isGain
            ? `hsla(152, 69%, 46%, ${0.2 + intensity * 0.3})`
            : `hsla(0, 72%, 55%, ${0.2 + intensity * 0.3})`;

          // Size based on market cap
          const mcapRatio = stock.marketCap / Math.max(...stocks.map(s => s.marketCap));
          const sizeClass = mcapRatio > 0.5 ? "col-span-2 row-span-2" : mcapRatio > 0.2 ? "col-span-1 row-span-1" : "col-span-1 row-span-1";

          return (
            <div
              key={stock.ticker}
              className={`rounded-lg p-2.5 flex flex-col items-center justify-center text-center transition-all hover:scale-105 cursor-pointer ${sizeClass}`}
              style={{ backgroundColor: bg, border: `1px solid ${border}` }}
            >
              <span className="font-mono text-[11px] font-extrabold text-foreground">{stock.ticker.replace(".JK", "")}</span>
              <span className={`font-mono text-[10px] font-bold mt-0.5 ${isGain ? "text-gain" : "text-loss"}`}>
                {isGain ? "+" : ""}{stock.changePercent.toFixed(2)}%
              </span>
            </div>
          );
        })}
      </div>
    </motion.div>
  );
};

export default HeatMap;
