# Instant Search + Float Screener Implementation Plan

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Add (1) global instant search for tickers AND investor names with expandable inline portfolio, and (2) a Float Screener tab using MSCI methodology (Corporate/Bank = strategic/non-free-float, Fund/Individual = free float).

**Architecture:** `computeFreeFloat` pure function added to `ownership.ts`, tested in isolation. `FloatScreener` component reads from `ownershipRecords` + `stocks`. `SearchBar` extended to deduplicate investors from `ownershipRecords` and show grouped results. Index.tsx gets a new `"float"` tab.

**Tech Stack:** React + TypeScript + Vite, Tailwind CSS, existing `ownershipRecords`, `stocks`, `ownership.ts` utils.

---

## Context

### File map
- `src/lib/ownership.ts` — pure functions; add `computeFreeFloat` here
- `src/test/ownership.test.ts` — existing tests; add free-float tests here
- `src/components/SearchBar.tsx` — upgrade investor search
- `src/components/FloatScreener.tsx` — NEW component
- `src/pages/Index.tsx` — add "float" tab (lines ~92-102 tab type, ~454-538 tab nav, ~541+ tab content)
- `src/components/TabSkeletons.tsx` — add `FloatSkeleton`
- `src/data/ownershipData.ts` — read-only; exports `ownershipRecords`, `ownershipUniverseTickers`
- `src/data/stockData.ts` — read-only; exports `stocks`, `Stock` interface

### MSCI Free Float Methodology (simplified)
- **Strategic (non-free-float):** `InvestorType === "Corporate"` or `InvestorType === "Bank"`
- **Free float:** `InvestorType === "Fund"` or `InvestorType === "Individual"`
- Calculation: only use `provenance === "researched"` records
  - `strategicPct = sum of % held by Corporate + Bank investors (researched only)`
  - `freeFloatPct = 100 - strategicPct` (clamped 0–100)
- Tickers with zero researched records → `freeFloatPct: null` (no data)

### Risk level bands
```
freeFloatPct < 15   → "Sangat Rendah"  (badge: red)
15  ≤ ff < 30       → "Rendah"          (badge: orange)
30  ≤ ff < 50       → "Sedang"          (badge: yellow)
ff  ≥ 50            → "Tinggi"          (badge: green)
null                → "Tidak Ada Data"  (badge: gray)
```

### InvestorType values (from `src/lib/ownership.ts`)
```ts
export type InvestorType = "Bank" | "Fund" | "Corporate" | "Individual";
```

---

## Task 1: Add `computeFreeFloat` to `ownership.ts`

**Files:**
- Modify: `src/lib/ownership.ts` (append at end)
- Test: `src/test/ownership.test.ts` (append new `describe` block)

### Step 1: Append the function to `src/lib/ownership.ts`

Add this at the end of the file (after `getTickerUltimateOwner`):

```ts
export interface FreeFloatResult {
  ticker: string;
  freeFloatPct: number | null;   // null = no researched data
  strategicPct: number;
  strategicHolders: { investorName: string; investorType: InvestorType; percentage: number }[];
  hasResearchedData: boolean;
}

export function computeFreeFloat(
  records: OwnershipRecord[],
  ticker: string,
): FreeFloatResult {
  const researched = records.filter(
    (r) => r.ticker === ticker && r.provenance === "researched",
  );

  if (!researched.length) {
    return {
      ticker,
      freeFloatPct: null,
      strategicPct: 0,
      strategicHolders: [],
      hasResearchedData: false,
    };
  }

  const strategic = researched.filter(
    (r) => r.investorType === "Corporate" || r.investorType === "Bank",
  );

  const strategicPct = round2(
    strategic.reduce((sum, r) => sum + r.percentage, 0),
  );

  const freeFloatPct = Math.max(0, Math.min(100, round2(100 - strategicPct)));

  return {
    ticker,
    freeFloatPct,
    strategicPct,
    strategicHolders: strategic.map((r) => ({
      investorName: r.investorName,
      investorType: r.investorType,
      percentage: r.percentage,
    })),
    hasResearchedData: true,
  };
}
```

### Step 2: Add tests in `src/test/ownership.test.ts`

Find the end of the file and append:

```ts
describe("computeFreeFloat", () => {
  const records: OwnershipRecord[] = [
    {
      ticker: "BBCA.JK",
      investorId: "djarum",
      investorName: "Djarum Group",
      investorType: "Corporate",
      origin: "Local",
      shares: 100,
      percentage: 54.94,
      provenance: "researched",
    },
    {
      ticker: "BBCA.JK",
      investorId: "blackrock",
      investorName: "BlackRock",
      investorType: "Fund",
      origin: "Foreign",
      shares: 50,
      percentage: 4.0,
      provenance: "researched",
    },
    {
      ticker: "BBCA.JK",
      investorId: "est-local",
      investorName: "Est Local",
      investorType: "Individual",
      origin: "Local",
      shares: 10,
      percentage: 5.0,
      provenance: "estimated",   // should be ignored
    },
  ];

  it("returns freeFloatPct = 100 - strategicPct", () => {
    const result = computeFreeFloat(records, "BBCA.JK");
    expect(result.strategicPct).toBe(54.94);
    expect(result.freeFloatPct).toBe(45.06);
    expect(result.hasResearchedData).toBe(true);
  });

  it("ignores estimated records", () => {
    const result = computeFreeFloat(records, "BBCA.JK");
    expect(result.strategicHolders).toHaveLength(1);
    expect(result.strategicHolders[0]?.investorName).toBe("Djarum Group");
  });

  it("returns null freeFloatPct for ticker with no researched data", () => {
    const result = computeFreeFloat(records, "UNKNOWN.JK");
    expect(result.freeFloatPct).toBeNull();
    expect(result.hasResearchedData).toBe(false);
  });

  it("clamps freeFloatPct to 0 if strategic > 100", () => {
    const bigRecords: OwnershipRecord[] = [
      {
        ticker: "X.JK",
        investorId: "c1",
        investorName: "Corp A",
        investorType: "Corporate",
        origin: "Local",
        shares: 1,
        percentage: 60,
        provenance: "researched",
      },
      {
        ticker: "X.JK",
        investorId: "c2",
        investorName: "Corp B",
        investorType: "Corporate",
        origin: "Local",
        shares: 1,
        percentage: 50,
        provenance: "researched",
      },
    ];
    const result = computeFreeFloat(bigRecords, "X.JK");
    expect(result.freeFloatPct).toBe(0);
  });
});
```

