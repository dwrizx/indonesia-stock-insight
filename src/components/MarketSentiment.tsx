import { stocks } from "@/data/stockData";
import { motion } from "framer-motion";
import { Gauge, TrendingUp, TrendingDown, Activity } from "lucide-react";

const MarketSentiment = () => {
  const gainCount = stocks.filter(s => s.change >= 0).length;
  const totalStocks = stocks.length;
  const avgChange = stocks.reduce((a, b) => a + b.changePercent, 0) / totalStocks;
  const avgVolume = stocks.reduce((a, b) => a + b.volume, 0) / totalStocks;
  const highVolStocks = stocks.filter(s => s.volume > avgVolume).length;
  const lowBetaGainers = stocks.filter(s => s.beta < 1 && s.change >= 0).length;

  // Sentiment score: 0 (extreme fear) to 100 (extreme greed)
  const ratioScore = (gainCount / totalStocks) * 40;
  const changeScore = Math.min(Math.max((avgChange + 3) / 6 * 30, 0), 30);
  const momentumScore = (highVolStocks / totalStocks) * 15 + (lowBetaGainers / totalStocks) * 15;
  const score = Math.round(Math.min(Math.max(ratioScore + changeScore + momentumScore, 0), 100));

  const getLabel = (s: number) => {
    if (s >= 80) return { text: "Extreme Greed", color: "text-gain" };
    if (s >= 60) return { text: "Greed", color: "text-gain" };
    if (s >= 45) return { text: "Netral", color: "text-primary" };
    if (s >= 25) return { text: "Fear", color: "text-loss" };
    return { text: "Extreme Fear", color: "text-loss" };
  };

  const label = getLabel(score);
  const angle = -90 + (score / 100) * 180; // -90 to 90 degrees

  return (
    <motion.div
      initial={{ opacity: 0, y: 15 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="rounded-xl border border-border bg-card p-5 gradient-border"
    >
      <div className="flex items-center gap-2 mb-4">
        <Gauge className="h-4 w-4 text-primary" />
        <h3 className="text-sm font-bold text-foreground">Sentimen Pasar</h3>
      </div>

      {/* Gauge */}
      <div className="flex flex-col items-center">
        <div className="relative w-48 h-24 overflow-hidden">
          {/* Background arc */}
          <svg viewBox="0 0 200 100" className="w-full h-full">
            <defs>
              <linearGradient id="gaugeGrad" x1="0%" y1="0%" x2="100%" y2="0%">
                <stop offset="0%" stopColor="hsl(0, 72%, 55%)" />
                <stop offset="25%" stopColor="hsl(25, 80%, 55%)" />
                <stop offset="50%" stopColor="hsl(45, 93%, 58%)" />
                <stop offset="75%" stopColor="hsl(100, 60%, 50%)" />
                <stop offset="100%" stopColor="hsl(152, 69%, 46%)" />
              </linearGradient>
            </defs>
            <path
              d="M 20 95 A 80 80 0 0 1 180 95"
              fill="none"
              stroke="hsl(var(--secondary))"
              strokeWidth="12"
              strokeLinecap="round"
            />
            <path
              d="M 20 95 A 80 80 0 0 1 180 95"
              fill="none"
              stroke="url(#gaugeGrad)"
              strokeWidth="12"
              strokeLinecap="round"
              strokeDasharray={`${(score / 100) * 251.2} 251.2`}
            />
            {/* Needle */}
            <motion.line
              x1="100"
              y1="95"
              x2="100"
              y2="30"
              stroke="hsl(var(--foreground))"
              strokeWidth="2.5"
              strokeLinecap="round"
              initial={{ rotate: -90 }}
              animate={{ rotate: angle }}
              transition={{ duration: 1.5, type: "spring", damping: 15 }}
              style={{ transformOrigin: "100px 95px" }}
            />
            <circle cx="100" cy="95" r="5" fill="hsl(var(--foreground))" />
          </svg>
        </div>

        <motion.div
          className="text-center mt-2"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.8 }}
        >
          <span className="font-mono text-3xl font-extrabold text-foreground">{score}</span>
          <p className={`text-sm font-bold ${label.color} mt-1`}>{label.text}</p>
        </motion.div>

        {/* Mini metrics */}
        <div className="grid grid-cols-3 gap-3 mt-4 w-full">
          <div className="text-center">
            <div className="flex items-center justify-center gap-1 mb-1">
              <TrendingUp className="h-3 w-3 text-gain" />
            </div>
            <p className="font-mono text-xs font-bold text-foreground">{gainCount}/{totalStocks}</p>
            <p className="text-[9px] text-muted-foreground">Naik</p>
          </div>
          <div className="text-center">
            <div className="flex items-center justify-center gap-1 mb-1">
              <Activity className="h-3 w-3 text-primary" />
            </div>
            <p className={`font-mono text-xs font-bold ${avgChange >= 0 ? "text-gain" : "text-loss"}`}>
              {avgChange >= 0 ? "+" : ""}{avgChange.toFixed(2)}%
            </p>
            <p className="text-[9px] text-muted-foreground">Avg Δ</p>
          </div>
          <div className="text-center">
            <div className="flex items-center justify-center gap-1 mb-1">
              <TrendingDown className="h-3 w-3 text-loss" />
            </div>
            <p className="font-mono text-xs font-bold text-foreground">{totalStocks - gainCount}/{totalStocks}</p>
            <p className="text-[9px] text-muted-foreground">Turun</p>
          </div>
        </div>
      </div>
    </motion.div>
  );
};

export default MarketSentiment;
