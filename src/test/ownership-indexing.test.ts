import { describe, expect, it } from "vitest";
import {
  ownershipRecords,
  ownershipUniverseTickerCount,
  ownershipUniverseTickers,
} from "@/data/ownershipData";
import {
  getOwnershipCoverage,
  getTickerUltimateOwner,
  getOwnershipTickers,
} from "@/lib/ownership";

describe("ownership indexing coverage", () => {
  it("indexes the full stock ticker universe", () => {
    const coverage = getOwnershipCoverage(
      ownershipRecords,
      ownershipUniverseTickers,
    );

    expect(coverage.coveredTickerCount).toBe(ownershipUniverseTickerCount);
    expect(coverage.missingTickers).toEqual([]);
    expect(coverage.coverageRatio).toBe(100);
  });

  it("keeps ownership ticker list aligned with universe", () => {
    const tickers = getOwnershipTickers(ownershipRecords);
    expect(tickers.length).toBe(ownershipUniverseTickerCount);
  });
});

describe("ticker ultimate owner metadata", () => {
  it("provides researched owner info with source for key tickers", () => {
    const owner = getTickerUltimateOwner(ownershipRecords, "BBRI.JK");

    expect(owner).not.toBeNull();
    expect(owner?.ownerName).toMatch(/Government of Indonesia/i);
    expect(owner?.provenance).toBe("researched");
    expect(owner?.sourceUrl).toContain("ir-bri.com");
  });
});
