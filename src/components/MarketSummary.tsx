import { stocks, sectorData } from "@/data/stockData";
import { motion } from "framer-motion";
import { MessageSquareText, TrendingUp, TrendingDown } from "lucide-react";

const MarketSummary = () => {
  const gainCount = stocks.filter((s) => s.change >= 0).length;
  const lossCount = stocks.length - gainCount;
  const isPositive = gainCount > lossCount;

  // Find best sector
  const sectorPerf = sectorData
    .map((sector) => {
      const sectorStocks = stocks.filter((s) => s.sector === sector.name);
      const avgChange =
        sectorStocks.length > 0
          ? sectorStocks.reduce((a, b) => a + b.changePercent, 0) /
            sectorStocks.length
          : 0;
      return { name: sector.name, avgChange };
    })
    .sort((a, b) => b.avgChange - a.avgChange);

  const bestSector = sectorPerf[0];
  const worstSector = sectorPerf[sectorPerf.length - 1];

  const topGainer = [...stocks].sort(
    (a, b) => b.changePercent - a.changePercent,
  )[0];
  const topLoser = [...stocks].sort(
    (a, b) => a.changePercent - b.changePercent,
  )[0];

  const summaryText = isPositive
    ? `Pasar menguat hari ini dengan ${gainCount} dari ${stocks.length} saham ditutup hijau. Sektor ${bestSector.name} memimpin kenaikan (+${bestSector.avgChange.toFixed(2)}%).`
    : `Pasar melemah hari ini dengan ${lossCount} dari ${stocks.length} saham ditutup merah. Sektor ${worstSector.name} menjadi yang paling tertekan (${worstSector.avgChange.toFixed(2)}%).`;

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
      className="rounded-xl border border-border bg-card p-4"
    >
      <div className="flex items-start gap-3">
        <div
          className={`flex h-8 w-8 items-center justify-center rounded-lg shrink-0 ${isPositive ? "bg-gain/10" : "bg-loss/10"}`}
        >
          <MessageSquareText
            className={`h-4 w-4 ${isPositive ? "text-gain" : "text-loss"}`}
          />
        </div>
        <div className="flex-1 min-w-0">
          <p className="text-xs text-foreground leading-relaxed">
            {summaryText}
          </p>
          <div className="flex flex-wrap gap-3 mt-3">
            <div className="flex items-center gap-1.5 text-[10px]">
              <TrendingUp className="h-3 w-3 text-gain" />
              <span className="text-muted-foreground">Top:</span>
              <span className="font-mono font-bold text-gain">
                {topGainer.ticker.replace(".JK", "")} +
                {topGainer.changePercent.toFixed(2)}%
              </span>
            </div>
            <div className="flex items-center gap-1.5 text-[10px]">
              <TrendingDown className="h-3 w-3 text-loss" />
              <span className="text-muted-foreground">Bottom:</span>
              <span className="font-mono font-bold text-loss">
                {topLoser.ticker.replace(".JK", "")}{" "}
                {topLoser.changePercent.toFixed(2)}%
              </span>
            </div>
          </div>
        </div>
      </div>
    </motion.div>
  );
};

export default MarketSummary;
