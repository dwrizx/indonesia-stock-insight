import {
  stocks as baseStocks,
  type Stock,
  formatRupiah,
  getSectorColor,
  getOrderedSectorsFromStocks,
} from "@/data/stockData";
import { useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { Fragment, useState } from "react";
import { ChevronDown, BarChart3 } from "lucide-react";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  Cell,
} from "recharts";

type SectorDetailProps = {
  stocks?: Stock[];
};

const SectorDetail = ({ stocks = baseStocks }: SectorDetailProps) => {
  const navigate = useNavigate();
  const [expandedSector, setExpandedSector] = useState<string | null>(null);
  const allSectorNames = getOrderedSectorsFromStocks(stocks);

  const sectorStats = allSectorNames
    .map((sectorName) => {
      const sectorStocks = stocks.filter((s) => s.sector === sectorName);
      const avgChange =
        sectorStocks.length > 0
          ? sectorStocks.reduce((a, b) => a + b.changePercent, 0) /
            sectorStocks.length
          : 0;
      const avgPE =
        sectorStocks.filter((s) => s.pe > 0).length > 0
          ? sectorStocks.filter((s) => s.pe > 0).reduce((a, b) => a + b.pe, 0) /
            sectorStocks.filter((s) => s.pe > 0).length
          : 0;
      const avgDivYield =
        sectorStocks.length > 0
          ? sectorStocks.reduce((a, b) => a + b.dividendYield, 0) /
            sectorStocks.length
          : 0;
      const totalMCap = sectorStocks.reduce((a, b) => a + b.marketCap, 0);
      return {
        name: sectorName,
        color: getSectorColor(sectorName),
        stocks: sectorStocks,
        count: sectorStocks.length,
        avgChange,
        avgPE,
        avgDivYield,
        totalMCap,
      };
    })
    .sort((a, b) => {
      if (b.count !== a.count) return b.count - a.count;
      return b.avgChange - a.avgChange;
    });

  const barData = sectorStats.map((s) => ({
    name: s.name.substring(0, 6),
    fullName: s.name,
    change: parseFloat(s.avgChange.toFixed(2)),
    color: s.color,
  }));

  const CustomBarTooltip = ({ active, payload }: any) => {
    if (active && payload && payload.length) {
      const d = payload[0].payload;
      return (
        <div className="rounded-lg bg-popover border border-border p-2 shadow-xl text-xs">
          <p className="font-bold text-foreground">{d.fullName}</p>
          <p
            className={`font-mono font-bold ${d.change >= 0 ? "text-gain" : "text-loss"}`}
          >
            {d.change >= 0 ? "+" : ""}
            {d.change}%
          </p>
        </div>
      );
    }
    return null;
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
      className="space-y-6"
    >
      {/* Horizontal bar chart */}
      <div className="rounded-xl border border-border bg-card p-5">
        <div className="flex items-center gap-2 mb-4">
          <BarChart3 className="h-4 w-4 text-primary" />
          <h3 className="text-sm font-bold text-foreground">
            Performa Sektor Hari Ini
          </h3>
        </div>
        <div className="h-48">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart
              data={barData}
              layout="vertical"
              margin={{ top: 0, right: 20, left: 0, bottom: 0 }}
            >
              <XAxis
                type="number"
                tick={{ fontSize: 9, fill: "hsl(var(--muted-foreground))" }}
                tickFormatter={(v) => `${v}%`}
              />
              <YAxis
                type="category"
                dataKey="name"
                tick={{ fontSize: 10, fill: "hsl(var(--muted-foreground))" }}
                width={55}
              />
              <Tooltip content={<CustomBarTooltip />} />
              <Bar dataKey="change" radius={[0, 4, 4, 0]}>
                {barData.map((entry, i) => (
                  <Cell
                    key={i}
                    fill={
                      entry.change >= 0
                        ? "hsl(152, 69%, 46%)"
                        : "hsl(0, 72%, 55%)"
                    }
                    fillOpacity={0.7}
                  />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Summary table */}
      <div className="rounded-xl border border-border bg-card overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-border bg-secondary/30">
                <th className="text-left px-4 py-3 text-[10px] font-bold text-muted-foreground uppercase tracking-wider">
                  Sektor
                </th>
                <th className="text-center px-4 py-3 text-[10px] font-bold text-muted-foreground uppercase tracking-wider">
                  Saham
                </th>
                <th className="text-right px-4 py-3 text-[10px] font-bold text-muted-foreground uppercase tracking-wider">
                  Avg Δ%
                </th>
                <th className="text-right px-4 py-3 text-[10px] font-bold text-muted-foreground uppercase tracking-wider hidden sm:table-cell">
                  Avg P/E
                </th>
                <th className="text-right px-4 py-3 text-[10px] font-bold text-muted-foreground uppercase tracking-wider hidden sm:table-cell">
                  Avg Div
                </th>
                <th className="text-right px-4 py-3 text-[10px] font-bold text-muted-foreground uppercase tracking-wider hidden md:table-cell">
                  Total MCap
                </th>
                <th className="px-4 py-3 w-8"></th>
              </tr>
            </thead>
            <tbody>
              {sectorStats.map((sector) => (
                <Fragment key={sector.name}>
                  <tr
                    onClick={() =>
                      setExpandedSector(
                        expandedSector === sector.name ? null : sector.name,
                      )
                    }
                    className="border-b border-border/30 hover:bg-accent/30 cursor-pointer transition-colors"
                  >
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-2">
                        <div
                          className="h-3 w-3 rounded-sm"
                          style={{ backgroundColor: sector.color }}
                        />
                        <span className="text-xs font-bold text-foreground">
                          {sector.name}
                        </span>
                      </div>
                    </td>
                    <td className="px-4 py-3 text-center">
                      <span className="font-mono text-xs text-muted-foreground">
                        {sector.count}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-right">
                      <span
                        className={`font-mono text-xs font-bold ${sector.avgChange >= 0 ? "text-gain" : "text-loss"}`}
                      >
                        {sector.avgChange >= 0 ? "+" : ""}
                        {sector.avgChange.toFixed(2)}%
                      </span>
                    </td>
                    <td className="px-4 py-3 text-right hidden sm:table-cell">
                      <span className="font-mono text-xs text-foreground">
                        {sector.avgPE > 0 ? sector.avgPE.toFixed(1) : "N/A"}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-right hidden sm:table-cell">
                      <span className="font-mono text-xs text-foreground">
                        {sector.avgDivYield.toFixed(1)}%
                      </span>
                    </td>
                    <td className="px-4 py-3 text-right hidden md:table-cell">
                      <span className="font-mono text-xs text-muted-foreground">
                        {formatRupiah(sector.totalMCap)}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      <ChevronDown
                        className={`h-3.5 w-3.5 text-muted-foreground transition-transform ${expandedSector === sector.name ? "rotate-180" : ""}`}
                      />
                    </td>
                  </tr>
                  <AnimatePresence>
                    {expandedSector === sector.name && (
                      <motion.tr
                        key={`${sector.name}-detail`}
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                      >
                        <td colSpan={7} className="px-4 py-3 bg-secondary/10">
                          <div className="grid gap-2 sm:grid-cols-2 lg:grid-cols-3">
                            {sector.stocks.map((stock) => {
                              const isGain = stock.change >= 0;
                              return (
                                <button
                                  key={stock.ticker}
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    navigate(`/stock/${stock.ticker}`);
                                  }}
                                  className="flex items-center justify-between rounded-lg border border-border bg-card px-3 py-2 hover:border-primary/30 transition-all text-left"
                                >
                                  <div>
                                    <span className="font-mono text-[11px] font-extrabold text-primary">
                                      {stock.ticker.replace(".JK", "")}
                                    </span>
                                    <p className="text-[10px] text-muted-foreground truncate max-w-[120px]">
                                      {stock.name}
                                    </p>
                                  </div>
                                  <div className="text-right">
                                    <p className="font-mono text-[11px] font-bold text-foreground">
                                      Rp{stock.price.toLocaleString("id-ID")}
                                    </p>
                                    <p
                                      className={`font-mono text-[10px] font-bold ${isGain ? "text-gain" : "text-loss"}`}
                                    >
                                      {isGain ? "+" : ""}
                                      {stock.changePercent.toFixed(2)}%
                                    </p>
                                  </div>
                                </button>
                              );
                            })}
                          </div>
                        </td>
                      </motion.tr>
                    )}
                  </AnimatePresence>
                </Fragment>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </motion.div>
  );
};

export default SectorDetail;
