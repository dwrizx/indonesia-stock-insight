import { conglomerateGroupSeeds } from "@/data/conglomerateData";
import { ownershipResearchByTicker } from "@/data/ownershipResearch";
import { stocks } from "@/data/stockData";
import type {
  InvestorOrigin,
  InvestorType,
  OwnershipRecord,
} from "@/lib/ownership";

type InvestorProfile = {
  id: string;
  name: string;
  type: InvestorType;
  origin: InvestorOrigin;
};

type HoldingSeed = {
  ticker: string;
  investorId: string;
  percentage: number;
  shares?: number;
  provenance: OwnershipRecord["provenance"];
  sourceLabel?: string;
  sourceUrl?: string;
  asOfDate?: string;
  ultimateOwner?: string;
};

const baseProfiles: InvestorProfile[] = [
  {
    id: "INV-BNK-001",
    name: "Nusantara Bank Treasury",
    type: "Bank",
    origin: "Local",
  },
  {
    id: "INV-BNK-002",
    name: "Mandala Capital Bank",
    type: "Bank",
    origin: "Local",
  },
  {
    id: "INV-FND-001",
    name: "ASEAN Growth Fund",
    type: "Fund",
    origin: "Foreign",
  },
  {
    id: "INV-FND-002",
    name: "Pacific Sovereign Fund",
    type: "Fund",
    origin: "Foreign",
  },
  {
    id: "INV-FND-003",
    name: "Archipelago Equity Fund",
    type: "Fund",
    origin: "Local",
  },
  {
    id: "INV-FND-004",
    name: "Global EM Alpha Fund",
    type: "Fund",
    origin: "Foreign",
  },
  {
    id: "INV-COR-001",
    name: "Sarana Investama Tbk",
    type: "Corporate",
    origin: "Local",
  },
  {
    id: "INV-COR-002",
    name: "Harbor Strategic Holdings Pte",
    type: "Corporate",
    origin: "Foreign",
  },
  {
    id: "INV-COR-003",
    name: "Telekom Pension Entity",
    type: "Corporate",
    origin: "Local",
  },
  {
    id: "INV-IND-001",
    name: "Budi Santoso Family Office",
    type: "Individual",
    origin: "Local",
  },
  {
    id: "INV-IND-002",
    name: "Chen Wei Asset Office",
    type: "Individual",
    origin: "Foreign",
  },
  {
    id: "INV-IND-003",
    name: "Adelia Pratama",
    type: "Individual",
    origin: "Local",
  },
  {
    id: "INV-EST-LOCAL-INST",
    name: "Domestic Institutional Investors",
    type: "Fund",
    origin: "Local",
  },
  {
    id: "INV-EST-FOREIGN-INST",
    name: "Foreign Institutional Investors",
    type: "Fund",
    origin: "Foreign",
  },
  {
    id: "INV-EST-RETAIL",
    name: "Retail & Individuals",
    type: "Individual",
    origin: "Local",
  },
];

