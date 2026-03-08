import { useEffect, useMemo, useRef, useState } from "react";
import * as d3 from "d3";
import {
  ArrowUpRight,
  BarChart3,
  Building2,
  ChevronDown,
  ChevronRight,
  Crown,
  FilterX,
  GitMerge,
  Globe2,
  Landmark,
  Network,
  Search,
  TrendingDown,
  TrendingUp,
  Users,
  X,
} from "lucide-react";
import { useNavigate } from "react-router-dom";
import type { Stock } from "@/data/stockData";
import { formatRupiah } from "@/data/stockData";
import { conglomerateGroupSeeds } from "@/data/conglomerateData";
import {
  buildConglomerateGraph,
  buildConglomerateGroups,
  type ConglomerateGraphLink,
  type ConglomerateGraphNode,
} from "@/lib/conglomerate";
import {
  ownershipRecords,
  ownershipUniverseTickers,
} from "@/data/ownershipData";
import {
  buildInvestorConnectionIndex,
  getOwnershipCoverage,
  getTopCrossHoldingInvestors,
  type InvestorType,
} from "@/lib/ownership";

type Props = { stocks: Stock[] };
type Scope = "all" | "selected";
type SimNode = ConglomerateGraphNode & d3.SimulationNodeDatum;
type SimLink = ConglomerateGraphLink & d3.SimulationLinkDatum<SimNode>;

// ── Helpers ────────────────────────────────────────────────
function fmt(value: number): string {
  if (value >= 1e15) return `Rp${(value / 1e15).toFixed(1)}Q`;
  if (value >= 1e12) return `Rp${(value / 1e12).toFixed(1)}T`;
  if (value >= 1e9) return `Rp${(value / 1e9).toFixed(1)}M`;
  return formatRupiah(value);
}

function fmtPrice(value: number): string {
  return `Rp${Math.round(value).toLocaleString("id-ID")}`;
}

function shortTicker(ticker: string): string {
  return ticker.replace(".JK", "");
}

function nodeRadius(node: ConglomerateGraphNode): number {
  if (node.kind === "group") return 24;
  return Math.max(9, Math.min(20, 9 + Math.log10(Math.max(node.marketCap, 1e9)) - 1));
}

function nodeColor(node: ConglomerateGraphNode): string {
  if (node.kind === "group") return "hsl(263, 70%, 62%)";
  if (node.changePercent >= 0) return "hsl(152, 69%, 46%)";
  return "hsl(0, 84%, 63%)";
}

function linkColor(link: ConglomerateGraphLink): string {
  return link.changePercent >= 0 ? "hsl(152, 69%, 46%)" : "hsl(0, 84%, 63%)";
}

function typeBadge(type: InvestorType): string {
  switch (type) {
    case "Bank": return "border-blue-400/40 bg-blue-500/15 text-blue-700 dark:text-blue-300";
    case "Fund": return "border-violet-400/40 bg-violet-500/15 text-violet-700 dark:text-violet-300";
    case "Corporate": return "border-amber-400/40 bg-amber-500/15 text-amber-700 dark:text-amber-300";
    case "Individual": return "border-rose-400/40 bg-rose-500/15 text-rose-700 dark:text-rose-300";
  }
}

