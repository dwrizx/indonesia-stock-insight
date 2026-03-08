import { useEffect, useMemo, useRef, useState } from "react";
import * as d3 from "d3";
import {
  ArrowDown,
  ArrowUp,
  ArrowUpDown,
  ArrowUpRight,
  Building2,
  FilterX,
  Globe2,
  Landmark,
  Link2,
  Network,
  Search,
  UserRound,
  Users,
  Trophy,
  BarChart3,
  GitMerge,
  ChevronDown,
  X,
} from "lucide-react";
import { useNavigate } from "react-router-dom";
import {
  ownershipRecords,
  ownershipUniverseTickerCount,
  ownershipUniverseTickers,
} from "@/data/ownershipData";
import {
  buildInvestorConnectionIndex,
  buildOwnershipGraph,
  computeOwnershipSplit,
  filterOwnershipRecords,
  getOwnershipCoverage,
  getOwnershipByTicker,
  getTickerUltimateOwner,
  getOwnershipTickers,
  getTopCrossHoldingInvestors,
  summarizeTickerOwnership,
  type FilterOption,
  type InvestorOrigin,
  type InvestorType,
  type OwnershipGraphLink,
  type OwnershipGraphNode,
} from "@/lib/ownership";

type SimNode = OwnershipGraphNode & d3.SimulationNodeDatum;
type SimLink = OwnershipGraphLink & d3.SimulationLinkDatum<SimNode>;

const investorTypeOptions: Array<FilterOption<InvestorType>> = [
  "All",
  "Bank",
  "Fund",
  "Corporate",
  "Individual",
];

const originOptions: Array<FilterOption<InvestorOrigin>> = [
  "All",
  "Local",
  "Foreign",
];

function formatShares(value: number): string {
  if (value >= 1_000_000_000) return `${(value / 1_000_000_000).toFixed(2)}B`;
  if (value >= 1_000_000) return `${(value / 1_000_000).toFixed(1)}M`;
  return value.toLocaleString("id-ID");
}

function formatSharesFull(value: number): string {
  return value.toLocaleString("id-ID");
}

function nodeFill(node: OwnershipGraphNode): string {
  if (node.kind === "ticker") return "hsl(45, 93%, 58%)";
  if (node.origin === "Foreign") return "hsl(206, 84%, 57%)";
  return "hsl(152, 69%, 46%)";
}

function linkStroke(link: OwnershipGraphLink): string {
  return link.origin === "Foreign"
    ? "hsl(206, 84%, 57%)"
    : "hsl(152, 69%, 46%)";
}

function nodeRadius(node: OwnershipGraphNode): number {
  if (node.kind === "ticker") {
    return Math.min(28, 14 + node.degree * 0.8);
  }
  return Math.min(20, 8 + node.degree * 1.2);
}

function originBadgeClass(origin: InvestorOrigin): string {
  if (origin === "Local") {
    return "border border-emerald-400/40 bg-emerald-500/20 text-emerald-700 dark:text-emerald-300";
  }
  return "border border-sky-400/40 bg-sky-500/20 text-sky-700 dark:text-sky-300";
}

function typeBadgeClass(type: InvestorType): string {
  switch (type) {
    case "Bank":
      return "border border-blue-400/40 bg-blue-500/15 text-blue-700 dark:text-blue-300";
    case "Fund":
      return "border border-violet-400/40 bg-violet-500/15 text-violet-700 dark:text-violet-300";
    case "Corporate":
      return "border border-amber-400/40 bg-amber-500/15 text-amber-700 dark:text-amber-300";
    case "Individual":
      return "border border-rose-400/40 bg-rose-500/15 text-rose-700 dark:text-rose-300";
  }
}

function provenanceBadgeClass(provenance: "researched" | "estimated"): string {
  if (provenance === "researched") {
    return "border border-blue-400/50 bg-blue-500/15 text-blue-800 dark:text-blue-200";
  }
  return "border border-amber-400/50 bg-amber-500/15 text-amber-800 dark:text-amber-200";
}

const MAX_ALL_VIEW_NODES = 60;

const TYPE_COLORS: Record<InvestorType, string> = {
  Bank: "bg-blue-500",
  Fund: "bg-violet-500",
  Corporate: "bg-amber-500",
  Individual: "bg-rose-500",
};

const TYPE_TEXT: Record<InvestorType, string> = {
  Bank: "text-blue-500",
  Fund: "text-violet-500",
  Corporate: "text-amber-500",
  Individual: "text-rose-500",
};

