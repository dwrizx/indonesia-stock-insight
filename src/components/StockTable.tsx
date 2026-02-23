import { Stock, formatRupiah, formatVolume } from "@/data/stockData";
import { TrendingUp, TrendingDown } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import Sparkline from "@/components/Sparkline";

interface StockTableProps {
  stocks: Stock[];
}

function getSignalBadge(stock: Stock): { label: string; color: string } {
  const score =
    (stock.pe > 0 && stock.pe < 15 ? 2 : stock.pe > 0 && stock.pe < 25 ? 1 : 0) +
    (stock.roe > 15 ? 2 : stock.roe > 10 ? 1 : 0) +
    (stock.dividendYield > 3 ? 1 : 0) +
    (stock.changePercent > 0 ? 1 : 0) +
    (stock.beta < 1.2 ? 1 : 0);
  if (score >= 5) return { label: "BUY", color: "text-gain" };
  if (score >= 3) return { label: "HOLD", color: "text-primary" };
  return { label: "SELL", color: "text-loss" };
}

const StockTable = ({ stocks }: StockTableProps) => {
  const navigate = useNavigate();

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.3 }}
      className="rounded-xl border border-border bg-card overflow-hidden"
    >
      <div className="overflow-x-auto max-h-[600px]">
        <table className="w-full text-sm">
          <thead className="sticky top-0 z-10 bg-card">
            <tr className="border-b border-border bg-secondary/30">
              <th className="text-left px-4 py-3 text-[10px] font-bold text-muted-foreground uppercase tracking-wider">Ticker</th>
              <th className="text-left px-4 py-3 text-[10px] font-bold text-muted-foreground uppercase tracking-wider hidden md:table-cell">Nama</th>
              <th className="text-left px-4 py-3 text-[10px] font-bold text-muted-foreground uppercase tracking-wider hidden lg:table-cell">Sektor</th>
              <th className="text-right px-4 py-3 text-[10px] font-bold text-muted-foreground uppercase tracking-wider">Harga</th>
              <th className="text-right px-4 py-3 text-[10px] font-bold text-muted-foreground uppercase tracking-wider">Perubahan</th>
              <th className="text-center px-4 py-3 text-[10px] font-bold text-muted-foreground uppercase tracking-wider hidden sm:table-cell w-24">Trend</th>
              <th className="text-center px-4 py-3 text-[10px] font-bold text-muted-foreground uppercase tracking-wider hidden sm:table-cell">Sinyal</th>
              <th className="text-right px-4 py-3 text-[10px] font-bold text-muted-foreground uppercase tracking-wider hidden md:table-cell">Volume</th>
              <th className="text-right px-4 py-3 text-[10px] font-bold text-muted-foreground uppercase tracking-wider hidden lg:table-cell">P/E</th>
              <th className="text-right px-4 py-3 text-[10px] font-bold text-muted-foreground uppercase tracking-wider hidden lg:table-cell">Div. Yield</th>
              <th className="text-right px-4 py-3 text-[10px] font-bold text-muted-foreground uppercase tracking-wider hidden xl:table-cell">Market Cap</th>
            </tr>
          </thead>
          <tbody>
            {stocks.map((stock, i) => {
              const isGain = stock.change >= 0;
              const signal = getSignalBadge(stock);
              return (
                <tr
                  key={stock.ticker}
                  onClick={() => navigate(`/stock/${stock.ticker}`)}
                  className="border-b border-border/30 hover:bg-accent/50 cursor-pointer transition-colors"
                >
                  <td className="px-4 py-3">
                    <span className="font-mono text-xs font-extrabold text-primary">{stock.ticker.replace(".JK", "")}</span>
                  </td>
                  <td className="px-4 py-3 hidden md:table-cell">
                    <span className="text-xs text-foreground truncate max-w-[160px] block">{stock.name}</span>
                  </td>
                  <td className="px-4 py-3 hidden lg:table-cell">
                    <span className="text-[10px] text-muted-foreground bg-secondary rounded-full px-2 py-0.5">{stock.sector}</span>
                  </td>
                  <td className="px-4 py-3 text-right">
                    <span className="font-mono text-xs font-bold text-foreground">Rp{stock.price.toLocaleString("id-ID")}</span>
                  </td>
                  <td className="px-4 py-3 text-right">
                    <div className={`inline-flex items-center gap-1 font-mono text-xs font-bold ${isGain ? "text-gain" : "text-loss"}`}>
                      {isGain ? <TrendingUp className="h-3 w-3" /> : <TrendingDown className="h-3 w-3" />}
                      {isGain ? "+" : ""}{stock.changePercent.toFixed(2)}%
                    </div>
                  </td>
                  <td className="px-4 py-3 hidden sm:table-cell">
                    <div className="w-20 h-5 mx-auto opacity-60">
                      <Sparkline basePrice={stock.price} isGain={isGain} seed={stock.price % 17} height={20} />
                    </div>
                  </td>
                  <td className="px-4 py-3 hidden sm:table-cell text-center">
                    <span className={`text-[10px] font-extrabold ${signal.color}`}>{signal.label}</span>
                  </td>
                  <td className="px-4 py-3 text-right hidden md:table-cell">
                    <span className="font-mono text-xs text-muted-foreground">{formatVolume(stock.volume)}</span>
                  </td>
                  <td className="px-4 py-3 text-right hidden lg:table-cell">
                    <span className={`font-mono text-xs ${stock.pe > 0 && stock.pe < 15 ? "text-gain font-bold" : "text-foreground"}`}>
                      {stock.pe > 0 ? stock.pe.toFixed(1) : "N/A"}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-right hidden lg:table-cell">
                    <span className={`font-mono text-xs ${stock.dividendYield > 3 ? "text-gain font-bold" : "text-foreground"}`}>
                      {stock.dividendYield.toFixed(1)}%
                    </span>
                  </td>
                  <td className="px-4 py-3 text-right hidden xl:table-cell">
                    <span className="font-mono text-xs text-muted-foreground">{formatRupiah(stock.marketCap)}</span>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </motion.div>
  );
};

export default StockTable;
