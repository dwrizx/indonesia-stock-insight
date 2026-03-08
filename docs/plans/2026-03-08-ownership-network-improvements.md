# OwnershipNetwork Improvements Implementation Plan

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Upgrade the OwnershipNetwork component with D3 hover highlighting, performance cap for "All" view, investor-type breakdown bars, table search, sortable headers, and inline ownership % bars.

**Architecture:** All changes are self-contained in `src/components/OwnershipNetwork.tsx`. No new files. New state (`tableSort`, `tableSearch`), new memos (`typeBreakdown`, capped graph), D3 hover effects, and updated JSX panels.

**Tech Stack:** React, D3 v7, TypeScript, Tailwind CSS, lucide-react

---

### Task 1: Add table search + sort state and sorted rows memo

**Files:**
- Modify: `src/components/OwnershipNetwork.tsx`

**Step 1: Add two new state variables after existing state declarations (line ~101)**

Find the block:
```tsx
  const [tableTicker, setTableTicker] = useState<string>(tickers[0] ?? "");
```

Add immediately after it:
```tsx
  const [tableSearch, setTableSearch] = useState("");
  const [tableSort, setTableSort] = useState<{
    key: "investorName" | "investorType" | "origin" | "shares" | "percentage";
    dir: "asc" | "desc";
  }>({ key: "percentage", dir: "desc" });
```

**Step 2: Add the sortedTableRows memo after the existing `tableRows` memo**

Find:
```tsx
  const tableRows = useMemo(
    () => getOwnershipByTicker(filteredRecords, tableTicker),
    [filteredRecords, tableTicker],
  );
```

Add immediately after:
```tsx
  const sortedTableRows = useMemo(() => {
    let rows = [...tableRows];
    if (tableSearch.trim()) {
      const q = tableSearch.toLowerCase();
      rows = rows.filter((r) =>
        r.investorName.toLowerCase().includes(q),
      );
    }
    rows.sort((a, b) => {
      const { key, dir } = tableSort;
      const aVal = a[key];
      const bVal = b[key];
      if (typeof aVal === "string" && typeof bVal === "string") {
        return dir === "asc"
          ? aVal.localeCompare(bVal)
          : bVal.localeCompare(aVal);
      }
      return dir === "asc"
        ? (aVal as number) - (bVal as number)
        : (bVal as number) - (aVal as number);
    });
    return rows;
  }, [tableRows, tableSearch, tableSort]);
```

**Step 3: Add toggleTableSort helper after the existing `openIndex` helper or near other helpers**

```tsx
  const toggleTableSort = (
    key: typeof tableSort.key,
  ) => {
    setTableSort((prev) =>
      prev.key === key
        ? { key, dir: prev.dir === "desc" ? "asc" : "desc" }
        : { key, dir: "desc" },
    );
  };
```

**Step 4: Verify TypeScript compiles**
```bash
npx tsc --noEmit
```
Expected: No errors.

**Step 5: Commit**
```bash
git add src/components/OwnershipNetwork.tsx
git commit -m "feat(ownership): add table search state, sort state, and sortedTableRows memo"
```

---

### Task 2: Add investor type breakdown memo

**Files:**
- Modify: `src/components/OwnershipNetwork.tsx`

**Step 1: Add import for `InvestorType` if not already imported (it is, skip). Then add typeBreakdown memo after `activeOwner` memo**

Find:
```tsx
  const activeOwner = useMemo(
    () => getTickerUltimateOwner(ownershipRecords, tableTicker),
    [tableTicker],
  );
```

Add immediately after:
```tsx
  const TYPE_COLORS: Record<InvestorType, string> = {
    Bank: "bg-blue-500",
    Fund: "bg-violet-500",
    Corporate: "bg-amber-500",
    Individual: "bg-rose-500",
  };

  const typeBreakdown = useMemo(() => {
    const rows = getOwnershipByTicker(filteredRecords, tableTicker);
    const types: InvestorType[] = ["Bank", "Fund", "Corporate", "Individual"];
    return types
      .map((type) => {
        const typeRows = rows.filter((r) => r.investorType === type);
        return {
          type,
          percentage: typeRows.reduce((sum, r) => sum + r.percentage, 0),
          count: typeRows.length,
        };
      })
      .filter((t) => t.percentage > 0);
  }, [filteredRecords, tableTicker]);
```

