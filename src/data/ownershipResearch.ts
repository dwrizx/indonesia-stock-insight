export type OwnershipResearchShareholder = {
  name: string;
  percentage: number;
  sourceUrl: string;
  sourceLabel: string;
};

export type OwnershipResearchSnapshot = {
  ticker: string;
  ultimateOwner: string;
  asOfDate: string;
  notes?: string;
  primarySourceUrl: string;
  primarySourceLabel: string;
  majorShareholders: OwnershipResearchShareholder[];
};

export const ownershipResearchSnapshots: OwnershipResearchSnapshot[] = [
  {
    ticker: "BBCA.JK",
    ultimateOwner: "Hartono Family (via PT Dwimuria Investama Andalan)",
    asOfDate: "2026-03-08",
    notes:
      "Riset MCP Exa; data ditampilkan sebagai snapshot riset dan perlu verifikasi periodik dari laporan tahunan terbaru.",
    primarySourceUrl:
      "https://www.idx.co.id/StaticData/NewsAndAnnouncement/ANNOUNCEMENTSTOCK/From_EREP/202102/7cf5c73ac5_c45610e196.pdf",
    primarySourceLabel: "IDX Filing / Annual Report",
    majorShareholders: [
      {
        name: "PT Dwimuria Investama Andalan",
        percentage: 54.94,
        sourceUrl:
          "https://www.idx.co.id/StaticData/NewsAndAnnouncement/ANNOUNCEMENTSTOCK/From_EREP/202102/7cf5c73ac5_c45610e196.pdf",
        sourceLabel: "IDX Filing / Annual Report",
      },
      {
        name: "Public Float",
        percentage: 45.06,
        sourceUrl: "https://finance.yahoo.com/quote/BBCA.JK/holders",
        sourceLabel: "Yahoo Finance Holders",
      },
    ],
  },
  {
    ticker: "BBRI.JK",
    ultimateOwner: "Government of Indonesia",
    asOfDate: "2026-03-08",
    primarySourceUrl: "https://www.ir-bri.com/ownership.html",
    primarySourceLabel: "BRI Investor Relations Ownership",
    majorShareholders: [
      {
        name: "Government of Indonesia",
        percentage: 52,
        sourceUrl: "https://www.ir-bri.com/ownership.html",
        sourceLabel: "BRI Investor Relations Ownership",
      },
      {
        name: "Indonesia Investment Authority",
        percentage: 8,
        sourceUrl: "https://www.ir-bri.com/ownership.html",
        sourceLabel: "BRI Investor Relations Ownership",
      },
    ],
  },
  {
    ticker: "BMRI.JK",
    ultimateOwner: "Government of Indonesia",
    asOfDate: "2026-03-08",
    primarySourceUrl: "https://www.bankmandiri.co.id/en/web/ir",
    primarySourceLabel: "Bank Mandiri Investor Relations",
    majorShareholders: [
      {
        name: "Government of Indonesia",
        percentage: 52,
        sourceUrl:
          "https://www.bankmandiri.co.id/documents/38268824/305044721/Annual+Report+of+Bank+Mandiri+FY+2023,+page+171-181.pdf",
        sourceLabel: "Bank Mandiri Annual Report",
      },
      {
        name: "Indonesia Investment Authority",
        percentage: 8,
        sourceUrl:
          "https://www.bankmandiri.co.id/documents/38268824/305044721/Annual+Report+of+Bank+Mandiri+FY+2023,+page+171-181.pdf",
        sourceLabel: "Bank Mandiri Annual Report",
      },
    ],
  },
  {
    ticker: "TLKM.JK",
    ultimateOwner: "Government of Indonesia",
    asOfDate: "2026-03-08",
    primarySourceUrl:
      "https://www.telkom.co.id/data/image_upload/page/1664115085590_D.1.1%20Annual%20Report%20FY%202021%20page%2083.pdf",
    primarySourceLabel: "Telkom Annual Report",
    majorShareholders: [
      {
        name: "Government of Indonesia",
        percentage: 52.09,
        sourceUrl:
          "https://www.telkom.co.id/data/image_upload/page/1664115085590_D.1.1%20Annual%20Report%20FY%202021%20page%2083.pdf",
        sourceLabel: "Telkom Annual Report",
      },
    ],
  },
  {
    ticker: "ASII.JK",
    ultimateOwner: "Jardine Cycle & Carriage Limited",
    asOfDate: "2026-03-08",
    primarySourceUrl:
      "https://www.marketscreener.com/quote/stock/PT-ASTRA-INTERNATIONAL-TB-6491639/company-shareholders",
    primarySourceLabel: "MarketScreener Shareholders",
    majorShareholders: [
      {
        name: "Jardine Cycle & Carriage Limited",
        percentage: 50.1,
        sourceUrl:
          "https://www.marketscreener.com/quote/stock/PT-ASTRA-INTERNATIONAL-TB-6491639/company-shareholders",
        sourceLabel: "MarketScreener Shareholders",
      },
      {
        name: "Toyota Motor Corporation",
        percentage: 4.74,
        sourceUrl:
          "https://www.marketscreener.com/quote/stock/PT-ASTRA-INTERNATIONAL-TB-6491639/company-shareholders",
        sourceLabel: "MarketScreener Shareholders",
      },
    ],
  },
  {
    ticker: "INDF.JK",
    ultimateOwner: "Anthoni Salim / First Pacific Group",
    asOfDate: "2026-03-08",
    primarySourceUrl: "https://www.indofood.com/page/shareholders-composition",
    primarySourceLabel: "Indofood Shareholder Composition",
    majorShareholders: [
      {
        name: "First Pacific Company Limited",
        percentage: 50.07,
        sourceUrl: "https://www.indofood.com/page/shareholders-composition",
        sourceLabel: "Indofood Shareholder Composition",
      },
      {
        name: "Public Float",
        percentage: 49.93,
        sourceUrl: "https://www.indofood.com/page/shareholders-composition",
        sourceLabel: "Indofood Shareholder Composition",
      },
    ],
  },
  {
    ticker: "SMMA.JK",
    ultimateOwner: "Sinar Mas Group / Widjaja Family",
    asOfDate: "2026-03-08",
    primarySourceUrl:
      "https://simplywall.st/stocks/id/insurance/idx-smma/sinar-mas-multiartha-shares/ownership",
    primarySourceLabel: "Simply Wall St Ownership",
    majorShareholders: [
      {
        name: "PT Sinar Mas Group",
        percentage: 49.4,
        sourceUrl:
          "https://simplywall.st/stocks/id/insurance/idx-smma/sinar-mas-multiartha-shares/ownership",
        sourceLabel: "Simply Wall St Ownership",
      },
      {
        name: "Public Float",
        percentage: 50.6,
        sourceUrl:
          "https://simplywall.st/stocks/id/insurance/idx-smma/sinar-mas-multiartha-shares/ownership",
        sourceLabel: "Simply Wall St Ownership",
      },
    ],
  },
  {
    ticker: "TKIM.JK",
    ultimateOwner: "APP / Sinar Mas Ecosystem",
    asOfDate: "2026-03-08",
    primarySourceUrl:
      "https://simplywall.st/stocks/id/materials/idx-tkim/pabrik-kertas-tjiwi-kimia-shares/ownership",
    primarySourceLabel: "Simply Wall St Ownership",
    majorShareholders: [
      {
        name: "Bapak Limantara",
        percentage: 59.7,
        sourceUrl:
          "https://simplywall.st/stocks/id/materials/idx-tkim/pabrik-kertas-tjiwi-kimia-shares/ownership",
        sourceLabel: "Simply Wall St Ownership",
      },
      {
        name: "Cascade Gold Limited",
        percentage: 5.04,
        sourceUrl:
          "https://simplywall.st/stocks/id/materials/idx-tkim/pabrik-kertas-tjiwi-kimia-shares/ownership",
        sourceLabel: "Simply Wall St Ownership",
      },
    ],
  },
  {
    ticker: "BSDE.JK",
    ultimateOwner: "Sinar Mas Land / Widjaja Family",
    asOfDate: "2026-03-08",
    primarySourceUrl:
      "https://simplywall.st/stocks/us/real-estate-management-and-development/otc-bspd.y/bumi-serpong-damai/ownership",
    primarySourceLabel: "Simply Wall St Ownership",
    majorShareholders: [
      {
        name: "Sinarmas Land Limited",
        percentage: 72.8,
        sourceUrl:
          "https://simplywall.st/stocks/us/real-estate-management-and-development/otc-bspd.y/bumi-serpong-damai/ownership",
        sourceLabel: "Simply Wall St Ownership",
      },
      {
        name: "Norges Bank Investment Management",
        percentage: 1.99,
        sourceUrl:
          "https://simplywall.st/stocks/us/real-estate-management-and-development/otc-bspd.y/bumi-serpong-damai/ownership",
        sourceLabel: "Simply Wall St Ownership",
      },
    ],
  },
  {
    ticker: "BRPT.JK",
    ultimateOwner: "Prajogo Pangestu / Barito Pacific Group",
    asOfDate: "2026-03-08",
    primarySourceUrl:
      "https://simplywall.st/stocks/id/materials/idx-brpt/barito-pacific-shares/ownership",
    primarySourceLabel: "Simply Wall St Ownership",
    majorShareholders: [
      {
        name: "Baritono Pangestu",
        percentage: 71.4,
        sourceUrl:
          "https://simplywall.st/stocks/id/materials/idx-brpt/barito-pacific-shares/ownership",
        sourceLabel: "Simply Wall St Ownership",
      },
      {
        name: "The Vanguard Group, Inc.",
        percentage: 0.96,
        sourceUrl:
          "https://simplywall.st/stocks/id/materials/idx-brpt/barito-pacific-shares/ownership",
        sourceLabel: "Simply Wall St Ownership",
      },
    ],
  },
  {
    ticker: "TPIA.JK",
    ultimateOwner: "Barito Pacific Group",
    asOfDate: "2026-03-08",
    primarySourceUrl: "https://matrixbcg.com/blogs/owners/chandra-asri",
    primarySourceLabel: "Ownership Snapshot",
    majorShareholders: [
      {
        name: "PT Barito Pacific Tbk",
        percentage: 34.63,
        sourceUrl: "https://matrixbcg.com/blogs/owners/chandra-asri",
        sourceLabel: "Ownership Snapshot",
      },
      {
        name: "SCG Chemicals Company Limited",
        percentage: 30.57,
        sourceUrl: "https://matrixbcg.com/blogs/owners/chandra-asri",
        sourceLabel: "Ownership Snapshot",
      },
    ],
  },
];

export const ownershipResearchByTicker = new Map(
  ownershipResearchSnapshots.map((item) => [item.ticker, item]),
);
