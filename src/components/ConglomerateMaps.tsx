import { useEffect, useMemo, useRef, useState } from "react";
import * as d3 from "d3";
import {
  ArrowUpRight,
  Building2,
  Crown,
  FilterX,
  Network,
  Search,
  TrendingDown,
  TrendingUp,
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
  type ConglomerateGroupView,
} from "@/lib/conglomerate";

type Props = {
  stocks: Stock[];
};

type Scope = "all" | "selected";
type SimNode = ConglomerateGraphNode & d3.SimulationNodeDatum;
type SimLink = ConglomerateGraphLink & d3.SimulationLinkDatum<SimNode>;

function formatPrice(value: number): string {
  return `Rp${Math.round(value).toLocaleString("id-ID")}`;
}

function shortTicker(ticker: string): string {
  return ticker.replace(".JK", "");
}

function nodeRadius(node: ConglomerateGraphNode): number {
  if (node.kind === "group") return 22;
  return Math.max(
    8,
    Math.min(18, 8 + Math.log10(Math.max(node.marketCap, 1e6))),
  );
}

function nodeColor(node: ConglomerateGraphNode): string {
  if (node.kind === "group") return "hsl(263, 70%, 62%)";
  if (node.changePercent >= 0) return "hsl(152, 69%, 46%)";
  return "hsl(0, 84%, 63%)";
}

function linkColor(link: ConglomerateGraphLink): string {
  return link.changePercent >= 0 ? "hsl(152, 69%, 46%)" : "hsl(0, 84%, 63%)";
}

