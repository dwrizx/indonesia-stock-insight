import { marketIndices } from "@/data/stockData";
import { TrendingUp, TrendingDown, Activity } from "lucide-react";

const MarketOverview = () => {
  return (
    <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
      {marketIndices.map((idx) => {
        const isGain = idx.change >= 0;
        return (
          <div key={idx.name} className="card-shine rounded-xl border border-border p-4">
            <div className="flex items-center gap-2 mb-2">
              <Activity className="h-3.5 w-3.5 text-primary" />
              <span className="text-xs font-semibold text-muted-foreground">{idx.name}</span>
            </div>
            <p className="font-mono text-lg font-bold text-foreground">{idx.value.toLocaleString("id-ID")}</p>
            <div className={`mt-1 flex items-center gap-1 text-xs font-medium ${isGain ? "text-gain" : "text-loss"}`}>
              {isGain ? <TrendingUp className="h-3 w-3" /> : <TrendingDown className="h-3 w-3" />}
              <span>{isGain ? "+" : ""}{idx.change.toFixed(2)}</span>
              <span>({isGain ? "+" : ""}{idx.changePercent.toFixed(2)}%)</span>
            </div>
          </div>
        );
      })}
    </div>
  );
};

export default MarketOverview;
