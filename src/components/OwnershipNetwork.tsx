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
  Network,
  Link2,
  Search,
  UserRound,
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
    return "border border-emerald-400/40 bg-emerald-500/20 text-emerald-700 dark:text-emerald-200";
  }
  return "border border-sky-400/40 bg-sky-500/20 text-sky-700 dark:text-sky-200";
}

function provenanceBadgeClass(provenance: "researched" | "estimated"): string {
  if (provenance === "researched") {
    return "border border-blue-400/50 bg-blue-500/15 text-blue-800 dark:text-blue-200";
  }
  return "border border-amber-400/50 bg-amber-500/15 text-amber-800 dark:text-amber-200";
}

const MAX_ALL_VIEW_NODES = 60;

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

  const localSharePct =
    selectedTickerSplit.totalShares > 0
      ? (selectedTickerSplit.local.shares / selectedTickerSplit.totalShares) *
        100
      : 0;
  const foreignSharePct =
    selectedTickerSplit.totalShares > 0
      ? (selectedTickerSplit.foreign.shares / selectedTickerSplit.totalShares) *
        100
      : 0;

  const activeTicker = tableTicker.replace(".JK", "");

  const toggleTableSort = (
    key: typeof tableSort.key,
  ) => {
    setTableSort((prev) =>
      prev.key === key
        ? { key, dir: prev.dir === "desc" ? "asc" : "desc" }
        : { key, dir: "desc" },
    );
  };

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
    const height = 500;

    const svg = d3.select(svgEl);
    svg.selectAll("*").remove();
    svg.attr("viewBox", `0 0 ${width} ${height}`);

    const root = svg.append("g");
    const zoom = d3
      .zoom<SVGSVGElement, unknown>()
      .scaleExtent([0.45, 2.5])
      .on("zoom", (event) => {
        root.attr("transform", event.transform);
      });
    svg.call(zoom);

    const simNodes: SimNode[] = nodes.map((node) => ({ ...node }));
    const simLinks: SimLink[] = links.map((link) => ({ ...link }));

    const linkLayer = root
      .append("g")
      .attr("stroke-linecap", "round")
      .selectAll("line")
      .data(simLinks)
      .join("line")
      .attr("stroke", (d) => linkStroke(d))
      .attr("stroke-opacity", 0.45)
      .attr("stroke-width", (d) => 1 + Math.min(6, d.percentage * 0.35));

    const nodeLayer = root
      .append("g")
      .selectAll<SVGGElement, SimNode>("g")
      .data(simNodes)
      .join("g")
      .style("cursor", "pointer");

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
        d.kind === "ticker" && d.ticker === tableTicker ? 4 : 2,
      );

    nodeLayer
      .append("text")
      .text((d) => d.label)
      .attr("y", (d) => nodeRadius(d) + 12)
      .attr("text-anchor", "middle")
      .attr("font-size", 10)
      .attr("font-weight", 700)
      .attr("fill", "hsl(var(--foreground))");

    nodeLayer
      .append("title")
      .text((d) =>
        d.kind === "ticker"
          ? `${d.label}\nTracked ownership: ${d.totalPercentage.toFixed(2)}%\nSingle click: pilih ticker\nDouble click: buka detail saham`
          : `${d.label}\n${d.investorType} • ${d.origin}\nConnected tickers: ${d.degree}`,
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
            return 40 + sourceRadius + targetRadius;
          })
          .strength(0.5),
      )
      .force(
        "charge",
        d3.forceManyBody<SimNode>().strength((d) => (d.kind === "ticker" ? -800 : -420)),
      )
      .force("center", d3.forceCenter(width / 2, height / 2))
      .force(
        "collide",
        d3.forceCollide<SimNode>().radius((d) => nodeRadius(d) + 8),
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

  return (
    <div className="space-y-5">
      <div className="rounded-2xl border border-border bg-card p-4 md:p-5">
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div>
            <h3 className="flex items-center gap-2 text-sm font-extrabold text-foreground">
              <Network className="h-4 w-4 text-primary" />
              Ownership Network Explorer
            </h3>
            <p className="mt-1 text-xs text-foreground/80">
              Single click node ticker untuk sinkron tabel. Double click untuk
              buka halaman detail saham. Drag & zoom untuk eksplorasi hubungan.
            </p>
          </div>
          <div className="flex flex-wrap gap-2 text-xs">
            <button
              onClick={() => {
                setInvestorType("All");
                setOrigin("All");
                setNetworkTicker(tableTicker);
              }}
              className="inline-flex items-center gap-1.5 rounded-lg border border-border bg-secondary/60 px-2.5 py-1.5 font-semibold text-foreground transition-colors hover:bg-accent"
            >
              <FilterX className="h-3.5 w-3.5 text-primary" />
              Reset Filter
            </button>
            <button
              onClick={() => navigate(`/stock/${tableTicker}`)}
              className="inline-flex items-center gap-1.5 rounded-lg border border-primary/35 bg-primary/10 px-2.5 py-1.5 font-semibold text-primary transition-colors hover:bg-primary/20"
            >
              Buka {activeTicker}
              <ArrowUpRight className="h-3.5 w-3.5" />
            </button>
          </div>
        </div>

        <div className="mt-4 grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
          <div className="rounded-xl border border-border bg-secondary/30 p-3">
            <p className="text-[10px] font-bold uppercase tracking-wider text-foreground/70">
              Investor Terhubung
            </p>
            <p className="mt-1 font-mono text-lg font-extrabold text-foreground">
              {tickerSummary.investorCount}
            </p>
            <p className="text-[11px] text-foreground/75">
              Local {tickerSummary.localInvestorCount} · Foreign{" "}
              {tickerSummary.foreignInvestorCount}
            </p>
          </div>
          <div className="rounded-xl border border-border bg-secondary/30 p-3">
            <p className="text-[10px] font-bold uppercase tracking-wider text-foreground/70">
              Holder Terbesar
            </p>
            <p className="mt-1 text-sm font-bold text-foreground">
              {tickerSummary.topInvestorName}
            </p>
            <p className="text-[11px] text-foreground/75">
              {tickerSummary.topInvestorType ?? "-"} ·{" "}
              {tickerSummary.topInvestorOrigin ?? "-"} ·{" "}
              {tickerSummary.topInvestorPercentage.toFixed(2)}%
            </p>
          </div>
          <div className="rounded-xl border border-border bg-secondary/30 p-3">
            <p className="text-[10px] font-bold uppercase tracking-wider text-foreground/70">
              Ownership Coverage
            </p>
            <p className="mt-1 font-mono text-lg font-extrabold text-foreground">
              {coverage.coveredTickerCount}/{ownershipUniverseTickerCount}
            </p>
            <p className="text-[11px] text-foreground/75">
              Indexed tickers · {coverage.coverageRatio.toFixed(2)}% coverage
            </p>
          </div>
          <div className="rounded-xl border border-border bg-secondary/30 p-3">
            <p className="text-[10px] font-bold uppercase tracking-wider text-foreground/70">
              Top Cross-Holding
            </p>
            <p className="mt-1 text-sm font-bold text-foreground">
              {topCrossHolders[0]?.investorName ?? "-"}
            </p>
            <p className="text-[11px] text-foreground/75">
              {topCrossHolders[0]?.tickerCount ?? 0} ticker ·{" "}
              {(topCrossHolders[0]?.totalPercentage ?? 0).toFixed(2)}%
            </p>
          </div>
        </div>

        <div className="mt-3 rounded-xl border border-border/70 bg-background/60 p-3">
          <p className="text-[10px] font-bold uppercase tracking-wider text-foreground/80">
            Ultimate Owner - {activeTicker}
          </p>
          <div className="mt-1 flex flex-wrap items-center gap-2 text-xs">
            <span className="font-semibold text-foreground">
              {activeOwner?.ownerName ?? "Belum tersedia"}
            </span>
            {activeOwner && (
              <span
                className={`rounded-full px-2 py-0.5 text-[10px] font-bold uppercase tracking-wide ${provenanceBadgeClass(activeOwner.provenance)}`}
              >
                {activeOwner.provenance === "researched"
                  ? "Researched"
                  : "Estimated"}
              </span>
            )}
            {activeOwner?.sourceUrl && (
              <a
                href={activeOwner.sourceUrl}
                target="_blank"
                rel="noreferrer"
                className="inline-flex items-center gap-1 rounded-full border border-border bg-secondary/70 px-2 py-0.5 text-[10px] font-semibold text-foreground transition-colors hover:bg-accent"
              >
                <Link2 className="h-3 w-3" />
                {activeOwner.sourceLabel ?? "Source"}
              </a>
            )}
          </div>
          <p className="mt-1 text-[11px] text-muted-foreground">
            Label `Researched` berasal dari snapshot riset MCP Exa + sumber
            terbuka. Label `Estimated` adalah pemodelan agar seluruh ticker
            tetap terindeks.
          </p>
        </div>

        <div className="mt-4 flex flex-wrap gap-2">
          {tickers.map((ticker) => {
            const active = tableTicker === ticker;
            return (
              <button
                key={ticker}
                onClick={() => {
                  setTableTicker(ticker);
                  setNetworkTicker(ticker);
                }}
                className={`rounded-lg border px-2.5 py-1.5 text-[11px] font-semibold transition-colors ${
                  active
                    ? "border-primary/45 bg-primary/15 text-primary"
                    : "border-border bg-secondary/40 text-foreground hover:bg-accent"
                }`}
              >
                {ticker.replace(".JK", "")}
              </button>
            );
          })}
        </div>

        <div className="mt-4 flex flex-wrap gap-2 text-xs">
          <label className="rounded-lg border border-border bg-secondary/70 px-2.5 py-1.5 text-foreground">
            Scope
            <select
              className="ml-2 rounded bg-background/70 font-semibold text-foreground outline-none"
              value={networkTicker}
              onChange={(event) => setNetworkTicker(event.target.value)}
            >
              <option value="All">Semua Ticker</option>
              {tickers.map((ticker) => (
                <option key={ticker} value={ticker}>
                  {ticker.replace(".JK", "")}
                </option>
              ))}
            </select>
          </label>
          <label className="rounded-lg border border-border bg-secondary/70 px-2.5 py-1.5 text-foreground">
            Investor Type
            <select
              className="ml-2 rounded bg-background/70 font-semibold text-foreground outline-none"
              value={investorType}
              onChange={(event) =>
                setInvestorType(
                  event.target.value as FilterOption<InvestorType>,
                )
              }
            >
              {investorTypeOptions.map((option) => (
                <option key={option} value={option}>
                  {option}
                </option>
              ))}
            </select>
          </label>
          <label className="rounded-lg border border-border bg-secondary/70 px-2.5 py-1.5 text-foreground">
            Origin
            <select
              className="ml-2 rounded bg-background/70 font-semibold text-foreground outline-none"
              value={origin}
              onChange={(event) =>
                setOrigin(event.target.value as FilterOption<InvestorOrigin>)
              }
            >
              {originOptions.map((option) => (
                <option key={option} value={option}>
                  {option}
                </option>
              ))}
            </select>
          </label>
        </div>

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
          ) : (
            <div className="grid h-[260px] place-items-center text-sm text-foreground/70">
              Data tidak tersedia untuk kombinasi filter ini.
            </div>
          )}
        </div>

        <div className="mt-3 flex flex-wrap items-center gap-4 text-[11px] text-foreground/75">
          <span className="inline-flex items-center gap-1.5">
            <span className="h-2.5 w-2.5 rounded-full bg-[hsl(45,93%,58%)]" />
            Ticker Nodes
          </span>
          <span className="inline-flex items-center gap-1.5">
            <span className="h-2.5 w-2.5 rounded-full bg-[hsl(152,69%,46%)]" />
            Local Investors
          </span>
          <span className="inline-flex items-center gap-1.5">
            <span className="h-2.5 w-2.5 rounded-full bg-[hsl(206,84%,57%)]" />
            Foreign Investors
          </span>
        </div>
      </div>

      <div className="grid gap-4 lg:grid-cols-3">
        <div className="rounded-xl border border-border bg-card p-4 lg:col-span-1">
          <h4 className="text-xs font-bold uppercase tracking-wider text-foreground">
            Local vs Foreign
          </h4>
          <label className="mt-3 flex items-center justify-between rounded-lg border border-border bg-secondary/70 px-2.5 py-1.5 text-xs text-foreground">
            Ticker
            <select
              className="rounded bg-background/70 font-semibold text-foreground outline-none"
              value={tableTicker}
              onChange={(event) => setTableTicker(event.target.value)}
            >
              {tickers.map((ticker) => (
                <option key={ticker} value={ticker}>
                  {ticker.replace(".JK", "")}
                </option>
              ))}
            </select>
          </label>

          <div className="mt-3 space-y-3">
            <div className="rounded-lg border border-border/60 bg-secondary/40 p-3">
              <div className="mb-1 flex items-center justify-between text-xs">
                <span className="inline-flex items-center gap-1.5 text-foreground/80">
                  <Landmark className="h-3.5 w-3.5 text-primary" />
                  Tracked Shares
                </span>
                <span className="font-mono font-bold text-foreground">
                  {formatShares(selectedTickerSplit.totalShares)}
                </span>
              </div>
              <p className="text-[11px] text-foreground/70">
                Coverage: {selectedTickerSplit.totalPercentage.toFixed(2)}% dari
                total saham beredar.
              </p>
            </div>

            <button
              onClick={() => setOrigin("Local")}
              className="w-full space-y-2 rounded-lg border border-border/60 bg-secondary/40 p-3 text-left transition-colors hover:bg-accent/60"
            >
              <div className="flex items-center justify-between text-xs">
                <span className="inline-flex items-center gap-1.5 text-foreground">
                  <Building2 className="h-3.5 w-3.5 text-emerald-500" />
                  Local
                </span>
                <span className="font-mono font-bold text-foreground">
                  {selectedTickerSplit.local.percentage.toFixed(2)}%
                </span>
              </div>
              <div className="h-2 rounded-full bg-border/70">
                <div
                  className="h-full rounded-full bg-emerald-500"
                  style={{ width: `${Math.min(localSharePct, 100)}%` }}
                />
              </div>
              <p className="font-mono text-[11px] text-foreground/70">
                {formatShares(selectedTickerSplit.local.shares)} shares
              </p>
            </button>

            <button
              onClick={() => setOrigin("Foreign")}
              className="w-full space-y-2 rounded-lg border border-border/60 bg-secondary/40 p-3 text-left transition-colors hover:bg-accent/60"
            >
              <div className="flex items-center justify-between text-xs">
                <span className="inline-flex items-center gap-1.5 text-foreground">
                  <Globe2 className="h-3.5 w-3.5 text-sky-500" />
                  Foreign
                </span>
                <span className="font-mono font-bold text-foreground">
                  {selectedTickerSplit.foreign.percentage.toFixed(2)}%
                </span>
              </div>
              <div className="h-2 rounded-full bg-border/70">
                <div
                  className="h-full rounded-full bg-sky-500"
                  style={{ width: `${Math.min(foreignSharePct, 100)}%` }}
                />
              </div>
              <p className="font-mono text-[11px] text-foreground/70">
                {formatShares(selectedTickerSplit.foreign.shares)} shares
              </p>
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
          <div className="flex flex-wrap items-center justify-between gap-2">
            <h4 className="text-xs font-bold uppercase tracking-wider text-foreground">
              Deep Ownership Table - {activeTicker}
            </h4>
            <button
              onClick={() => navigate(`/stock/${tableTicker}`)}
              className="inline-flex items-center gap-1.5 rounded-lg border border-primary/35 bg-primary/10 px-2 py-1 text-[11px] font-semibold text-primary transition-colors hover:bg-primary/20"
            >
              Lihat Saham
              <ArrowUpRight className="h-3.5 w-3.5" />
            </button>
          </div>
          <p className="mt-1 text-xs text-foreground/75">
            Breakdown investor lengkap. Klik badge type/origin pada row untuk
            apply filter cepat, klik source untuk buka referensi, dan klik
            ticker terhubung untuk pindah relasi.
          </p>

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
              <tbody>
                {sortedTableRows.map((row) => {
                  const connectedTickers =
                    investorConnectionIndex.get(row.investorId) ?? [];
                  return (
                    <tr
                      key={`${row.ticker}-${row.investorId}`}
                      className="border-t border-border/80 odd:bg-background/60 even:bg-secondary/30"
                    >
                      <td className="px-3 py-2 text-foreground">
                        <span className="inline-flex items-center gap-1.5 font-medium">
                          <UserRound className="h-3.5 w-3.5 text-primary" />
                          {row.investorName}
                        </span>
                      </td>
                      <td className="px-3 py-2">
                        <button
                          onClick={() => setInvestorType(row.investorType)}
                          className="rounded-full border border-border/70 bg-secondary/90 px-2 py-0.5 text-[10px] font-bold uppercase tracking-wide text-foreground hover:bg-accent"
                        >
                          {row.investorType}
                        </button>
                      </td>
                      <td className="px-3 py-2">
                        <button
                          onClick={() => setOrigin(row.origin)}
                          className={`rounded-full px-2 py-0.5 text-[10px] font-bold uppercase tracking-wide ${originBadgeClass(row.origin)}`}
                        >
                          {row.origin}
                        </button>
                      </td>
                      <td className="px-3 py-2 text-right font-mono text-foreground">
                        {formatShares(row.shares)}
                      </td>
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
                      <td className="px-3 py-2">
                        <span
                          className={`rounded-full px-2 py-0.5 text-[10px] font-bold uppercase tracking-wide ${provenanceBadgeClass(row.provenance)}`}
                        >
                          {row.provenance === "researched"
                            ? "Researched"
                            : "Estimated"}
                        </span>
                      </td>
                      <td className="px-3 py-2 text-foreground">
                        {row.sourceUrl ? (
                          <a
                            href={row.sourceUrl}
                            target="_blank"
                            rel="noreferrer"
                            className="inline-flex items-center gap-1 rounded-full border border-border bg-secondary/70 px-2 py-0.5 text-[10px] font-semibold text-foreground transition-colors hover:bg-accent"
                          >
                            <Link2 className="h-3 w-3" />
                            {row.sourceLabel ?? "Source"}
                          </a>
                        ) : (
                          <span className="text-[11px] text-muted-foreground">
                            {row.sourceLabel ?? "-"}
                          </span>
                        )}
                      </td>
                      <td className="px-3 py-2">
                        <div className="flex flex-wrap gap-1">
                          {connectedTickers.slice(0, 6).map((ticker) => (
                            <button
                              key={`${row.investorId}-${ticker}`}
                              onClick={() => {
                                setTableTicker(ticker);
                                setNetworkTicker(ticker);
                              }}
                              className={`rounded border px-1.5 py-0.5 text-[10px] font-semibold transition-colors ${
                                ticker === tableTicker
                                  ? "border-primary/50 bg-primary/15 text-primary"
                                  : "border-border bg-secondary/80 text-foreground hover:bg-accent"
                              }`}
                            >
                              {ticker.replace(".JK", "")}
                            </button>
                          ))}
                          {connectedTickers.length === 0 && (
                            <span className="text-[11px] text-muted-foreground">
                              -
                            </span>
                          )}
                        </div>
                      </td>
                    </tr>
                  );
                })}
                {sortedTableRows.length === 0 && (
                  <tr>
                    <td
                      colSpan={8}
                      className="px-3 py-6 text-center text-foreground/70"
                    >
                      Tidak ada data untuk kombinasi filter ini.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
};

export default OwnershipNetwork;
