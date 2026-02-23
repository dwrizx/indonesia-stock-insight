import { TrendingUp, TrendingDown } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { Stock, formatRupiah, formatVolume } from "@/data/stockData";

interface StockCardProps {
  stock: Stock;
  index: number;
}

const StockCard = ({ stock, index }: StockCardProps) => {
  const navigate = useNavigate();
  const isGain = stock.change >= 0;

  return (
    <div
      onClick={() => navigate(`/stock/${stock.ticker}`)}
      className="card-shine group cursor-pointer rounded-xl border border-border p-4 transition-all duration-300 hover:border-primary/30 hover:glow-primary animate-slide-up"
      style={{ animationDelay: `${index * 60}ms`, animationFillMode: "both" }}
    >
      <div className="flex items-start justify-between mb-3">
        <div>
          <div className="flex items-center gap-2">
            <h3 className="font-mono text-sm font-bold text-primary">{stock.ticker.replace(".JK", "")}</h3>
            <span className="rounded-full bg-secondary px-2 py-0.5 text-[10px] text-muted-foreground">{stock.sector}</span>
          </div>
          <p className="mt-0.5 text-xs text-muted-foreground truncate max-w-[160px]">{stock.name}</p>
        </div>
        <div className={`flex items-center gap-1 rounded-md px-2 py-1 text-xs font-semibold ${isGain ? "bg-gain\/10 text-gain" : "bg-loss\/10 text-loss"}`}>
          {isGain ? <TrendingUp className="h-3 w-3" /> : <TrendingDown className="h-3 w-3" />}
          {isGain ? "+" : ""}{stock.changePercent.toFixed(2)}%
        </div>
      </div>

      <div className="mb-3">
        <span className="font-mono text-xl font-bold text-foreground">Rp{stock.price.toLocaleString("id-ID")}</span>
        <span className={`ml-2 font-mono text-xs ${isGain ? "text-gain" : "text-loss"}`}>
          {isGain ? "+" : ""}{stock.change.toLocaleString("id-ID")}
        </span>
      </div>

      <div className="grid grid-cols-3 gap-2 border-t border-border pt-3">
        <div>
          <p className="text-[10px] text-muted-foreground">Volume</p>
          <p className="font-mono text-xs font-medium text-foreground">{formatVolume(stock.volume)}</p>
        </div>
        <div>
          <p className="text-[10px] text-muted-foreground">P/E</p>
          <p className="font-mono text-xs font-medium text-foreground">{stock.pe > 0 ? stock.pe.toFixed(1) : "N/A"}</p>
        </div>
        <div>
          <p className="text-[10px] text-muted-foreground">Mkt Cap</p>
          <p className="font-mono text-xs font-medium text-foreground">{formatRupiah(stock.marketCap)}</p>
        </div>
      </div>
    </div>
  );
};

export default StockCard;