// ── Conglomerate Group Card ────────────────────────────────
function GroupCard({
  group,
  active,
  onSelect,
}: {
  group: ReturnType<typeof buildConglomerateGroups>[number];
  active: boolean;
  onSelect: () => void;
}) {
  const navigate = useNavigate();
  const [expanded, setExpanded] = useState(false);
  const isGain = group.averagePerformance >= 0;

  return (
    <div
      className={`rounded-xl border transition-all ${
        active
          ? "border-primary/40 bg-primary/8 ring-1 ring-primary/20"
          : "border-border bg-card hover:border-border/80"
      }`}
    >
      <button
        onClick={() => { onSelect(); setExpanded(true); }}
        className="w-full p-3 text-left"
      >
        <div className="flex items-start justify-between gap-2">
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-1.5">
              <Crown className="h-3 w-3 shrink-0 text-amber-500" />
              <p className="text-xs font-extrabold text-foreground leading-tight truncate">
                {group.name}
              </p>
            </div>
            <p className="mt-0.5 text-[10px] text-muted-foreground truncate">
              {group.controller}
            </p>
          </div>
          <span
            className={`shrink-0 rounded-lg px-2 py-0.5 font-mono text-[11px] font-bold ${
              isGain
                ? "bg-gain/15 text-gain"
                : "bg-loss/15 text-loss"
            }`}
          >
            {isGain ? "+" : ""}{group.averagePerformance.toFixed(2)}%
          </span>
        </div>

        <div className="mt-2 flex items-center gap-3 text-[11px] text-muted-foreground">
          <span className="flex items-center gap-1">
            <Building2 className="h-3 w-3" />
            {group.companyCount} saham
          </span>
          <span className="font-mono font-semibold text-foreground/70">
            {fmt(group.totalMarketCap)}
          </span>
        </div>
      </button>

      {/* Company rows */}
      {active && (
        <div className="border-t border-border/50">
          <button
            onClick={() => setExpanded((e) => !e)}
            className="flex w-full items-center justify-between px-3 py-1.5 text-[10px] font-semibold text-muted-foreground hover:bg-accent/30"
          >
            <span>Lihat {group.companyCount} perusahaan</span>
            {expanded ? <ChevronDown className="h-3 w-3" /> : <ChevronRight className="h-3 w-3" />}
          </button>
          {expanded && (
            <div className="divide-y divide-border/40">
              {group.companies.map((company) => {
                const gain = company.changePercent >= 0;
                return (
                  <button
                    key={company.ticker}
                    onClick={() => navigate(`/stock/${company.ticker}`)}
                    className="flex w-full items-center gap-2 px-3 py-2 text-left text-[11px] transition-colors hover:bg-accent/40"
                  >
                    <span className="w-10 shrink-0 font-mono font-bold text-foreground">
                      {shortTicker(company.ticker)}
                    </span>
                    <div className="flex-1 min-w-0">
                      <p className="truncate text-foreground/80">{company.name}</p>
                      <p className="font-mono text-[10px] text-muted-foreground">
                        {fmtPrice(company.price)} · {fmt(company.marketCap)}
                      </p>
                    </div>
                    <span className={`shrink-0 font-mono font-bold ${gain ? "text-gain" : "text-loss"}`}>
                      {gain ? "+" : ""}{company.changePercent.toFixed(2)}%
                    </span>
                    <ArrowUpRight className="h-3 w-3 shrink-0 text-muted-foreground/50" />
                  </button>
                );
              })}
            </div>
          )}
        </div>
      )}
    </div>
  );
}

