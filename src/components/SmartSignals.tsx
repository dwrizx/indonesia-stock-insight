import { useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { Rocket, RotateCcw, Activity } from "lucide-react";
import type { Stock } from "@/data/stockData";
import { generateMarketSignals } from "@/lib/marketSignals";

type SmartSignalsProps = {
  stocks: Stock[];
};

const signalConfig = [
  { key: "breakout", title: "Breakout", icon: Rocket },
  { key: "rebound", title: "Rebound", icon: RotateCcw },
  { key: "active", title: "Aktif", icon: Activity },
] as const;

const SmartSignals = ({ stocks }: SmartSignalsProps) => {
  const navigate = useNavigate();
  const signals = useMemo(() => generateMarketSignals(stocks, 5), [stocks]);

  return (
    <div className="rounded-xl border border-border bg-card p-4">
      <div className="mb-4 flex items-center justify-between gap-3">
        <div>
          <h3 className="text-sm font-bold text-foreground">Smart Signals</h3>
          <p className="text-[11px] text-muted-foreground">
            Ringkasan cepat peluang pasar berbasis data live
          </p>
        </div>
      </div>

      <div className="grid gap-3 md:grid-cols-3">
        {signalConfig.map((section) => {
          const items = signals[section.key];
          return (
            <div
              key={section.key}
              className="rounded-lg border border-border/80 bg-secondary/20 p-3"
            >
              <div className="mb-2 flex items-center justify-between">
                <div className="flex items-center gap-1.5">
                  <section.icon className="h-3.5 w-3.5 text-primary" />
                  <span className="text-xs font-bold text-foreground">
                    {section.title}
                  </span>
                </div>
                <span className="rounded-full bg-primary/10 px-2 py-0.5 text-[10px] font-semibold text-primary">
                  {items.length}
                </span>
              </div>

              <div className="space-y-1.5">
                {items.length === 0 ? (
                  <p className="text-[11px] text-muted-foreground">
                    Belum ada sinyal kuat
                  </p>
                ) : (
                  items.map((item, i) => (
                    <motion.button
                      key={`${section.key}-${item.ticker}`}
                      onClick={() => navigate(`/stock/${item.ticker}`)}
                      initial={{ opacity: 0, y: 6 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ duration: 0.2, delay: i * 0.04 }}
                      className="w-full rounded-md border border-border bg-card px-2.5 py-2 text-left hover:border-primary/35"
                    >
                      <div className="flex items-center justify-between gap-2">
                        <span className="font-mono text-[11px] font-bold text-primary">
                          {item.ticker.replace(".JK", "")}
                        </span>
                        <span
                          className={`font-mono text-[10px] font-semibold ${
                            item.changePercent >= 0 ? "text-gain" : "text-loss"
                          }`}
                        >
                          {item.changePercent >= 0 ? "+" : ""}
                          {item.changePercent.toFixed(2)}%
                        </span>
                      </div>
                      <p className="truncate text-[10px] text-muted-foreground">
                        {item.name}
                      </p>
                      <p className="mt-0.5 text-[10px] text-muted-foreground/90">
                        {item.reason}
                      </p>
                    </motion.button>
                  ))
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default SmartSignals;

