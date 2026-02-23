import { useState } from "react";
import {
  stocks,
  formatRupiah,
  formatVolume,
  sectorData,
} from "@/data/stockData";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import {
  Eye,
  BarChart2,
  DollarSign,
  TrendingUp,
  TrendingDown,
} from "lucide-react";

type ViewMode = "change" | "volume" | "marketCap";

const HeatMap = () => {
  const navigate = useNavigate();
  const [viewMode, setViewMode] = useState<ViewMode>("change");
  const [hoveredTicker, setHoveredTicker] = useState<string | null>(null);

  const maxAbsChange = Math.max(
    ...stocks.map((s) => Math.abs(s.changePercent)),
  );
  const maxVolume = Math.max(...stocks.map((s) => s.volume));
  const maxMCap = Math.max(...stocks.map((s) => s.marketCap));

  const getIntensity = (stock: (typeof stocks)[0]) => {
    switch (viewMode) {
      case "change":
        return Math.abs(stock.changePercent) / maxAbsChange;
      case "volume":
        return stock.volume / maxVolume;
      case "marketCap":
        return stock.marketCap / maxMCap;
    }
  };

  const getColor = (stock: (typeof stocks)[0], intensity: number) => {
    if (viewMode === "change") {
      const isGain = stock.change >= 0;
      return {
        bg: isGain
          ? `hsla(152, 69%, 46%, ${0.1 + intensity * 0.4})`
          : `hsla(0, 72%, 55%, ${0.1 + intensity * 0.4})`,
        border: isGain
          ? `hsla(152, 69%, 46%, ${0.2 + intensity * 0.3})`
          : `hsla(0, 72%, 55%, ${0.2 + intensity * 0.3})`,
      };
    }
    return {
      bg: `hsla(200, 70%, 50%, ${0.08 + intensity * 0.4})`,
      border: `hsla(200, 70%, 50%, ${0.15 + intensity * 0.3})`,
    };
  };

  const getValue = (stock: (typeof stocks)[0]) => {
    switch (viewMode) {
      case "change":
        return `${stock.change >= 0 ? "+" : ""}${stock.changePercent.toFixed(2)}%`;
      case "volume":
        return formatVolume(stock.volume);
      case "marketCap":
        return formatRupiah(stock.marketCap);
    }
  };

  // Group by sector
  const groupedBySector = sectorData.map((sector) => ({
    ...sector,
    stocks: stocks
      .filter((s) => s.sector === sector.name)
      .sort((a, b) => b.marketCap - a.marketCap),
  }));

  // Size class based on market cap
  const getSizeClass = (stock: (typeof stocks)[0]) => {
    const ratio = stock.marketCap / maxMCap;
    if (ratio > 0.4) return "col-span-2 row-span-2";
    if (ratio > 0.15) return "col-span-2";
    return "";
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 15 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="space-y-4"
    >
      {/* Controls */}
      <div className="flex flex-wrap items-center justify-between gap-3">
        <h3 className="text-sm font-bold text-foreground">Peta Pasar</h3>
        <div className="flex items-center rounded-lg bg-secondary/50 p-0.5 border border-border">
          {[
            { key: "change" as const, label: "Perubahan", icon: TrendingUp },
            { key: "volume" as const, label: "Volume", icon: BarChart2 },
            { key: "marketCap" as const, label: "MCap", icon: DollarSign },
          ].map((opt) => (
            <button
              key={opt.key}
              onClick={() => setViewMode(opt.key)}
              className={`flex items-center gap-1.5 rounded-md px-3 py-1.5 text-[11px] font-bold transition-all ${
                viewMode === opt.key
                  ? "bg-primary text-primary-foreground shadow"
                  : "text-muted-foreground hover:text-foreground"
              }`}
            >
              <opt.icon className="h-3 w-3" />
              <span className="hidden sm:inline">{opt.label}</span>
            </button>
          ))}
        </div>
      </div>

      {/* Color Legend */}
      {viewMode === "change" && (
        <div className="flex items-center gap-2 text-[10px] text-muted-foreground">
          <span>Turun</span>
          <div className="flex h-2 flex-1 rounded-full overflow-hidden">
            <div className="flex-1 bg-gradient-to-r from-[hsla(0,72%,55%,0.5)] to-[hsla(0,72%,55%,0.1)]" />
            <div className="flex-1 bg-gradient-to-r from-[hsla(152,69%,46%,0.1)] to-[hsla(152,69%,46%,0.5)]" />
          </div>
          <span>Naik</span>
        </div>
      )}

      {/* Grouped by Sector */}
      {groupedBySector.map((sector) => (
        <div
          key={sector.name}
          className="rounded-xl border border-border bg-card p-4"
        >
          <div className="flex items-center gap-2 mb-3">
            <div
              className="h-3 w-3 rounded-sm"
              style={{ backgroundColor: sector.color }}
            />
            <span className="text-[11px] font-bold text-foreground uppercase tracking-wider">
              {sector.name}
            </span>
            <span className="text-[10px] text-muted-foreground">
              ({sector.stocks.length})
            </span>
          </div>
          <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-6 gap-1.5">
            {sector.stocks.map((stock) => {
              const intensity = getIntensity(stock);
              const colors = getColor(stock, intensity);
              const isGain = stock.change >= 0;
              const isHovered = hoveredTicker === stock.ticker;
              const sizeClass = getSizeClass(stock);

              return (
                <div
                  key={stock.ticker}
                  className={`relative rounded-lg p-2.5 flex flex-col items-center justify-center text-center transition-all cursor-pointer ${sizeClass}`}
                  style={{
                    backgroundColor: colors.bg,
                    border: `1px solid ${colors.border}`,
                  }}
                  onClick={() => navigate(`/stock/${stock.ticker}`)}
                  onMouseEnter={() => setHoveredTicker(stock.ticker)}
                  onMouseLeave={() => setHoveredTicker(null)}
                >
                  <span className="font-mono text-[11px] font-extrabold text-foreground">
                    {stock.ticker.replace(".JK", "")}
                  </span>
                  <span
                    className={`font-mono text-[10px] font-bold mt-0.5 ${
                      viewMode === "change"
                        ? isGain
                          ? "text-gain"
                          : "text-loss"
                        : "text-primary"
                    }`}
                  >
                    {getValue(stock)}
                  </span>

                  {/* Tooltip */}
                  {isHovered && (
                    <motion.div
                      initial={{ opacity: 0, y: 4 }}
                      animate={{ opacity: 1, y: 0 }}
                      className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 z-50 rounded-lg bg-popover border border-border p-3 shadow-xl whitespace-nowrap pointer-events-none"
                    >
                      <p className="font-mono text-xs font-extrabold text-primary">
                        {stock.ticker.replace(".JK", "")}
                      </p>
                      <p className="text-[10px] text-muted-foreground mb-1.5">
                        {stock.name}
                      </p>
                      <div className="space-y-1 text-[10px]">
                        <div className="flex justify-between gap-4">
                          <span className="text-muted-foreground">Harga</span>
                          <span className="font-mono font-bold text-foreground">
                            Rp{stock.price.toLocaleString("id-ID")}
                          </span>
                        </div>
                        <div className="flex justify-between gap-4">
                          <span className="text-muted-foreground">
                            Perubahan
                          </span>
                          <span
                            className={`font-mono font-bold ${isGain ? "text-gain" : "text-loss"}`}
                          >
                            {isGain ? "+" : ""}
                            {stock.changePercent.toFixed(2)}%
                          </span>
                        </div>
                        <div className="flex justify-between gap-4">
                          <span className="text-muted-foreground">Volume</span>
                          <span className="font-mono font-bold text-foreground">
                            {formatVolume(stock.volume)}
                          </span>
                        </div>
                        <div className="flex justify-between gap-4">
                          <span className="text-muted-foreground">MCap</span>
                          <span className="font-mono font-bold text-foreground">
                            {formatRupiah(stock.marketCap)}
                          </span>
                        </div>
                      </div>
                    </motion.div>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      ))}
    </motion.div>
  );
};

export default HeatMap;