// ── Main Component ─────────────────────────────────────────
const ConglomerateMaps = ({ stocks }: Props) => {
  const navigate = useNavigate();
  const svgRef = useRef<SVGSVGElement | null>(null);
  const [query, setQuery] = useState("");
  const [mapScope, setMapScope] = useState<Scope>("all");
  const [selectedGroupId, setSelectedGroupId] = useState<string>("");
  const [investorSearch, setInvestorSearch] = useState("");
  const [expandedInvestorId, setExpandedInvestorId] = useState<string | null>(null);

  const allGroups = useMemo(
    () => buildConglomerateGroups(stocks, conglomerateGroupSeeds),
    [stocks],
  );

  const visibleGroups = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return allGroups;
    return allGroups.filter(
      (g) =>
        g.name.toLowerCase().includes(q) ||
        g.controller.toLowerCase().includes(q) ||
        g.companies.some(
          (c) =>
            c.ticker.toLowerCase().includes(q) ||
            c.name.toLowerCase().includes(q),
        ),
    );
  }, [allGroups, query]);

  useEffect(() => {
    if (!selectedGroupId && visibleGroups.length > 0) {
      setSelectedGroupId(visibleGroups[0].id);
      return;
    }
    if (selectedGroupId && visibleGroups.every((g) => g.id !== selectedGroupId)) {
      setSelectedGroupId(visibleGroups[0]?.id ?? "");
    }
  }, [selectedGroupId, visibleGroups]);

  const selectedGroup = useMemo(
    () => visibleGroups.find((g) => g.id === selectedGroupId),
    [selectedGroupId, visibleGroups],
  );

  const groupsForMap = useMemo(
    () => (mapScope === "selected" && selectedGroup ? [selectedGroup] : visibleGroups),
    [mapScope, selectedGroup, visibleGroups],
  );

  const graphData = useMemo(
    () => buildConglomerateGraph(groupsForMap),
    [groupsForMap],
  );

  const totalMarketCap = useMemo(
    () => visibleGroups.reduce((s, g) => s + g.totalMarketCap, 0),
    [visibleGroups],
  );

  const avgPerf = useMemo(() => {
    if (!visibleGroups.length) return 0;
    return Number(
      (
        visibleGroups.reduce((s, g) => s + g.averagePerformance, 0) /
        visibleGroups.length
      ).toFixed(2),
    );
  }, [visibleGroups]);

  // ── Investor Network data ────────────────────────────────
  const topCrossHolders = useMemo(
    () => getTopCrossHoldingInvestors(ownershipRecords, 20),
    [],
  );

  const investorConnectionIndex = useMemo(
    () => buildInvestorConnectionIndex(ownershipRecords),
    [],
  );

  const coverage = useMemo(
    () => getOwnershipCoverage(ownershipRecords, ownershipUniverseTickers),
    [],
  );

  const filteredCrossHolders = useMemo(() => {
    const q = investorSearch.trim().toLowerCase();
    if (!q) return topCrossHolders;
    return topCrossHolders.filter(
      (inv) =>
        inv.investorName.toLowerCase().includes(q) ||
        inv.investorType.toLowerCase().includes(q),
    );
  }, [topCrossHolders, investorSearch]);

  // ── D3 ───────────────────────────────────────────────────
  useEffect(() => {
    const svgEl = svgRef.current;
    if (!svgEl) return;

    const { nodes, links } = graphData;
    const svg = d3.select(svgEl);
    svg.selectAll("*").remove();
    if (!nodes.length) return;

    const width = svgEl.clientWidth || 960;
    const height = 520;
    svg.attr("viewBox", `0 0 ${width} ${height}`);

    const root = svg.append("g");
    svg.call(
      d3
        .zoom<SVGSVGElement, unknown>()
        .scaleExtent([0.3, 3])
        .on("zoom", (event) => root.attr("transform", event.transform)),
    );

    const simNodes: SimNode[] = nodes.map((n) => ({ ...n }));
    const simLinks: SimLink[] = links.map((l) => ({ ...l }));

    // Glow defs
    const defs = svg.append("defs");
    const filter = defs.append("filter").attr("id", "cg-glow");
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
      .attr("stroke", (d) => linkColor(d))
      .attr("stroke-opacity", 0.35)
      .attr("stroke-width", (d) => 1 + Math.min(4, d.marketCap / 3e11));

    const nodeLayer = root
      .append("g")
      .selectAll<SVGGElement, SimNode>("g")
      .data(simNodes)
      .join("g")
      .style("cursor", "pointer");

    // Outer glow ring for selected group
    nodeLayer
      .filter((d) => d.kind === "group" && d.groupId === selectedGroupId)
      .append("circle")
      .attr("r", (d) => nodeRadius(d) + 6)
      .attr("fill", "none")
      .attr("stroke", "hsl(var(--primary))")
      .attr("stroke-width", 1.5)
      .attr("stroke-opacity", 0.45)
      .attr("filter", "url(#cg-glow)");

    nodeLayer
      .append("circle")
      .attr("r", (d) => nodeRadius(d))
      .attr("fill", (d) => nodeColor(d))
      .attr("stroke", (d) =>
        d.kind === "group" && d.groupId === selectedGroupId
          ? "hsl(var(--primary))"
          : "hsl(var(--background))",
      )
      .attr("stroke-width", (d) =>
        d.kind === "group" && d.groupId === selectedGroupId ? 3 : 1.5,
      );

    nodeLayer
      .append("text")
      .text((d) => d.label)
      .attr("y", (d) => nodeRadius(d) + 11)
      .attr("text-anchor", "middle")
      .attr("font-size", (d) => (d.kind === "group" ? 10 : 9))
      .attr("font-weight", 700)
      .attr("fill", "hsl(var(--foreground))")
      .attr("paint-order", "stroke")
      .attr("stroke", "hsl(var(--background))")
      .attr("stroke-width", 3);

    nodeLayer.append("title").text((d) =>
      d.kind === "group"
        ? `${d.label}\nPerf: ${d.changePercent.toFixed(2)}%\nClick → pilih grup`
        : `${d.label}\nPerf: ${d.changePercent >= 0 ? "+" : ""}${d.changePercent.toFixed(2)}%\nDouble-click → buka saham`,
    );

    nodeLayer.on("click", (_event, node) => {
      if (node.kind === "group" && node.groupId) setSelectedGroupId(node.groupId);
      else if (node.kind === "company" && node.groupId) setSelectedGroupId(node.groupId);
    });

    nodeLayer.on("dblclick", (_event, node) => {
      if (node.kind === "company" && node.ticker) navigate(`/stock/${node.ticker}`);
    });

    // Hover highlight
    nodeLayer
      .on("mouseenter", (_event, hoveredNode) => {
        const connectedIds = new Set<string>([hoveredNode.id]);
        simLinks.forEach((link) => {
          const srcId = typeof link.source === "string" ? link.source : (link.source as SimNode).id;
          const tgtId = typeof link.target === "string" ? link.target : (link.target as SimNode).id;
          if (srcId === hoveredNode.id || tgtId === hoveredNode.id) {
            connectedIds.add(srcId);
            connectedIds.add(tgtId);
          }
        });
        nodeLayer.attr("opacity", (d) => connectedIds.has(d.id) ? 1 : 0.1);
        linkLayer.attr("stroke-opacity", (d) => {
          const srcId = typeof d.source === "string" ? d.source : (d.source as SimNode).id;
          const tgtId = typeof d.target === "string" ? d.target : (d.target as SimNode).id;
          return connectedIds.has(srcId) && connectedIds.has(tgtId) ? 0.85 : 0.03;
        });
      })
      .on("mouseleave", () => {
        nodeLayer.attr("opacity", 1);
        linkLayer.attr("stroke-opacity", 0.35);
      });

    const simulation = d3
      .forceSimulation(simNodes)
      .force(
        "link",
        d3
          .forceLink<SimNode, SimLink>(simLinks)
          .id((d) => d.id)
          .distance((d) => {
            const src = d.source as SimNode;
            const tgt = d.target as SimNode;
            return 52 + nodeRadius(src) + nodeRadius(tgt);
          })
          .strength(0.4),
      )
      .force(
        "charge",
        d3.forceManyBody<SimNode>().strength((d) => (d.kind === "group" ? -1000 : -300)),
      )
      .force("center", d3.forceCenter(width / 2, height / 2))
      .force("collide", d3.forceCollide<SimNode>().radius((d) => nodeRadius(d) + 10));

    nodeLayer.call(
      d3
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
        }),
    );

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

    return () => { simulation.stop(); };
  }, [graphData, navigate, selectedGroupId]);

  // ── JSX ──────────────────────────────────────────────────
  return (
    <div className="space-y-4">

      {/* ── Panel: Network ─────────────────────────────── */}
      <div className="rounded-2xl border border-border bg-card overflow-hidden">

        {/* Header */}
        <div className="border-b border-border bg-gradient-to-r from-violet-500/8 via-transparent to-transparent px-5 py-4">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div className="flex items-center gap-3">
              <div className="flex h-9 w-9 items-center justify-center rounded-xl border border-violet-500/25 bg-violet-500/15">
                <Network className="h-4.5 w-4.5 text-violet-500" />
              </div>
              <div>
                <h3 className="text-sm font-extrabold text-foreground">
                  Conglomerate Maps
                </h3>
                <p className="text-[11px] text-muted-foreground">
                  Peta grup konglomerat Indonesia · Klik node → pilih · Double-click saham → detail
                </p>
              </div>
            </div>
            <div className="flex gap-2">
              <button
                onClick={() => { setQuery(""); setMapScope("all"); }}
                className="inline-flex items-center gap-1.5 rounded-lg border border-border bg-secondary/60 px-3 py-1.5 text-xs font-semibold text-foreground hover:bg-accent"
              >
                <FilterX className="h-3.5 w-3.5 text-muted-foreground" />
                Reset
              </button>
              {selectedGroup && (
                <button
                  onClick={() => setMapScope((p) => (p === "all" ? "selected" : "all"))}
                  className={`rounded-lg border px-3 py-1.5 text-xs font-bold transition-colors ${
                    mapScope === "selected"
                      ? "border-violet-500/40 bg-violet-500/15 text-violet-700 dark:text-violet-300"
                      : "border-primary/35 bg-primary/10 text-primary hover:bg-primary/20"
                  }`}
                >
                  {mapScope === "all" ? `Focus: ${selectedGroup.name.split(" ")[0]}` : "All Groups"}
                </button>
              )}
            </div>
          </div>
        </div>

        <div className="p-4 md:p-5 space-y-4">

          {/* Stats */}
          <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
            <div className="relative overflow-hidden rounded-xl border border-violet-500/20 bg-violet-500/8 p-3.5">
              <div className="absolute right-2 top-2 opacity-10">
                <Crown className="h-8 w-8 text-violet-500" />
              </div>
              <p className="text-[10px] font-bold uppercase tracking-wider text-violet-600 dark:text-violet-400">Total Grup</p>
              <p className="mt-1 font-mono text-2xl font-extrabold text-foreground">{visibleGroups.length}</p>
              <p className="mt-0.5 text-[11px] text-foreground/60">konglomerat terindeks</p>
            </div>
            <div className="relative overflow-hidden rounded-xl border border-amber-500/20 bg-amber-500/8 p-3.5">
              <div className="absolute right-2 top-2 opacity-10">
                <Building2 className="h-8 w-8 text-amber-500" />
              </div>
              <p className="text-[10px] font-bold uppercase tracking-wider text-amber-600 dark:text-amber-400">Total Emiten</p>
              <p className="mt-1 font-mono text-2xl font-extrabold text-foreground">
                {visibleGroups.reduce((s, g) => s + g.companyCount, 0)}
              </p>
              <p className="mt-0.5 text-[11px] text-foreground/60">saham publik</p>
            </div>
            <div className="relative overflow-hidden rounded-xl border border-sky-500/20 bg-sky-500/8 p-3.5">
              <div className="absolute right-2 top-2 opacity-10">
                <BarChart3 className="h-8 w-8 text-sky-500" />
              </div>
              <p className="text-[10px] font-bold uppercase tracking-wider text-sky-600 dark:text-sky-400">Combined Mkt Cap</p>
              <p className="mt-1 font-mono text-base font-extrabold text-foreground">{fmt(totalMarketCap)}</p>
              <p className="mt-0.5 text-[11px] text-foreground/60">estimasi gabungan</p>
            </div>
            <div className="relative overflow-hidden rounded-xl border border-emerald-500/20 bg-emerald-500/8 p-3.5">
              <div className="absolute right-2 top-2 opacity-10">
                <TrendingUp className="h-8 w-8 text-emerald-500" />
              </div>
              <p className="text-[10px] font-bold uppercase tracking-wider text-emerald-600 dark:text-emerald-400">Avg Group Perf</p>
              <p className={`mt-1 font-mono text-2xl font-extrabold ${avgPerf >= 0 ? "text-gain" : "text-loss"}`}>
                {avgPerf >= 0 ? "+" : ""}{avgPerf.toFixed(2)}%
              </p>
              <p className="mt-0.5 text-[11px] text-foreground/60">rata-rata hari ini</p>
            </div>
          </div>

          {/* Search */}
          <div className="relative">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <input
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Cari grup, controller, ticker, atau nama perusahaan..."
              className="w-full rounded-xl border border-border bg-secondary/40 py-2.5 pl-10 pr-9 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-1 focus:ring-primary/50"
            />
            {query && (
              <button
                onClick={() => setQuery("")}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
              >
                <X className="h-4 w-4" />
              </button>
            )}
          </div>

          {/* Two-column: Graph + Group Cards */}
          <div className="grid gap-4 lg:grid-cols-5">

            {/* Group Cards */}
            <div className="lg:col-span-2 space-y-2 max-h-[600px] overflow-y-auto pr-1">
              <p className="text-[10px] font-bold uppercase tracking-wider text-foreground/50 px-0.5">
                {visibleGroups.length} Grup — klik untuk pilih
              </p>
              {visibleGroups.map((group) => (
                <GroupCard
                  key={group.id}
                  group={group}
                  active={selectedGroupId === group.id}
                  onSelect={() => setSelectedGroupId(group.id)}
                />
              ))}
              {visibleGroups.length === 0 && (
                <div className="rounded-xl border border-border/50 bg-secondary/20 py-8 text-center text-sm text-muted-foreground">
                  Tidak ada grup yang cocok.
                </div>
              )}
            </div>

            {/* Network Graph */}
            <div className="rounded-xl border border-border/60 bg-background/50 overflow-hidden lg:col-span-3">
              <div className="flex items-center justify-between border-b border-border/40 px-3 py-2">
                <div className="flex items-center gap-3 text-[11px] text-foreground/60">
                  <span className="flex items-center gap-1.5">
                    <span className="h-2 w-2 rounded-full bg-[hsl(263,70%,62%)]" />
                    Grup
                  </span>
                  <span className="flex items-center gap-1.5">
                    <span className="h-2 w-2 rounded-full bg-[hsl(152,69%,46%)]" />
                    Gain
                  </span>
                  <span className="flex items-center gap-1.5">
                    <span className="h-2 w-2 rounded-full bg-[hsl(0,84%,63%)]" />
                    Loss
                  </span>
                  <span className="text-foreground/40">
                    {graphData.nodes.length} nodes
                  </span>
                </div>
                <span className="text-[10px] text-foreground/40 hidden sm:block">
                  Hover → highlight · Drag · Scroll zoom
                </span>
              </div>
              {graphData.nodes.length > 0 ? (
                <svg ref={svgRef} className="h-[520px] w-full" />
              ) : (
                <div className="grid h-[260px] place-items-center">
                  <div className="text-center">
                    <Network className="mx-auto h-10 w-10 text-muted-foreground/25 mb-2" />
                    <p className="text-sm text-muted-foreground">Tidak ada grup yang cocok.</p>
                  </div>
                </div>
              )}
            </div>
          </div>

        </div>
      </div>

      {/* ── Selected Group Detail ─────────────────────── */}
      {selectedGroup && (
        <div className="rounded-2xl border border-border bg-card overflow-hidden">
          <div className="border-b border-border bg-gradient-to-r from-amber-500/8 via-transparent to-transparent px-5 py-4">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <div className="flex items-center gap-3">
                <div className="flex h-9 w-9 items-center justify-center rounded-xl border border-amber-500/25 bg-amber-500/15">
                  <Crown className="h-4.5 w-4.5 text-amber-500" />
                </div>
                <div>
                  <h3 className="text-sm font-extrabold text-foreground">
                    {selectedGroup.name}
                  </h3>
                  <p className="text-[11px] text-muted-foreground">
                    {selectedGroup.controller} · {selectedGroup.companyCount} saham publik
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <div className="text-right">
                  <p className="text-[10px] text-muted-foreground">Market Cap</p>
                  <p className="font-mono font-bold text-foreground">{fmt(selectedGroup.totalMarketCap)}</p>
                </div>
                <span
                  className={`rounded-xl px-3 py-1.5 font-mono text-sm font-bold ${
                    selectedGroup.averagePerformance >= 0
                      ? "bg-gain/15 text-gain"
                      : "bg-loss/15 text-loss"
                  }`}
                >
                  {selectedGroup.averagePerformance >= 0 ? "+" : ""}
                  {selectedGroup.averagePerformance.toFixed(2)}%
                </span>
              </div>
            </div>
          </div>

          <div className="p-4">
            {/* Performance bar across companies */}
            <div className="mb-4 grid grid-cols-2 gap-2 sm:grid-cols-3 md:grid-cols-4 xl:grid-cols-6">
              {selectedGroup.companies.map((company) => {
                const gain = company.changePercent >= 0;
                return (
                  <button
                    key={company.ticker}
                    onClick={() => navigate(`/stock/${company.ticker}`)}
                    className="rounded-xl border border-border bg-secondary/30 p-2.5 text-left transition-all hover:border-primary/30 hover:bg-accent/40"
                  >
                    <div className="flex items-center justify-between mb-1">
                      <span className="font-mono text-xs font-extrabold text-foreground">
                        {shortTicker(company.ticker)}
                      </span>
                      {company.source === "live" ? (
                        <span className="h-1.5 w-1.5 rounded-full bg-gain animate-pulse" title="Live" />
                      ) : (
                        <span className="h-1.5 w-1.5 rounded-full bg-border" title="Seed" />
                      )}
                    </div>
                    <p className="text-[10px] text-muted-foreground truncate mb-1.5">{company.name}</p>
                    <p className="font-mono text-[10px] text-foreground/70">{fmtPrice(company.price)}</p>
                    <div className="mt-1.5 h-1 rounded-full bg-border/50">
                      <div
                        className={`h-full rounded-full ${gain ? "bg-gain" : "bg-loss"}`}
                        style={{ width: `${Math.min(Math.abs(company.changePercent) * 10, 100)}%` }}
                      />
                    </div>
                    <p className={`mt-1 font-mono text-[10px] font-bold ${gain ? "text-gain" : "text-loss"}`}>
                      {gain ? "+" : ""}{company.changePercent.toFixed(2)}%
                    </p>
                  </button>
                );
              })}
            </div>

            {/* Table */}
            <div className="overflow-x-auto rounded-xl border border-border/60">
              <table className="w-full text-xs">
                <thead>
                  <tr className="bg-secondary/60">
                    <th className="w-8 px-3 py-2.5 text-center text-[10px] font-bold text-foreground/40">#</th>
                    <th className="px-3 py-2.5 text-left text-[10px] font-bold uppercase tracking-wider text-foreground/70">
                      Ticker / Nama
                    </th>
                    <th className="px-3 py-2.5 text-right text-[10px] font-bold uppercase tracking-wider text-foreground/70">
                      Market Cap
                    </th>
                    <th className="px-3 py-2.5 text-right text-[10px] font-bold uppercase tracking-wider text-foreground/70">
                      Harga
                    </th>
                    <th className="px-3 py-2.5 text-right text-[10px] font-bold uppercase tracking-wider text-foreground/70">
                      Perf Hari Ini
                    </th>
                    <th className="px-3 py-2.5 text-left text-[10px] font-bold uppercase tracking-wider text-foreground/70">
                      Data
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border/40">
                  {selectedGroup.companies.map((company, idx) => {
                    const gain = company.changePercent >= 0;
                    const mcPct = selectedGroup.totalMarketCap > 0
                      ? (company.marketCap / selectedGroup.totalMarketCap) * 100
                      : 0;
                    return (
                      <tr
                        key={company.ticker}
                        className="group cursor-pointer transition-colors hover:bg-accent/30"
                        onClick={() => navigate(`/stock/${company.ticker}`)}
                      >
                        <td className="px-3 py-3 text-center text-[10px] font-mono text-foreground/30">
                          {idx + 1}
                        </td>
                        <td className="px-3 py-3">
                          <div className="flex items-center gap-2">
                            <span className="font-mono font-extrabold text-foreground">
                              {shortTicker(company.ticker)}
                            </span>
                            <span className="text-foreground/70">{company.name}</span>
                            <ArrowUpRight className="h-3 w-3 text-muted-foreground/40 opacity-0 group-hover:opacity-100 transition-opacity" />
                          </div>
                        </td>
                        <td className="px-3 py-3 text-right">
                          <div className="flex flex-col items-end gap-0.5">
                            <span className="font-mono font-bold text-foreground">{fmt(company.marketCap)}</span>
                            <div className="w-16 h-1 rounded-full bg-border/40">
                              <div
                                className="h-full rounded-full bg-violet-500/60"
                                style={{ width: `${Math.min(mcPct, 100)}%` }}
                              />
                            </div>
                          </div>
                        </td>
                        <td className="px-3 py-3 text-right font-mono text-foreground">
                          {fmtPrice(company.price)}
                        </td>
                        <td className="px-3 py-3 text-right">
                          <div className={`inline-flex items-center gap-1 rounded-lg px-2 py-1 font-mono font-bold ${
                            gain ? "bg-gain/15 text-gain" : "bg-loss/15 text-loss"
                          }`}>
                            {gain ? <TrendingUp className="h-3 w-3" /> : <TrendingDown className="h-3 w-3" />}
                            {gain ? "+" : ""}{company.changePercent.toFixed(2)}%
                          </div>
                        </td>
                        <td className="px-3 py-3">
                          <span className={`rounded-full border px-2 py-0.5 text-[10px] font-semibold ${
                            company.source === "live"
                              ? "border-gain/30 bg-gain/10 text-gain"
                              : "border-border bg-secondary text-muted-foreground"
                          }`}>
                            {company.source === "live" ? "● Live" : "○ Seed"}
                          </span>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* ── Investor Network ──────────────────────────── */}
      <div className="rounded-2xl border border-border bg-card overflow-hidden">
        <div className="border-b border-border bg-gradient-to-r from-sky-500/8 via-transparent to-transparent px-5 py-4">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div className="flex items-center gap-3">
              <div className="flex h-9 w-9 items-center justify-center rounded-xl border border-sky-500/25 bg-sky-500/15">
                <GitMerge className="h-4.5 w-4.5 text-sky-500" />
              </div>
              <div>
                <h3 className="text-sm font-extrabold text-foreground">
                  Investor Network
                </h3>
                <p className="text-[11px] text-muted-foreground">
                  Top cross-holding investors berdasarkan jumlah saham yang dipegang ·{" "}
                  <span className="text-sky-600 dark:text-sky-400 font-semibold">
                    {coverage.coveredTickerCount}/{coverage.totalUniverseCount} tickers
                  </span>{" "}
                  terindeks
                </p>
              </div>
            </div>
            <div className="flex items-center gap-2 text-[11px] text-foreground/60">
              <span className="inline-flex items-center gap-1.5 rounded-lg border border-border bg-secondary/50 px-2.5 py-1.5">
                <Landmark className="h-3.5 w-3.5 text-emerald-500" />
                <span className="font-semibold">Local</span>
              </span>
              <span className="inline-flex items-center gap-1.5 rounded-lg border border-border bg-secondary/50 px-2.5 py-1.5">
                <Globe2 className="h-3.5 w-3.5 text-sky-500" />
                <span className="font-semibold">Foreign</span>
              </span>
            </div>
          </div>
        </div>

        <div className="p-4 space-y-3">
          {/* Search */}
          <div className="relative">
            <Search className="absolute left-3 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-muted-foreground" />
            <input
              value={investorSearch}
              onChange={(e) => setInvestorSearch(e.target.value)}
              placeholder="Cari investor..."
              className="w-full rounded-xl border border-border bg-secondary/40 py-2 pl-9 pr-4 text-xs text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-1 focus:ring-primary/50"
            />
          </div>

          {/* Grid of investor cards */}
          <div className="grid gap-2 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            {filteredCrossHolders.map((inv, idx) => {
              const tickers = investorConnectionIndex.get(inv.investorId) ?? [];
              const isExpanded = expandedInvestorId === inv.investorId;
              const maxPct = topCrossHolders[0]?.tickerCount ?? 1;
              const barWidth = Math.min((inv.tickerCount / maxPct) * 100, 100);

              return (
                <div
                  key={inv.investorId}
                  className={`rounded-xl border transition-all ${
                    isExpanded
                      ? "border-primary/40 bg-primary/5 col-span-1 sm:col-span-2"
                      : "border-border bg-card hover:border-border/80"
                  }`}
                >
                  <button
                    onClick={() =>
                      setExpandedInvestorId(isExpanded ? null : inv.investorId)
                    }
                    className="w-full p-3 text-left"
                  >
                    <div className="flex items-start justify-between gap-2">
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2">
                          <span className="text-[10px] font-mono text-foreground/30">
                            #{idx + 1}
                          </span>
                          <p className="text-xs font-extrabold text-foreground truncate">
                            {inv.investorName}
                          </p>
                        </div>
                        <div className="mt-1 flex items-center gap-1.5 flex-wrap">
                          <span className={`rounded-full border px-2 py-0.5 text-[10px] font-bold ${typeBadge(inv.investorType)}`}>
                            {inv.investorType}
                          </span>
                          <span className={`rounded-full border px-2 py-0.5 text-[10px] font-bold ${
                            inv.origin === "Local"
                              ? "border-emerald-400/40 bg-emerald-500/15 text-emerald-700 dark:text-emerald-300"
                              : "border-sky-400/40 bg-sky-500/15 text-sky-700 dark:text-sky-300"
                          }`}>
                            {inv.origin}
                          </span>
                        </div>
                      </div>
                      <div className="text-right shrink-0">
                        <p className="font-mono font-extrabold text-foreground text-sm">
                          {inv.tickerCount}
                        </p>
                        <p className="text-[10px] text-muted-foreground">saham</p>
                      </div>
                    </div>

                    <div className="mt-2 h-1.5 rounded-full bg-border/40">
                      <div
                        className="h-full rounded-full bg-primary/60 transition-all"
                        style={{ width: `${barWidth}%` }}
                      />
                    </div>
                    <div className="mt-1 flex items-center justify-between text-[10px] text-muted-foreground">
                      <span>
                        {inv.totalPercentage.toFixed(1)}% total tracked
                      </span>
                      <span className="flex items-center gap-1">
                        {isExpanded ? <ChevronDown className="h-3 w-3" /> : <ChevronRight className="h-3 w-3" />}
                        {isExpanded ? "Tutup" : "Lihat portofolio"}
                      </span>
                    </div>
                  </button>

                  {isExpanded && (
                    <div className="border-t border-border/50 p-3">
                      <p className="mb-2 text-[10px] font-bold uppercase tracking-wider text-foreground/50">
                        Saham yang dipegang ({tickers.length})
                      </p>
                      <div className="flex flex-wrap gap-1.5">
                        {tickers.map((ticker) => (
                          <button
                            key={ticker}
                            onClick={() => navigate(`/stock/${ticker}`)}
                            className="inline-flex items-center gap-1 rounded-lg border border-border bg-secondary/60 px-2 py-1 text-[11px] font-semibold text-foreground transition-colors hover:border-primary/30 hover:bg-accent"
                          >
                            {shortTicker(ticker)}
                            <ArrowUpRight className="h-3 w-3 text-muted-foreground/50" />
                          </button>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              );
            })}

            {filteredCrossHolders.length === 0 && (
              <div className="col-span-full rounded-xl border border-border/50 bg-secondary/20 py-10 text-center">
                <Users className="mx-auto h-8 w-8 text-muted-foreground/30 mb-2" />
                <p className="text-sm text-muted-foreground">Tidak ada investor yang cocok.</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default ConglomerateMaps;