const strategicHoldingSeeds: Omit<HoldingSeed, "provenance">[] = [
  {
    ticker: "GOTO.JK",
    investorId: "INV-FND-004",
    shares: 6_300_000_000,
    percentage: 4.9,
  },
  {
    ticker: "GOTO.JK",
    investorId: "INV-COR-002",
    shares: 4_400_000_000,
    percentage: 3.4,
  },
  {
    ticker: "GOTO.JK",
    investorId: "INV-FND-001",
    shares: 3_300_000_000,
    percentage: 2.6,
  },
  {
    ticker: "GOTO.JK",
    investorId: "INV-COR-001",
    shares: 2_500_000_000,
    percentage: 2,
  },
  {
    ticker: "BBNI.JK",
    investorId: "INV-BNK-001",
    shares: 1_050_000_000,
    percentage: 4,
  },
  {
    ticker: "BBNI.JK",
    investorId: "INV-FND-003",
    shares: 880_000_000,
    percentage: 3.3,
  },
  {
    ticker: "BBNI.JK",
    investorId: "INV-FND-001",
    shares: 690_000_000,
    percentage: 2.6,
  },
  {
    ticker: "BBNI.JK",
    investorId: "INV-COR-002",
    shares: 520_000_000,
    percentage: 2,
  },
  {
    ticker: "BRIS.JK",
    investorId: "INV-BNK-001",
    shares: 1_300_000_000,
    percentage: 5.3,
  },
  {
    ticker: "BRIS.JK",
    investorId: "INV-FND-003",
    shares: 890_000_000,
    percentage: 3.7,
  },
  {
    ticker: "BRIS.JK",
    investorId: "INV-COR-003",
    shares: 720_000_000,
    percentage: 3,
  },
  {
    ticker: "BRIS.JK",
    investorId: "INV-FND-004",
    shares: 460_000_000,
    percentage: 1.9,
  },
  {
    ticker: "ICBP.JK",
    investorId: "INV-COR-001",
    shares: 980_000_000,
    percentage: 4.2,
  },
  {
    ticker: "ICBP.JK",
    investorId: "INV-FND-003",
    shares: 820_000_000,
    percentage: 3.5,
  },
  {
    ticker: "ICBP.JK",
    investorId: "INV-BNK-002",
    shares: 540_000_000,
    percentage: 2.3,
  },
  {
    ticker: "ICBP.JK",
    investorId: "INV-FND-001",
    shares: 490_000_000,
    percentage: 2.1,
  },
  {
    ticker: "TPIA.JK",
    investorId: "INV-COR-002",
    shares: 9_400_000_000,
    percentage: 56,
  },
  {
    ticker: "TPIA.JK",
    investorId: "INV-FND-001",
    shares: 560_000_000,
    percentage: 3.3,
  },
  {
    ticker: "BRPT.JK",
    investorId: "INV-COR-002",
    shares: 44_000_000_000,
    percentage: 71,
  },
  {
    ticker: "BRPT.JK",
    investorId: "INV-FND-003",
    shares: 2_100_000_000,
    percentage: 3.4,
  },
];

function normalizeTicker(ticker: string): string {
  const trimmed = ticker.trim().toUpperCase();
  return trimmed.endsWith(".JK") ? trimmed : `${trimmed}.JK`;
}

function inferInvestorType(name: string): InvestorType {
  const lower = name.toLowerCase();
  // Bank – explicit banking institutions
  if (
    lower.includes("bank") ||
    lower.includes("mitsubishi ufj") ||
    lower.includes("mufg") ||
    lower.includes("sumitomo mitsui") ||
    lower.includes("ocbc") ||
    lower.includes("citibank") ||
    lower.includes("jpmorgan") ||
    lower.includes("dbs bank")
  ) {
    return "Bank";
  }
  // Fund – portfolio / institutional investors
  if (
    lower.includes("fund") ||
    lower.includes("asset management") ||
    lower.includes("investment") ||
    lower.includes("authority") ||
    lower.includes("blackrock") ||
    lower.includes("fidelity") ||
    lower.includes("norges") ||
    lower.includes("vanguard") ||
    lower.includes("state street") ||
    lower.includes("gic ") ||
    lower.includes("temasek") ||
    lower.includes("sovereign wealth") ||
    lower.includes("pension") ||
    lower.includes("dana pensiun") ||
    lower.includes("asuransi") ||
    lower.includes("softbank") ||
    lower.includes("alibaba") ||
    lower.includes("kkr") ||
    lower.includes("carlyle") ||
    lower.includes("capital group") ||
    lower.includes("dimensional") ||
    lower.includes("invesco") ||
    lower.includes("aberdeen") ||
    lower.includes("templeton") ||
    lower.includes("ishares")
  ) {
    return "Fund";
  }
  // Individual – named persons / families
  if (
    lower.includes("family") ||
    lower.includes("anthoni") ||
    lower.includes("hartono") ||
    lower.includes("widjaja") ||
    lower.includes("ciputra") ||
    lower.includes("thohir") ||
    lower.includes("pangestu") ||
    lower.includes("prajogo") ||
    lower.includes("soeryadjaja") ||
    lower.includes("tanoto") ||
    lower.includes("wonowidjojo") ||
    lower.includes("hidayat") ||
    lower.includes("lo kheng") ||
    lower.includes("rachmat") ||
    lower.includes("soegiarto") ||
    lower.includes("atmadja") ||
    lower.includes("riady") ||
    lower.includes("panigoro") ||
    lower.includes("sariaatmadja") ||
    lower.includes("haliman") ||
    lower.includes("tedja") ||
    lower.includes("sastrawinata") ||
    lower.includes("adikoesoemo") ||
    lower.includes("tirtohadiguno") ||
    lower.includes("susanto") ||
    lower.includes("wirianata") ||
    lower.includes("kartajaya")
  ) {
    return "Individual";
  }
  return "Corporate";
}

