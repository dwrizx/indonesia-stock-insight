import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip } from "recharts";
import { sectorData } from "@/data/stockData";
import { motion } from "framer-motion";

const SectorChart = () => {
  const total = sectorData.reduce((a, b) => a + b.value, 0);

  const CustomTooltip = ({ active, payload }: any) => {
    if (active && payload && payload.length) {
      const data = payload[0].payload;
      return (
        <div className="rounded-xl bg-popover border border-border p-3 shadow-xl">
          <div className="flex items-center gap-2 mb-1.5">
            <div className="h-3 w-3 rounded-sm" style={{ backgroundColor: data.color }} />
            <span className="text-xs font-bold text-foreground">{data.name}</span>
          </div>
          <p className="font-mono text-lg font-extrabold text-foreground">{data.value}%</p>
          <p className="text-[10px] text-muted-foreground">dari total pasar</p>
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
                animationBegin={200}
                animationDuration={800}
              >
                {sectorData.map((entry, index) => (
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
        <div className="w-full space-y-2.5">
          {sectorData.map((s, i) => (
            <motion.div 
              key={s.name} 
              className="flex items-center gap-3 group cursor-default"
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.4 + i * 0.08 }}
            >
              <div className="h-3 w-3 rounded-sm flex-shrink-0 transition-transform group-hover:scale-125" style={{ backgroundColor: s.color }} />
              <span className="text-xs text-muted-foreground flex-1 group-hover:text-foreground transition-colors">{s.name}</span>
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
                <span className="font-mono text-xs font-bold text-foreground w-8 text-right">{s.value}%</span>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </motion.div>
  );
};

export default SectorChart;