**Step 2: Verify TypeScript compiles**
```bash
npx tsc --noEmit
```
Expected: No errors.

**Step 3: Commit**
```bash
git add src/components/OwnershipNetwork.tsx
git commit -m "feat(ownership): add investor type breakdown memo"
```

---

### Task 3: Cap graph nodes in "All" view for performance

**Files:**
- Modify: `src/components/OwnershipNetwork.tsx`

**Step 1: Replace the existing `graphData` useMemo**

Find and replace:
```tsx
  const graphData = useMemo(
    () =>
      buildOwnershipGraph(filteredRecords, {
        ticker: networkTicker === "All" ? undefined : networkTicker,
      }),
    [filteredRecords, networkTicker],
  );
```

Replace with:
```tsx
  const MAX_ALL_VIEW_NODES = 60;

  const graphData = useMemo(() => {
    const raw = buildOwnershipGraph(filteredRecords, {
      ticker: networkTicker === "All" ? undefined : networkTicker,
    });

    if (networkTicker !== "All" || raw.nodes.length <= MAX_ALL_VIEW_NODES) {
      return raw;
    }

    // Keep only the most-connected nodes for performance
    const topNodes = [...raw.nodes]
      .sort((a, b) => b.degree - a.degree)
      .slice(0, MAX_ALL_VIEW_NODES);
    const topIds = new Set(topNodes.map((n) => n.id));

    return {
      nodes: topNodes,
      links: raw.links.filter((l) => {
        const srcId =
          typeof l.source === "string"
            ? l.source
            : (l.source as SimNode).id;
        const tgtId =
          typeof l.target === "string"
            ? l.target
            : (l.target as SimNode).id;
        return topIds.has(srcId) && topIds.has(tgtId);
      }),
    };
  }, [filteredRecords, networkTicker]);
```

**Step 2: Verify TypeScript compiles**
```bash
npx tsc --noEmit
```
Expected: No errors.

**Step 3: Commit**
```bash
git add src/components/OwnershipNetwork.tsx
git commit -m "feat(ownership): cap network graph to 60 nodes in All view for performance"
```

---

### Task 4: Add D3 hover highlighting (dim non-connected nodes)

**Files:**
- Modify: `src/components/OwnershipNetwork.tsx`

**Step 1: In the D3 useEffect, add hover events on nodeLayer AFTER the existing `nodeLayer.on("dblclick", ...)` handler**

Find:
```tsx
    nodeLayer.on("dblclick", (_event, node) => {
      if (node.kind === "ticker" && node.ticker) {
        navigate(`/stock/${node.ticker}`);
      }
    });
```

Add immediately after:
```tsx
    nodeLayer
      .on("mouseenter", (_event, hoveredNode) => {
        const connectedIds = new Set<string>([hoveredNode.id]);
        simLinks.forEach((link) => {
          const srcId =
            typeof link.source === "string"
              ? link.source
              : (link.source as SimNode).id;
          const tgtId =
            typeof link.target === "string"
              ? link.target
              : (link.target as SimNode).id;
          if (srcId === hoveredNode.id || tgtId === hoveredNode.id) {
            connectedIds.add(srcId);
            connectedIds.add(tgtId);
          }
        });

        nodeLayer.attr("opacity", (d) =>
          connectedIds.has(d.id) ? 1 : 0.12,
        );
        linkLayer.attr("stroke-opacity", (d) => {
          const srcId =
            typeof d.source === "string"
              ? d.source
              : (d.source as SimNode).id;
          const tgtId =
            typeof d.target === "string"
              ? d.target
              : (d.target as SimNode).id;
          return connectedIds.has(srcId) && connectedIds.has(tgtId)
            ? 0.8
            : 0.03;
        });
      })
      .on("mouseleave", () => {
        nodeLayer.attr("opacity", 1);
        linkLayer.attr("stroke-opacity", 0.45);
      });
```