function inferInvestorOrigin(name: string): InvestorOrigin {
  const lower = name.toLowerCase();
  // Local – Indonesian entities and persons
  if (
    lower.includes("indonesia") ||
    lower.includes("pemerintah") ||
    lower.includes("government") ||
    lower.includes("danantara") ||
    lower.includes("persero") ||
    lower.includes("pt ") ||
    lower.includes("nusantara") ||
    lower.includes("budi") ||
    lower.includes("public float") ||
    lower.includes("sinar mas") ||
    lower.includes("sinarmas") ||
    lower.includes("djarum") ||
    lower.includes("widjaja") ||
    lower.includes("ciputra") ||
    lower.includes("thohir") ||
    lower.includes("pangestu") ||
    lower.includes("prajogo") ||
    lower.includes("soeryadjaja") ||
    lower.includes("saratoga") ||
    lower.includes("tanoto") ||
    lower.includes("wonowidjojo") ||
    lower.includes("gudang garam") ||
    lower.includes("hidayat") ||
    lower.includes("lo kheng") ||
    lower.includes("kalbe") ||
    lower.includes("barito") ||
    lower.includes("adaro") ||
    lower.includes("medco") ||
    lower.includes("pertamina") ||
    lower.includes("astra") ||
    lower.includes("telkom") ||
    lower.includes("lippo") ||
    lower.includes("panigoro") ||
    lower.includes("sariaatmadja") ||
    lower.includes("atmadja") ||
    lower.includes("haliman") ||
    lower.includes("tedja") ||
    lower.includes("tirtohadiguno") ||
    lower.includes("susanto") ||
    lower.includes("wirianata") ||
    lower.includes("alfindo") ||
    lower.includes("kawan lama") ||
    lower.includes("tangerang") ||
    lower.includes("pakuwon") ||
    lower.includes("arthakencana") ||
    lower.includes("tanito")
  ) {
    return "Local";
  }
  return "Foreign";
}

function toInvestorId(name: string): string {
  const token = name
    .toUpperCase()
    .replace(/[^A-Z0-9]+/g, "_")
    .replace(/^_+|_+$/g, "")
    .slice(0, 36);
  return `INV-RSCH-${token || "UNKNOWN"}`;
}

function hashNumber(text: string, salt: number = 0): number {
  let value = 0;
  for (let i = 0; i < text.length; i += 1) {
    value = (value * 31 + text.charCodeAt(i) + salt) % 100_000;
  }
  return value;
}

const stockByTicker = new Map(stocks.map((stock) => [stock.ticker, stock]));

function estimateOutstandingShares(ticker: string): number {
  const stock = stockByTicker.get(ticker);
  const marketCap = stock?.marketCap ?? 0;
  const price = stock?.price ?? 0;

  if (marketCap > 0 && price > 0) {
    return Math.max(1_000_000, Math.round(marketCap / price));
  }

  return 800_000_000 + hashNumber(ticker, 17) * 1_000;
}

