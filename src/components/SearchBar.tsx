import { Search, Building2, User, Landmark, TrendingUp } from "lucide-react";
import { useState, useMemo } from "react";
import { stocks } from "@/data/stockData";
import { ownershipRecords } from "@/data/ownershipData";
import { useNavigate } from "react-router-dom";
import type { InvestorType } from "@/lib/ownership";

// Build deduplicated investor index once (module-level, not in component)
const investorIndex: {
  investorId: string;
  investorName: string;
  investorType: InvestorType;
  origin: "Local" | "Foreign";
  tickers: string[];
}[] = (() => {
  const byId = new Map<string, typeof investorIndex[0]>();
  for (const r of ownershipRecords) {
    const existing = byId.get(r.investorId);
    if (existing) {
      if (!existing.tickers.includes(r.ticker)) existing.tickers.push(r.ticker);
    } else {
      byId.set(r.investorId, {
        investorId: r.investorId,
        investorName: r.investorName,
        investorType: r.investorType,
        origin: r.origin,
        tickers: [r.ticker],
      });
    }
  }
  return [...byId.values()].sort((a, b) => b.tickers.length - a.tickers.length);
})();

const TYPE_ICON: Record<InvestorType, typeof Building2> = {
  Corporate: Building2,
  Bank: Landmark,
  Fund: TrendingUp,
  Individual: User,
};

const TYPE_COLOR: Record<InvestorType, string> = {
  Corporate: "text-violet-400",
  Bank: "text-sky-400",
  Fund: "text-emerald-400",
  Individual: "text-amber-400",
};

const SearchBar = () => {
  const [query, setQuery] = useState("");
  const [focused, setFocused] = useState(false);
  const [expandedInvestor, setExpandedInvestor] = useState<string | null>(null);
  const navigate = useNavigate();

  const stockResults = useMemo(() => {
    if (!query.trim()) return [];
    const q = query.toLowerCase();
    return stocks
      .filter(
        (s) =>
          s.ticker.toLowerCase().includes(q) ||
          s.name.toLowerCase().includes(q),
      )
      .slice(0, 5);
  }, [query]);

  const investorResults = useMemo(() => {
    if (query.trim().length < 2) return [];
    const q = query.toLowerCase();
    return investorIndex
      .filter((inv) => inv.investorName.toLowerCase().includes(q))
      .slice(0, 4);
  }, [query]);

  const hasResults = stockResults.length > 0 || investorResults.length > 0;

  return (
    <div className="relative w-full max-w-md">
      <div
        className={`flex items-center gap-2 rounded-lg border px-3 py-2 transition-all ${focused ? "border-primary glow-primary" : "border-border bg-secondary/50"}`}
      >
        <Search className="h-4 w-4 shrink-0 text-muted-foreground" />
        <input
          type="text"
          placeholder="Cari saham atau investor... (BBCA, Lo Kheng Hong, Norges Bank)"
          className="w-full bg-transparent text-sm text-foreground placeholder:text-muted-foreground outline-none"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          onFocus={() => setFocused(true)}
          onBlur={() => setTimeout(() => { setFocused(false); setExpandedInvestor(null); }, 250)}
        />
      </div>

      {focused && hasResults && (
        <div className="absolute top-full left-0 right-0 z-50 mt-1 rounded-lg border border-border bg-popover shadow-xl overflow-hidden">
          {stockResults.length > 0 && (
            <div>
              <p className="px-3 pt-2 pb-1 text-[10px] font-bold uppercase tracking-wider text-muted-foreground">
                Saham
              </p>
              {stockResults.map((stock) => (
                <button
                  key={stock.ticker}
                  className="flex w-full items-center justify-between px-3 py-2 text-sm hover:bg-accent transition-colors"
                  onClick={() => {
                    navigate(`/stock/${stock.ticker}`);
                    setQuery("");
                  }}
                >
                  <div className="flex items-center gap-3">
                    <span className="font-mono font-semibold text-primary w-14 shrink-0">
                      {stock.ticker.replace(".JK", "")}
                    </span>
                    <span className="text-muted-foreground text-xs truncate">{stock.name}</span>
                  </div>
                  <span className={`font-mono text-xs shrink-0 ${stock.changePercent >= 0 ? "text-gain" : "text-loss"}`}>
                    {stock.changePercent >= 0 ? "+" : ""}{stock.changePercent.toFixed(2)}%
                  </span>
                </button>
              ))}
            </div>
          )}

          {investorResults.length > 0 && (
            <div className={stockResults.length > 0 ? "border-t border-border/50" : ""}>
              <p className="px-3 pt-2 pb-1 text-[10px] font-bold uppercase tracking-wider text-muted-foreground">
                Investor
              </p>
              {investorResults.map((inv) => {
                const Icon = TYPE_ICON[inv.investorType];
                const isExpanded = expandedInvestor === inv.investorId;
                return (
                  <div key={inv.investorId}>
                    <button
                      className="flex w-full items-center justify-between px-3 py-2 hover:bg-accent transition-colors"
                      onClick={() =>
                        setExpandedInvestor(isExpanded ? null : inv.investorId)
                      }
                    >
                      <div className="flex items-center gap-2">
                        <Icon className={`h-3.5 w-3.5 shrink-0 ${TYPE_COLOR[inv.investorType]}`} />
                        <span className="text-sm font-semibold text-foreground">{inv.investorName}</span>
                        <span className="text-[10px] rounded px-1.5 py-0.5 bg-secondary text-muted-foreground">
                          {inv.investorType}
                        </span>
                        <span className={`text-[10px] rounded px-1.5 py-0.5 ${inv.origin === "Foreign" ? "bg-sky-500/10 text-sky-400" : "bg-emerald-500/10 text-emerald-400"}`}>
                          {inv.origin === "Foreign" ? "Asing" : "Lokal"}
                        </span>
                      </div>
                      <span className="text-xs font-bold text-primary">{inv.tickers.length} saham</span>
                    </button>

                    {isExpanded && (
                      <div className="px-3 pb-2 bg-secondary/20">
                        <p className="text-[10px] text-muted-foreground mb-1.5">Portfolio (klik untuk detail):</p>
                        <div className="flex flex-wrap gap-1">
                          {inv.tickers.slice(0, 20).map((ticker) => (
                            <button
                              key={ticker}
                              onClick={() => {
                                navigate(`/stock/${ticker}`);
                                setQuery("");
                              }}
                              className="rounded px-2 py-0.5 text-[11px] font-mono font-bold bg-primary/10 text-primary hover:bg-primary/20 transition-colors"
                            >
                              {ticker.replace(".JK", "")}
                            </button>
                          ))}
                          {inv.tickers.length > 20 && (
                            <span className="text-[10px] text-muted-foreground self-center">
                              +{inv.tickers.length - 20} lagi
                            </span>
                          )}
                        </div>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default SearchBar;
