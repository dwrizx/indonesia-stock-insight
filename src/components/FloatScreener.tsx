import { useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { ChevronDown, ChevronUp, ArrowUpDown, Info } from "lucide-react";
import { ownershipRecords } from "@/data/ownershipData";
import { stocks, formatRupiah } from "@/data/stockData";
import { computeFreeFloat } from "@/lib/ownership";
import type { FreeFloatResult } from "@/lib/ownership";

type RiskBand = "Semua" | "Tinggi" | "Sedang" | "Rendah" | "Sangat Rendah" | "Tidak Ada Data";
type SortCol = "ticker" | "freeFloat" | "strategic" | "marketCap" | "changePercent";
type SortDir = "asc" | "desc";

interface FloatRow {
  ticker: string;
  name: string;
  sector: string;
  price: number;
  changePercent: number;
  marketCap: number;
  ff: FreeFloatResult;
  riskBand: RiskBand;
}

function getRiskBand(freeFloatPct: number | null): RiskBand {
  if (freeFloatPct === null) return "Tidak Ada Data";
  if (freeFloatPct < 15) return "Sangat Rendah";
  if (freeFloatPct < 30) return "Rendah";
  if (freeFloatPct < 50) return "Sedang";
  return "Tinggi";
}

const RISK_STYLE: Record<RiskBand, { badge: string; bar: string }> = {
  Tinggi: { badge: "bg-gain/15 text-gain border border-gain/30", bar: "bg-gain" },
  Sedang: { badge: "bg-yellow-500/15 text-yellow-400 border border-yellow-500/30", bar: "bg-yellow-400" },
  Rendah: { badge: "bg-orange-500/15 text-orange-400 border border-orange-500/30", bar: "bg-orange-400" },
  "Sangat Rendah": { badge: "bg-loss/15 text-loss border border-loss/30", bar: "bg-loss" },
  "Tidak Ada Data": { badge: "bg-muted/30 text-muted-foreground border border-border", bar: "bg-muted" },
  Semua: { badge: "", bar: "" },
};

const RISK_BANDS: RiskBand[] = ["Semua", "Tinggi", "Sedang", "Rendah", "Sangat Rendah", "Tidak Ada Data"];

const FloatScreener = () => {
  const navigate = useNavigate();
  const [riskFilter, setRiskFilter] = useState<RiskBand>("Semua");
  const [sectorFilter, setSectorFilter] = useState("Semua");
  const [sortCol, setSortCol] = useState<SortCol>("freeFloat");
  const [sortDir, setSortDir] = useState<SortDir>("asc");
  const [page, setPage] = useState(1);
  const PAGE_SIZE = 50;

  const rows = useMemo<FloatRow[]>(() => {
    return stocks.map((stock) => {
      const ff = computeFreeFloat(ownershipRecords, stock.ticker);
      return {
        ticker: stock.ticker.replace(".JK", ""),
        name: stock.name,
        sector: stock.sector,
        price: stock.price,
        changePercent: stock.changePercent,
        marketCap: stock.marketCap,
        ff,
        riskBand: getRiskBand(ff.freeFloatPct),
      };
    });
  }, []);

  const sectors = useMemo(
    () => ["Semua", ...Array.from(new Set(stocks.map((s) => s.sector))).sort()],
    [],
  );

  const filtered = useMemo(() => {
    return rows
      .filter((r) => riskFilter === "Semua" || r.riskBand === riskFilter)
      .filter((r) => sectorFilter === "Semua" || r.sector === sectorFilter)
      .sort((a, b) => {
        let aVal: number, bVal: number;
        switch (sortCol) {
          case "ticker":
            return sortDir === "asc"
              ? a.ticker.localeCompare(b.ticker)
              : b.ticker.localeCompare(a.ticker);
          case "freeFloat":
            aVal = a.ff.freeFloatPct ?? -1;
            bVal = b.ff.freeFloatPct ?? -1;
            break;
          case "strategic":
            aVal = a.ff.strategicPct;
            bVal = b.ff.strategicPct;
            break;
          case "marketCap":
            aVal = a.marketCap;
            bVal = b.marketCap;
            break;
          case "changePercent":
            aVal = a.changePercent;
            bVal = b.changePercent;
            break;
          default:
            return 0;
        }
        return sortDir === "asc" ? aVal - bVal : bVal - aVal;
      });
  }, [rows, riskFilter, sectorFilter, sortCol, sortDir]);

  const totalPages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));
  const paginated = filtered.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);

  const riskCounts = useMemo(() => {
    const counts: Partial<Record<RiskBand, number>> = {};
    for (const r of rows) {
      counts[r.riskBand] = (counts[r.riskBand] ?? 0) + 1;
    }
    return counts;
  }, [rows]);

  const withData = rows.filter((r) => r.ff.hasResearchedData).length;

  const toggleSort = (col: SortCol) => {
    if (sortCol === col) setSortDir((d) => (d === "asc" ? "desc" : "asc"));
    else { setSortCol(col); setSortDir("asc"); }
    setPage(1);
  };

  const SortIcon = ({ col }: { col: SortCol }) =>
    sortCol === col ? (
      sortDir === "asc" ? <ChevronUp className="h-3 w-3" /> : <ChevronDown className="h-3 w-3" />
    ) : (
      <ArrowUpDown className="h-3 w-3 opacity-40" />
    );

  return (
    <div className="space-y-5">
      {/* Header */}
      <div className="rounded-2xl border border-border bg-card p-5 space-y-4">
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div>
            <h2 className="text-lg font-extrabold text-foreground">Float Screener</h2>
            <p className="text-xs text-muted-foreground mt-0.5">
              Metodologi MSCI: Corporate &amp; Bank = strategic (non-free-float) ·
              Fund &amp; Individual = free float
            </p>
          </div>
          <div className="flex items-center gap-2 rounded-xl border border-border bg-secondary/40 px-3 py-2 text-xs text-muted-foreground">
            <Info className="h-3.5 w-3.5 text-primary" />
            <span>{withData} dari {rows.length} saham memiliki data riset</span>
          </div>
        </div>

        {/* Risk band summary cards */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          {(["Tinggi", "Sedang", "Rendah", "Sangat Rendah"] as RiskBand[]).map((band) => (
            <button
              key={band}
              onClick={() => { setRiskFilter(riskFilter === band ? "Semua" : band); setPage(1); }}
              className={`rounded-xl border p-3 text-left transition-all ${
                riskFilter === band
                  ? RISK_STYLE[band].badge + " scale-[0.98]"
                  : "border-border bg-card/60 hover:border-primary/30"
              }`}
            >
              <p className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">Float {band}</p>
              <p className="text-2xl font-extrabold mt-1 text-foreground">{riskCounts[band] ?? 0}</p>
              <p className="text-[10px] text-muted-foreground">saham</p>
            </button>
          ))}
        </div>

        {/* Filters */}
        <div className="flex flex-wrap items-center gap-2">
          <span className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">Risk:</span>
          {RISK_BANDS.map((band) => (
            <button
              key={band}
              onClick={() => { setRiskFilter(band); setPage(1); }}
              className={`rounded-lg px-2.5 py-1 text-[11px] font-semibold border transition-all ${
                riskFilter === band
                  ? "bg-primary/15 border-primary/40 text-primary"
                  : "bg-secondary/30 border-border text-muted-foreground hover:text-foreground"
              }`}
            >
              {band === "Semua" ? "Semua" : band}
              {band !== "Semua" && (
                <span className="ml-1 opacity-60">({riskCounts[band] ?? 0})</span>
              )}
            </button>
          ))}
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <span className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">Sektor:</span>
          <div className="flex flex-wrap gap-1.5">
            {sectors.map((s) => (
              <button
                key={s}
                onClick={() => { setSectorFilter(s); setPage(1); }}
                className={`rounded-lg px-2.5 py-1 text-[11px] font-semibold border transition-all ${
                  sectorFilter === s
                    ? "bg-primary/15 border-primary/40 text-primary"
                    : "bg-secondary/30 border-border text-muted-foreground hover:text-foreground"
                }`}
              >
                {s}
              </button>
            ))}
          </div>
        </div>

        <p className="text-xs text-muted-foreground">
          Menampilkan <strong className="text-foreground">{filtered.length}</strong> saham
        </p>
      </div>

      {/* Table */}
      <div className="rounded-xl border border-border bg-card overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-xs">
            <thead>
              <tr className="border-b border-border bg-secondary/30">
                <th className="px-4 py-3 text-left font-bold text-muted-foreground w-8">#</th>
                <th className="px-3 py-3 text-left">
                  <button onClick={() => toggleSort("ticker")} className="flex items-center gap-1 font-bold text-muted-foreground hover:text-foreground">
                    Saham <SortIcon col="ticker" />
                  </button>
                </th>
                <th className="px-3 py-3 text-left font-bold text-muted-foreground hidden md:table-cell">Sektor</th>
                <th className="px-3 py-3 text-left">
                  <button onClick={() => toggleSort("freeFloat")} className="flex items-center gap-1 font-bold text-muted-foreground hover:text-foreground">
                    Free Float % <SortIcon col="freeFloat" />
                  </button>
                </th>
                <th className="px-3 py-3 text-left hidden sm:table-cell">
                  <button onClick={() => toggleSort("strategic")} className="flex items-center gap-1 font-bold text-muted-foreground hover:text-foreground">
                    Strategic % <SortIcon col="strategic" />
                  </button>
                </th>
                <th className="px-3 py-3 text-left font-bold text-muted-foreground hidden lg:table-cell">Strategic Holders</th>
                <th className="px-3 py-3 text-left font-bold text-muted-foreground">Risk</th>
                <th className="px-3 py-3 text-right hidden sm:table-cell">
                  <button onClick={() => toggleSort("marketCap")} className="flex items-center gap-1 font-bold text-muted-foreground hover:text-foreground ml-auto">
                    Mkt Cap <SortIcon col="marketCap" />
                  </button>
                </th>
                <th className="px-3 py-3 text-right">
                  <button onClick={() => toggleSort("changePercent")} className="flex items-center gap-1 font-bold text-muted-foreground hover:text-foreground ml-auto">
                    % <SortIcon col="changePercent" />
                  </button>
                </th>
              </tr>
            </thead>
            <tbody>
              {paginated.map((row, i) => {
                const ffPct = row.ff.freeFloatPct;
                const style = RISK_STYLE[row.riskBand];
                const rowIndex = (page - 1) * PAGE_SIZE + i + 1;
                return (
                  <tr
                    key={row.ticker}
                    className="border-b border-border/50 hover:bg-accent/30 cursor-pointer transition-colors"
                    onClick={() => navigate(`/stock/${row.ticker}.JK`)}
                  >
                    <td className="px-4 py-3 text-muted-foreground font-mono">{rowIndex}</td>
                    <td className="px-3 py-3">
                      <div>
                        <span className="font-mono font-bold text-primary">{row.ticker}</span>
                        <p className="text-[10px] text-muted-foreground truncate max-w-[120px]">{row.name}</p>
                      </div>
                    </td>
                    <td className="px-3 py-3 text-muted-foreground hidden md:table-cell">{row.sector}</td>
                    <td className="px-3 py-3">
                      {ffPct !== null ? (
                        <div className="space-y-1">
                          <span className="font-mono font-bold text-foreground">{ffPct.toFixed(1)}%</span>
                          <div className="w-20 h-1.5 rounded-full bg-secondary overflow-hidden">
                            <div
                              className={`h-full rounded-full ${style.bar}`}
                              style={{ width: `${ffPct}%` }}
                            />
                          </div>
                        </div>
                      ) : (
                        <span className="text-muted-foreground/50">—</span>
                      )}
                    </td>
                    <td className="px-3 py-3 hidden sm:table-cell">
                      {row.ff.hasResearchedData ? (
                        <span className="font-mono text-foreground">{row.ff.strategicPct.toFixed(1)}%</span>
                      ) : (
                        <span className="text-muted-foreground/50">—</span>
                      )}
                    </td>
                    <td className="px-3 py-3 hidden lg:table-cell">
                      <div className="flex flex-wrap gap-1">
                        {row.ff.strategicHolders.slice(0, 2).map((h) => (
                          <span key={h.investorName} className="rounded px-1.5 py-0.5 text-[9px] bg-secondary/60 text-muted-foreground">
                            {h.investorName} {h.percentage.toFixed(1)}%
                          </span>
                        ))}
                        {row.ff.strategicHolders.length > 2 && (
                          <span className="text-[9px] text-muted-foreground/60">+{row.ff.strategicHolders.length - 2}</span>
                        )}
                        {row.ff.strategicHolders.length === 0 && row.ff.hasResearchedData && (
                          <span className="text-[10px] text-gain/70">No strategic holders</span>
                        )}
                      </div>
                    </td>
                    <td className="px-3 py-3">
                      <span className={`rounded-lg px-2 py-0.5 text-[10px] font-bold ${style.badge}`}>
                        {row.riskBand}
                      </span>
                    </td>
                    <td className="px-3 py-3 text-right font-mono text-foreground hidden sm:table-cell">
                      {formatRupiah(row.marketCap)}
                    </td>
                    <td className={`px-3 py-3 text-right font-mono font-bold ${row.changePercent >= 0 ? "text-gain" : "text-loss"}`}>
                      {row.changePercent >= 0 ? "+" : ""}{row.changePercent.toFixed(2)}%
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="flex items-center justify-between px-4 py-3 border-t border-border">
            <p className="text-xs text-muted-foreground">Halaman {page} / {totalPages}</p>
            <div className="flex items-center gap-1">
              <button
                onClick={() => setPage((p) => Math.max(1, p - 1))}
                disabled={page === 1}
                className="rounded-md border border-border px-2.5 py-1.5 text-xs font-semibold disabled:opacity-50"
              >
                Sebelumnya
              </button>
              <button
                onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                disabled={page === totalPages}
                className="rounded-md border border-border px-2.5 py-1.5 text-xs font-semibold disabled:opacity-50"
              >
                Selanjutnya
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Methodology note */}
      <div className="rounded-xl border border-border/50 bg-card/40 p-4 text-xs text-muted-foreground space-y-1.5">
        <p className="font-bold text-foreground">Tentang Metodologi</p>
        <p>
          <strong className="text-foreground">Free Float</strong> dihitung dengan mengurangkan kepemilikan strategis dari 100%.
          Hanya data dengan provenance <em>researched</em> yang digunakan untuk perhitungan.
        </p>
        <p>
          <strong className="text-foreground">Strategic (non-free-float):</strong> Investor jenis Corporate dan Bank —
          biasanya grup konglomerat, pemerintah/BUMN, dan bank pemegang saham pengendali.
        </p>
        <p>
          <strong className="text-foreground">Free Float:</strong> Investor jenis Fund (reksa dana, dana pensiun, asuransi)
          dan Individual (investor ritel).
        </p>
        <p className="text-muted-foreground/60">
          Saham bertanda "Tidak Ada Data" belum memiliki data riset kepemilikan yang terverifikasi.
        </p>
      </div>
    </div>
  );
};

export default FloatScreener;