function estimateSharesFromPercentage(
  ticker: string,
  percentage: number,
): number {
  return Math.round((estimateOutstandingShares(ticker) * percentage) / 100);
}

function controllerMapByTicker(): Map<string, string> {
  const controllerByTicker = new Map<string, string>();

  for (const group of conglomerateGroupSeeds) {
    for (const company of group.companies) {
      const ticker = normalizeTicker(company.ticker);
      const current = controllerByTicker.get(ticker);
      if (!current || group.controller.includes("Government")) {
        controllerByTicker.set(ticker, group.controller);
      }
    }
  }

  return controllerByTicker;
}

const controllersByTicker = controllerMapByTicker();
const universeTickers = [
  ...new Set(stocks.map((stock) => normalizeTicker(stock.ticker))),
].sort();

const profileById = new Map(
  baseProfiles.map((profile) => [profile.id, profile]),
);

function ensureProfile(
  name: string,
  type: InvestorType = inferInvestorType(name),
  origin: InvestorOrigin = inferInvestorOrigin(name),
): string {
  const id = toInvestorId(name);
  if (!profileById.has(id)) {
    profileById.set(id, {
      id,
      name,
      type,
      origin,
    });
  }
  return id;
}

const researchTickerSet = new Set<string>(
  [...ownershipResearchByTicker.keys()].map((ticker) =>
    normalizeTicker(ticker),
  ),
);

const researchedHoldings: HoldingSeed[] = [
  ...ownershipResearchByTicker.values(),
].flatMap((snapshot) => {
  const ticker = normalizeTicker(snapshot.ticker);

  return snapshot.majorShareholders.map((holder): HoldingSeed => {
    const investorId = ensureProfile(holder.name);
    const percentage = Math.min(99.99, Math.max(0.01, holder.percentage));
    return {
      ticker,
      investorId,
      percentage,
      shares: estimateSharesFromPercentage(ticker, percentage),
      provenance: "researched",
      sourceLabel: holder.sourceLabel || snapshot.primarySourceLabel,
      sourceUrl: holder.sourceUrl || snapshot.primarySourceUrl,
      asOfDate: snapshot.asOfDate,
      ultimateOwner: snapshot.ultimateOwner,
    };
  });
});

const strategicHoldings: HoldingSeed[] = strategicHoldingSeeds
  .filter((seed) => !researchTickerSet.has(normalizeTicker(seed.ticker)))
  .map(
    (seed): HoldingSeed => ({
      ...seed,
      ticker: normalizeTicker(seed.ticker),
      provenance: "estimated",
    }),
  );

const tickersWithSeed = new Set<string>([
  ...researchedHoldings.map((row) => row.ticker),
  ...strategicHoldings.map((row) => row.ticker),
]);

function buildEstimatedFallbackForTicker(ticker: string): HoldingSeed[] {
  const controller =
    ownershipResearchByTicker.get(ticker)?.ultimateOwner ||
    controllersByTicker.get(ticker) ||
    "Public / Diversified Shareholders";

  const controllerPct = controllersByTicker.has(ticker)
    ? 28 + (hashNumber(ticker, 1) % 18)
    : 18 + (hashNumber(ticker, 1) % 15);
  const localInstPct = 8 + (hashNumber(ticker, 2) % 11);
  const foreignInstPct = 6 + (hashNumber(ticker, 3) % 10);
  const retailPct = 3 + (hashNumber(ticker, 4) % 8);

  const controllerId = ensureProfile(controller);

  return [
    {
      ticker,
      investorId: controllerId,
      percentage: controllerPct,
      provenance: "estimated",
      sourceLabel: "Model Estimate",
      asOfDate: "2026-03-08",
      ultimateOwner: controller,
    },
    {
      ticker,
      investorId: "INV-EST-LOCAL-INST",
      percentage: localInstPct,
      provenance: "estimated",
      sourceLabel: "Model Estimate",
      asOfDate: "2026-03-08",
      ultimateOwner: controller,
    },
    {
      ticker,
      investorId: "INV-EST-FOREIGN-INST",
      percentage: foreignInstPct,
      provenance: "estimated",
      sourceLabel: "Model Estimate",
      asOfDate: "2026-03-08",
      ultimateOwner: controller,
    },
    {
      ticker,
      investorId: "INV-EST-RETAIL",
      percentage: retailPct,
      provenance: "estimated",
      sourceLabel: "Model Estimate",
      asOfDate: "2026-03-08",
      ultimateOwner: controller,
    },
  ].map((row) => ({
    ...row,
    shares: estimateSharesFromPercentage(ticker, row.percentage),
  }));
}

