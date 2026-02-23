import { TrendingUp, TrendingDown } from "lucide-react";
import { marketIndices } from "@/data/stockData";
import { getMarketIndexUrl } from "@/lib/marketIndex";

const MarketTicker = () => {
  const items = [...marketIndices, ...marketIndices, ...marketIndices];

  const openIndex = (name: string) => {
    window.open(getMarketIndexUrl(name), "_blank", "noopener,noreferrer");
  };

  return (
    <div className="group overflow-hidden border-b border-border bg-card/40 backdrop-blur-sm">
      <div className="flex animate-ticker whitespace-nowrap py-2.5 group-hover:[animation-play-state:paused]">
        {items.map((index, i) => (
          <button
            key={`${index.name}-${i}`}
            onClick={() => openIndex(index.name)}
            className="mx-8 flex items-center gap-3 text-sm transition-opacity hover:opacity-80"
            title={`Buka chart ${index.name}`}
          >
            <span className="font-bold text-foreground">{index.name}</span>
            <span className="font-mono text-foreground/80">
              {index.value.toLocaleString("id-ID")}
            </span>
            <span
              className={`flex items-center gap-1 font-mono text-xs font-semibold rounded-md px-1.5 py-0.5 ${index.change >= 0 ? "bg-gain/10 text-gain" : "bg-loss/10 text-loss"}`}
            >
              {index.change >= 0 ? (
                <TrendingUp className="h-3 w-3" />
              ) : (
                <TrendingDown className="h-3 w-3" />
              )}
              {index.change >= 0 ? "+" : ""}
              {index.changePercent.toFixed(2)}%
            </span>
          </button>
        ))}
      </div>
    </div>
  );
};

export default MarketTicker;
