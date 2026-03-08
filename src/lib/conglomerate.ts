import type { Stock } from "@/data/stockData";

export interface ConglomerateCompanySeed {
  ticker: string;
  fallbackName: string;
  fallbackPrice: number;
  fallbackChangePercent: number;
  fallbackMarketCap: number;
}

export interface ConglomerateGroupSeed {
  id: string;
  name: string;
  controller: string;
  companies: ConglomerateCompanySeed[];
}

export interface ConglomerateCompanyView {
  ticker: string;
  name: string;
  price: number;
  changePercent: number;
  marketCap: number;
  source: "live" | "seed";
}

export interface ConglomerateGroupView {
  id: string;
  name: string;
  controller: string;
  companies: ConglomerateCompanyView[];
  companyCount: number;
  totalMarketCap: number;
  averagePerformance: number;
}

export interface ConglomerateGraphNode {
  id: string;
  label: string;
  kind: "group" | "company";
  groupId?: string;
  ticker?: string;
  marketCap: number;
  changePercent: number;
}

export interface ConglomerateGraphLink {
  source: string;
  target: string;
  groupId: string;
  ticker: string;
  marketCap: number;
  changePercent: number;
}

export interface ConglomerateGraph {
  nodes: ConglomerateGraphNode[];
  links: ConglomerateGraphLink[];
}

type StockInput = Pick<
  Stock,
  "ticker" | "name" | "price" | "changePercent" | "marketCap"
>;

function round2(value: number): number {
  return Number(value.toFixed(2));
}

export function buildConglomerateGroups(
  stocks: StockInput[],
  seeds: ConglomerateGroupSeed[],
): ConglomerateGroupView[] {
  const byTicker = new Map<string, StockInput>();
  for (const stock of stocks) {
    byTicker.set(stock.ticker, stock);
  }

  return seeds
    .map((seed): ConglomerateGroupView => {
      const companies = seed.companies
        .map((item): ConglomerateCompanyView => {
          const live = byTicker.get(item.ticker);
          if (!live) {
            return {
              ticker: item.ticker,
              name: item.fallbackName,
              price: item.fallbackPrice,
              changePercent: item.fallbackChangePercent,
              marketCap: item.fallbackMarketCap,
              source: "seed",
            };
          }

          return {
            ticker: item.ticker,
            name: live.name,
            price: live.price,
            changePercent: live.changePercent,
            marketCap: live.marketCap,
            source: "live",
          };
        })
        .sort((left, right) => right.marketCap - left.marketCap);

      const companyCount = companies.length;
      const totalMarketCap = companies.reduce(
        (sum, company) => sum + company.marketCap,
        0,
      );
      const averagePerformance =
        companyCount > 0
          ? round2(
              companies.reduce(
                (sum, company) => sum + company.changePercent,
                0,
              ) / companyCount,
            )
          : 0;

      return {
        id: seed.id,
        name: seed.name,
        controller: seed.controller,
        companies,
        companyCount,
        totalMarketCap,
        averagePerformance,
      };
    })
    .sort((left, right) => right.totalMarketCap - left.totalMarketCap);
}

export function buildConglomerateGraph(
  groups: ConglomerateGroupView[],
): ConglomerateGraph {
  const nodes: ConglomerateGraphNode[] = [];
  const links: ConglomerateGraphLink[] = [];

  for (const group of groups) {
    const groupNodeId = `group:${group.id}`;
    nodes.push({
      id: groupNodeId,
      label: group.name,
      kind: "group",
      groupId: group.id,
      marketCap: group.totalMarketCap,
      changePercent: group.averagePerformance,
    });

    for (const company of group.companies) {
      const companyNodeId = `company:${group.id}:${company.ticker}`;
      nodes.push({
        id: companyNodeId,
        label: company.ticker.replace(".JK", ""),
        kind: "company",
        groupId: group.id,
        ticker: company.ticker,
        marketCap: company.marketCap,
        changePercent: company.changePercent,
      });
      links.push({
        source: groupNodeId,
        target: companyNodeId,
        groupId: group.id,
        ticker: company.ticker,
        marketCap: company.marketCap,
        changePercent: company.changePercent,
      });
    }
  }

  return { nodes, links };
}
