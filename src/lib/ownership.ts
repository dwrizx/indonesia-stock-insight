export type InvestorType = "Bank" | "Fund" | "Corporate" | "Individual";
export type InvestorOrigin = "Local" | "Foreign";
export type OwnershipProvenance = "researched" | "estimated";
export type FilterOption<T extends string> = T | "All";

export interface OwnershipRecord {
  ticker: string;
  investorId: string;
  investorName: string;
  investorType: InvestorType;
  origin: InvestorOrigin;
  shares: number;
  percentage: number;
  provenance: OwnershipProvenance;
  sourceLabel?: string;
  sourceUrl?: string;
  asOfDate?: string;
  ultimateOwner?: string;
}

export interface OwnershipFilters {
  ticker?: string;
  investorType?: FilterOption<InvestorType>;
  origin?: FilterOption<InvestorOrigin>;
}

export interface OwnershipSplit {
  totalShares: number;
  totalPercentage: number;
  local: {
    shares: number;
    percentage: number;
  };
  foreign: {
    shares: number;
    percentage: number;
  };
}

export interface OwnershipGraphNode {
  id: string;
  label: string;
  kind: "ticker" | "investor";
  ticker?: string;
  investorId?: string;
  investorType?: InvestorType;
  origin?: InvestorOrigin;
  totalShares: number;
  totalPercentage: number;
  degree: number;
}

export interface OwnershipGraphLink {
  source: string;
  target: string;
  ticker: string;
  investorId: string;
  investorType: InvestorType;
  origin: InvestorOrigin;
  shares: number;
  percentage: number;
  provenance: OwnershipProvenance;
  sourceUrl?: string;
}

export interface OwnershipGraph {
  nodes: OwnershipGraphNode[];
  links: OwnershipGraphLink[];
}

export interface TickerOwnershipSummary {
  ticker: string;
  investorCount: number;
  localInvestorCount: number;
  foreignInvestorCount: number;
  totalShares: number;
  totalPercentage: number;
  topInvestorName: string;
  topInvestorType: InvestorType | null;
  topInvestorOrigin: InvestorOrigin | null;
  topInvestorPercentage: number;
}

export interface CrossHoldingSummary {
  investorId: string;
  investorName: string;
  investorType: InvestorType;
  origin: InvestorOrigin;
  tickerCount: number;
  totalShares: number;
  totalPercentage: number;
}

export interface OwnershipCoverage {
  coveredTickerCount: number;
  totalUniverseCount: number;
  coverageRatio: number;
  missingTickers: string[];
}

export interface TickerUltimateOwner {
  ticker: string;
  ownerName: string;
  provenance: OwnershipProvenance;
  sourceLabel?: string;
  sourceUrl?: string;
}

function round2(value: number): number {
  return Number(value.toFixed(2));
}

function byTickerThenPercent(
  left: OwnershipRecord,
  right: OwnershipRecord,
): number {
  if (left.ticker === right.ticker) {
    return right.percentage - left.percentage;
  }
  return left.ticker.localeCompare(right.ticker);
}

export function filterOwnershipRecords(
  records: OwnershipRecord[],
  filters: OwnershipFilters = {},
): OwnershipRecord[] {
  const { ticker, investorType = "All", origin = "All" } = filters;
  return records
    .filter((record) => (ticker ? record.ticker === ticker : true))
    .filter((record) =>
      investorType === "All" ? true : record.investorType === investorType,
    )
    .filter((record) => (origin === "All" ? true : record.origin === origin))
    .sort(byTickerThenPercent);
}

export function computeOwnershipSplit(
  records: OwnershipRecord[],
  ticker: string,
): OwnershipSplit {
  const tickerRecords = filterOwnershipRecords(records, { ticker });
  const local = tickerRecords.filter((record) => record.origin === "Local");
  const foreign = tickerRecords.filter((record) => record.origin === "Foreign");

  const localShares = local.reduce((sum, row) => sum + row.shares, 0);
  const foreignShares = foreign.reduce((sum, row) => sum + row.shares, 0);
  const localPercentage = local.reduce((sum, row) => sum + row.percentage, 0);
  const foreignPercentage = foreign.reduce(
    (sum, row) => sum + row.percentage,
    0,
  );

  return {
    totalShares: localShares + foreignShares,
    totalPercentage: round2(localPercentage + foreignPercentage),
    local: {
      shares: localShares,
      percentage: round2(localPercentage),
    },
    foreign: {
      shares: foreignShares,
      percentage: round2(foreignPercentage),
    },
  };
}

export function getOwnershipTickers(records: OwnershipRecord[]): string[] {
  return [...new Set(records.map((record) => record.ticker))].sort();
}

export function getOwnershipByTicker(
  records: OwnershipRecord[],
  ticker: string,
): OwnershipRecord[] {
  return filterOwnershipRecords(records, { ticker }).sort(
    (left, right) => right.percentage - left.percentage,
  );
}

