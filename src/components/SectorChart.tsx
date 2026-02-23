import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip } from "recharts";
import { sectorData } from "@/data/stockData";

const SectorChart = () => {
  return (
    <div className="card-shine rounded-xl border border-border p-5">
      <h3 className="mb-4 text-sm font-semibold text-foreground">📊 Distribusi Sektor</h3>
      <div className="flex items-center gap-6">
        <div className="w-40 h-40 flex-shrink-0">
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie
                data={sectorData}
                cx="50%"
                cy="50%"
                innerRadius={35}
                outerRadius={65}
                paddingAngle={3}
                dataKey="value"
                strokeWidth={0}
              >
                {sectorData.map((entry, index) => (
                  <Cell key={index} fill={entry.color} />
                ))}
              </Pie>
              <Tooltip
                contentStyle={{
                  backgroundColor: "hsl(220, 18%, 12%)",
                  border: "1px solid hsl(220, 14%, 18%)",
                  borderRadius: "8px",
                  fontSize: "12px",
                  color: "hsl(210, 20%, 92%)",
                }}
                formatter={(value: number) => [`${value}%`, "Porsi"]}
              />
            </PieChart>
          </ResponsiveContainer>
        </div>
        <div className="flex-1 space-y-2">
          {sectorData.map((s) => (
            <div key={s.name} className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="h-2.5 w-2.5 rounded-full" style={{ backgroundColor: s.color }} />
                <span className="text-xs text-muted-foreground">{s.name}</span>
              </div>
              <span className="font-mono text-xs font-medium text-foreground">{s.value}%</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default SectorChart;