**Step 2: Verify TypeScript compiles**
```bash
npx tsc --noEmit
```
Expected: No errors.

**Step 3: Commit**
```bash
git add src/components/OwnershipNetwork.tsx
git commit -m "feat(ownership): add D3 hover highlighting - dim non-connected nodes on hover"
```

---

### Task 5: Add node count badge + "showing top N" notice to network panel

**Files:**
- Modify: `src/components/OwnershipNetwork.tsx`

**Step 1: In JSX, find the SVG container div and add a node count badge above it**

Find:
```tsx
        <div className="mt-4 rounded-xl border border-border/70 bg-background/40 p-2">
          {graphData.nodes.length > 0 ? (
            <svg ref={svgRef} className="h-[500px] w-full" />
```

Replace with:
```tsx
        <div className="mt-4 rounded-xl border border-border/70 bg-background/40 p-2">
          <div className="mb-2 flex items-center justify-between px-1">
            <span className="text-[10px] text-foreground/60">
              {graphData.nodes.length} nodes · {graphData.links.length} links
              {networkTicker === "All" &&
                graphData.nodes.length === MAX_ALL_VIEW_NODES && (
                  <span className="ml-1 text-amber-600 dark:text-amber-400">
                    (top {MAX_ALL_VIEW_NODES} by connection)
                  </span>
                )}
            </span>
            <span className="text-[10px] text-foreground/50">
              Hover node to highlight · Drag to reposition
            </span>
          </div>
          {graphData.nodes.length > 0 ? (
            <svg ref={svgRef} className="h-[500px] w-full" />
```

**Step 2: Move `MAX_ALL_VIEW_NODES` constant to component scope (above the component function) so JSX can reference it. Move it from inside the useMemo to before `const OwnershipNetwork = () => {`**

Find (inside useMemo):
```tsx
  const MAX_ALL_VIEW_NODES = 60;

  const graphData = useMemo(() => {
```

Change to (remove const from inside useMemo, already defined at top level):
```tsx
  const graphData = useMemo(() => {
```

And add at top of file (before the component):
```tsx
const MAX_ALL_VIEW_NODES = 60;
```

**Step 3: Verify TypeScript compiles**
```bash
npx tsc --noEmit
```
Expected: No errors.

**Step 4: Commit**
```bash
git add src/components/OwnershipNetwork.tsx
git commit -m "feat(ownership): add node/link count badge and top-N notice to network panel"
```

---

### Task 6: Add investor type breakdown UI to Local vs Foreign panel

**Files:**
- Modify: `src/components/OwnershipNetwork.tsx`

**Step 1: In the Local vs Foreign card, add type breakdown after the Foreign button**

Find:
```tsx
            </button>
          </div>
        </div>

        <div className="rounded-xl border border-border bg-card p-4 lg:col-span-2">
```

Replace (add the type breakdown section before the closing `</div>` of the Local/Foreign card):
```tsx
            </button>

            {typeBreakdown.length > 0 && (
              <div className="rounded-lg border border-border/60 bg-secondary/40 p-3">
                <p className="mb-2 text-[10px] font-bold uppercase tracking-wider text-foreground/70">
                  By Investor Type
                </p>
                <div className="space-y-2">
                  {typeBreakdown.map(({ type, percentage, count }) => (
                    <button
                      key={type}
                      onClick={() => setInvestorType(type)}
                      className="w-full text-left"
                    >
                      <div className="flex items-center justify-between text-[11px] mb-0.5">
                        <span className="font-semibold text-foreground">
                          {type}
                          <span className="ml-1 text-foreground/50">
                            ({count})
                          </span>
                        </span>
                        <span className="font-mono font-bold text-foreground">
                          {percentage.toFixed(2)}%
                        </span>
                      </div>
                      <div className="h-1.5 rounded-full bg-border/70">
                        <div
                          className={`h-full rounded-full transition-all ${TYPE_COLORS[type as InvestorType]}`}
                          style={{
                            width: `${Math.min(percentage, 100)}%`,
                          }}
                        />
                      </div>
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>

        <div className="rounded-xl border border-border bg-card p-4 lg:col-span-2">
```

