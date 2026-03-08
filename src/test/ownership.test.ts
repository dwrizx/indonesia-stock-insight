import { describe, expect, it } from "vitest";
import {
  buildInvestorConnectionIndex,
  buildOwnershipGraph,
  computeOwnershipSplit,
  filterOwnershipRecords,
  getOwnershipCoverage,
  getTopCrossHoldingInvestors,
  summarizeTickerOwnership,
  type OwnershipRecord,
} from "@/lib/ownership";

const records: OwnershipRecord[] = [
  {
    ticker: "BBCA.JK",
    investorId: "INV-BNK-001",
    investorName: "Nusantara Bank Treasury",
    investorType: "Bank",
    origin: "Local",
    shares: 1_200_000_000,
    percentage: 4.2,
    provenance: "researched",
  },
  {
    ticker: "BBCA.JK",
    investorId: "INV-FND-001",
    investorName: "ASEAN Growth Fund",
    investorType: "Fund",
    origin: "Foreign",
    shares: 900_000_000,
    percentage: 3.1,
    provenance: "researched",
  },
  {
    ticker: "TLKM.JK",
    investorId: "INV-FND-001",
    investorName: "ASEAN Growth Fund",
    investorType: "Fund",
    origin: "Foreign",
    shares: 700_000_000,
    percentage: 2.8,
    provenance: "researched",
  },
  {
    ticker: "TLKM.JK",
    investorId: "INV-COR-001",
    investorName: "Telekom Pension Entity",
    investorType: "Corporate",
    origin: "Local",
    shares: 1_000_000_000,
    percentage: 3.9,
    provenance: "researched",
  },
];

describe("filterOwnershipRecords", () => {
  it("filters by ticker, investor type, and origin simultaneously", () => {
    const filtered = filterOwnershipRecords(records, {
      ticker: "BBCA.JK",
      investorType: "Fund",
      origin: "Foreign",
    });

    expect(filtered).toHaveLength(1);
    expect(filtered[0]?.investorName).toBe("ASEAN Growth Fund");
  });
});

describe("computeOwnershipSplit", () => {
  it("returns local and foreign ownership split for a ticker", () => {
    const split = computeOwnershipSplit(records, "BBCA.JK");

    expect(split.totalShares).toBe(2_100_000_000);
    expect(split.totalPercentage).toBe(7.3);
    expect(split.local.shares).toBe(1_200_000_000);
    expect(split.local.percentage).toBe(4.2);
    expect(split.foreign.shares).toBe(900_000_000);
    expect(split.foreign.percentage).toBe(3.1);
  });
});

describe("buildOwnershipGraph", () => {
  it("builds ticker+investor nodes and weighted links", () => {
    const graph = buildOwnershipGraph(records, {
      ticker: "TLKM.JK",
    });

    const investorNodes = graph.nodes.filter(
      (node) => node.kind === "investor",
    );
    const tickerNodes = graph.nodes.filter((node) => node.kind === "ticker");

    expect(tickerNodes).toHaveLength(1);
    expect(investorNodes).toHaveLength(2);
    expect(graph.links).toHaveLength(2);
    expect(graph.links.every((link) => link.target === "ticker:TLKM.JK")).toBe(
      true,
    );
  });
});

describe("summarizeTickerOwnership", () => {
  it("returns readable per-ticker ownership summary with top holder", () => {
    const summary = summarizeTickerOwnership(records, "TLKM.JK");

    expect(summary.ticker).toBe("TLKM.JK");
    expect(summary.investorCount).toBe(2);
    expect(summary.localInvestorCount).toBe(1);
    expect(summary.foreignInvestorCount).toBe(1);
    expect(summary.totalPercentage).toBe(6.7);
    expect(summary.topInvestorName).toBe("Telekom Pension Entity");
    expect(summary.topInvestorPercentage).toBe(3.9);
  });
});

describe("getTopCrossHoldingInvestors", () => {
  it("ranks investors by cross-holding breadth and ownership size", () => {
    const ranked = getTopCrossHoldingInvestors(records, 1);

    expect(ranked).toHaveLength(1);
    expect(ranked[0]?.investorName).toBe("ASEAN Growth Fund");
    expect(ranked[0]?.tickerCount).toBe(2);
    expect(ranked[0]?.totalPercentage).toBe(5.9);
  });
});

describe("buildInvestorConnectionIndex", () => {
  it("maps each investor to connected tickers in stable order", () => {
    const index = buildInvestorConnectionIndex(records);

    expect(index.get("INV-FND-001")).toEqual(["BBCA.JK", "TLKM.JK"]);
    expect(index.get("INV-BNK-001")).toEqual(["BBCA.JK"]);
  });
});

describe("getOwnershipCoverage", () => {
  it("calculates indexed vs missing ticker coverage", () => {
    const coverage = getOwnershipCoverage(records, [
      "BBCA.JK",
      "TLKM.JK",
      "ASII.JK",
    ]);

    expect(coverage.coveredTickerCount).toBe(2);
    expect(coverage.totalUniverseCount).toBe(3);
    expect(coverage.coverageRatio).toBe(66.67);
    expect(coverage.missingTickers).toEqual(["ASII.JK"]);
  });
});
