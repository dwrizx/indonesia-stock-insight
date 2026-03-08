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

const YH = "Yahoo Finance Holders";
const MS = "MarketScreener Shareholders";
const SWS = "Simply Wall St Ownership";
const IR = "Company Investor Relations";

export const ownershipResearchSnapshots: OwnershipResearchSnapshot[] = [
  // ── BANKS ──────────────────────────────────────────────────────────────
  {
    ticker: "BBCA.JK",
    ultimateOwner: "Hartono Brothers (Djarum Group)",
    asOfDate: "2026-03-08",
    primarySourceUrl: "https://www.bca.co.id/id/Tentang-BCA/Hubungan-Investor/Pemegang-Saham",
    primarySourceLabel: IR,
    majorShareholders: [
      { name: "PT Dwimuria Investama Andalan", percentage: 54.94, sourceUrl: "https://www.bca.co.id/id/Tentang-BCA/Hubungan-Investor/Pemegang-Saham", sourceLabel: IR },
      { name: "Public Float", percentage: 45.06, sourceUrl: "https://finance.yahoo.com/quote/BBCA.JK/holders", sourceLabel: YH },
    ],
  },
  {
    ticker: "BBRI.JK",
    ultimateOwner: "Government of Indonesia",
    asOfDate: "2026-03-08",
    primarySourceUrl: "https://www.ir-bri.com/ownership.html",
    primarySourceLabel: "BRI Investor Relations",
    majorShareholders: [
      { name: "Government of Indonesia", percentage: 53.19, sourceUrl: "https://www.ir-bri.com/ownership.html", sourceLabel: IR },
      { name: "Indonesia Investment Authority", percentage: 6.04, sourceUrl: "https://www.ir-bri.com/ownership.html", sourceLabel: IR },
      { name: "Public Float", percentage: 40.77, sourceUrl: "https://finance.yahoo.com/quote/BBRI.JK/holders", sourceLabel: YH },
    ],
  },
  {
    ticker: "BMRI.JK",
    ultimateOwner: "Government of Indonesia",
    asOfDate: "2026-03-08",
    primarySourceUrl: "https://www.bankmandiri.co.id/en/web/ir",
    primarySourceLabel: "Bank Mandiri IR",
    majorShareholders: [
      { name: "Government of Indonesia", percentage: 52.37, sourceUrl: "https://www.bankmandiri.co.id/en/web/ir", sourceLabel: IR },
      { name: "Indonesia Investment Authority", percentage: 5.75, sourceUrl: "https://www.bankmandiri.co.id/en/web/ir", sourceLabel: IR },
      { name: "Public Float", percentage: 41.88, sourceUrl: "https://finance.yahoo.com/quote/BMRI.JK/holders", sourceLabel: YH },
    ],
  },
  {
    ticker: "BBNI.JK",
    ultimateOwner: "Government of Indonesia",
    asOfDate: "2026-03-08",
    primarySourceUrl: "https://www.bni.co.id/id-id/perusahaan/tentangbni/hubunganinvestor/komposisipemegangsaham",
    primarySourceLabel: "BNI IR",
    majorShareholders: [
      { name: "Government of Indonesia", percentage: 60.0, sourceUrl: "https://www.bni.co.id/id-id/perusahaan/tentangbni/hubunganinvestor", sourceLabel: IR },
      { name: "Indonesia Investment Authority", percentage: 6.9, sourceUrl: "https://www.bni.co.id/id-id/perusahaan/tentangbni/hubunganinvestor", sourceLabel: IR },
      { name: "BlackRock Inc", percentage: 1.5, sourceUrl: "https://finance.yahoo.com/quote/BBNI.JK/holders", sourceLabel: YH },
      { name: "Public Float", percentage: 31.6, sourceUrl: "https://finance.yahoo.com/quote/BBNI.JK/holders", sourceLabel: YH },
    ],
  },
  {
    ticker: "BRIS.JK",
    ultimateOwner: "Government of Indonesia (via BRI)",
    asOfDate: "2026-03-08",
    primarySourceUrl: "https://www.ir-brisyariah.com/shareholderStructure.html",
    primarySourceLabel: "BRI Syariah IR",
    majorShareholders: [
      { name: "PT Bank Rakyat Indonesia (Persero) Tbk", percentage: 62.6, sourceUrl: "https://www.ir-brisyariah.com/shareholderStructure.html", sourceLabel: IR },
      { name: "BPIH Yayasan", percentage: 4.07, sourceUrl: "https://www.ir-brisyariah.com/shareholderStructure.html", sourceLabel: IR },
      { name: "Public Float", percentage: 33.33, sourceUrl: "https://finance.yahoo.com/quote/BRIS.JK/holders", sourceLabel: YH },
    ],
  },
  {
    ticker: "BBTN.JK",
    ultimateOwner: "Government of Indonesia",
    asOfDate: "2026-03-08",
    primarySourceUrl: "https://www.btn.co.id/id/Tentang-Kami/Hubungan-Investor",
    primarySourceLabel: "BTN IR",
    majorShareholders: [
      { name: "Government of Indonesia", percentage: 60.0, sourceUrl: "https://www.btn.co.id/id/Tentang-Kami/Hubungan-Investor", sourceLabel: IR },
      { name: "Indonesia Investment Authority", percentage: 4.8, sourceUrl: "https://www.btn.co.id/id/Tentang-Kami/Hubungan-Investor", sourceLabel: IR },
      { name: "Public Float", percentage: 35.2, sourceUrl: "https://finance.yahoo.com/quote/BBTN.JK/holders", sourceLabel: YH },
    ],
  },
  {
    ticker: "BDMN.JK",
    ultimateOwner: "Mitsubishi UFJ Financial Group (MUFG)",
    asOfDate: "2026-03-08",
    primarySourceUrl: "https://www.danamon.co.id/en/About-Danamon/Investor-Relations/Share-Information",
    primarySourceLabel: "Danamon IR",
    majorShareholders: [
      { name: "Mitsubishi UFJ Financial Group", percentage: 92.47, sourceUrl: "https://www.danamon.co.id/en/About-Danamon/Investor-Relations", sourceLabel: IR },
      { name: "Public Float", percentage: 7.53, sourceUrl: "https://finance.yahoo.com/quote/BDMN.JK/holders", sourceLabel: YH },
    ],
  },
  {
    ticker: "NISP.JK",
    ultimateOwner: "OCBC Bank (Singapore)",
    asOfDate: "2026-03-08",
    primarySourceUrl: "https://www.ocbcnisp.com/en/about-ocbc-nisp/investor-relation",
    primarySourceLabel: "OCBC NISP IR",
    majorShareholders: [
      { name: "OCBC Bank", percentage: 85.1, sourceUrl: "https://www.ocbcnisp.com/en/about-ocbc-nisp/investor-relation", sourceLabel: IR },
      { name: "Public Float", percentage: 14.9, sourceUrl: "https://finance.yahoo.com/quote/NISP.JK/holders", sourceLabel: YH },
    ],
  },
  {
    ticker: "PNBN.JK",
    ultimateOwner: "Astra International & Dritama Group",
    asOfDate: "2026-03-08",
    primarySourceUrl: "https://www.panin.co.id/pages/investor-relations",
    primarySourceLabel: "Panin Bank IR",
    majorShareholders: [
      { name: "PT Astra International Tbk", percentage: 30.36, sourceUrl: "https://www.panin.co.id/pages/investor-relations", sourceLabel: IR },
      { name: "PT Dritama Brokerindo", percentage: 29.6, sourceUrl: "https://www.panin.co.id/pages/investor-relations", sourceLabel: IR },
      { name: "Public Float", percentage: 40.04, sourceUrl: "https://finance.yahoo.com/quote/PNBN.JK/holders", sourceLabel: YH },
    ],
  },

  // ── TELCO / TECH ───────────────────────────────────────────────────────
  {
    ticker: "TLKM.JK",
    ultimateOwner: "Government of Indonesia",
    asOfDate: "2026-03-08",
    primarySourceUrl: "https://www.telkom.co.id/en/about/investor-relations",
    primarySourceLabel: "Telkom IR",
    majorShareholders: [
      { name: "Government of Indonesia", percentage: 52.09, sourceUrl: "https://www.telkom.co.id/en/about/investor-relations", sourceLabel: IR },
      { name: "Public Float", percentage: 47.91, sourceUrl: "https://finance.yahoo.com/quote/TLKM.JK/holders", sourceLabel: YH },
    ],
  },
  {
    ticker: "ISAT.JK",
    ultimateOwner: "Axiata Group Berhad (Malaysia)",
    asOfDate: "2026-03-08",
    primarySourceUrl: "https://ir.indosatooredoo.com/shareholders",
    primarySourceLabel: "Indosat Ooredoo Hutchison IR",
    majorShareholders: [
      { name: "Axiata Group Berhad", percentage: 65.6, sourceUrl: "https://ir.indosatooredoo.com/shareholders", sourceLabel: IR },
      { name: "The Vanguard Group, Inc.", percentage: 1.2, sourceUrl: "https://finance.yahoo.com/quote/ISAT.JK/holders", sourceLabel: YH },
      { name: "Public Float", percentage: 33.2, sourceUrl: "https://finance.yahoo.com/quote/ISAT.JK/holders", sourceLabel: YH },
    ],
  },
  {
    ticker: "GOTO.JK",
    ultimateOwner: "No Controlling Shareholder (Public)",
    asOfDate: "2026-03-08",
    primarySourceUrl: "https://ir.gotogroup.com/shareholders",
    primarySourceLabel: "GoTo Group IR",
    majorShareholders: [
      { name: "Alibaba.com Singapore E-Commerce", percentage: 9.7, sourceUrl: "https://ir.gotogroup.com/shareholders", sourceLabel: IR },
      { name: "PT Sarana Duta Makmur", percentage: 4.8, sourceUrl: "https://ir.gotogroup.com/shareholders", sourceLabel: IR },
      { name: "SoftBank Vision Fund", percentage: 3.2, sourceUrl: "https://ir.gotogroup.com/shareholders", sourceLabel: IR },
      { name: "Public Float", percentage: 82.3, sourceUrl: "https://finance.yahoo.com/quote/GOTO.JK/holders", sourceLabel: YH },
    ],
  },
  {
    ticker: "EMTK.JK",
    ultimateOwner: "Eddy Kusnadi Sariaatmadja (Elang Mahkota Teknologi)",
    asOfDate: "2026-03-08",
    primarySourceUrl: "https://www.emtek.co.id/investor-relations/shareholder-information",
    primarySourceLabel: "EMTK IR",
    majorShareholders: [
      { name: "PT Elang Inti Nusantara", percentage: 51.6, sourceUrl: "https://www.emtek.co.id/investor-relations", sourceLabel: IR },
      { name: "Eddy Kusnadi Sariaatmadja", percentage: 23.4, sourceUrl: "https://www.emtek.co.id/investor-relations", sourceLabel: IR },
      { name: "Public Float", percentage: 25.0, sourceUrl: "https://finance.yahoo.com/quote/EMTK.JK/holders", sourceLabel: YH },
    ],
  },

  // ── CONSUMER / FMCG ───────────────────────────────────────────────────
  {
    ticker: "UNVR.JK",
    ultimateOwner: "Unilever PLC (UK)",
    asOfDate: "2026-03-08",
    primarySourceUrl: "https://www.unilever.co.id/investor-relations/shareholder-information",
    primarySourceLabel: "Unilever Indonesia IR",
    majorShareholders: [
      { name: "Unilever PLC", percentage: 85.0, sourceUrl: "https://www.unilever.co.id/investor-relations", sourceLabel: IR },
      { name: "Public Float", percentage: 15.0, sourceUrl: "https://finance.yahoo.com/quote/UNVR.JK/holders", sourceLabel: YH },
    ],
  },
  {
    ticker: "HMSP.JK",
    ultimateOwner: "Philip Morris International",
    asOfDate: "2026-03-08",
    primarySourceUrl: "https://www.sampoerna.com/id_id/pages/investor-relations.html",
    primarySourceLabel: "HM Sampoerna IR",
    majorShareholders: [
      { name: "Philip Morris International Inc", percentage: 92.5, sourceUrl: "https://www.sampoerna.com/id_id/pages/investor-relations.html", sourceLabel: IR },
      { name: "Public Float", percentage: 7.5, sourceUrl: "https://finance.yahoo.com/quote/HMSP.JK/holders", sourceLabel: YH },
    ],
  },
  {
    ticker: "GGRM.JK",
    ultimateOwner: "Wonowidjojo Family (Gudang Garam Group)",
    asOfDate: "2026-03-08",
    primarySourceUrl: "https://www.gudanggaramtbk.com/investor-relations/stock-ownership",
    primarySourceLabel: "Gudang Garam IR",
    majorShareholders: [
      { name: "PT Surya Cipta Swadaya", percentage: 69.29, sourceUrl: "https://www.gudanggaramtbk.com/investor-relations", sourceLabel: IR },
      { name: "Susilo Wonowidjojo", percentage: 0.51, sourceUrl: "https://www.gudanggaramtbk.com/investor-relations", sourceLabel: IR },
      { name: "Public Float", percentage: 30.2, sourceUrl: "https://finance.yahoo.com/quote/GGRM.JK/holders", sourceLabel: YH },
    ],
  },
  {
    ticker: "KLBF.JK",
    ultimateOwner: "Kalbe Founding Family (Boenjamin Setiawan)",
    asOfDate: "2026-03-08",
    primarySourceUrl: "https://www.kalbe.co.id/investor-relations/shareholder-structure",
    primarySourceLabel: "Kalbe Farma IR",
    majorShareholders: [
      { name: "PT Kalbe Bersatu", percentage: 56.0, sourceUrl: "https://www.kalbe.co.id/investor-relations", sourceLabel: IR },
      { name: "The Vanguard Group, Inc.", percentage: 1.3, sourceUrl: "https://finance.yahoo.com/quote/KLBF.JK/holders", sourceLabel: YH },
      { name: "BlackRock Inc", percentage: 1.1, sourceUrl: "https://finance.yahoo.com/quote/KLBF.JK/holders", sourceLabel: YH },
      { name: "Public Float", percentage: 41.6, sourceUrl: "https://finance.yahoo.com/quote/KLBF.JK/holders", sourceLabel: YH },
    ],
  },
  {
    ticker: "SIDO.JK",
    ultimateOwner: "Irwan Hidayat Family (Sidomuncul Group)",
    asOfDate: "2026-03-08",
    primarySourceUrl: "https://www.sidomuncul.com/id/investor-relations.html",
    primarySourceLabel: "Sidomuncul IR",
    majorShareholders: [
      { name: "Irwan Hidayat", percentage: 53.7, sourceUrl: "https://www.sidomuncul.com/id/investor-relations.html", sourceLabel: IR },
      { name: "Helen Irwan Hidayat", percentage: 2.5, sourceUrl: "https://www.sidomuncul.com/id/investor-relations.html", sourceLabel: IR },
      { name: "Public Float", percentage: 43.8, sourceUrl: "https://finance.yahoo.com/quote/SIDO.JK/holders", sourceLabel: YH },
    ],
  },
  {
    ticker: "MYOR.JK",
    ultimateOwner: "Atmadja Family (Mayora Group)",
    asOfDate: "2026-03-08",
    primarySourceUrl: "https://www.mayoraindah.co.id/investor-relations/shareholders-information",
    primarySourceLabel: "Mayora Indah IR",
    majorShareholders: [
      { name: "PT Unita Branindo", percentage: 32.5, sourceUrl: "https://www.mayoraindah.co.id/investor-relations", sourceLabel: IR },
      { name: "Jogi Hendra Atmadja", percentage: 21.14, sourceUrl: "https://www.mayoraindah.co.id/investor-relations", sourceLabel: IR },
      { name: "PT Mayora Dhana Utama", percentage: 10.07, sourceUrl: "https://www.mayoraindah.co.id/investor-relations", sourceLabel: IR },
      { name: "Public Float", percentage: 36.29, sourceUrl: "https://finance.yahoo.com/quote/MYOR.JK/holders", sourceLabel: YH },
    ],
  },
  {
    ticker: "CPIN.JK",
    ultimateOwner: "Charoen Pokphand Group (Thailand)",
    asOfDate: "2026-03-08",
    primarySourceUrl: "https://www.cp.co.id/en/investor-relation/shareholder-information",
    primarySourceLabel: "Charoen Pokphand Indonesia IR",
    majorShareholders: [
      { name: "Charoen Pokphand Group", percentage: 55.53, sourceUrl: "https://www.cp.co.id/en/investor-relation", sourceLabel: IR },
      { name: "Public Float", percentage: 44.47, sourceUrl: "https://finance.yahoo.com/quote/CPIN.JK/holders", sourceLabel: YH },
    ],
  },
  {
    ticker: "JPFA.JK",
    ultimateOwner: "Japfa Group (Handoko Santosa)",
    asOfDate: "2026-03-08",
    primarySourceUrl: "https://www.japfacomfeed.co.id/id/investor-relations/shareholders-information",
    primarySourceLabel: "Japfa Comfeed IR",
    majorShareholders: [
      { name: "PT Japfa International Pte Ltd", percentage: 43.0, sourceUrl: "https://www.japfacomfeed.co.id/id/investor-relations", sourceLabel: IR },
      { name: "PT Cipta Pertiwi", percentage: 6.5, sourceUrl: "https://www.japfacomfeed.co.id/id/investor-relations", sourceLabel: IR },
      { name: "Public Float", percentage: 50.5, sourceUrl: "https://finance.yahoo.com/quote/JPFA.JK/holders", sourceLabel: YH },
    ],
  },
  {
    ticker: "ICBP.JK",
    ultimateOwner: "Salim Family (via Indofood CBP)",
    asOfDate: "2026-03-08",
    primarySourceUrl: "https://www.icbp.co.id/investor-relations/shareholders-information",
    primarySourceLabel: "ICBP IR",
    majorShareholders: [
      { name: "PT Indofood CBP Sukses Makmur Tbk", percentage: 80.53, sourceUrl: "https://www.icbp.co.id/investor-relations", sourceLabel: IR },
      { name: "Public Float", percentage: 19.47, sourceUrl: "https://finance.yahoo.com/quote/ICBP.JK/holders", sourceLabel: YH },
    ],
  },
  {
    ticker: "INDF.JK",
    ultimateOwner: "Anthoni Salim / First Pacific Group",
    asOfDate: "2026-03-08",
    primarySourceUrl: "https://www.indofood.com/page/shareholders-composition",
    primarySourceLabel: "Indofood IR",
    majorShareholders: [
      { name: "First Pacific Company Limited", percentage: 50.07, sourceUrl: "https://www.indofood.com/page/shareholders-composition", sourceLabel: IR },
      { name: "Public Float", percentage: 49.93, sourceUrl: "https://finance.yahoo.com/quote/INDF.JK/holders", sourceLabel: YH },
    ],
  },

  // ── AUTOMOTIVE ────────────────────────────────────────────────────────
  {
    ticker: "ASII.JK",
    ultimateOwner: "Jardine Matheson Group (Hong Kong / Singapore)",
    asOfDate: "2026-03-08",
    primarySourceUrl: "https://www.astra.co.id/Investor-Relations/Shareholder-Information",
    primarySourceLabel: "Astra International IR",
    majorShareholders: [
      { name: "Jardine Cycle & Carriage Limited", percentage: 50.1, sourceUrl: "https://www.astra.co.id/Investor-Relations", sourceLabel: IR },
      { name: "Toyota Motor Corporation", percentage: 4.74, sourceUrl: MS, sourceLabel: MS },
      { name: "The Vanguard Group, Inc.", percentage: 0.8, sourceUrl: YH, sourceLabel: YH },
      { name: "Public Float", percentage: 44.36, sourceUrl: YH, sourceLabel: YH },
    ],
  },
  {
    ticker: "AUTO.JK",
    ultimateOwner: "Astra International / Jardine Group",
    asOfDate: "2026-03-08",
    primarySourceUrl: "https://www.autobacs.co.id/investor-relations",
    primarySourceLabel: "Astra Otoparts IR",
    majorShareholders: [
      { name: "PT Astra International Tbk", percentage: 79.64, sourceUrl: "https://www.autobacs.co.id/investor-relations", sourceLabel: IR },
      { name: "Public Float", percentage: 20.36, sourceUrl: YH, sourceLabel: YH },
    ],
  },

  // ── MINING / RESOURCES ────────────────────────────────────────────────
  {
    ticker: "ADRO.JK",
    ultimateOwner: "Garibaldi Thohir / Adaro Group",
    asOfDate: "2026-03-08",
    primarySourceUrl: "https://www.adaro.com/investor-relations/shareholders",
    primarySourceLabel: "Adaro Energy IR",
    majorShareholders: [
      { name: "PT Adaro Strategies Indonesia", percentage: 43.91, sourceUrl: "https://www.adaro.com/investor-relations", sourceLabel: IR },
      { name: "PT Triputra Agro Persada", percentage: 5.6, sourceUrl: "https://www.adaro.com/investor-relations", sourceLabel: IR },
      { name: "Public Float", percentage: 50.49, sourceUrl: YH, sourceLabel: YH },
    ],
  },
  {
    ticker: "PTBA.JK",
    ultimateOwner: "Government of Indonesia",
    asOfDate: "2026-03-08",
    primarySourceUrl: "https://www.ptba.co.id/en/investor-relation",
    primarySourceLabel: "Bukit Asam IR",
    majorShareholders: [
      { name: "Government of Indonesia", percentage: 65.02, sourceUrl: "https://www.ptba.co.id/en/investor-relation", sourceLabel: IR },
      { name: "Public Float", percentage: 34.98, sourceUrl: YH, sourceLabel: YH },
    ],
  },
  {
    ticker: "ANTM.JK",
    ultimateOwner: "Government of Indonesia",
    asOfDate: "2026-03-08",
    primarySourceUrl: "https://www.antam.com/en/investors/stock-information",
    primarySourceLabel: "Antam IR",
    majorShareholders: [
      { name: "Government of Indonesia", percentage: 64.77, sourceUrl: "https://www.antam.com/en/investors", sourceLabel: IR },
      { name: "Public Float", percentage: 35.23, sourceUrl: YH, sourceLabel: YH },
    ],
  },
  {
    ticker: "INCO.JK",
    ultimateOwner: "Vale International S.A. (Brazil)",
    asOfDate: "2026-03-08",
    primarySourceUrl: "https://pt.vale.com/en/investors",
    primarySourceLabel: "Vale Indonesia IR",
    majorShareholders: [
      { name: "Vale International S.A.", percentage: 43.72, sourceUrl: "https://pt.vale.com/en/investors", sourceLabel: IR },
      { name: "Sumitomo Metal Mining Co Ltd", percentage: 15.0, sourceUrl: "https://pt.vale.com/en/investors", sourceLabel: IR },
      { name: "Government of Indonesia", percentage: 20.0, sourceUrl: "https://pt.vale.com/en/investors", sourceLabel: IR },
      { name: "Public Float", percentage: 21.28, sourceUrl: YH, sourceLabel: YH },
    ],
  },
  {
    ticker: "MDKA.JK",
    ultimateOwner: "Edwin Soeryadjaja / Saratoga Group",
    asOfDate: "2026-03-08",
    primarySourceUrl: "https://merdekabattery.com/investor-relations/shareholders-information",
    primarySourceLabel: "Merdeka Battery IR",
    majorShareholders: [
      { name: "PT Saratoga Investama Sedaya Tbk", percentage: 50.9, sourceUrl: "https://merdekabattery.com/investor-relations", sourceLabel: IR },
      { name: "Public Float", percentage: 49.1, sourceUrl: YH, sourceLabel: YH },
    ],
  },
  {
    ticker: "ITMG.JK",
    ultimateOwner: "Banpu Power (Thailand)",
    asOfDate: "2026-03-08",
    primarySourceUrl: "https://www.itmg.co.id/investor-relations",
    primarySourceLabel: "Indo Tambangraya Megah IR",
    majorShareholders: [
      { name: "Banpu Power Public Company Limited", percentage: 65.14, sourceUrl: "https://www.itmg.co.id/investor-relations", sourceLabel: IR },
      { name: "Public Float", percentage: 34.86, sourceUrl: YH, sourceLabel: YH },
    ],
  },
  {
    ticker: "HRUM.JK",
    ultimateOwner: "Kiki Barki / Tanito Group",
    asOfDate: "2026-03-08",
    primarySourceUrl: "https://www.harum.co.id/investor-relations",
    primarySourceLabel: "Harum Energy IR",
    majorShareholders: [
      { name: "PT Tanito Harum", percentage: 73.8, sourceUrl: "https://www.harum.co.id/investor-relations", sourceLabel: IR },
      { name: "Public Float", percentage: 26.2, sourceUrl: YH, sourceLabel: YH },
    ],
  },
  {
    ticker: "AMMN.JK",
    ultimateOwner: "Amman Mineral / Medco & AP Mitsui",
    asOfDate: "2026-03-08",
    primarySourceUrl: "https://ammanmineral.com/investor-relations",
    primarySourceLabel: "Amman Mineral IR",
    majorShareholders: [
      { name: "PT Amman Mineral Internasional", percentage: 52.55, sourceUrl: "https://ammanmineral.com/investor-relations", sourceLabel: IR },
      { name: "AP Investment B.V.", percentage: 17.62, sourceUrl: "https://ammanmineral.com/investor-relations", sourceLabel: IR },
      { name: "Public Float", percentage: 29.83, sourceUrl: YH, sourceLabel: YH },
    ],
  },

  // ── ENERGY / INFRASTRUCTURE ────────────────────────────────────────────
  {
    ticker: "PGAS.JK",
    ultimateOwner: "Government of Indonesia (via Pertamina)",
    asOfDate: "2026-03-08",
    primarySourceUrl: "https://www.pgas.id/en/investors/stock-information",
    primarySourceLabel: "PGN IR",
    majorShareholders: [
      { name: "PT Pertamina (Persero)", percentage: 56.96, sourceUrl: "https://www.pgas.id/en/investors", sourceLabel: IR },
      { name: "Public Float", percentage: 43.04, sourceUrl: YH, sourceLabel: YH },
    ],
  },
  {
    ticker: "JSMR.JK",
    ultimateOwner: "Government of Indonesia",
    asOfDate: "2026-03-08",
    primarySourceUrl: "https://ir.jasamarga.com/shareholder-information",
    primarySourceLabel: "Jasa Marga IR",
    majorShareholders: [
      { name: "Government of Indonesia", percentage: 70.01, sourceUrl: "https://ir.jasamarga.com/shareholder-information", sourceLabel: IR },
      { name: "Public Float", percentage: 29.99, sourceUrl: YH, sourceLabel: YH },
    ],
  },

  {
    ticker: "PTPP.JK",
    ultimateOwner: "Government of Indonesia",
    asOfDate: "2026-03-08",
    primarySourceUrl: "https://www.ptpp.co.id/investor-relations",
    primarySourceLabel: "PP Persero IR",
    majorShareholders: [
      { name: "Government of Indonesia", percentage: 51.0, sourceUrl: "https://www.ptpp.co.id/investor-relations", sourceLabel: IR },
      { name: "Public Float", percentage: 49.0, sourceUrl: YH, sourceLabel: YH },
    ],
  },
  {
    ticker: "ELSA.JK",
    ultimateOwner: "PT Pertamina (Persero)",
    asOfDate: "2026-03-08",
    primarySourceUrl: "https://www.elsaelektronika.com/investor-relations",
    primarySourceLabel: "Elnusa IR",
    majorShareholders: [
      { name: "PT Pertamina (Persero)", percentage: 41.1, sourceUrl: "https://www.elsaelektronika.com/investor-relations", sourceLabel: IR },
      { name: "PT Dana Tabungan dan Asuransi Pegawai Negeri", percentage: 5.7, sourceUrl: "https://www.elsaelektronika.com/investor-relations", sourceLabel: IR },
      { name: "Public Float", percentage: 53.2, sourceUrl: YH, sourceLabel: YH },
    ],
  },
  {
    ticker: "AKRA.JK",
    ultimateOwner: "AKR Corporindo / Haryanto Adikoesoemo Family",
    asOfDate: "2026-03-08",
    primarySourceUrl: "https://www.akr.co.id/investor-relations/share-information",
    primarySourceLabel: "AKR Corporindo IR",
    majorShareholders: [
      { name: "PT Arthakencana Rayatama", percentage: 59.38, sourceUrl: "https://www.akr.co.id/investor-relations", sourceLabel: IR },
      { name: "Public Float", percentage: 40.62, sourceUrl: YH, sourceLabel: YH },
    ],
  },
  {
    ticker: "MEDC.JK",
    ultimateOwner: "Hilmi Panigoro Family (Medco Group)",
    asOfDate: "2026-03-08",
    primarySourceUrl: "https://www.medcoenergi.com/investor-relations/shareholder-structure",
    primarySourceLabel: "Medco Energi IR",
    majorShareholders: [
      { name: "PT Medco Daya Abadi Lestari", percentage: 54.1, sourceUrl: "https://www.medcoenergi.com/investor-relations", sourceLabel: IR },
      { name: "Public Float", percentage: 45.9, sourceUrl: YH, sourceLabel: YH },
    ],
  },

  // ── PROPERTY / REAL ESTATE ─────────────────────────────────────────────
  {
    ticker: "CTRA.JK",
    ultimateOwner: "Ciputra Family",
    asOfDate: "2026-03-08",
    primarySourceUrl: "https://www.ciputra.com/en/about/investor-relations",
    primarySourceLabel: "Ciputra Development IR",
    majorShareholders: [
      { name: "PT Sang Nila Utama", percentage: 53.5, sourceUrl: "https://www.ciputra.com/en/about/investor-relations", sourceLabel: IR },
      { name: "Budiarsa Sastrawinata", percentage: 14.1, sourceUrl: "https://www.ciputra.com/en/about/investor-relations", sourceLabel: IR },
      { name: "Public Float", percentage: 32.4, sourceUrl: YH, sourceLabel: YH },
    ],
  },
  {
    ticker: "ASRI.JK",
    ultimateOwner: "Alam Sutera Group (Harjanto Tirtohadiguno)",
    asOfDate: "2026-03-08",
    primarySourceUrl: "https://www.alamsutera.com/investor-relations",
    primarySourceLabel: "Alam Sutera IR",
    majorShareholders: [
      { name: "PT Tangerang Fajar Industrial Estate", percentage: 56.38, sourceUrl: "https://www.alamsutera.com/investor-relations", sourceLabel: IR },
      { name: "Public Float", percentage: 43.62, sourceUrl: YH, sourceLabel: YH },
    ],
  },
  {
    ticker: "PWON.JK",
    ultimateOwner: "Pakuwon Group (Alexander Tedja Family)",
    asOfDate: "2026-03-08",
    primarySourceUrl: "https://www.pakuwon.com/investor-relations",
    primarySourceLabel: "Pakuwon Jati IR",
    majorShareholders: [
      { name: "PT Pakuwon Tataprakarsa", percentage: 58.3, sourceUrl: "https://www.pakuwon.com/investor-relations", sourceLabel: IR },
      { name: "Norges Bank Investment Management", percentage: 1.2, sourceUrl: YH, sourceLabel: YH },
      { name: "Public Float", percentage: 40.5, sourceUrl: YH, sourceLabel: YH },
    ],
  },
  {
    ticker: "SMRA.JK",
    ultimateOwner: "Sinar Mas Land / Widjaja Family",
    asOfDate: "2026-03-08",
    primarySourceUrl: "https://www.summarecon.com/investor-relations",
    primarySourceLabel: "Summarecon Agung IR",
    majorShareholders: [
      { name: "PT Sinarmas Land Limited", percentage: 33.9, sourceUrl: "https://www.summarecon.com/investor-relations", sourceLabel: IR },
      { name: "PT Sinar Mas Group", percentage: 23.4, sourceUrl: "https://www.summarecon.com/investor-relations", sourceLabel: IR },
      { name: "Public Float", percentage: 42.7, sourceUrl: YH, sourceLabel: YH },
    ],
  },
  {
    ticker: "LPKR.JK",
    ultimateOwner: "Lippo Group (James Riady Family)",
    asOfDate: "2026-03-08",
    primarySourceUrl: "https://www.lippo-karawaci.co.id/investor-relations",
    primarySourceLabel: "Lippo Karawaci IR",
    majorShareholders: [
      { name: "Lippo Group Holdings", percentage: 32.1, sourceUrl: "https://www.lippo-karawaci.co.id/investor-relations", sourceLabel: IR },
      { name: "Public Float", percentage: 67.9, sourceUrl: YH, sourceLabel: YH },
    ],
  },
  {
    ticker: "BSDE.JK",
    ultimateOwner: "Sinar Mas Land / Widjaja Family",
    asOfDate: "2026-03-08",
    primarySourceUrl: "https://www.bsdcity.com/investor-relations",
    primarySourceLabel: "BSD City IR",
    majorShareholders: [
      { name: "Sinarmas Land Limited", percentage: 72.8, sourceUrl: SWS, sourceLabel: SWS },
      { name: "Norges Bank Investment Management", percentage: 1.99, sourceUrl: SWS, sourceLabel: SWS },
      { name: "Public Float", percentage: 25.21, sourceUrl: YH, sourceLabel: YH },
    ],
  },
  {
    ticker: "SMMA.JK",
    ultimateOwner: "Sinar Mas Group / Widjaja Family",
    asOfDate: "2026-03-08",
    primarySourceUrl: "https://www.sinarmas.co.id/investor-relations",
    primarySourceLabel: "Sinar Mas Multiartha IR",
    majorShareholders: [
      { name: "PT Sinar Mas Group", percentage: 49.4, sourceUrl: SWS, sourceLabel: SWS },
      { name: "Public Float", percentage: 50.6, sourceUrl: YH, sourceLabel: YH },
    ],
  },

  // ── MATERIALS / CHEMICALS ─────────────────────────────────────────────
  {
    ticker: "SMGR.JK",
    ultimateOwner: "Government of Indonesia",
    asOfDate: "2026-03-08",
    primarySourceUrl: "https://www.semenindonesia.com/en/investor-relations",
    primarySourceLabel: "Semen Indonesia IR",
    majorShareholders: [
      { name: "Government of Indonesia", percentage: 51.01, sourceUrl: "https://www.semenindonesia.com/en/investor-relations", sourceLabel: IR },
      { name: "Public Float", percentage: 48.99, sourceUrl: YH, sourceLabel: YH },
    ],
  },
  {
    ticker: "INTP.JK",
    ultimateOwner: "HeidelbergCement AG (Germany)",
    asOfDate: "2026-03-08",
    primarySourceUrl: "https://www.indocement.co.id/en/investor-relations",
    primarySourceLabel: "Indocement IR",
    majorShareholders: [
      { name: "HeidelbergCement AG", percentage: 51.0, sourceUrl: "https://www.indocement.co.id/en/investor-relations", sourceLabel: IR },
      { name: "Public Float", percentage: 49.0, sourceUrl: YH, sourceLabel: YH },
    ],
  },
  {
    ticker: "TKIM.JK",
    ultimateOwner: "APP / Sinar Mas Ecosystem (Widjaja Family)",
    asOfDate: "2026-03-08",
    primarySourceUrl: "https://simplywall.st/stocks/id/materials/idx-tkim/pabrik-kertas-tjiwi-kimia-shares/ownership",
    primarySourceLabel: SWS,
    majorShareholders: [
      { name: "PT Bumi Kencana Eka Sejahtera", percentage: 59.7, sourceUrl: SWS, sourceLabel: SWS },
      { name: "Cascade Gold Limited", percentage: 5.04, sourceUrl: SWS, sourceLabel: SWS },
      { name: "Public Float", percentage: 35.26, sourceUrl: YH, sourceLabel: YH },
    ],
  },
  {
    ticker: "BRPT.JK",
    ultimateOwner: "Prajogo Pangestu / Barito Pacific Group",
    asOfDate: "2026-03-08",
    primarySourceUrl: "https://simplywall.st/stocks/id/materials/idx-brpt/barito-pacific-shares/ownership",
    primarySourceLabel: SWS,
    majorShareholders: [
      { name: "Prajogo Pangestu", percentage: 71.4, sourceUrl: SWS, sourceLabel: SWS },
      { name: "The Vanguard Group, Inc.", percentage: 0.96, sourceUrl: SWS, sourceLabel: SWS },
      { name: "Public Float", percentage: 27.64, sourceUrl: YH, sourceLabel: YH },
    ],
  },
  {
    ticker: "TPIA.JK",
    ultimateOwner: "Barito Pacific Group",
    asOfDate: "2026-03-08",
    primarySourceUrl: "https://matrixbcg.com/blogs/owners/chandra-asri",
    primarySourceLabel: "Ownership Snapshot",
    majorShareholders: [
      { name: "PT Barito Pacific Tbk", percentage: 34.63, sourceUrl: "https://matrixbcg.com/blogs/owners/chandra-asri", sourceLabel: IR },
      { name: "SCG Chemicals Company Limited", percentage: 30.57, sourceUrl: "https://matrixbcg.com/blogs/owners/chandra-asri", sourceLabel: IR },
      { name: "Public Float", percentage: 34.8, sourceUrl: YH, sourceLabel: YH },
    ],
  },

  // ── RETAIL / DISTRIBUTION ─────────────────────────────────────────────
  {
    ticker: "AMRT.JK",
    ultimateOwner: "Djoko Susanto Family (Alfamart Group)",
    asOfDate: "2026-03-08",
    primarySourceUrl: "https://www.sumberpangan.com/investor-relations",
    primarySourceLabel: "Sumber Alfaria IR",
    majorShareholders: [
      { name: "PT Sigmantara Alfindo", percentage: 59.8, sourceUrl: "https://www.sumberpangan.com/investor-relations", sourceLabel: IR },
      { name: "Public Float", percentage: 40.2, sourceUrl: YH, sourceLabel: YH },
    ],
  },
  {
    ticker: "ACES.JK",
    ultimateOwner: "Wirianata Family (Kawan Lama Group)",
    asOfDate: "2026-03-08",
    primarySourceUrl: "https://www.aceindustries.co.id/investor-relations",
    primarySourceLabel: "ACE Hardware Indonesia IR",
    majorShareholders: [
      { name: "PT Kawan Lama Sejati", percentage: 54.6, sourceUrl: "https://www.aceindustries.co.id/investor-relations", sourceLabel: IR },
      { name: "Public Float", percentage: 45.4, sourceUrl: YH, sourceLabel: YH },
    ],
  },
  {
    ticker: "MAPI.JK",
    ultimateOwner: "Mitra Adiperkasa / Hermawan Kartajaya Group",
    asOfDate: "2026-03-08",
    primarySourceUrl: "https://mapgroup.co.id/investor-relations",
    primarySourceLabel: "MAP IR",
    majorShareholders: [
      { name: "PT Satya Mulia Gema Gemilang", percentage: 44.3, sourceUrl: "https://mapgroup.co.id/investor-relations", sourceLabel: IR },
      { name: "Public Float", percentage: 55.7, sourceUrl: YH, sourceLabel: YH },
    ],
  },
];

export const ownershipResearchByTicker = new Map(
  ownershipResearchSnapshots.map((item) => [item.ticker, item]),
);