// ──────────────────────────────────────────────────────────
// Searchable Ticker Picker component
// ──────────────────────────────────────────────────────────
function TickerPicker({
  tickers,
  value,
  onChange,
  label = "Ticker",
}: {
  tickers: string[];
  value: string;
  onChange: (ticker: string) => void;
  label?: string;
}) {
  const [open, setOpen] = useState(false);
  const [search, setSearch] = useState("");
  const containerRef = useRef<HTMLDivElement>(null);

  const filtered = useMemo(() => {
    const q = search.trim().toUpperCase();
    if (!q) return tickers;
    return tickers.filter(
      (t) =>
        t.replace(".JK", "").includes(q) ||
        t.includes(q),
    );
  }, [tickers, search]);

  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (
        containerRef.current &&
        !containerRef.current.contains(e.target as Node)
      ) {
        setOpen(false);
        setSearch("");
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const displayLabel = value.replace(".JK", "");

  return (
    <div ref={containerRef} className="relative">
      <p className="mb-1 text-[10px] font-bold uppercase tracking-wider text-foreground/60">
        {label}
      </p>
      <button
        onClick={() => setOpen((o) => !o)}
        className="flex w-full items-center justify-between gap-2 rounded-xl border border-border bg-secondary/60 px-3 py-2 text-sm font-bold text-foreground transition-colors hover:border-primary/40 hover:bg-accent"
      >
        <span className="flex items-center gap-2">
          <span className="h-2 w-2 rounded-full bg-primary" />
          {displayLabel}
        </span>
        <ChevronDown
          className={`h-3.5 w-3.5 text-muted-foreground transition-transform ${open ? "rotate-180" : ""}`}
        />
      </button>

      {open && (
        <div className="absolute z-50 mt-1 w-full min-w-[180px] rounded-xl border border-border bg-card shadow-xl shadow-black/20">
          <div className="p-2">
            <div className="relative">
              <Search className="absolute left-2.5 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-muted-foreground" />
              <input
                autoFocus
                type="text"
                placeholder="Cari ticker..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="w-full rounded-lg border border-border bg-secondary/50 py-1.5 pl-8 pr-3 text-xs text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-1 focus:ring-primary/50"
              />
              {search && (
                <button
                  onClick={() => setSearch("")}
                  className="absolute right-2 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                >
                  <X className="h-3 w-3" />
                </button>
              )}
            </div>
          </div>
          <div className="max-h-48 overflow-y-auto px-2 pb-2">
            {filtered.length === 0 && (
              <p className="py-3 text-center text-[11px] text-muted-foreground">
                Tidak ditemukan
              </p>
            )}
            <div className="grid grid-cols-4 gap-1">
              {filtered.map((ticker) => {
                const label = ticker.replace(".JK", "");
                const active = ticker === value;
                return (
                  <button
                    key={ticker}
                    onClick={() => {
                      onChange(ticker);
                      setOpen(false);
                      setSearch("");
                    }}
                    className={`rounded-lg px-2 py-1.5 text-center text-[11px] font-semibold transition-colors ${
                      active
                        ? "bg-primary text-primary-foreground"
                        : "bg-secondary/60 text-foreground hover:bg-accent"
                    }`}
                  >
                    {label}
                  </button>
                );
              })}
            </div>
            <p className="mt-1.5 text-center text-[10px] text-muted-foreground">
              {filtered.length} dari {tickers.length} ticker
            </p>
          </div>
        </div>
      )}
    </div>
  );
}

// ──────────────────────────────────────────────────────────
// Main component
// ──────────────────────────────────────────────────────────
const OwnershipNetwork = () => {
  const navigate = useNavigate();
  const svgRef = useRef<SVGSVGElement | null>(null);
  const tickers = useMemo(() => getOwnershipTickers(ownershipRecords), []);
  const [investorType, setInvestorType] =
    useState<FilterOption<InvestorType>>("All");
  const [origin, setOrigin] = useState<FilterOption<InvestorOrigin>>("All");
  const [networkTicker, setNetworkTicker] = useState<string>(
    tickers[0] ?? "All",
  );
  const [tableTicker, setTableTicker] = useState<string>(tickers[0] ?? "");
  const [tableSearch, setTableSearch] = useState("");
  const [tableSort, setTableSort] = useState<{
    key: "investorName" | "investorType" | "origin" | "shares" | "percentage";
    dir: "asc" | "desc";
  }>({ key: "percentage", dir: "desc" });

  useEffect(() => {
    if (!tableTicker && tickers.length > 0) {
      setTableTicker(tickers[0]);
    }
    if (!networkTicker && tickers.length > 0) {
      setNetworkTicker(tickers[0]);
    }
  }, [networkTicker, tableTicker, tickers]);

  const filteredRecords = useMemo(
    () =>
      filterOwnershipRecords(ownershipRecords, {
        investorType,
        origin,
      }),
    [investorType, origin],
  );

  const graphData = useMemo(() => {
    const raw = buildOwnershipGraph(filteredRecords, {
      ticker: networkTicker === "All" ? undefined : networkTicker,
    });

    if (networkTicker !== "All" || raw.nodes.length <= MAX_ALL_VIEW_NODES) {
      return raw;
    }

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

  const selectedTickerSplit = useMemo(
    () => computeOwnershipSplit(filteredRecords, tableTicker),
    [filteredRecords, tableTicker],
  );

  const tickerSummary = useMemo(
    () => summarizeTickerOwnership(filteredRecords, tableTicker),
    [filteredRecords, tableTicker],
  );

  const topCrossHolders = useMemo(
    () => getTopCrossHoldingInvestors(filteredRecords, 3),
    [filteredRecords],
  );

  const tableRows = useMemo(
    () => getOwnershipByTicker(filteredRecords, tableTicker),
    [filteredRecords, tableTicker],
  );

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

  const tableMaxPct = useMemo(
    () => Math.max(1, ...tableRows.map((r) => r.percentage)),
    [tableRows],
  );

  const investorConnectionIndex = useMemo(
    () => buildInvestorConnectionIndex(ownershipRecords),
    [],
  );

  const coverage = useMemo(
    () => getOwnershipCoverage(ownershipRecords, ownershipUniverseTickers),
    [],
  );

  const activeOwner = useMemo(
    () => getTickerUltimateOwner(ownershipRecords, tableTicker),
    [tableTicker],
  );

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

  const localPct = selectedTickerSplit.totalPercentage > 0
    ? (selectedTickerSplit.local.percentage / selectedTickerSplit.totalPercentage) * 100
    : 0;

  const activeTicker = tableTicker.replace(".JK", "");

  const toggleTableSort = (key: typeof tableSort.key) => {
    setTableSort((prev) =>
      prev.key === key
        ? { key, dir: prev.dir === "desc" ? "asc" : "desc" }
        : { key, dir: "desc" },
    );
  };

  const handleTickerSelect = (ticker: string) => {
    setTableTicker(ticker);
    setNetworkTicker(ticker);
  };

  // ── D3 effect ──────────────────────────────────────────
  useEffect(() => {
    const svgEl = svgRef.current;
    if (!svgEl) return;

    const { nodes, links } = graphData;
    if (!nodes.length) {
      const svg = d3.select(svgEl);
      svg.selectAll("*").remove();
      return;
    }

    const width = svgEl.clientWidth || 960;
    const height = 520;

    const svg = d3.select(svgEl);
    svg.selectAll("*").remove();
    svg.attr("viewBox", `0 0 ${width} ${height}`);

    const root = svg.append("g");
    const zoom = d3
      .zoom<SVGSVGElement, unknown>()
      .scaleExtent([0.3, 3])
      .on("zoom", (event) => {
        root.attr("transform", event.transform);
      });
    svg.call(zoom);

    const simNodes: SimNode[] = nodes.map((node) => ({ ...node }));
    const simLinks: SimLink[] = links.map((link) => ({ ...link }));

    // Glow filter
    const defs = svg.append("defs");
    const filter = defs.append("filter").attr("id", "glow");
    filter.append("feGaussianBlur").attr("stdDeviation", "3").attr("result", "coloredBlur");
    const feMerge = filter.append("feMerge");
    feMerge.append("feMergeNode").attr("in", "coloredBlur");
    feMerge.append("feMergeNode").attr("in", "SourceGraphic");

    const linkLayer = root
      .append("g")
      .attr("stroke-linecap", "round")
      .selectAll("line")
      .data(simLinks)
      .join("line")
      .attr("stroke", (d) => linkStroke(d))
      .attr("stroke-opacity", 0.4)
      .attr("stroke-width", (d) => 1 + Math.min(5, d.percentage * 0.3));

    const nodeLayer = root
      .append("g")
      .selectAll<SVGGElement, SimNode>("g")
      .data(simNodes)
      .join("g")
      .style("cursor", "pointer");

    // Outer glow ring for selected ticker
    nodeLayer
      .filter((d) => d.kind === "ticker" && d.ticker === tableTicker)
      .append("circle")
      .attr("r", (d) => nodeRadius(d) + 5)
      .attr("fill", "none")
      .attr("stroke", "hsl(var(--primary))")
      .attr("stroke-width", 1.5)
      .attr("stroke-opacity", 0.4)
      .attr("filter", "url(#glow)");

    nodeLayer
      .append("circle")
      .attr("r", (d) => nodeRadius(d))
      .attr("fill", (d) => nodeFill(d))
      .attr("stroke", (d) =>
        d.kind === "ticker" && d.ticker === tableTicker
          ? "hsl(var(--primary))"
          : "hsl(var(--background))",
      )
      .attr("stroke-width", (d) =>
        d.kind === "ticker" && d.ticker === tableTicker ? 3 : 1.5,
      );

    nodeLayer
      .append("text")
      .text((d) => d.label)
      .attr("y", (d) => nodeRadius(d) + 11)
      .attr("text-anchor", "middle")
      .attr("font-size", (d) => (d.kind === "ticker" ? 10 : 9))
      .attr("font-weight", 700)
      .attr("fill", "hsl(var(--foreground))")
      .attr("paint-order", "stroke")
      .attr("stroke", "hsl(var(--background))")
      .attr("stroke-width", 3);

    nodeLayer.append("title").text((d) =>
      d.kind === "ticker"
        ? `${d.label}\nTracked: ${d.totalPercentage.toFixed(2)}%\n→ Click to select · Double-click to open`
        : `${d.label}\n${d.investorType} · ${d.origin}\n${d.degree} connected tickers`,
    );

    nodeLayer.on("click", (_event, node) => {
      if (node.kind === "ticker" && node.ticker) {
        setTableTicker(node.ticker);
      }
    });

    nodeLayer.on("dblclick", (_event, node) => {
      if (node.kind === "ticker" && node.ticker) {
        navigate(`/stock/${node.ticker}`);
      }
    });

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
          connectedIds.has(d.id) ? 1 : 0.1,
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
            ? 0.85
            : 0.03;
        });
      })
      .on("mouseleave", () => {
        nodeLayer.attr("opacity", 1);
        linkLayer.attr("stroke-opacity", 0.4);
      });

    const simulation = d3
      .forceSimulation(simNodes)
      .force(
        "link",
        d3
          .forceLink<SimNode, SimLink>(simLinks)
          .id((d) => d.id)
          .distance((d) => {
            const source = d.source as SimNode;
            const target = d.target as SimNode;
            const sourceRadius = source ? nodeRadius(source) : 12;
            const targetRadius = target ? nodeRadius(target) : 12;
            return 50 + sourceRadius + targetRadius;
          })
          .strength(0.4),
      )
      .force(
        "charge",
        d3.forceManyBody<SimNode>().strength((d) =>
          d.kind === "ticker" ? -900 : -450,
        ),
      )
      .force("center", d3.forceCenter(width / 2, height / 2))
      .force(
        "collide",
        d3.forceCollide<SimNode>().radius((d) => nodeRadius(d) + 10),
      );

    const drag = d3
      .drag<SVGGElement, SimNode>()
      .on("start", (event, node) => {
        if (!event.active) simulation.alphaTarget(0.2).restart();
        node.fx = node.x;
        node.fy = node.y;
      })
      .on("drag", (event, node) => {
        node.fx = event.x;
        node.fy = event.y;
      })
      .on("end", (event, node) => {
        if (!event.active) simulation.alphaTarget(0);
        node.fx = null;
        node.fy = null;
      });

    nodeLayer.call(drag);

    simulation.on("tick", () => {
      linkLayer
        .attr("x1", (d) => (d.source as SimNode).x ?? 0)
        .attr("y1", (d) => (d.source as SimNode).y ?? 0)
        .attr("x2", (d) => (d.target as SimNode).x ?? 0)
        .attr("y2", (d) => (d.target as SimNode).y ?? 0);

      nodeLayer.attr(
        "transform",
        (d) => `translate(${d.x ?? width / 2},${d.y ?? height / 2})`,
      );
    });

    return () => {
      simulation.stop();
    };
  }, [graphData, navigate, tableTicker]);

  // ── JSX ───────────────────────────────────────────────
  return (
    <div className="space-y-4">

      {/* ── Panel Utama ─────────────────────────────────── */}
      <div className="rounded-2xl border border-border bg-card overflow-hidden">

        {/* Header strip */}
        <div className="border-b border-border bg-gradient-to-r from-primary/8 via-transparent to-transparent px-5 py-4">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div className="flex items-center gap-3">
              <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-primary/15 border border-primary/25">
                <Network className="h-4.5 w-4.5 text-primary" />
              </div>
              <div>
                <h3 className="text-sm font-extrabold text-foreground">
                  Ownership Network Explorer
                </h3>
                <p className="text-[11px] text-muted-foreground">
                  Klik node untuk pilih · Double-click untuk buka saham · Drag &amp; zoom
                </p>
              </div>
            </div>
            <div className="flex gap-2">
              <button
                onClick={() => {
                  setInvestorType("All");
                  setOrigin("All");
                }}
                className="inline-flex items-center gap-1.5 rounded-lg border border-border bg-secondary/60 px-3 py-1.5 text-xs font-semibold text-foreground transition-colors hover:bg-accent"
              >
                <FilterX className="h-3.5 w-3.5 text-muted-foreground" />
                Reset
              </button>
              <button
                onClick={() => navigate(`/stock/${tableTicker}`)}
                className="inline-flex items-center gap-1.5 rounded-lg bg-primary px-3 py-1.5 text-xs font-bold text-primary-foreground transition-opacity hover:opacity-90"
              >
                Buka {activeTicker}
                <ArrowUpRight className="h-3.5 w-3.5" />
              </button>
            </div>
          </div>
        </div>

        <div className="p-4 md:p-5 space-y-4">

          {/* ── Stats Cards ─────────────────────────────── */}
          <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
            <div className="relative overflow-hidden rounded-xl border border-violet-500/20 bg-violet-500/8 p-3.5">
              <div className="absolute right-2 top-2 opacity-10">
                <Users className="h-8 w-8 text-violet-500" />
              </div>
              <p className="text-[10px] font-bold uppercase tracking-wider text-violet-600 dark:text-violet-400">
                Investor Terhubung
              </p>
              <p className="mt-1 font-mono text-2xl font-extrabold text-foreground">
                {tickerSummary.investorCount}
              </p>
              <p className="mt-0.5 text-[11px] text-foreground/60">
                <span className="text-emerald-600 dark:text-emerald-400 font-semibold">Local {tickerSummary.localInvestorCount}</span>
                {" · "}
                <span className="text-sky-600 dark:text-sky-400 font-semibold">Foreign {tickerSummary.foreignInvestorCount}</span>
              </p>
            </div>

            <div className="relative overflow-hidden rounded-xl border border-amber-500/20 bg-amber-500/8 p-3.5">
              <div className="absolute right-2 top-2 opacity-10">
                <Trophy className="h-8 w-8 text-amber-500" />
              </div>
              <p className="text-[10px] font-bold uppercase tracking-wider text-amber-600 dark:text-amber-400">
                Holder Terbesar
              </p>
              <p className="mt-1 text-sm font-extrabold text-foreground leading-tight">
                {tickerSummary.topInvestorName}
              </p>
              <p className="mt-0.5 text-[11px] text-foreground/60">
                {tickerSummary.topInvestorType ?? "-"} ·{" "}
                {tickerSummary.topInvestorOrigin ?? "-"} ·{" "}
                <span className="font-bold text-amber-600 dark:text-amber-400">
                  {tickerSummary.topInvestorPercentage.toFixed(2)}%
                </span>
              </p>
            </div>

            <div className="relative overflow-hidden rounded-xl border border-emerald-500/20 bg-emerald-500/8 p-3.5">
              <div className="absolute right-2 top-2 opacity-10">
                <BarChart3 className="h-8 w-8 text-emerald-500" />
              </div>
              <p className="text-[10px] font-bold uppercase tracking-wider text-emerald-600 dark:text-emerald-400">
                Ownership Coverage
              </p>
              <p className="mt-1 font-mono text-2xl font-extrabold text-foreground">
                {coverage.coveredTickerCount}
                <span className="text-base text-foreground/50">/{ownershipUniverseTickerCount}</span>
              </p>
              <p className="mt-0.5 text-[11px] text-foreground/60">
                <span className="font-bold text-emerald-600 dark:text-emerald-400">
                  {coverage.coverageRatio.toFixed(1)}%
                </span>{" "}
                tickers terindeks
              </p>
            </div>

            <div className="relative overflow-hidden rounded-xl border border-sky-500/20 bg-sky-500/8 p-3.5">
              <div className="absolute right-2 top-2 opacity-10">
                <GitMerge className="h-8 w-8 text-sky-500" />
              </div>
              <p className="text-[10px] font-bold uppercase tracking-wider text-sky-600 dark:text-sky-400">
                Top Cross-Holding
              </p>
              <p className="mt-1 text-sm font-extrabold text-foreground leading-tight">
                {topCrossHolders[0]?.investorName ?? "-"}
              </p>
              <p className="mt-0.5 text-[11px] text-foreground/60">
                <span className="font-bold text-sky-600 dark:text-sky-400">
                  {topCrossHolders[0]?.tickerCount ?? 0} ticker
                </span>
                {" · "}
                {(topCrossHolders[0]?.totalPercentage ?? 0).toFixed(2)}%
              </p>
            </div>
          </div>

          {/* ── Ultimate Owner ───────────────────────────── */}
          <div className="rounded-xl border border-border/60 bg-secondary/30 px-4 py-3">
            <div className="flex flex-wrap items-center gap-3">
              <div className="flex-1 min-w-0">
                <p className="text-[10px] font-bold uppercase tracking-wider text-foreground/50 mb-1">
                  Ultimate Owner — {activeTicker}
                </p>
                <div className="flex flex-wrap items-center gap-2">
                  <span className="text-sm font-bold text-foreground">
                    {activeOwner?.ownerName ?? "Belum tersedia"}
                  </span>
                  {activeOwner && (
                    <span
                      className={`rounded-full px-2 py-0.5 text-[10px] font-bold uppercase tracking-wide ${provenanceBadgeClass(activeOwner.provenance)}`}
                    >
                      {activeOwner.provenance === "researched"
                        ? "✓ Researched"
                        : "~ Estimated"}
                    </span>
                  )}
                  {activeOwner?.sourceUrl && (
                    <a
                      href={activeOwner.sourceUrl}
                      target="_blank"
                      rel="noreferrer"
                      className="inline-flex items-center gap-1 rounded-full border border-border bg-card px-2 py-0.5 text-[10px] font-semibold text-foreground transition-colors hover:bg-accent"
                    >
                      <Link2 className="h-3 w-3" />
                      {activeOwner.sourceLabel ?? "Source"}
                    </a>
                  )}
                </div>
              </div>
              <p className="text-[10px] text-muted-foreground max-w-xs text-right hidden lg:block">
                "Researched" = snapshot riset MCP Exa.
                "Estimated" = model agar seluruh ticker terindeks.
              </p>
            </div>
          </div>

          {/* ── Ticker Picker + Graph Filters ────────────── */}
          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
            <div>
              <TickerPicker
                tickers={tickers}
                value={tableTicker}
                onChange={handleTickerSelect}
                label="Active Ticker (Table + Graph)"
              />
            </div>
            <div>
              <p className="mb-1 text-[10px] font-bold uppercase tracking-wider text-foreground/60">
                Graph Scope
              </p>
              <select
                value={networkTicker}
                onChange={(e) => setNetworkTicker(e.target.value)}
                className="w-full rounded-xl border border-border bg-secondary/60 px-3 py-2 text-sm font-semibold text-foreground outline-none transition-colors hover:border-primary/40 focus:ring-1 focus:ring-primary/50"
              >
                <option value="All">Semua Ticker</option>
                {tickers.map((t) => (
                  <option key={t} value={t}>
                    {t.replace(".JK", "")}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <p className="mb-1 text-[10px] font-bold uppercase tracking-wider text-foreground/60">
                Investor Type
              </p>
              <select
                value={investorType}
                onChange={(e) =>
                  setInvestorType(e.target.value as FilterOption<InvestorType>)
                }
                className="w-full rounded-xl border border-border bg-secondary/60 px-3 py-2 text-sm font-semibold text-foreground outline-none transition-colors hover:border-primary/40 focus:ring-1 focus:ring-primary/50"
              >
                {investorTypeOptions.map((o) => (
                  <option key={o} value={o}>
                    {o}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <p className="mb-1 text-[10px] font-bold uppercase tracking-wider text-foreground/60">
                Origin
              </p>
              <select
                value={origin}
                onChange={(e) =>
                  setOrigin(e.target.value as FilterOption<InvestorOrigin>)
                }
                className="w-full rounded-xl border border-border bg-secondary/60 px-3 py-2 text-sm font-semibold text-foreground outline-none transition-colors hover:border-primary/40 focus:ring-1 focus:ring-primary/50"
              >
                {originOptions.map((o) => (
                  <option key={o} value={o}>
                    {o}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* ── Network Graph ────────────────────────────── */}
          <div className="rounded-xl border border-border/60 bg-background/50 overflow-hidden">
            <div className="flex items-center justify-between border-b border-border/40 px-3 py-2">
              <div className="flex items-center gap-4 text-[11px] text-foreground/60">
                <span className="flex items-center gap-1.5">
                  <span className="h-2 w-2 rounded-full bg-[hsl(45,93%,58%)]" />
                  Ticker
                </span>
                <span className="flex items-center gap-1.5">
                  <span className="h-2 w-2 rounded-full bg-[hsl(152,69%,46%)]" />
                  Local
                </span>
                <span className="flex items-center gap-1.5">
                  <span className="h-2 w-2 rounded-full bg-[hsl(206,84%,57%)]" />
                  Foreign
                </span>
                <span className="text-foreground/40">
                  {graphData.nodes.length} nodes · {graphData.links.length} links
                  {networkTicker === "All" &&
                    graphData.nodes.length === MAX_ALL_VIEW_NODES && (
                      <span className="ml-1 text-amber-500">
                        (top {MAX_ALL_VIEW_NODES})
                      </span>
                    )}
                </span>
              </div>
              <span className="text-[10px] text-foreground/40 hidden sm:block">
                Hover → highlight · Drag → reposition · Scroll → zoom
              </span>
            </div>
            {graphData.nodes.length > 0 ? (
              <svg ref={svgRef} className="h-[520px] w-full" />
            ) : (
              <div className="grid h-[260px] place-items-center">
                <div className="text-center">
                  <Network className="mx-auto h-10 w-10 text-muted-foreground/30 mb-2" />
                  <p className="text-sm text-muted-foreground">
                    Tidak ada data untuk kombinasi filter ini.
                  </p>
                </div>
              </div>
            )}
          </div>

        </div>
      </div>

      {/* ── Local vs Foreign + Deep Table ───────────────── */}
      <div className="grid gap-4 lg:grid-cols-3">

        {/* ── Local vs Foreign Panel ───────────────────── */}
        <div className="rounded-2xl border border-border bg-card overflow-hidden lg:col-span-1">
          <div className="border-b border-border/60 bg-secondary/30 px-4 py-3">
            <div className="flex items-center justify-between">
              <h4 className="flex items-center gap-2 text-xs font-extrabold uppercase tracking-wider text-foreground">
                <Landmark className="h-3.5 w-3.5 text-primary" />
                Local vs Foreign
              </h4>
              <div className="w-40">
                <TickerPicker
                  tickers={tickers}
                  value={tableTicker}
                  onChange={handleTickerSelect}
                  label=""
                />
              </div>
            </div>
          </div>

          <div className="p-4 space-y-3">
            {/* Combined stacked bar */}
            <div className="rounded-xl border border-border/60 bg-secondary/30 p-3">
              <div className="mb-2 flex items-center justify-between text-xs">
                <span className="font-bold text-foreground">Komposisi Kepemilikan</span>
                <span className="font-mono text-foreground/60 text-[11px]">
                  {selectedTickerSplit.totalPercentage.toFixed(1)}% tracked
                </span>
              </div>
              <div className="h-6 w-full rounded-lg overflow-hidden flex bg-border/40">
                {localPct > 0 && (
                  <div
                    className="h-full bg-emerald-500 flex items-center justify-center transition-all"
                    style={{ width: `${localPct}%` }}
                  >
                    {localPct > 15 && (
                      <span className="text-[9px] font-bold text-white px-1">
                        {selectedTickerSplit.local.percentage.toFixed(1)}%
                      </span>
                    )}
                  </div>
                )}
                {(100 - localPct) > 0 && (
                  <div
                    className="h-full bg-sky-500 flex items-center justify-center transition-all"
                    style={{ width: `${100 - localPct}%` }}
                  >
                    {(100 - localPct) > 15 && (
                      <span className="text-[9px] font-bold text-white px-1">
                        {selectedTickerSplit.foreign.percentage.toFixed(1)}%
                      </span>
                    )}
                  </div>
                )}
              </div>
              <div className="mt-1.5 flex justify-between text-[10px] text-foreground/50">
                <span className="flex items-center gap-1">
                  <span className="h-1.5 w-1.5 rounded-full bg-emerald-500" />
                  Local
                </span>
                <span className="font-mono font-bold text-foreground">
                  {formatSharesFull(selectedTickerSplit.totalShares)} shares
                </span>
                <span className="flex items-center gap-1">
                  Foreign
                  <span className="h-1.5 w-1.5 rounded-full bg-sky-500" />
                </span>
              </div>
            </div>

            {/* Local card */}
            <button
              onClick={() => setOrigin(origin === "Local" ? "All" : "Local")}
              className={`w-full rounded-xl border p-3 text-left transition-all ${
                origin === "Local"
                  ? "border-emerald-500/40 bg-emerald-500/12 ring-1 ring-emerald-500/20"
                  : "border-border/60 bg-secondary/30 hover:bg-accent/60"
              }`}
            >
              <div className="flex items-center justify-between mb-2">
                <span className="flex items-center gap-1.5 text-xs font-bold text-foreground">
                  <Building2 className="h-3.5 w-3.5 text-emerald-500" />
                  Local Investors
                </span>
                <span className="font-mono text-lg font-extrabold text-emerald-600 dark:text-emerald-400">
                  {selectedTickerSplit.local.percentage.toFixed(2)}%
                </span>
              </div>
              <div className="h-1.5 rounded-full bg-border/50">
                <div
                  className="h-full rounded-full bg-emerald-500 transition-all"
                  style={{ width: `${Math.min(localPct, 100)}%` }}
                />
              </div>
              <p className="mt-1.5 font-mono text-[11px] text-foreground/50">
                {formatShares(selectedTickerSplit.local.shares)} shares
              </p>
            </button>

            {/* Foreign card */}
            <button
              onClick={() => setOrigin(origin === "Foreign" ? "All" : "Foreign")}
              className={`w-full rounded-xl border p-3 text-left transition-all ${
                origin === "Foreign"
                  ? "border-sky-500/40 bg-sky-500/12 ring-1 ring-sky-500/20"
                  : "border-border/60 bg-secondary/30 hover:bg-accent/60"
              }`}
            >
              <div className="flex items-center justify-between mb-2">
                <span className="flex items-center gap-1.5 text-xs font-bold text-foreground">
                  <Globe2 className="h-3.5 w-3.5 text-sky-500" />
                  Foreign Investors
                </span>
                <span className="font-mono text-lg font-extrabold text-sky-600 dark:text-sky-400">
                  {selectedTickerSplit.foreign.percentage.toFixed(2)}%
                </span>
              </div>
              <div className="h-1.5 rounded-full bg-border/50">
                <div
                  className="h-full rounded-full bg-sky-500 transition-all"
                  style={{ width: `${Math.min(100 - localPct, 100)}%` }}
                />
              </div>
              <p className="mt-1.5 font-mono text-[11px] text-foreground/50">
                {formatShares(selectedTickerSplit.foreign.shares)} shares
              </p>
            </button>

            {/* By Type */}
            {typeBreakdown.length > 0 && (
              <div className="rounded-xl border border-border/60 bg-secondary/30 p-3">
                <p className="mb-2.5 text-[10px] font-bold uppercase tracking-wider text-foreground/60">
                  By Investor Type
                </p>
                <div className="space-y-2.5">
                  {typeBreakdown.map(({ type, percentage, count }) => (
                    <button
                      key={type}
                      onClick={() =>
                        setInvestorType(
                          investorType === type ? "All" : type,
                        )
                      }
                      className={`w-full text-left rounded-lg px-2.5 py-1.5 transition-colors ${
                        investorType === type
                          ? "bg-primary/10 ring-1 ring-primary/25"
                          : "hover:bg-accent/40"
                      }`}
                    >
                      <div className="flex items-center justify-between text-[11px] mb-1">
                        <span className={`font-bold ${TYPE_TEXT[type as InvestorType]}`}>
                          {type}
                          <span className="ml-1 font-normal text-foreground/40">
                            ×{count}
                          </span>
                        </span>
                        <span className="font-mono font-bold text-foreground">
                          {percentage.toFixed(2)}%
                        </span>
                      </div>
                      <div className="h-1.5 rounded-full bg-border/50">
                        <div
                          className={`h-full rounded-full transition-all ${TYPE_COLORS[type as InvestorType]}`}
                          style={{ width: `${Math.min(percentage, 100)}%` }}
                        />
                      </div>
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>

        {/* ── Deep Ownership Table ─────────────────────── */}
        <div className="rounded-2xl border border-border bg-card overflow-hidden lg:col-span-2">
          <div className="border-b border-border/60 bg-secondary/30 px-4 py-3">
            <div className="flex flex-wrap items-center justify-between gap-2">
              <div>
                <h4 className="flex items-center gap-2 text-xs font-extrabold uppercase tracking-wider text-foreground">
                  <UserRound className="h-3.5 w-3.5 text-primary" />
                  Deep Ownership —{" "}
                  <span className="text-primary">{activeTicker}</span>
                </h4>
                <p className="mt-0.5 text-[11px] text-muted-foreground">
                  Klik kolom header untuk sort · klik badge untuk filter cepat
                </p>
              </div>
              <button
                onClick={() => navigate(`/stock/${tableTicker}`)}
                className="inline-flex items-center gap-1.5 rounded-lg border border-primary/35 bg-primary/10 px-3 py-1.5 text-[11px] font-bold text-primary transition-colors hover:bg-primary/20"
              >
                Lihat Saham
                <ArrowUpRight className="h-3.5 w-3.5" />
              </button>
            </div>
          </div>

          <div className="p-4 space-y-3">
            {/* Search */}
            <div className="flex items-center gap-2">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-muted-foreground" />
                <input
                  type="text"
                  placeholder="Cari nama investor..."
                  value={tableSearch}
                  onChange={(e) => setTableSearch(e.target.value)}
                  className="w-full rounded-xl border border-border bg-secondary/40 py-2 pl-9 pr-3 text-xs text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-1 focus:ring-primary/50"
                />
              </div>
              {tableSearch && (
                <button
                  onClick={() => setTableSearch("")}
                  className="inline-flex items-center gap-1 rounded-xl border border-border bg-secondary/70 px-3 py-2 text-[11px] font-semibold text-foreground hover:bg-accent"
                >
                  <X className="h-3 w-3" />
                  Clear
                </button>
              )}
              {(investorType !== "All" || origin !== "All") && (
                <button
                  onClick={() => { setInvestorType("All"); setOrigin("All"); }}
                  className="inline-flex items-center gap-1 rounded-xl border border-border bg-secondary/70 px-3 py-2 text-[11px] font-semibold text-foreground hover:bg-accent"
                >
                  <FilterX className="h-3 w-3" />
                  Reset
                </button>
              )}
            </div>

            {/* Table */}
            <div className="overflow-x-auto rounded-xl border border-border/60">
              <table className="w-full text-xs">
                <thead>
                  <tr className="bg-secondary/60">
                    <th className="w-8 px-3 py-2.5 text-center text-[10px] font-bold text-foreground/40">#</th>
                    {(
                      [
                        { key: "investorName", label: "Investor", align: "left" },
                        { key: "investorType", label: "Type", align: "left" },
                        { key: "origin", label: "Origin", align: "left" },
                        { key: "shares", label: "Shares", align: "right" },
                        { key: "percentage", label: "Ownership %", align: "right" },
                      ] as const
                    ).map((col) => (
                      <th
                        key={col.key}
                        onClick={() => toggleTableSort(col.key)}
                        className={`px-3 py-2.5 text-[10px] font-bold uppercase tracking-wider text-foreground/70 cursor-pointer select-none transition-colors hover:bg-accent/60 hover:text-foreground ${
                          col.align === "right" ? "text-right" : "text-left"
                        }`}
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
                            <ArrowUpDown className="h-3 w-3 opacity-30" />
                          )}
                        </span>
                      </th>
                    ))}
                    <th className="px-3 py-2.5 text-left text-[10px] font-bold uppercase tracking-wider text-foreground/70">
                      Data
                    </th>
                    <th className="px-3 py-2.5 text-left text-[10px] font-bold uppercase tracking-wider text-foreground/70">
                      Source
                    </th>
                    <th className="px-3 py-2.5 text-left text-[10px] font-bold uppercase tracking-wider text-foreground/70">
                      Also in
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border/50">
                  {sortedTableRows.map((row, idx) => {
                    const connectedTickers =
                      investorConnectionIndex.get(row.investorId) ?? [];
                    const barWidth = Math.min(
                      (row.percentage / tableMaxPct) * 100,
                      100,
                    );
                    return (
                      <tr
                        key={`${row.ticker}-${row.investorId}`}
                        className="group transition-colors hover:bg-accent/30"
                      >
                        <td className="px-3 py-3 text-center">
                          <span className="text-[10px] font-mono text-foreground/30">
                            {idx + 1}
                          </span>
                        </td>
                        <td className="px-3 py-3">
                          <span className="flex items-center gap-2 font-medium text-foreground">
                            <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-secondary/80 border border-border/60">
                              <UserRound className="h-3 w-3 text-muted-foreground" />
                            </span>
                            <span className="leading-tight">{row.investorName}</span>
                          </span>
                        </td>
                        <td className="px-3 py-3">
                          <button
                            onClick={() =>
                              setInvestorType(
                                investorType === row.investorType
                                  ? "All"
                                  : row.investorType,
                              )
                            }
                            className={`rounded-full border px-2.5 py-0.5 text-[10px] font-bold uppercase tracking-wide transition-opacity hover:opacity-80 ${typeBadgeClass(row.investorType)}`}
                          >
                            {row.investorType}
                          </button>
                        </td>
                        <td className="px-3 py-3">
                          <button
                            onClick={() =>
                              setOrigin(
                                origin === row.origin ? "All" : row.origin,
                              )
                            }
                            className={`rounded-full border px-2.5 py-0.5 text-[10px] font-bold uppercase tracking-wide transition-opacity hover:opacity-80 ${originBadgeClass(row.origin)}`}
                          >
                            {row.origin}
                          </button>
                        </td>
                        <td className="px-3 py-3 text-right font-mono text-foreground/80">
                          {formatShares(row.shares)}
                        </td>
                        <td className="px-3 py-3 text-right">
                          <div className="flex flex-col items-end gap-1">
                            <span className="font-mono font-extrabold text-foreground">
                              {row.percentage.toFixed(2)}%
                            </span>
                            <div className="w-20 h-1.5 rounded-full bg-border/50">
                              <div
                                className="h-full rounded-full bg-primary/70 transition-all"
                                style={{ width: `${barWidth}%` }}
                              />
                            </div>
                          </div>
                        </td>
                        <td className="px-3 py-3">
                          <span
                            className={`rounded-full border px-2 py-0.5 text-[10px] font-bold uppercase tracking-wide ${provenanceBadgeClass(row.provenance)}`}
                          >
                            {row.provenance === "researched" ? "✓ Researched" : "~ Estimated"}
                          </span>
                        </td>
                        <td className="px-3 py-3 text-foreground">
                          {row.sourceUrl ? (
                            <a
                              href={row.sourceUrl}
                              target="_blank"
                              rel="noreferrer"
                              className="inline-flex items-center gap-1 rounded-full border border-border bg-secondary/70 px-2 py-0.5 text-[10px] font-semibold text-foreground transition-colors hover:bg-accent"
                            >
                              <Link2 className="h-3 w-3" />
                              {row.sourceLabel ?? "Src"}
                            </a>
                          ) : (
                            <span className="text-[11px] text-muted-foreground">
                              {row.sourceLabel ?? "—"}
                            </span>
                          )}
                        </td>
                        <td className="px-3 py-3">
                          <div className="flex flex-wrap gap-1">
                            {connectedTickers.slice(0, 5).map((ticker) => (
                              <button
                                key={`${row.investorId}-${ticker}`}
                                onClick={() => handleTickerSelect(ticker)}
                                className={`rounded-md border px-1.5 py-0.5 text-[10px] font-semibold transition-colors ${
                                  ticker === tableTicker
                                    ? "border-primary/50 bg-primary/15 text-primary"
                                    : "border-border bg-secondary/70 text-foreground/70 hover:bg-accent hover:text-foreground"
                                }`}
                              >
                                {ticker.replace(".JK", "")}
                              </button>
                            ))}
                            {connectedTickers.length > 5 && (
                              <span className="rounded-md border border-border/50 px-1.5 py-0.5 text-[10px] text-foreground/40">
                                +{connectedTickers.length - 5}
                              </span>
                            )}
                            {connectedTickers.length === 0 && (
                              <span className="text-[11px] text-muted-foreground">—</span>
                            )}
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                  {sortedTableRows.length === 0 && (
                    <tr>
                      <td
                        colSpan={9}
                        className="px-3 py-10 text-center"
                      >
                        <Search className="mx-auto h-8 w-8 text-muted-foreground/30 mb-2" />
                        <p className="text-sm text-muted-foreground">
                          Tidak ada data untuk kombinasi filter ini.
                        </p>
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>

            {sortedTableRows.length > 0 && (
              <p className="text-[11px] text-muted-foreground text-right">
                Menampilkan {sortedTableRows.length} dari {tableRows.length} investor
              </p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default OwnershipNetwork;
