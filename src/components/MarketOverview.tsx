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
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.4, delay: i * 0.08 }}
            className="group rounded-xl border border-border bg-card p-4 hover:border-primary/30 transition-all relative overflow-hidden"
          >
            <div className="absolute inset-0 bg-gradient-to-br from-primary/3 to-transparent opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none" />
            <div className="relative z-10">
              <div className="flex items-center justify-between mb-1">
                <span className="text-xs font-bold text-primary">{idx.name}</span>
                <div className={`flex items-center gap-0.5 text-[10px] font-semibold ${isGain ? "text-gain" : "text-loss"}`}>
                  {isGain ? <TrendingUp className="h-2.5 w-2.5" /> : <TrendingDown className="h-2.5 w-2.5" />}
                  {isGain ? "+" : ""}{idx.changePercent.toFixed(2)}%
                </div>
              </div>
              <p className="font-mono text-lg font-bold text-foreground mb-1">{idx.value.toLocaleString("id-ID")}</p>
              <div className="h-6 opacity-60">
                <Sparkline basePrice={idx.value} isGain={isGain} seed={i * 7} height={24} />
              </div>
              <p className={`mt-1 font-mono text-xs ${isGain ? "text-gain" : "text-loss"}`}>
                {isGain ? "+" : ""}{idx.change.toFixed(2)}
              </p>
            </div>
          </motion.div>
        );
      })}
    </div>
  );
};

export default MarketOverview;
