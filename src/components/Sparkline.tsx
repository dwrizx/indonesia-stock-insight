import { useMemo } from "react";
import { LineChart, Line, ResponsiveContainer } from "recharts";
import { generateSparkline } from "@/data/stockData";

interface SparklineProps {
  basePrice: number;
  isGain: boolean;
  seed?: number;
  height?: number;
}

const Sparkline = ({ basePrice, isGain, seed = 0, height = 32 }: SparklineProps) => {
  const data = useMemo(
    () => generateSparkline(basePrice, 20, seed).map((v, i) => ({ v, i })),
    [basePrice, seed]
  );

  return (
    <ResponsiveContainer width="100%" height={height}>
      <LineChart data={data}>
        <Line
          type="monotone"
          dataKey="v"
          stroke={isGain ? "hsl(152, 69%, 46%)" : "hsl(0, 72%, 55%)"}
          strokeWidth={1.5}
          dot={false}
        />
      </LineChart>
    </ResponsiveContainer>
  );
};

export default Sparkline;
