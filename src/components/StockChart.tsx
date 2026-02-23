import { useMemo } from "react";
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, BarChart, Bar } from "recharts";
import { generateChartData } from "@/data/stockData";

interface StockChartProps {
  basePrice: number;
  ticker: string;
}

const StockChart = ({ basePrice, ticker }: StockChartProps) => {
  const data = useMemo(() => generateChartData(basePrice, 90), [basePrice]);
  const minPrice = Math.min(...data.map(d => d.price)) * 0.98;
  const maxPrice = Math.max(...data.map(d => d.price)) * 1.02;
  const isGain = data[data.length - 1].price >= data[0].price;

  return (
    <div className="space-y-4">
      <div className="card-shine rounded-xl border border-border p-4">
        <h3 className="mb-4 text-sm font-semibold text-muted-foreground">Harga Saham — 90 Hari Terakhir</h3>
        <ResponsiveContainer width="100%" height={300}>
          <AreaChart data={data}>
            <defs>
              <linearGradient id={`gradient-${ticker}`} x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor={isGain ? "hsl(152, 69%, 46%)" : "hsl(0, 72%, 55%)"} stopOpacity={0.3} />
                <stop offset="100%" stopColor={isGain ? "hsl(152, 69%, 46%)" : "hsl(0, 72%, 55%)"} stopOpacity={0} />
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" stroke="hsl(220, 14%, 18%)" />
            <XAxis dataKey="date" tick={{ fill: "hsl(215, 15%, 55%)", fontSize: 10 }} tickLine={false} axisLine={false} interval={14} />
            <YAxis domain={[minPrice, maxPrice]} tick={{ fill: "hsl(215, 15%, 55%)", fontSize: 10 }} tickLine={false} axisLine={false} tickFormatter={(v) => `${(v / 1000).toFixed(1)}k`} />
            <Tooltip
              contentStyle={{ backgroundColor: "hsl(220, 18%, 12%)", border: "1px solid hsl(220, 14%, 18%)", borderRadius: "8px", fontSize: "12px" }}
              labelStyle={{ color: "hsl(215, 15%, 55%)" }}
              formatter={(value: number) => [`Rp${value.toLocaleString("id-ID")}`, "Harga"]}
            />
            <Area type="monotone" dataKey="price" stroke={isGain ? "hsl(152, 69%, 46%)" : "hsl(0, 72%, 55%)"} strokeWidth={2} fill={`url(#gradient-${ticker})`} />
          </AreaChart>
        </ResponsiveContainer>
      </div>

      <div className="card-shine rounded-xl border border-border p-4">
        <h3 className="mb-4 text-sm font-semibold text-muted-foreground">Volume Perdagangan</h3>
        <ResponsiveContainer width="100%" height={150}>
          <BarChart data={data}>
            <CartesianGrid strokeDasharray="3 3" stroke="hsl(220, 14%, 18%)" />
            <XAxis dataKey="date" tick={{ fill: "hsl(215, 15%, 55%)", fontSize: 10 }} tickLine={false} axisLine={false} interval={14} />
            <YAxis tick={{ fill: "hsl(215, 15%, 55%)", fontSize: 10 }} tickLine={false} axisLine={false} tickFormatter={(v) => `${(v / 1e6).toFixed(0)}M`} />
            <Tooltip
              contentStyle={{ backgroundColor: "hsl(220, 18%, 12%)", border: "1px solid hsl(220, 14%, 18%)", borderRadius: "8px", fontSize: "12px" }}
              formatter={(value: number) => [`${(value / 1e6).toFixed(1)}M`, "Volume"]}
            />
            <Bar dataKey="volume" fill="hsl(215, 15%, 30%)" radius={[2, 2, 0, 0]} />
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
};

export default StockChart;
