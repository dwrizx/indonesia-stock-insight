import { Stock } from "@/data/stockData";
import { Radar, RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, ResponsiveContainer, Legend } from "recharts";
import { motion } from "framer-motion";
import { Crosshair } from "lucide-react";

interface RadarCompareProps {
  stockA: Stock;
  stockB: Stock;
}

function normalize(value: number, min: number, max: number): number {
  if (max === min) return 50;
  return Math.round(Math.min(Math.max(((value - min) / (max - min)) * 100, 0), 100));
}

const RadarCompare = ({ stockA, stockB }: RadarCompareProps) => {
  const tA = stockA.ticker.replace(".JK", "");
  const tB = stockB.ticker.replace(".JK", "");

  // Normalize metrics to 0-100 scale
  const data = [
    {
      metric: "Valuasi",
      [tA]: stockA.pe > 0 ? normalize(1 / stockA.pe, 0, 0.15) : 20,
      [tB]: stockB.pe > 0 ? normalize(1 / stockB.pe, 0, 0.15) : 20,
    },
    {
      metric: "Profit",
      [tA]: normalize(stockA.roe, -10, 100),
      [tB]: normalize(stockB.roe, -10, 100),
    },
    {
      metric: "Dividen",
      [tA]: normalize(stockA.dividendYield, 0, 8),
      [tB]: normalize(stockB.dividendYield, 0, 8),
    },
    {
      metric: "Momentum",
      [tA]: normalize(stockA.changePercent, -5, 5),
      [tB]: normalize(stockB.changePercent, -5, 5),
    },
    {
      metric: "Stabilitas",
      [tA]: normalize(2 - stockA.beta, 0, 2),
      [tB]: normalize(2 - stockB.beta, 0, 2),
    },
  ];

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
      className="rounded-xl border border-border bg-card p-5"
    >
      <div className="flex items-center gap-2 mb-4">
        <Crosshair className="h-4 w-4 text-primary" />
        <h3 className="text-sm font-bold text-foreground">Analisis Multi-Dimensi</h3>
      </div>
      <p className="text-[10px] text-muted-foreground mb-4">Perbandingan 5 dimensi: Valuasi, Profitabilitas, Dividen, Momentum, dan Stabilitas</p>

      <div className="h-72">
        <ResponsiveContainer width="100%" height="100%">
          <RadarChart data={data} cx="50%" cy="50%" outerRadius="75%">
            <PolarGrid stroke="hsl(var(--border))" />
            <PolarAngleAxis
              dataKey="metric"
              tick={{ fontSize: 10, fill: "hsl(var(--muted-foreground))" }}
            />
            <PolarRadiusAxis
              angle={90}
              domain={[0, 100]}
              tick={false}
              axisLine={false}
            />
            <Radar
              name={tA}
              dataKey={tA}
              stroke="hsl(var(--primary))"
              fill="hsl(var(--primary))"
              fillOpacity={0.15}
              strokeWidth={2}
            />
            <Radar
              name={tB}
              dataKey={tB}
              stroke="hsl(var(--gain))"
              fill="hsl(var(--gain))"
              fillOpacity={0.15}
              strokeWidth={2}
            />
            <Legend
              wrapperStyle={{ fontSize: "11px", paddingTop: "8px" }}
              formatter={(value) => <span style={{ color: "hsl(var(--foreground))", fontWeight: 600 }}>{value}</span>}
            />
          </RadarChart>
        </ResponsiveContainer>
      </div>
    </motion.div>
  );
};

export default RadarCompare;
