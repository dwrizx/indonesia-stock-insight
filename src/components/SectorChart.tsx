import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip } from "recharts";
import { sectorData } from "@/data/stockData";
import { motion } from "framer-motion";

const SectorChart = () => {
  const total = sectorData.reduce((a, b) => a + b.value, 0);

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay: 0.2 }}
      className="rounded-xl border border-border bg-card p-5 gradient-border h-full"
    >
      <h3 className="mb-5 text-sm font-bold text-foreground uppercase tracking-wider">Distribusi Sektor</h3>
      <div className="flex flex-col items-center gap-5">
        <div className="w-44 h-44 flex-shrink-0">
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie
                data={sectorData}
                cx="50%"
                cy="50%"
                innerRadius={40}
                outerRadius={70}
                paddingAngle={3}
                dataKey="value"
                strokeWidth={0}
              >
                {sectorData.map((entry, index) => (
                  <Cell key={index} fill={entry.color} className="drop-shadow-sm" />
                ))}
              </Pie>
              <Tooltip
                contentStyle={{
                  backgroundColor: "hsl(222, 20%, 10%)",
                  border: "1px solid hsl(222, 14%, 14%)",
                  borderRadius: "10px",
                  fontSize: "12px",
                  color: "hsl(210, 20%, 92%)",
                  boxShadow: "0 10px 30px rgba(0,0,0,0.4)",
                }}
                formatter={(value: number) => [`${value}%`, "Porsi"]}
              />
            </PieChart>
          </ResponsiveContainer>
        </div>
        <div className="w-full space-y-2.5">
          {sectorData.map((s) => (
            <div key={s.name} className="flex items-center gap-3">
              <div className="h-3 w-3 rounded-sm flex-shrink-0" style={{ backgroundColor: s.color }} />
              <span className="text-xs text-muted-foreground flex-1">{s.name}</span>
              <div className="flex items-center gap-2">
                <div className="w-16 h-1.5 rounded-full bg-secondary overflow-hidden">
                  <div className="h-full rounded-full" style={{ width: `${(s.value / total) * 100}%`, backgroundColor: s.color }} />
                </div>
                <span className="font-mono text-xs font-bold text-foreground w-8 text-right">{s.value}%</span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </motion.div>
  );
};

export default SectorChart;
