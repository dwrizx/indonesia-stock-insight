import { useMemo } from "react";
import { AreaChart, Area, ResponsiveContainer } from "recharts";
import { generateSparkline } from "@/data/stockData";

interface SparklineProps {
  basePrice: number;
  isGain: boolean;
  seed?: number;
  height?: number;
}

const Sparkline = ({ basePrice, isGain, seed = 0, height = 32 }: SparklineProps) => {
  const data = useMemo(
    () => generateSparkline(basePrice, 24, seed).map((v, i) => ({ v, i })),
    [basePrice, seed]
  );

  const color = isGain ? "hsl(152, 69%, 46%)" : "hsl(0, 72%, 55%)";
  const id = `spark-${seed}-${isGain ? "g" : "l"}`;

  return (
    <ResponsiveContainer width="100%" height={height}>
      <AreaChart data={data}>
        <defs>
          <linearGradient id={id} x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor={color} stopOpacity={0.3} />
            <stop offset="100%" stopColor={color} stopOpacity={0} />
          </linearGradient>
        </defs>
        <Area
          type="monotone"
          dataKey="v"
          stroke={color}
          strokeWidth={1.5}
          fill={`url(#${id})`}
          dot={false}
        />
      </AreaChart>
    </ResponsiveContainer>
  );
};

export default Sparkline;
