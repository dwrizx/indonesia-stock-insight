import { TrendingUp, TrendingDown, ArrowRight } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { Stock, formatRupiah, formatVolume } from "@/data/stockData";
import Sparkline from "@/components/Sparkline";

interface StockCardProps {
  stock: Stock;
  index: number;
}

const StockCard = ({ stock, index }: StockCardProps) => {
  const navigate = useNavigate();
  const isGain = stock.change >= 0;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, delay: index * 0.05 }}
      onClick={() => navigate(`/stock/${stock.ticker}`)}
      className="group cursor-pointer rounded-xl border border-border bg-card p-5 transition-all duration-300 hover:border-primary/30 hover:glow-primary relative overflow-hidden"
    >
      <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500 bg-gradient-to-br from-primary/5 via-transparent to-transparent pointer-events-none" />

      <div className="relative z-10">
        {/* Header */}
        <div className="flex items-start justify-between mb-3">
          <div>
            <div className="flex items-center gap-2">
              <h3 className="font-mono text-sm font-extrabold text-primary">{stock.ticker.replace(".JK", "")}</h3>
              <span className="rounded-full bg-secondary px-2 py-0.5 text-[9px] font-medium text-muted-foreground uppercase tracking-wider">{stock.sector}</span>
            </div>
            <p className="mt-1 text-xs text-muted-foreground truncate max-w-[160px]">{stock.name}</p>
          </div>
          <div className={`flex items-center gap-1 rounded-lg px-2 py-1 text-xs font-bold ${isGain ? "bg-gain/10 text-gain" : "bg-loss/10 text-loss"}`}>
            {isGain ? <TrendingUp className="h-3 w-3" /> : <TrendingDown className="h-3 w-3" />}
            {isGain ? "+" : ""}{stock.changePercent.toFixed(2)}%
          </div>
        </div>

        {/* Sparkline */}
        <div className="my-3 h-12 opacity-60 group-hover:opacity-100 transition-opacity">
          <Sparkline basePrice={stock.price} isGain={isGain} seed={stock.price % 17} height={48} />
        </div>

        {/* Price */}
        <div className="flex items-end justify-between mb-4">
          <div>
            <span className="font-mono text-2xl font-extrabold text-foreground">Rp{stock.price.toLocaleString("id-ID")}</span>
            <span className={`ml-2 font-mono text-xs font-semibold ${isGain ? "text-gain" : "text-loss"}`}>
              {isGain ? "+" : ""}{stock.change.toLocaleString("id-ID")}
            </span>
          </div>
        </div>

        {/* Metrics */}
        <div className="grid grid-cols-3 gap-2 border-t border-border/50 pt-3">
          <div>
            <p className="text-[9px] text-muted-foreground uppercase tracking-wider">Vol</p>
            <p className="font-mono text-xs font-bold text-foreground">{formatVolume(stock.volume)}</p>
          </div>
          <div>
            <p className="text-[9px] text-muted-foreground uppercase tracking-wider">P/E</p>
            <p className="font-mono text-xs font-bold text-foreground">{stock.pe > 0 ? stock.pe.toFixed(1) : "N/A"}</p>
          </div>
          <div>
            <p className="text-[9px] text-muted-foreground uppercase tracking-wider">MCap</p>
            <p className="font-mono text-xs font-bold text-foreground">{formatRupiah(stock.marketCap)}</p>
          </div>
        </div>

        {/* Hover CTA */}
        <div className="mt-3 flex items-center justify-center gap-1 text-[10px] font-semibold text-primary opacity-0 group-hover:opacity-100 transition-opacity">
          <span>Lihat Detail</span>
          <ArrowRight className="h-3 w-3" />
        </div>
      </div>
    </motion.div>
  );
};

export default StockCard;