export function buildOwnershipGraph(
  records: OwnershipRecord[],
  filters: OwnershipFilters = {},
): OwnershipGraph {
  const filtered = filterOwnershipRecords(records, filters);
  const nodes = new Map<string, OwnershipGraphNode>();
  const links: OwnershipGraphLink[] = [];

  for (const record of filtered) {
    const tickerNodeId = `ticker:${record.ticker}`;
    const investorNodeId = `investor:${record.investorId}`;
    const tickerLabel = record.ticker.replace(".JK", "");

    const tickerNode = nodes.get(tickerNodeId) ?? {
      id: tickerNodeId,
      label: tickerLabel,
      kind: "ticker" as const,
      ticker: record.ticker,
      totalShares: 0,
      totalPercentage: 0,
      degree: 0,
    };

    tickerNode.totalShares += record.shares;
    tickerNode.totalPercentage += record.percentage;
    tickerNode.degree += 1;
    nodes.set(tickerNodeId, tickerNode);

    const investorNode = nodes.get(investorNodeId) ?? {
      id: investorNodeId,
      label: record.investorName,
      kind: "investor" as const,
      investorId: record.investorId,
      investorType: record.investorType,
      origin: record.origin,
      totalShares: 0,
      totalPercentage: 0,
      degree: 0,
    };

    investorNode.totalShares += record.shares;
    investorNode.totalPercentage += record.percentage;
    investorNode.degree += 1;
    nodes.set(investorNodeId, investorNode);

    links.push({
      source: investorNodeId,
      target: tickerNodeId,
      ticker: record.ticker,
      investorId: record.investorId,
      investorType: record.investorType,
      origin: record.origin,
      shares: record.shares,
      percentage: record.percentage,
      provenance: record.provenance,
      sourceUrl: record.sourceUrl,
    });
  }

  const finalNodes = [...nodes.values()].map((node) => ({
    ...node,
    totalPercentage: round2(node.totalPercentage),
  }));

  return {
    nodes: finalNodes,
    links,
  };
}

export function summarizeTickerOwnership(
  records: OwnershipRecord[],
  ticker: string,
): TickerOwnershipSummary {
  const rows = getOwnershipByTicker(records, ticker);
  const localRows = rows.filter((row) => row.origin === "Local");
  const foreignRows = rows.filter((row) => row.origin === "Foreign");
  const topInvestor = rows[0];

  return {
    ticker,
    investorCount: rows.length,
    localInvestorCount: localRows.length,
    foreignInvestorCount: foreignRows.length,
    totalShares: rows.reduce((sum, row) => sum + row.shares, 0),
    totalPercentage: round2(rows.reduce((sum, row) => sum + row.percentage, 0)),
    topInvestorName: topInvestor?.investorName ?? "-",
    topInvestorType: topInvestor?.investorType ?? null,
    topInvestorOrigin: topInvestor?.origin ?? null,
    topInvestorPercentage: round2(topInvestor?.percentage ?? 0),
  };
}

export function getTopCrossHoldingInvestors(
  records: OwnershipRecord[],
  limit: number = 6,
): CrossHoldingSummary[] {
  const byInvestor = new Map<string, OwnershipRecord[]>();
  for (const row of records) {
    const current = byInvestor.get(row.investorId) ?? [];
    current.push(row);
    byInvestor.set(row.investorId, current);
  }

  return [...byInvestor.entries()]
    .map(([_investorId, rows]) => {
      const tickers = new Set(rows.map((row) => row.ticker));
      const first = rows[0];
      if (!first) {
        return null;
      }

      return {
        investorId: first.investorId,
        investorName: first.investorName,
        investorType: first.investorType,
        origin: first.origin,
        tickerCount: tickers.size,
        totalShares: rows.reduce((sum, row) => sum + row.shares, 0),
        totalPercentage: round2(
          rows.reduce((sum, row) => sum + row.percentage, 0),
        ),
      };
    })
    .filter((item): item is CrossHoldingSummary => item !== null)
    .sort((left, right) => {
      if (left.tickerCount !== right.tickerCount) {
        return right.tickerCount - left.tickerCount;
      }
      return right.totalPercentage - left.totalPercentage;
    })
    .slice(0, Math.max(limit, 0));
}

export function buildInvestorConnectionIndex(
  records: OwnershipRecord[],
): Map<string, string[]> {
  const index = new Map<string, Set<string>>();

  for (const row of records) {
    const current = index.get(row.investorId) ?? new Set<string>();
    current.add(row.ticker);
    index.set(row.investorId, current);
  }

  return new Map(
    [...index.entries()].map(([investorId, tickers]) => [
      investorId,
      [...tickers].sort(),
    ]),
  );
}

export function getOwnershipCoverage(
  records: OwnershipRecord[],
  universeTickers: string[],
): OwnershipCoverage {
  const covered = new Set(records.map((row) => row.ticker));
  const uniqueUniverse = [...new Set(universeTickers)].sort();
  const missingTickers = uniqueUniverse.filter(
    (ticker) => !covered.has(ticker),
  );
  const coveredTickerCount = uniqueUniverse.length - missingTickers.length;
  const totalUniverseCount = uniqueUniverse.length;
  const coverageRatio =
    totalUniverseCount === 0
      ? 0
      : round2((coveredTickerCount / totalUniverseCount) * 100);

  return {
    coveredTickerCount,
    totalUniverseCount,
    coverageRatio,
    missingTickers,
  };
}

export function getTickerUltimateOwner(
  records: OwnershipRecord[],
  ticker: string,
): TickerUltimateOwner | null {
  const rows = getOwnershipByTicker(records, ticker);
  if (!rows.length) return null;

  const researchedOwner = rows.find(
    (row) => row.ultimateOwner && row.provenance === "researched",
  );
  if (researchedOwner?.ultimateOwner) {
    return {
      ticker,
      ownerName: researchedOwner.ultimateOwner,
      provenance: researchedOwner.provenance,
      sourceLabel: researchedOwner.sourceLabel,
      sourceUrl: researchedOwner.sourceUrl,
    };
  }

  const fallback = rows[0];
  if (!fallback) return null;

  return {
    ticker,
    ownerName: fallback.ultimateOwner ?? fallback.investorName,
    provenance: fallback.provenance,
    sourceLabel: fallback.sourceLabel,
    sourceUrl: fallback.sourceUrl,
  };
}

export interface FreeFloatResult {
  ticker: string;
  freeFloatPct: number | null; // null = no researched data
  strategicPct: number;
  strategicHolders: {
    investorName: string;
    investorType: InvestorType;
    percentage: number;
  }[];
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
