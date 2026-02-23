import { stocks, formatRupiah } from "@/data/stockData";
import { useNavigate } from "react-router-dom";
import { TrendingUp, TrendingDown, Users } from "lucide-react";
import { motion } from "framer-motion";
import Sparkline from "@/components/Sparkline";

interface PeerComparisonProps {
  currentTicker: string;
  sector: string;
}

const PeerComparison = ({ currentTicker, sector }: PeerComparisonProps) => {
  const navigate = useNavigate();
  const peers = stocks
    .filter((s) => s.sector === sector && s.ticker !== currentTicker)
    .slice(0, 5);

  if (peers.length === 0) return null;

  return (
    <motion.div
      initial={{ opacity: 0, y: 15 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay: 0.4 }}
      className="rounded-xl border border-border bg-card p-5 gradient-border"
    >
      <h3 className="mb-4 flex items-center gap-2 text-xs font-bold text-foreground uppercase tracking-wider">
        <Users className="h-4 w-4 text-primary" />
        Perbandingan Sektor — {sector}
      </h3>
      <div className="overflow-x-auto">
        <table className="w-full text-xs">
          <thead>
            <tr className="border-b border-border/50">
              <th className="text-left pb-2 text-[9px] text-muted-foreground uppercase tracking-wider">
                Saham
              </th>
              <th className="text-right pb-2 text-[9px] text-muted-foreground uppercase tracking-wider">
                Harga
              </th>
              <th className="text-right pb-2 text-[9px] text-muted-foreground uppercase tracking-wider">
                P/E
              </th>
              <th className="text-right pb-2 text-[9px] text-muted-foreground uppercase tracking-wider">
                ROE
              </th>
              <th className="text-right pb-2 text-[9px] text-muted-foreground uppercase tracking-wider">
                Div
              </th>
              <th className="text-right pb-2 text-[9px] text-muted-foreground uppercase tracking-wider">
                Chg%
              </th>
            </tr>
          </thead>
          <tbody>
            {peers.map((peer) => {
              const isGain = peer.change >= 0;
              return (
                <tr
                  key={peer.ticker}
                  onClick={() => navigate(`/stock/${peer.ticker}`)}
                  className="border-b border-border/20 hover:bg-accent/50 cursor-pointer transition-colors"
                >
                  <td className="py-2.5">
                    <div>
                      <span className="font-mono font-bold text-primary">
                        {peer.ticker.replace(".JK", "")}
                      </span>
                      <p className="text-[9px] text-muted-foreground mt-0.5 truncate max-w-[100px]">
                        {peer.name}
                      </p>
                    </div>
                  </td>
                  <td className="text-right py-2.5 font-mono font-semibold text-foreground">
                    Rp{peer.price.toLocaleString("id-ID")}
                  </td>
                  <td className="text-right py-2.5 font-mono text-foreground">
                    {peer.pe > 0 ? peer.pe.toFixed(1) : "N/A"}
                  </td>
                  <td className="text-right py-2.5 font-mono text-foreground">
                    {peer.roe.toFixed(1)}%
                  </td>
                  <td className="text-right py-2.5 font-mono text-foreground">
                    {peer.dividendYield.toFixed(1)}%
                  </td>
                  <td
                    className={`text-right py-2.5 font-mono font-bold ${isGain ? "text-gain" : "text-loss"}`}
                  >
                    {isGain ? "+" : ""}
                    {peer.changePercent.toFixed(2)}%
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

export default PeerComparison;