**Step 2: Verify TypeScript compiles**
```bash
npx tsc --noEmit
```
Expected: No errors.

**Step 3: Commit**
```bash
git add src/components/OwnershipNetwork.tsx
git commit -m "feat(ownership): add investor type breakdown bars to Local vs Foreign panel"
```

---

### Task 7: Add search input and sortable headers to Deep Ownership Table

**Files:**
- Modify: `src/components/OwnershipNetwork.tsx`

**Step 1: Add Search icon import if missing**

Find the existing lucide imports block (line ~2) and ensure `Search` is included:
```tsx
import {
  ArrowUpRight,
  Building2,
  FilterX,
  Globe2,
  Landmark,
  Network,
  Link2,
  UserRound,
  Search,
  ArrowUpDown,
  ArrowUp,
  ArrowDown,
} from "lucide-react";
```

**Step 2: Add search input above the table**

Find:
```tsx
          <div className="mt-3 overflow-x-auto rounded-lg border border-border/70">
            <table className="w-full text-xs">
```

Replace with:
```tsx
          <div className="mt-3 flex items-center gap-2">
            <div className="relative flex-1">
              <Search className="absolute left-2.5 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-muted-foreground" />
              <input
                type="text"
                placeholder="Cari nama investor..."
                value={tableSearch}
                onChange={(e) => setTableSearch(e.target.value)}
                className="w-full rounded-lg border border-border bg-secondary/50 py-1.5 pl-8 pr-3 text-xs text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-1 focus:ring-primary/50"
              />
            </div>
            {tableSearch && (
              <button
                onClick={() => setTableSearch("")}
                className="rounded-lg border border-border bg-secondary/70 px-2.5 py-1.5 text-[11px] font-semibold text-foreground hover:bg-accent"
              >
                Clear
              </button>
            )}
          </div>

          <div className="mt-2 overflow-x-auto rounded-lg border border-border/70">
            <table className="w-full text-xs">
```

**Step 3: Replace `<thead>` with sortable headers**

Find the entire `<thead>` block:
```tsx
              <thead className="bg-secondary/80">
                <tr>
                  <th className="px-3 py-2 text-left font-bold uppercase tracking-wider text-foreground">
                    Investor
                  </th>
                  <th className="px-3 py-2 text-left font-bold uppercase tracking-wider text-foreground">
                    Type
                  </th>
                  <th className="px-3 py-2 text-left font-bold uppercase tracking-wider text-foreground">
                    Local/Foreign
                  </th>
                  <th className="px-3 py-2 text-right font-bold uppercase tracking-wider text-foreground">
                    Shares
                  </th>
                  <th className="px-3 py-2 text-right font-bold uppercase tracking-wider text-foreground">
                    Ownership
                  </th>
                  <th className="px-3 py-2 text-left font-bold uppercase tracking-wider text-foreground">
                    Data
                  </th>
                  <th className="px-3 py-2 text-left font-bold uppercase tracking-wider text-foreground">
                    Source
                  </th>
                  <th className="px-3 py-2 text-left font-bold uppercase tracking-wider text-foreground">
                    Connected
                  </th>
                </tr>
              </thead>
```

Replace with:
```tsx
              <thead className="bg-secondary/80">
                <tr>
                  {(
                    [
                      { key: "investorName", label: "Investor", align: "left" },
                      { key: "investorType", label: "Type", align: "left" },
                      { key: "origin", label: "Local/Foreign", align: "left" },
                      { key: "shares", label: "Shares", align: "right" },
                      { key: "percentage", label: "Ownership", align: "right" },
                    ] as const
                  ).map((col) => (
                    <th
                      key={col.key}
                      className={`px-3 py-2 font-bold uppercase tracking-wider text-foreground cursor-pointer select-none hover:bg-accent/60 transition-colors ${col.align === "right" ? "text-right" : "text-left"}`}
                      onClick={() => toggleTableSort(col.key)}
                    >
                      <span className="inline-flex items-center gap-1">
                        {col.label}
                        {tableSort.key === col.key ? (
                          tableSort.dir === "desc" ? (
                            <ArrowDown className="h-3 w-3 text-primary" />
                          ) : (
                            <ArrowUp className="h-3 w-3 text-primary" />
                          )
                        ) : (
                          <ArrowUpDown className="h-3 w-3 text-muted-foreground/50" />
                        )}
                      </span>
                    </th>
                  ))}
                  <th className="px-3 py-2 text-left font-bold uppercase tracking-wider text-foreground">
                    Data
                  </th>
                  <th className="px-3 py-2 text-left font-bold uppercase tracking-wider text-foreground">
                    Source
                  </th>
                  <th className="px-3 py-2 text-left font-bold uppercase tracking-wider text-foreground">
                    Connected
                  </th>
                </tr>
              </thead>
```