const generatedFallbackHoldings = universeTickers
  .filter((ticker) => !tickersWithSeed.has(ticker))
  .flatMap((ticker) => buildEstimatedFallbackForTicker(ticker));

function ensureLocalForeignPresence(rows: HoldingSeed[]): HoldingSeed[] {
  const byTicker = new Map<string, HoldingSeed[]>();
  for (const row of rows) {
    const current = byTicker.get(row.ticker) ?? [];
    current.push(row);
    byTicker.set(row.ticker, current);
  }

  const balancedRows: HoldingSeed[] = [];
  for (const [ticker, tickerRows] of byTicker.entries()) {
    balancedRows.push(...tickerRows);

    const hasLocal = tickerRows.some((row) => {
      const profile = profileById.get(row.investorId);
      return profile?.origin === "Local";
    });
    const hasForeign = tickerRows.some((row) => {
      const profile = profileById.get(row.investorId);
      return profile?.origin === "Foreign";
    });

    const owner = tickerRows[0]?.ultimateOwner;

    if (!hasLocal) {
      const percentage = 5 + (hashNumber(ticker, 29) % 7);
      balancedRows.push({
        ticker,
        investorId: "INV-EST-LOCAL-INST",
        percentage,
        shares: estimateSharesFromPercentage(ticker, percentage),
        provenance: "estimated",
        sourceLabel: "Model Estimate",
        asOfDate: "2026-03-08",
        ultimateOwner: owner,
      });
    }

    if (!hasForeign) {
      const percentage = 5 + (hashNumber(ticker, 31) % 7);
      balancedRows.push({
        ticker,
        investorId: "INV-EST-FOREIGN-INST",
        percentage,
        shares: estimateSharesFromPercentage(ticker, percentage),
        provenance: "estimated",
        sourceLabel: "Model Estimate",
        asOfDate: "2026-03-08",
        ultimateOwner: owner,
      });
    }
  }

  return balancedRows;
}

const allHoldingSeeds = ensureLocalForeignPresence([
  ...researchedHoldings,
  ...strategicHoldings,
  ...generatedFallbackHoldings,
]);

export const ownershipRecords: OwnershipRecord[] = allHoldingSeeds
  .map((holding): OwnershipRecord | null => {
    const profile = profileById.get(holding.investorId);
    if (!profile) {
      return null;
    }

    return {
      ticker: holding.ticker,
      investorId: profile.id,
      investorName: profile.name,
      investorType: profile.type,
      origin: profile.origin,
      shares:
        holding.shares ??
        estimateSharesFromPercentage(holding.ticker, holding.percentage),
      percentage: holding.percentage,
      provenance: holding.provenance,
      sourceLabel: holding.sourceLabel,
      sourceUrl: holding.sourceUrl,
      asOfDate: holding.asOfDate,
      ultimateOwner: holding.ultimateOwner,
    };
  })
  .filter((item): item is OwnershipRecord => item !== null)
  .sort((left, right) => {
    if (left.ticker === right.ticker) {
      return right.percentage - left.percentage;
    }
    return left.ticker.localeCompare(right.ticker);
  });

export const ownershipUniverseTickerCount = universeTickers.length;
export const ownershipUniverseTickers = universeTickers;
