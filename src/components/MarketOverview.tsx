import { marketIndices } from "@/data/stockData";
import { TrendingUp, TrendingDown } from "lucide-react";
import { motion } from "framer-motion";
import Sparkline from "@/components/Sparkline";

const MarketOverview = () => {
  return (
    <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
      {marketIndices.map((idx, i) => {
        const isGain = idx.change >= 0;
        return (
          <motion.div
            key={idx.name}
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, delay: i * 0.1 }}
            whileHover={{ y: -4, transition: { duration: 0.2 } }}
            className="group relative rounded-xl border border-border bg-card p-4 hover:border-primary/30 transition-all duration-300 overflow-hidden gradient-border hover:shadow-lg hover:shadow-primary/10"
            style={{ perspective: "800px" }}
          >
            <div className="absolute inset-0 bg-gradient-to-br from-primary/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none" />
            <div className="relative z-10">
              <div className="flex items-center justify-between mb-2">
                <span className="text-[11px] font-bold text-primary uppercase tracking-wider">{idx.name}</span>
                <div className={`flex items-center gap-1 rounded-md px-1.5 py-0.5 text-[10px] font-bold ${isGain ? "bg-gain/10 text-gain" : "bg-loss/10 text-loss"}`}>
                  {isGain ? <TrendingUp className="h-2.5 w-2.5" /> : <TrendingDown className="h-2.5 w-2.5" />}
                  {isGain ? "+" : ""}{idx.changePercent.toFixed(2)}%
                </div>
              </div>
              <p className="font-mono text-xl font-extrabold text-foreground mb-2">{idx.value.toLocaleString("id-ID")}</p>
              
              {/* Enhanced sparkline */}
              <div className="h-10 opacity-60 group-hover:opacity-100 transition-opacity">
                <Sparkline basePrice={idx.value} isGain={isGain} seed={i * 7} height={40} />
              </div>

              {/* Mini progress bar */}
              <div className="mt-2 h-1 rounded-full bg-secondary/50 overflow-hidden">
                <motion.div
                  initial={{ width: 0 }}
                  animate={{ width: `${Math.min(50 + Math.abs(idx.changePercent) * 20, 95)}%` }}
                  transition={{ duration: 1, delay: i * 0.1 + 0.5 }}
                  className={`h-full rounded-full ${isGain ? "bg-gain/60" : "bg-loss/60"}`}
                />
              </div>

              <p className={`mt-2 font-mono text-xs font-semibold ${isGain ? "text-gain" : "text-loss"}`}>
                {isGain ? "+" : ""}{idx.change.toFixed(2)} pts
              </p>
            </div>
          </motion.div>
        );
      })}
    </div>
  );
};

export default MarketOverview;
