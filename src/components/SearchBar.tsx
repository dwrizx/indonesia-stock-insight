import { Search } from "lucide-react";
import { useState } from "react";
import { stocks } from "@/data/stockData";
import { useNavigate } from "react-router-dom";

const SearchBar = () => {
  const [query, setQuery] = useState("");
  const [focused, setFocused] = useState(false);
  const navigate = useNavigate();

  const filtered = query.length > 0
    ? stocks.filter(s =>
        s.ticker.toLowerCase().includes(query.toLowerCase()) ||
        s.name.toLowerCase().includes(query.toLowerCase())
      )
    : [];

  return (
    <div className="relative w-full max-w-md">
      <div className={`flex items-center gap-2 rounded-lg border px-3 py-2 transition-all ${focused ? "border-primary glow-primary" : "border-border bg-secondary/50"}`}>
        <Search className="h-4 w-4 text-muted-foreground" />
        <input
          type="text"
          placeholder="Cari saham... (contoh: BBCA, Bank Central Asia)"
          className="w-full bg-transparent text-sm text-foreground placeholder:text-muted-foreground outline-none"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          onFocus={() => setFocused(true)}
          onBlur={() => setTimeout(() => setFocused(false), 200)}
        />
      </div>
      {focused && filtered.length > 0 && (
        <div className="absolute top-full left-0 right-0 z-50 mt-1 rounded-lg border border-border bg-popover p-1 shadow-xl">
          {filtered.map((stock) => (
            <button
              key={stock.ticker}
              className="flex w-full items-center justify-between rounded-md px-3 py-2 text-sm hover:bg-accent transition-colors"
              onClick={() => {
                navigate(`/stock/${stock.ticker}`);
                setQuery("");
              }}
            >
              <div className="flex items-center gap-3">
                <span className="font-mono font-semibold text-primary">{stock.ticker.replace(".JK", "")}</span>
                <span className="text-muted-foreground">{stock.name}</span>
              </div>
              <span className={`font-mono text-xs ${stock.change >= 0 ? "text-gain" : "text-loss"}`}>
                {stock.change >= 0 ? "+" : ""}{stock.changePercent.toFixed(2)}%
              </span>
            </button>
          ))}
        </div>
      )}
    </div>
  );
};

export default SearchBar;