### Step 3: Add the import at the top of the test file

In `src/test/ownership.test.ts`, find the existing import line for `ownership` functions and add `computeFreeFloat` to it. For example, if it currently says:
```ts
import { filterOwnershipRecords, ... } from "@/lib/ownership";
```
Add `computeFreeFloat` to that import. Also check the existing import for `OwnershipRecord` type.

### Step 4: Run tests

```bash
bun run test src/test/ownership.test.ts
```

Expected: all existing tests pass + new `computeFreeFloat` describe block passes (4 tests).

### Step 5: Commit

```bash
git add src/lib/ownership.ts src/test/ownership.test.ts
git commit -m "feat(ownership): add computeFreeFloat with MSCI methodology"
```

---

## Task 2: FloatScreener component

**Files:**
- Create: `src/components/FloatScreener.tsx`

### Step 1: Create `src/components/FloatScreener.tsx`

```tsx
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
```

### Step 2: Verify build

```bash
npx tsc --noEmit
```

Expected: no errors.

### Step 3: Commit

```bash
git add src/components/FloatScreener.tsx
git commit -m "feat(float): add FloatScreener component with MSCI methodology"
```

---

## Task 3: Upgrade SearchBar for instant investor search

**Files:**
- Modify: `src/components/SearchBar.tsx`

### Step 1: Replace `src/components/SearchBar.tsx` with the upgraded version

```tsx
import { Search, Building2, User, Landmark, TrendingUp, TrendingDown } from "lucide-react";
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
```

### Step 2: Verify build

```bash
npx tsc --noEmit
```

Expected: no errors.

### Step 3: Commit

```bash
git add src/components/SearchBar.tsx
git commit -m "feat(search): add investor instant search with expandable portfolio"
```

---

## Task 4: Wire FloatScreener into Index.tsx + add feature discovery section

**Files:**
- Modify: `src/pages/Index.tsx`
- Modify: `src/components/TabSkeletons.tsx`

### Step 1: Add `FloatSkeleton` to `src/components/TabSkeletons.tsx`

Read the file first, then add this export at the end:

```tsx
export const FloatSkeleton = () => (
  <div className="space-y-4 animate-pulse">
    <div className="h-48 rounded-2xl bg-secondary/60" />
    <div className="h-96 rounded-xl bg-secondary/40" />
  </div>
);
```

### Step 2: Modify `src/pages/Index.tsx`

**2a. Add import** — in the imports section (after existing component imports), add:
```tsx
import FloatScreener from "@/components/FloatScreener";
import { FloatSkeleton } from "@/components/TabSkeletons";
```

**2b. Add `"float"` to the tab type union** — find:
```tsx
  | "conglomerates"
>("overview");
```
Replace with:
```tsx
  | "conglomerates"
  | "float"
>("overview");
```

**2c. Add the Float tab button** — in the tab nav array (the `.map` with the array starting with `{ key: "overview"...}`), append after the `conglomerates` tab entry:
```tsx
{
  key: "float" as const,
  label: "Float Screener",
  icon: BarChart2,
  badge: null,
},
```

**2d. Add skeleton handler** — in the skeleton section find `{activeTab === "conglomerates" && <SectorSkeleton />}` and after it add:
```tsx
{activeTab === "float" && <FloatSkeleton />}
```

**2e. Add tab content** — after the `{activeTab === "conglomerates" && ...}` block, add:
```tsx
{activeTab === "float" && (
  <motion.div
    key="float"
    initial={{ opacity: 0, y: 10 }}
    animate={{ opacity: 1, y: 0 }}
    exit={{ opacity: 0, y: -10 }}
    transition={{ duration: 0.3 }}
  >
    <FloatScreener />
  </motion.div>
)}
```

**2f. Add Float Screener quick-link button** — in the hero section quick-link buttons (the `.map` over `[{key:"stocks"...}]` plus the two separate buttons for ownership/conglomerates), add after the conglomerate button:
```tsx
<button
  onClick={() => switchTab("float")}
  className="flex items-center gap-1.5 rounded-lg border border-border bg-card/70 px-3 py-1.5 text-[11px] font-semibold text-foreground hover:border-primary/35"
>
  <BarChart2 className="h-3.5 w-3.5 text-primary" />
  Float Screener
</button>
```

### Step 3: Verify build

```bash
npx tsc --noEmit
npx vite build 2>&1 | tail -6
```

Expected: clean build, no TypeScript errors.

### Step 4: Commit

```bash
git add src/pages/Index.tsx src/components/TabSkeletons.tsx
git commit -m "feat(ui): add Float Screener tab and quick-link to hero section"
```

---

## Final verification

```bash
bun run test
npx tsc --noEmit
npx vite build 2>&1 | tail -6
```

All tests pass, no TypeScript errors, build succeeds.