**Step 4: Replace `tableRows.map(...)` with `sortedTableRows.map(...)` in tbody**

Find:
```tsx
                {tableRows.map((row) => {
```

Replace:
```tsx
                {sortedTableRows.map((row) => {
```

Find the empty state check:
```tsx
                {tableRows.length === 0 && (
```

Replace:
```tsx
                {sortedTableRows.length === 0 && (
```

**Step 5: Verify TypeScript compiles**
```bash
npx tsc --noEmit
```
Expected: No errors.

**Step 6: Commit**
```bash
git add src/components/OwnershipNetwork.tsx
git commit -m "feat(ownership): add table search, sortable column headers, and sorted rows"
```

---

### Task 8: Add inline ownership % bar in the Ownership column

**Files:**
- Modify: `src/components/OwnershipNetwork.tsx`

**Step 1: Compute `maxPct` for bar scaling inside the `sortedTableRows.map` callback**

This needs the max percentage in the full unfiltered `tableRows` (not `sortedTableRows`) for consistent bar widths. Add this memo after `sortedTableRows`:

```tsx
  const tableMaxPct = useMemo(
    () => Math.max(1, ...tableRows.map((r) => r.percentage)),
    [tableRows],
  );
```

**Step 2: Replace the ownership percentage `<td>` in the table row**

Find:
```tsx
                      <td className="px-3 py-2 text-right font-mono font-bold text-foreground">
                        {row.percentage.toFixed(2)}%
                      </td>
```

Replace:
```tsx
                      <td className="px-3 py-2 text-right">
                        <div className="flex flex-col items-end gap-0.5">
                          <span className="font-mono font-bold text-foreground">
                            {row.percentage.toFixed(2)}%
                          </span>
                          <div className="w-16 h-1.5 rounded-full bg-border/70">
                            <div
                              className="h-full rounded-full bg-primary/70"
                              style={{
                                width: `${Math.min((row.percentage / tableMaxPct) * 100, 100)}%`,
                              }}
                            />
                          </div>
                        </div>
                      </td>
```

**Step 3: Verify TypeScript compiles**
```bash
npx tsc --noEmit
```
Expected: No errors.

**Step 4: Commit**
```bash
git add src/components/OwnershipNetwork.tsx
git commit -m "feat(ownership): add inline ownership % bar in deep ownership table"
```

---

### Task 9: Final build verification

**Step 1: Run full TypeScript check**
```bash
npx tsc --noEmit
```
Expected: No errors.

**Step 2: Run dev build to confirm Vite processes without errors**
```bash
npx vite build 2>&1 | tail -10
```
Expected: `✓ built in` message with no errors.

**Step 3: Final commit if any cleanup needed**
```bash
git status
```

---

## Summary of Changes

All changes in `src/components/OwnershipNetwork.tsx`:

| Feature | Change |
|---|---|
| D3 hover highlighting | `mouseenter`/`mouseleave` on nodeLayer dims non-connected nodes |
| Performance cap | `MAX_ALL_VIEW_NODES=60` constant, capped in `graphData` memo |
| Node count badge | Shows `N nodes · M links` above SVG |
| Type breakdown | `typeBreakdown` memo + colored bars in Local/Foreign panel |
| Table search | `tableSearch` state + text input with clear button |
| Sortable headers | `tableSort` state + `toggleTableSort` + arrow icons on headers |
| Inline % bars | `tableMaxPct` memo + visual bar in Ownership column |
