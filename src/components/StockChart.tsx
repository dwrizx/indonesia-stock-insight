import { useMemo, useState } from "react";
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  BarChart,
  Bar,
  ComposedChart,
  Line,
} from "recharts";
import { generateChartData } from "@/data/stockData";
import { motion } from "framer-motion";

interface StockChartProps {
  basePrice: number;
  ticker: string;
}

const periods = [
  { label: "1M", days: 30 },
  { label: "3M", days: 90 },
  { label: "6M", days: 180 },
  { label: "1Y", days: 365 },
];

const StockChart = ({ basePrice, ticker }: StockChartProps) => {
  const [activePeriod, setActivePeriod] = useState(1);
  const data = useMemo(
    () => generateChartData(basePrice, periods[activePeriod].days),
    [basePrice, activePeriod],
  );

  const minPrice = Math.min(...data.map((d) => d.price)) * 0.98;
  const maxPrice = Math.max(...data.map((d) => d.price)) * 1.02;
  const isGain = data[data.length - 1].price >= data[0].price;
  const gainColor = "hsl(152, 69%, 46%)";
  const lossColor = "hsl(0, 72%, 55%)";
  const lineColor = isGain ? gainColor : lossColor;

  // Calculate moving average
  const dataWithMA = useMemo(() => {
    return data.map((d, i) => {
      const window = 7;
      if (i < window - 1) return { ...d, ma: null };
      const slice = data.slice(i - window + 1, i + 1);
      const avg = slice.reduce((a, b) => a + b.price, 0) / window;
      return { ...d, ma: Math.round(avg) };
    });
  }, [data]);

  const tooltipStyle = {
    backgroundColor: "hsl(222, 20%, 8%)",
    border: "1px solid hsl(222, 14%, 16%)",
    borderRadius: "12px",
    fontSize: "12px",
    boxShadow: "0 20px 40px rgba(0,0,0,0.5)",
    padding: "12px",
  };

  const interval = Math.max(Math.floor(data.length / 6), 1);

  return (
    <div className="space-y-4">
      {/* Period Selector */}
      <div className="flex items-center gap-1 rounded-lg bg-secondary/50 p-1 w-fit">
        {periods.map((p, i) => (
          <button
            key={p.label}
            onClick={() => setActivePeriod(i)}
            className={`rounded-md px-4 py-1.5 text-xs font-bold transition-all ${
              activePeriod === i
                ? "bg-primary text-primary-foreground shadow-lg shadow-primary/20"
                : "text-muted-foreground hover:text-foreground"
            }`}
          >
            {p.label}
          </button>
        ))}
      </div>

      {/* Price Chart */}
      <motion.div
        key={activePeriod}
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.3 }}
        className="card-shine rounded-xl border border-border p-5"
      >
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-xs font-bold text-muted-foreground uppercase tracking-wider">
            Harga Saham — {periods[activePeriod].label}
          </h3>
          <div className="flex items-center gap-4 text-[10px] text-muted-foreground">
            <div className="flex items-center gap-1.5">
              <div
                className="h-0.5 w-4 rounded"
                style={{ backgroundColor: lineColor }}
              />
              <span>Harga</span>
            </div>
            <div className="flex items-center gap-1.5">
              <div
                className="h-0.5 w-4 rounded bg-primary/60"
                style={{ borderTop: "1px dashed hsl(45,93%,58%)" }}
              />
              <span>MA(7)</span>
            </div>
          </div>
        </div>
        <ResponsiveContainer width="100%" height={320}>
          <ComposedChart data={dataWithMA}>
            <defs>
              <linearGradient id={`grad-${ticker}`} x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor={lineColor} stopOpacity={0.25} />
                <stop offset="50%" stopColor={lineColor} stopOpacity={0.08} />
                <stop offset="100%" stopColor={lineColor} stopOpacity={0} />
              </linearGradient>
            </defs>
            <CartesianGrid
              strokeDasharray="3 3"
              stroke="hsl(222, 14%, 12%)"
              vertical={false}
            />
            <XAxis
              dataKey="date"
              tick={{ fill: "hsl(215, 15%, 40%)", fontSize: 10 }}
              tickLine={false}
              axisLine={false}
              interval={interval}
            />
            <YAxis
              domain={[minPrice, maxPrice]}
              tick={{ fill: "hsl(215, 15%, 40%)", fontSize: 10 }}
              tickLine={false}
              axisLine={false}
              tickFormatter={(v) => `${(v / 1000).toFixed(1)}k`}
              width={45}
            />
            <Tooltip
              contentStyle={tooltipStyle}
              labelStyle={{
                color: "hsl(215, 15%, 50%)",
                marginBottom: "6px",
                fontSize: "11px",
              }}
              formatter={(value: number, name: string) => {
                if (name === "ma")
                  return [
                    `Rp${value?.toLocaleString("id-ID") ?? "-"}`,
                    "MA(7)",
                  ];
                return [`Rp${value.toLocaleString("id-ID")}`, "Harga"];
              }}
              cursor={{ stroke: "hsl(215, 15%, 25%)", strokeDasharray: "4 4" }}
            />
            <Area
              type="monotone"
              dataKey="price"
              stroke={lineColor}
              strokeWidth={2}
              fill={`url(#grad-${ticker})`}
            />
            <Line
              type="monotone"
              dataKey="ma"
              stroke="hsl(45, 93%, 58%)"
              strokeWidth={1}
              strokeDasharray="4 4"
              dot={false}
              connectNulls
              opacity={0.6}
            />
          </ComposedChart>
        </ResponsiveContainer>
      </motion.div>

      {/* Volume Chart */}
      <div className="card-shine rounded-xl border border-border p-5">
        <h3 className="mb-4 text-xs font-bold text-muted-foreground uppercase tracking-wider">
          Volume Perdagangan
        </h3>
        <ResponsiveContainer width="100%" height={140}>
          <BarChart data={data}>
            <CartesianGrid
              strokeDasharray="3 3"
              stroke="hsl(222, 14%, 12%)"
              vertical={false}
            />
            <XAxis
              dataKey="date"
              tick={{ fill: "hsl(215, 15%, 40%)", fontSize: 10 }}
              tickLine={false}
              axisLine={false}
              interval={interval}
            />
            <YAxis
              tick={{ fill: "hsl(215, 15%, 40%)", fontSize: 10 }}
              tickLine={false}
              axisLine={false}
              tickFormatter={(v) => `${(v / 1e6).toFixed(0)}M`}
              width={45}
            />
            <Tooltip
              contentStyle={tooltipStyle}
              formatter={(value: number) => [
                `${(value / 1e6).toFixed(1)}M lot`,
                "Volume",
              ]}
              cursor={{ fill: "hsl(222, 14%, 14%)" }}
            />
            <Bar
              dataKey="volume"
              fill="hsl(45, 93%, 58%)"
              opacity={0.3}
              radius={[3, 3, 0, 0]}
            />
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
};

export default StockChart;
