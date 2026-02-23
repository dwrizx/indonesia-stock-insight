import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip } from "recharts";
import {
  stocks as baseStocks,
  type Stock,
  getSectorColor,
  getOrderedSectorsFromStocks,
} from "@/data/stockData";
import { motion } from "framer-motion";
import { BarChart, Bar, XAxis, YAxis, Cell as BarCell } from "recharts";

type SectorChartProps = {
  stocks?: Stock[];
};

const SectorChart = ({ stocks = baseStocks }: SectorChartProps) => {
  const allSectorNames = getOrderedSectorsFromStocks(stocks);

  // Calculate sector performance
  const sectorPerf = allSectorNames.map((sectorName) => {
    const sectorStocks = stocks.filter((s) => s.sector === sectorName);
    const totalMCap = sectorStocks.reduce(
      (sum, stock) => sum + stock.marketCap,
      0,
    );
    const avgChange =
      sectorStocks.length > 0
        ? sectorStocks.reduce((a, b) => a + b.changePercent, 0) /
          sectorStocks.length
        : 0;
    return {
      name: sectorName,
      color: getSectorColor(sectorName),
      avgChange: parseFloat(avgChange.toFixed(2)),
      count: sectorStocks.length,
      value: totalMCap,
    };
  });
  const total = Math.max(
    1,
    sectorPerf.reduce((sum, sector) => sum + sector.value, 0),
  );

  const CustomTooltip = ({ active, payload }: any) => {
    if (active && payload && payload.length) {
      const data = payload[0].payload;
      const sectorStocks = stocks.filter((s) => s.sector === data.name);
      const avgPE =
        sectorStocks.filter((s) => s.pe > 0).reduce((a, b) => a + b.pe, 0) /
        (sectorStocks.filter((s) => s.pe > 0).length || 1);
      return (
        <div className="rounded-xl bg-popover border border-border p-3 shadow-xl">
          <div className="flex items-center gap-2 mb-1.5">
            <div
              className="h-3 w-3 rounded-sm"
              style={{ backgroundColor: data.color }}
            />
            <span className="text-xs font-bold text-foreground">
              {data.name}
            </span>
          </div>
          <p className="font-mono text-lg font-extrabold text-foreground">
            {((data.value / total) * 100).toFixed(1)}%
          </p>
          <div className="mt-1.5 space-y-0.5 text-[10px] text-muted-foreground">
            <p>{sectorStocks.length} saham</p>
            <p>Avg P/E: {avgPE.toFixed(1)}</p>
          </div>
        </div>
      );
    }
    return null;
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay: 0.2 }}
      className="rounded-xl border border-border bg-card p-5 gradient-border h-full"
    >
      <h3 className="mb-5 text-sm font-bold text-foreground uppercase tracking-wider">
        Distribusi Sektor
      </h3>
      <div className="flex flex-col items-center gap-5">
        <div className="w-44 h-44 flex-shrink-0">
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie
                data={sectorPerf}
                cx="50%"
                cy="50%"
                innerRadius={40}
                outerRadius={70}
                paddingAngle={3}
                dataKey="value"
                strokeWidth={0}
                animationBegin={200}
                animationDuration={800}
              >
                {sectorPerf.map((entry, index) => (
                  <Cell
                    key={index}
                    fill={entry.color}
                    className="drop-shadow-sm cursor-pointer transition-all"
                    style={{ filter: "drop-shadow(0 2px 4px rgba(0,0,0,0.2))" }}
                  />
                ))}
              </Pie>
              <Tooltip content={<CustomTooltip />} />
            </PieChart>
          </ResponsiveContainer>
        </div>

        {/* Mini performance bar */}
        <div className="w-full">
          <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider mb-2">
            Performa Hari Ini
          </p>
          <div className="h-24">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart
                data={sectorPerf}
                layout="vertical"
                margin={{ left: 0, right: 5, top: 0, bottom: 0 }}
              >
                <XAxis type="number" hide />
                <YAxis
                  type="category"
                  dataKey="name"
                  width={50}
                  tick={{ fontSize: 9, fill: "hsl(var(--muted-foreground))" }}
                />
                <Bar dataKey="avgChange" radius={[0, 3, 3, 0]} barSize={8}>
                  {sectorPerf.map((entry, i) => (
                    <BarCell
                      key={i}
                      fill={
                        entry.avgChange >= 0
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

        <div className="w-full space-y-2.5">
          {sectorPerf.map((s, i) => (
            <motion.div
              key={s.name}
              className="flex items-center gap-3 group cursor-default"
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.4 + i * 0.08 }}
            >
              <div
                className="h-3 w-3 rounded-sm flex-shrink-0 transition-transform group-hover:scale-125"
                style={{ backgroundColor: s.color }}
              />
              <span className="text-xs text-muted-foreground flex-1 group-hover:text-foreground transition-colors">
                {s.name}
              </span>
              <span
                className={`font-mono text-[10px] font-bold ${s.avgChange >= 0 ? "text-gain" : "text-loss"}`}
              >
                {s.avgChange >= 0 ? "+" : ""}
                {s.avgChange}%
              </span>
              <div className="flex items-center gap-2">
                <div className="w-16 h-1.5 rounded-full bg-secondary overflow-hidden">
                  <motion.div
                    className="h-full rounded-full"
                    style={{ backgroundColor: s.color }}
                    initial={{ width: 0 }}
                    animate={{ width: `${(s.value / total) * 100}%` }}
                    transition={{ duration: 0.8, delay: 0.5 + i * 0.1 }}
                  />
                </div>
                <span className="font-mono text-xs font-bold text-foreground w-8 text-right">
                  {((s.value / total) * 100).toFixed(1)}%
                </span>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </motion.div>
  );
};

export default SectorChart;