const ConglomerateMaps = ({ stocks }: Props) => {
  const navigate = useNavigate();
  const svgRef = useRef<SVGSVGElement | null>(null);
  const [query, setQuery] = useState("");
  const [mapScope, setMapScope] = useState<Scope>("all");
  const [selectedGroupId, setSelectedGroupId] = useState<string>("");

  const allGroups = useMemo(
    () => buildConglomerateGroups(stocks, conglomerateGroupSeeds),
    [stocks],
  );

  const visibleGroups = useMemo(() => {
    const normalized = query.trim().toLowerCase();
    if (!normalized) return allGroups;

    return allGroups.filter((group) => {
      if (
        group.name.toLowerCase().includes(normalized) ||
        group.controller.toLowerCase().includes(normalized)
      ) {
        return true;
      }

      return group.companies.some(
        (company) =>
          company.ticker.toLowerCase().includes(normalized) ||
          company.name.toLowerCase().includes(normalized),
      );
    });
  }, [allGroups, query]);

  useEffect(() => {
    if (!selectedGroupId && visibleGroups.length > 0) {
      setSelectedGroupId(visibleGroups[0].id);
      return;
    }

    if (
      selectedGroupId &&
      visibleGroups.every((group) => group.id !== selectedGroupId)
    ) {
      setSelectedGroupId(visibleGroups[0]?.id ?? "");
    }
  }, [selectedGroupId, visibleGroups]);

  const selectedGroup = useMemo(
    () => visibleGroups.find((group) => group.id === selectedGroupId),
    [selectedGroupId, visibleGroups],
  );

  const groupsForMap = useMemo(() => {
    if (mapScope === "selected") {
      return selectedGroup ? [selectedGroup] : [];
    }
    return visibleGroups;
  }, [mapScope, selectedGroup, visibleGroups]);

  const graphData = useMemo(
    () => buildConglomerateGraph(groupsForMap),
    [groupsForMap],
  );

  const totalCompanies = useMemo(
    () => visibleGroups.reduce((sum, group) => sum + group.companies.length, 0),
    [visibleGroups],
  );

  const totalMarketCap = useMemo(
    () => visibleGroups.reduce((sum, group) => sum + group.totalMarketCap, 0),
    [visibleGroups],
  );

  const averagePerformance = useMemo(() => {
    if (visibleGroups.length === 0) return 0;
    const sum = visibleGroups.reduce(
      (acc, group) => acc + group.averagePerformance,
      0,
    );
    return Number((sum / visibleGroups.length).toFixed(2));
  }, [visibleGroups]);

  const leaders = useMemo(
    () =>
      [...visibleGroups].sort(
        (a, b) => b.averagePerformance - a.averagePerformance,
      ),
    [visibleGroups],
  );

  useEffect(() => {
    const svgEl = svgRef.current;
    if (!svgEl) return;

    const { nodes, links } = graphData;
    const svg = d3.select(svgEl);
    svg.selectAll("*").remove();

    if (nodes.length === 0) return;

    const width = svgEl.clientWidth || 960;
    const height = 500;
    svg.attr("viewBox", `0 0 ${width} ${height}`);

    const root = svg.append("g");
    svg.call(
      d3
        .zoom<SVGSVGElement, unknown>()
        .scaleExtent([0.45, 2.6])
        .on("zoom", (event) => {
          root.attr("transform", event.transform);
        }),
    );

    const simNodes: SimNode[] = nodes.map((node) => ({ ...node }));
    const simLinks: SimLink[] = links.map((link) => ({ ...link }));

    const linkLayer = root
      .append("g")
      .attr("stroke-linecap", "round")
      .selectAll("line")
      .data(simLinks)
      .join("line")
      .attr("stroke", (d) => linkColor(d))
      .attr("stroke-opacity", 0.35)
      .attr("stroke-width", (d) => 1 + Math.min(5, d.marketCap / 2e11));

    const nodeLayer = root
      .append("g")
      .selectAll<SVGGElement, SimNode>("g")
      .data(simNodes)
      .join("g")
      .style("cursor", "pointer");

    nodeLayer
      .append("circle")
      .attr("r", (d) => nodeRadius(d))
      .attr("fill", (d) => nodeColor(d))
      .attr("stroke", (d) => {
        if (d.kind === "group" && d.groupId === selectedGroupId) {
          return "hsl(var(--primary))";
        }
        return "hsl(var(--background))";
      })
      .attr("stroke-width", (d) =>
        d.kind === "group" && d.groupId === selectedGroupId ? 4 : 2,
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
        d.kind === "group"
          ? `${d.label}\nSingle click: pilih grup`
          : `${d.label}\nPerf ${d.changePercent.toFixed(2)}%\nDouble click: buka detail saham`,
      );

    nodeLayer.on("click", (_event, node) => {
      if (node.kind === "group" && node.groupId) {
        setSelectedGroupId(node.groupId);
        return;
      }

      if (node.kind === "company" && node.groupId) {
        setSelectedGroupId(node.groupId);
      }
    });

    nodeLayer.on("dblclick", (_event, node) => {
      if (node.kind === "company" && node.ticker) {
        navigate(`/stock/${node.ticker}`);
      }
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
            return 42 + nodeRadius(source) + nodeRadius(target);
          })
          .strength(0.45),
      )
      .force(
        "charge",
        d3.forceManyBody().strength((d) => (d.kind === "group" ? -900 : -260)),
      )
      .force("center", d3.forceCenter(width / 2, height / 2))
      .force(
        "collide",
        d3.forceCollide<SimNode>().radius((d) => nodeRadius(d) + 8),
      );

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

    return () => {
      simulation.stop();
    };
  }, [graphData, navigate, selectedGroupId]);

  return (
    <div className="space-y-5">
      <div className="rounded-2xl border border-border bg-card p-4 md:p-5">
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div>
            <h3 className="flex items-center gap-2 text-sm font-extrabold text-foreground">
              <Network className="h-4 w-4 text-primary" />
              Conglomerate Maps
            </h3>
            <p className="mt-1 text-xs text-foreground/80">
              Peta grup konglomerat Indonesia dan emiten publik di bawah kendali
              mereka. Klik node, lalu double click saham untuk buka detail.
            </p>
          </div>
          <div className="flex flex-wrap gap-2">
            <button
              onClick={() => {
                setQuery("");
                setMapScope("all");
              }}
              className="inline-flex items-center gap-1.5 rounded-lg border border-border bg-secondary/60 px-2.5 py-1.5 text-xs font-semibold text-foreground hover:bg-accent"
            >
              <FilterX className="h-3.5 w-3.5 text-primary" />
              Reset
            </button>
            {selectedGroup ? (
              <button
                onClick={() =>
                  setMapScope((prev) => (prev === "all" ? "selected" : "all"))
                }
                className="rounded-lg border border-primary/35 bg-primary/10 px-2.5 py-1.5 text-xs font-semibold text-primary hover:bg-primary/20"
              >
                Scope: {mapScope === "all" ? "All Groups" : selectedGroup.name}
              </button>
            ) : null}
          </div>
        </div>

        <div className="mt-4 grid gap-3 md:grid-cols-2 xl:grid-cols-4">
          <div className="rounded-xl border border-border bg-secondary/40 p-3">
            <p className="text-[10px] font-bold uppercase tracking-wider text-foreground/70">
              Total Grup
            </p>
            <p className="mt-1 font-mono text-lg font-extrabold text-foreground">
              {visibleGroups.length}
            </p>
          </div>
          <div className="rounded-xl border border-border bg-secondary/40 p-3">
            <p className="text-[10px] font-bold uppercase tracking-wider text-foreground/70">
              Total Emiten
            </p>
            <p className="mt-1 font-mono text-lg font-extrabold text-foreground">
              {totalCompanies}
            </p>
          </div>
          <div className="rounded-xl border border-border bg-secondary/40 p-3">
            <p className="text-[10px] font-bold uppercase tracking-wider text-foreground/70">
              Combined Market Cap
            </p>
            <p className="mt-1 font-mono text-lg font-extrabold text-foreground">
              {formatRupiah(totalMarketCap)}
            </p>
          </div>
          <div className="rounded-xl border border-border bg-secondary/40 p-3">
            <p className="text-[10px] font-bold uppercase tracking-wider text-foreground/70">
              Avg Group Perf
            </p>
            <p
              className={`mt-1 font-mono text-lg font-extrabold ${
                averagePerformance >= 0 ? "text-gain" : "text-loss"
              }`}
            >
              {averagePerformance >= 0 ? "+" : ""}
              {averagePerformance.toFixed(2)}%
            </p>
          </div>
        </div>

        <div className="mt-4 flex flex-wrap items-center gap-2 rounded-xl border border-border bg-secondary/35 px-3 py-2">
          <Search className="h-4 w-4 text-primary" />
          <input
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            placeholder="Cari grup, controller, ticker, atau nama perusahaan..."
            className="w-full bg-transparent text-sm text-foreground placeholder:text-foreground/55 outline-none md:flex-1"
          />
        </div>

        <div className="mt-4 rounded-xl border border-border/70 bg-background/40 p-2">
          {graphData.nodes.length > 0 ? (
            <svg ref={svgRef} className="h-[500px] w-full" />
          ) : (
            <div className="grid h-[260px] place-items-center text-sm text-foreground/70">
              Tidak ada grup yang cocok dengan pencarian saat ini.
            </div>
          )}
        </div>

        <div className="mt-3 flex flex-wrap gap-2">
          {visibleGroups.map((group) => {
            const active = selectedGroupId === group.id;
            return (
              <button
                key={group.id}
                onClick={() => setSelectedGroupId(group.id)}
                className={`rounded-lg border px-2.5 py-1.5 text-xs font-semibold transition-colors ${
                  active
                    ? "border-primary/45 bg-primary/15 text-primary"
                    : "border-border bg-secondary/40 text-foreground hover:bg-accent"
                }`}
              >
                {group.name}
              </button>
            );
          })}
        </div>
      </div>

      <div className="grid gap-4 lg:grid-cols-3">
        <div className="rounded-xl border border-border bg-card p-4">
          <h4 className="text-xs font-bold uppercase tracking-wider text-foreground">
            Group Leaders
          </h4>
          <div className="mt-3 space-y-2">
            {leaders.slice(0, 5).map((group) => (
              <button
                key={group.id}
                onClick={() => setSelectedGroupId(group.id)}
                className="w-full rounded-lg border border-border bg-secondary/35 p-3 text-left hover:bg-accent/60"
              >
                <div className="flex items-center justify-between gap-2">
                  <p className="text-xs font-bold text-foreground">
                    {group.name}
                  </p>
                  <span
                    className={`font-mono text-xs font-bold ${
                      group.averagePerformance >= 0 ? "text-gain" : "text-loss"
                    }`}
                  >
                    {group.averagePerformance >= 0 ? "+" : ""}
                    {group.averagePerformance.toFixed(2)}%
                  </span>
                </div>
                <p className="mt-1 text-[11px] text-foreground/75">
                  {group.companyCount} saham ·{" "}
                  {formatRupiah(group.totalMarketCap)}
                </p>
              </button>
            ))}
          </div>
        </div>

        <div className="rounded-xl border border-border bg-card p-4 lg:col-span-2">
          {selectedGroup ? (
            <>
              <div className="flex flex-wrap items-start justify-between gap-3">
                <div>
                  <h4 className="flex items-center gap-2 text-sm font-extrabold text-foreground">
                    <Crown className="h-4 w-4 text-primary" />
                    {selectedGroup.name}
                  </h4>
                  <p className="text-xs text-foreground/80">
                    {selectedGroup.controller} · {selectedGroup.companyCount}{" "}
                    saham · {formatRupiah(selectedGroup.totalMarketCap)}
                  </p>
                </div>
                <span
                  className={`rounded-lg px-2.5 py-1 text-xs font-bold ${
                    selectedGroup.averagePerformance >= 0
                      ? "bg-gain/15 text-gain"
                      : "bg-loss/15 text-loss"
                  }`}
                >
                  Perf Grup {selectedGroup.averagePerformance >= 0 ? "+" : ""}
                  {selectedGroup.averagePerformance.toFixed(2)}%
                </span>
              </div>

              <div className="mt-3 overflow-x-auto rounded-lg border border-border/70">
                <table className="w-full text-xs">
                  <thead className="bg-secondary/60">
                    <tr>
                      <th className="px-3 py-2 text-left font-bold uppercase tracking-wider text-foreground/70">
                        Market Cap
                      </th>
                      <th className="px-3 py-2 text-left font-bold uppercase tracking-wider text-foreground/70">
                        Name
                      </th>
                      <th className="px-3 py-2 text-right font-bold uppercase tracking-wider text-foreground/70">
                        Perf
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {selectedGroup.companies.map((company) => (
                      <tr
                        key={`${selectedGroup.id}-${company.ticker}`}
                        className="cursor-pointer border-t border-border/60 odd:bg-background/30 even:bg-secondary/25 hover:bg-accent/55"
                        onClick={() => navigate(`/stock/${company.ticker}`)}
                      >
                        <td className="px-3 py-2 font-mono text-foreground">
                          {formatRupiah(company.marketCap)}
                        </td>
                        <td className="px-3 py-2">
                          <div className="flex items-center justify-between gap-2">
                            <div>
                              <p className="font-bold text-foreground">
                                {shortTicker(company.ticker)}
                              </p>
                              <p className="text-[11px] text-foreground/75">
                                {company.name}
                              </p>
                              <p className="font-mono text-[11px] text-foreground/75">
                                {formatPrice(company.price)}
                              </p>
                            </div>
                            <span className="rounded-full border border-border/70 bg-secondary/60 px-2 py-0.5 text-[10px] font-semibold text-foreground/80">
                              {company.source === "live" ? "Live" : "Seed"}
                            </span>
                          </div>
                        </td>
                        <td className="px-3 py-2 text-right">
                          <div
                            className={`inline-flex items-center gap-1 rounded-lg px-2 py-1 font-mono font-bold ${
                              company.changePercent >= 0
                                ? "bg-gain/15 text-gain"
                                : "bg-loss/15 text-loss"
                            }`}
                          >
                            {company.changePercent >= 0 ? (
                              <TrendingUp className="h-3.5 w-3.5" />
                            ) : (
                              <TrendingDown className="h-3.5 w-3.5" />
                            )}
                            {company.changePercent >= 0 ? "+" : ""}
                            {company.changePercent.toFixed(2)}%
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </>
          ) : (
            <div className="grid h-52 place-items-center text-sm text-foreground/70">
              Pilih grup konglomerat untuk melihat detail.
            </div>
          )}
        </div>
      </div>

      {selectedGroup ? (
        <div className="rounded-xl border border-border bg-card p-4">
          <h4 className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-foreground">
            <Building2 className="h-4 w-4 text-primary" />
            Mapping {selectedGroup.name}
          </h4>
          <p className="mt-1 text-xs text-foreground/75">
            Semua saham di bawah grup ini sudah tertaut ke halaman detail emiten
            dan terhubung di peta network.
          </p>
          <div className="mt-3 flex flex-wrap gap-2">
            {selectedGroup.companies.map((company) => (
              <button
                key={`chip-${company.ticker}`}
                onClick={() => navigate(`/stock/${company.ticker}`)}
                className="inline-flex items-center gap-1.5 rounded-lg border border-border bg-secondary/40 px-2.5 py-1.5 text-xs font-semibold text-foreground hover:bg-accent"
              >
                {shortTicker(company.ticker)}
                <ArrowUpRight className="h-3.5 w-3.5 text-primary" />
              </button>
            ))}
          </div>
        </div>
      ) : null}
    </div>
  );
};

export default ConglomerateMaps;
