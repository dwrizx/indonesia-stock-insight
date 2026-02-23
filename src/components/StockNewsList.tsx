import { getStockNews, StockNews } from "@/data/stockData";
import { Newspaper, TrendingUp, TrendingDown, Minus } from "lucide-react";
import { motion } from "framer-motion";

interface StockNewsListProps {
  ticker: string;
}

const sentimentConfig = {
  positive: { icon: TrendingUp, color: "text-gain", bg: "bg-gain/10", label: "Positif" },
  negative: { icon: TrendingDown, color: "text-loss", bg: "bg-loss/10", label: "Negatif" },
  neutral: { icon: Minus, color: "text-muted-foreground", bg: "bg-secondary", label: "Netral" },
};

const StockNewsList = ({ ticker }: StockNewsListProps) => {
  const news = getStockNews(ticker);

  return (
    <motion.div
      initial={{ opacity: 0, y: 15 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay: 0.5 }}
      className="rounded-xl border border-border bg-card p-5 gradient-border"
    >
      <h3 className="mb-4 flex items-center gap-2 text-xs font-bold text-foreground uppercase tracking-wider">
        <Newspaper className="h-4 w-4 text-primary" />
        Berita & Sentimen
      </h3>
      <div className="space-y-3">
        {news.map((item, i) => {
          const config = sentimentConfig[item.sentiment];
          const Icon = config.icon;
          return (
            <div key={i} className="flex items-start gap-3 rounded-lg bg-secondary/20 p-3 hover:bg-secondary/40 transition-colors">
              <div className={`flex h-7 w-7 flex-shrink-0 items-center justify-center rounded-lg ${config.bg}`}>
                <Icon className={`h-3.5 w-3.5 ${config.color}`} />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-xs font-semibold text-foreground leading-relaxed">{item.title}</p>
                <div className="flex items-center gap-2 mt-1.5">
                  <span className="text-[9px] text-muted-foreground">{item.source}</span>
                  <span className="text-[9px] text-muted-foreground/50">•</span>
                  <span className="text-[9px] text-muted-foreground">{item.time}</span>
                  <span className={`text-[9px] font-bold ${config.color} ml-auto`}>{config.label}</span>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </motion.div>
  );
};

export default StockNewsList;
