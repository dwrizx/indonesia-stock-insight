import { describe, expect, it } from "vitest";
import {
  buildConglomerateGraph,
  buildConglomerateGroups,
  type ConglomerateGroupSeed,
} from "@/lib/conglomerate";

type StockLike = {
  ticker: string;
  name: string;
  price: number;
  changePercent: number;
  marketCap: number;
};

const groups: ConglomerateGroupSeed[] = [
  {
    id: "alpha",
    name: "Alpha Group",
    controller: "Founder A",
    companies: [
      {
        ticker: "AAA.JK",
        fallbackName: "AAA Fallback",
        fallbackPrice: 1200,
        fallbackChangePercent: 1.2,
        fallbackMarketCap: 100_000_000_000,
      },
      {
        ticker: "BBB.JK",
        fallbackName: "BBB Fallback",
        fallbackPrice: 800,
        fallbackChangePercent: -0.5,
        fallbackMarketCap: 80_000_000_000,
      },
    ],
  },
];

describe("buildConglomerateGroups", () => {
  it("uses live stock values when available and fallback values otherwise", () => {
    const stocks: StockLike[] = [
      {
        ticker: "AAA.JK",
        name: "AAA Live",
        price: 1500,
        changePercent: 2.5,
        marketCap: 120_000_000_000,
      },
    ];

    const built = buildConglomerateGroups(stocks, groups);
    expect(built).toHaveLength(1);

    const alpha = built[0];
    expect(alpha?.companyCount).toBe(2);
    expect(alpha?.companies[0]?.name).toBe("AAA Live");
    expect(alpha?.companies[0]?.source).toBe("live");
    expect(alpha?.companies[1]?.name).toBe("BBB Fallback");
    expect(alpha?.companies[1]?.source).toBe("seed");
  });

  it("computes aggregated market cap and average performance", () => {
    const stocks: StockLike[] = [
      {
        ticker: "AAA.JK",
        name: "AAA Live",
        price: 1500,
        changePercent: 2,
        marketCap: 120_000_000_000,
      },
      {
        ticker: "BBB.JK",
        name: "BBB Live",
        price: 750,
        changePercent: -1,
        marketCap: 80_000_000_000,
      },
    ];

    const built = buildConglomerateGroups(stocks, groups);
    const alpha = built[0];
    expect(alpha?.totalMarketCap).toBe(200_000_000_000);
    expect(alpha?.averagePerformance).toBe(0.5);
  });
});

describe("buildConglomerateGraph", () => {
  it("creates group and company nodes with links", () => {
    const stocks: StockLike[] = [
      {
        ticker: "AAA.JK",
        name: "AAA Live",
        price: 1500,
        changePercent: 2,
        marketCap: 120_000_000_000,
      },
      {
        ticker: "BBB.JK",
        name: "BBB Live",
        price: 750,
        changePercent: -1,
        marketCap: 80_000_000_000,
      },
    ];
    const built = buildConglomerateGroups(stocks, groups);
    const graph = buildConglomerateGraph(built);

    expect(graph.nodes.filter((node) => node.kind === "group")).toHaveLength(1);
    expect(graph.nodes.filter((node) => node.kind === "company")).toHaveLength(
      2,
    );
    expect(graph.links).toHaveLength(2);
    expect(graph.links.every((link) => link.source === "group:alpha")).toBe(
      true,
    );
  });
});
