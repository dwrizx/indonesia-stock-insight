import { TrendingUp, TrendingDown } from "lucide-react";
import { marketIndices } from "@/data/stockData";

const MarketTicker = () => {
  const items = [...marketIndices, ...marketIndices];

  return (
    <div className="overflow-hidden border-b border-border bg-secondary/50">
      <div className="flex animate-ticker whitespace-nowrap py-2">
        {items.map((index, i) => (
          <div key={i} className="mx-6 flex items-center gap-2 text-sm">
            <span className="font-semibold text-foreground">{index.name}</span>
            <span className="font-mono text-foreground">{index.value.toLocaleString("id-ID")}</span>
            <span className={`flex items-center gap-0.5 font-mono text-xs ${index.change >= 0 ? "text-gain" : "text-loss"}`}>
              {index.change >= 0 ? <TrendingUp className="h-3 w-3" /> : <TrendingDown className="h-3 w-3" />}
              {index.change >= 0 ? "+" : ""}{index.changePercent.toFixed(2)}%
            </span>
          </div>
        ))}
      </div>
    </div>
  );
};

export default MarketTicker;
