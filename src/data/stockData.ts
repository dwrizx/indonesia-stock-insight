export interface Stock {
  ticker: string;
  name: string;
  sector: string;
  price: number;
  change: number;
  changePercent: number;
  volume: number;
  marketCap: number;
  pe: number;
  pbv: number;
  dividendYield: number;
  high52w: number;
  low52w: number;
  open: number;
  high: number;
  low: number;
  prevClose: number;
  eps: number;
  roe: number;
  beta: number;
  debtToEquity: number;
}

export interface MarketIndex {
  name: string;
  value: number;
  change: number;
  changePercent: number;
}

export interface ChartDataPoint {
  date: string;
  price: number;
  volume: number;
}

export interface StockNews {
  title: string;
  source: string;
  time: string;
  sentiment: "positive" | "negative" | "neutral";
}

export const marketIndices: MarketIndex[] = [
  { name: "IHSG", value: 7234.56, change: 45.23, changePercent: 0.63 },
  { name: "LQ45", value: 987.12, change: -3.45, changePercent: -0.35 },
  { name: "IDX30", value: 512.34, change: 2.18, changePercent: 0.43 },
  { name: "JII", value: 598.90, change: 8.76, changePercent: 1.48 },
];

export const stocks: Stock[] = [
  {
    ticker: "BBCA.JK", name: "Bank Central Asia", sector: "Keuangan",
    price: 9875, change: 125, changePercent: 1.28, volume: 45230000,
    marketCap: 1215000000000000, pe: 26.5, pbv: 4.8, dividendYield: 1.2,
    high52w: 10250, low52w: 8400, open: 9750, high: 9900, low: 9725, prevClose: 9750,
    eps: 372, roe: 20.1, beta: 0.85, debtToEquity: 4.2,
  },
  {
    ticker: "BBRI.JK", name: "Bank Rakyat Indonesia", sector: "Keuangan",
    price: 5425, change: -75, changePercent: -1.36, volume: 89450000,
    marketCap: 820000000000000, pe: 14.2, pbv: 2.6, dividendYield: 3.8,
    high52w: 6100, low52w: 4200, open: 5500, high: 5525, low: 5400, prevClose: 5500,
    eps: 382, roe: 18.5, beta: 1.12, debtToEquity: 5.1,
  },
  {
    ticker: "TLKM.JK", name: "Telkom Indonesia", sector: "Telekomunikasi",
    price: 3940, change: 60, changePercent: 1.55, volume: 62100000,
    marketCap: 390000000000000, pe: 16.8, pbv: 3.1, dividendYield: 4.2,
    high52w: 4300, low52w: 3100, open: 3880, high: 3960, low: 3870, prevClose: 3880,
    eps: 234, roe: 19.8, beta: 0.72, debtToEquity: 0.8,
  },
  {
    ticker: "ASII.JK", name: "Astra International", sector: "Industri",
    price: 5150, change: -25, changePercent: -0.48, volume: 23400000,
    marketCap: 208000000000000, pe: 7.5, pbv: 1.2, dividendYield: 6.1,
    high52w: 5800, low52w: 4150, open: 5175, high: 5200, low: 5100, prevClose: 5175,
    eps: 687, roe: 15.2, beta: 1.05, debtToEquity: 0.9,
  },
  {
    ticker: "UNVR.JK", name: "Unilever Indonesia", sector: "Konsumsi",
    price: 3280, change: 80, changePercent: 2.50, volume: 12800000,
    marketCap: 125000000000000, pe: 32.1, pbv: 28.5, dividendYield: 2.8,
    high52w: 4200, low52w: 2800, open: 3200, high: 3300, low: 3190, prevClose: 3200,
    eps: 102, roe: 95.3, beta: 0.55, debtToEquity: 2.5,
  },
  {
    ticker: "BMRI.JK", name: "Bank Mandiri", sector: "Keuangan",
    price: 6350, change: 100, changePercent: 1.60, volume: 34500000,
    marketCap: 593000000000000, pe: 11.8, pbv: 2.1, dividendYield: 4.5,
    high52w: 7200, low52w: 5100, open: 6250, high: 6375, low: 6225, prevClose: 6250,
    eps: 538, roe: 21.3, beta: 1.08, debtToEquity: 4.8,
  },
  {
    ticker: "GOTO.JK", name: "GoTo Gojek Tokopedia", sector: "Teknologi",
    price: 76, change: 3, changePercent: 4.11, volume: 2340000000,
    marketCap: 89000000000000, pe: -12.5, pbv: 1.8, dividendYield: 0,
    high52w: 108, low52w: 52, open: 73, high: 78, low: 72, prevClose: 73,
    eps: -6, roe: -8.5, beta: 1.85, debtToEquity: 0.3,
  },
  {
    ticker: "BRIS.JK", name: "Bank Syariah Indonesia", sector: "Keuangan",
    price: 2650, change: -30, changePercent: -1.12, volume: 18900000,
    marketCap: 120000000000000, pe: 19.2, pbv: 3.4, dividendYield: 1.0,
    high52w: 3100, low52w: 1900, open: 2680, high: 2700, low: 2630, prevClose: 2680,
    eps: 138, roe: 16.2, beta: 1.25, debtToEquity: 6.2,
  },
  {
    ticker: "ICBP.JK", name: "Indofood CBP Sukses", sector: "Konsumsi",
    price: 11475, change: 175, changePercent: 1.55, volume: 5600000,
    marketCap: 134000000000000, pe: 21.3, pbv: 4.2, dividendYield: 2.1,
    high52w: 12500, low52w: 9800, open: 11300, high: 11500, low: 11275, prevClose: 11300,
    eps: 539, roe: 19.7, beta: 0.62, debtToEquity: 0.6,
  },
  {
    ticker: "ACES.JK", name: "Ace Hardware Indonesia", sector: "Ritel",
    price: 745, change: -10, changePercent: -1.32, volume: 15200000,
    marketCap: 12800000000000, pe: 22.5, pbv: 3.8, dividendYield: 2.5,
    high52w: 900, low52w: 600, open: 755, high: 760, low: 740, prevClose: 755,
    eps: 33, roe: 17.1, beta: 0.78, debtToEquity: 0.1,
  },
  {
    ticker: "BBNI.JK", name: "Bank Negara Indonesia", sector: "Keuangan",
    price: 5075, change: 50, changePercent: 0.99, volume: 28700000,
    marketCap: 189000000000000, pe: 8.9, pbv: 1.3, dividendYield: 5.2,
    high52w: 5900, low52w: 3800, open: 5025, high: 5100, low: 5000, prevClose: 5025,
    eps: 570, roe: 15.8, beta: 1.15, debtToEquity: 5.5,
  },
  {
    ticker: "INDF.JK", name: "Indofood Sukses Makmur", sector: "Konsumsi",
    price: 6925, change: -50, changePercent: -0.72, volume: 8900000,
    marketCap: 60800000000000, pe: 9.8, pbv: 1.4, dividendYield: 4.8,
    high52w: 7800, low52w: 5500, open: 6975, high: 7000, low: 6900, prevClose: 6975,
    eps: 707, roe: 14.2, beta: 0.68, debtToEquity: 0.9,
  },
  {
    ticker: "EMTK.JK", name: "Elang Mahkota Teknologi", sector: "Teknologi",
    price: 480, change: 15, changePercent: 3.23, volume: 42000000,
    marketCap: 26500000000000, pe: -8.2, pbv: 0.9, dividendYield: 0,
    high52w: 620, low52w: 310, open: 465, high: 490, low: 460, prevClose: 465,
    eps: -58, roe: -5.2, beta: 1.65, debtToEquity: 0.4,
  },
  {
    ticker: "MAPI.JK", name: "Mitra Adiperkasa", sector: "Ritel",
    price: 1560, change: 35, changePercent: 2.30, volume: 11200000,
    marketCap: 26200000000000, pe: 15.6, pbv: 3.2, dividendYield: 1.8,
    high52w: 1850, low52w: 1200, open: 1525, high: 1575, low: 1520, prevClose: 1525,
    eps: 100, roe: 22.4, beta: 0.92, debtToEquity: 1.1,
  },
];

export const stockNews: Record<string, StockNews[]> = {
  "BBCA.JK": [
    { title: "BCA catat laba bersih Rp52,1 triliun di 2025, naik 12% YoY", source: "CNBC Indonesia", time: "2 jam lalu", sentiment: "positive" },
    { title: "Analis rekomendasikan BCA sebagai saham blue chip terbaik", source: "Kontan", time: "5 jam lalu", sentiment: "positive" },
    { title: "BCA ekspansi layanan digital banking ke 15 kota baru", source: "Bisnis.com", time: "1 hari lalu", sentiment: "neutral" },
  ],
  "BBRI.JK": [
    { title: "BRI fokus penyaluran kredit UMKM capai Rp1.200 triliun", source: "Kompas", time: "3 jam lalu", sentiment: "positive" },
    { title: "NPL BRI naik tipis ke 2,8%, masih dalam batas wajar", source: "CNBC Indonesia", time: "6 jam lalu", sentiment: "negative" },
    { title: "BRI luncurkan fitur baru BRImo untuk transaksi saham", source: "Detik Finance", time: "1 hari lalu", sentiment: "neutral" },
  ],
  "TLKM.JK": [
    { title: "Telkom dorong ekspansi data center ke Asia Tenggara", source: "Bisnis.com", time: "4 jam lalu", sentiment: "positive" },
    { title: "Pendapatan Telkom dari layanan digital tumbuh 25%", source: "Kontan", time: "8 jam lalu", sentiment: "positive" },
    { title: "Telkom evaluasi portofolio anak usaha yang merugi", source: "CNBC Indonesia", time: "2 hari lalu", sentiment: "negative" },
  ],
  "GOTO.JK": [
    { title: "GoTo cetak EBITDA positif untuk pertama kalinya", source: "TechCrunch", time: "1 jam lalu", sentiment: "positive" },
    { title: "GoPay jadi dompet digital terbesar di Indonesia", source: "Kompas", time: "4 jam lalu", sentiment: "positive" },
    { title: "GoTo pangkas 300 karyawan dalam restrukturisasi", source: "Detik", time: "2 hari lalu", sentiment: "negative" },
  ],
};

// Default news for stocks without specific news
const defaultNews: StockNews[] = [
  { title: "Pasar saham Indonesia menguat di tengah sentimen global", source: "CNBC Indonesia", time: "1 jam lalu", sentiment: "positive" },
  { title: "Investor asing catat net buy Rp1,2 triliun di pasar reguler", source: "Kontan", time: "3 jam lalu", sentiment: "positive" },
  { title: "BI pertahankan suku bunga acuan di 5,75%", source: "Bisnis.com", time: "5 jam lalu", sentiment: "neutral" },
];

export function getStockNews(ticker: string): StockNews[] {
  return stockNews[ticker] || defaultNews;
}

export function generateSparkline(basePrice: number, points: number = 20, seed: number = 0): number[] {
  const data: number[] = [];
  let price = basePrice * 0.95;
  for (let i = 0; i < points; i++) {
    const volatility = (Math.sin(seed + i * 0.7) * 0.3 + (Math.random() - 0.48)) * basePrice * 0.02;
    price = Math.max(price + volatility, basePrice * 0.8);
    data.push(Math.round(price));
  }
  return data;
}

export function generateChartData(basePrice: number, days: number = 90): ChartDataPoint[] {
  const data: ChartDataPoint[] = [];
  let price = basePrice * 0.9;
  const now = new Date();

  for (let i = days; i >= 0; i--) {
    const date = new Date(now);
    date.setDate(date.getDate() - i);
    const volatility = (Math.random() - 0.48) * basePrice * 0.03;
    price = Math.max(price + volatility, basePrice * 0.7);
    data.push({
      date: date.toLocaleDateString("id-ID", { day: "2-digit", month: "short" }),
      price: Math.round(price),
      volume: Math.round(Math.random() * 50000000 + 10000000),
    });
  }
  return data;
}

export const sectorData = [
  { name: "Keuangan", value: 42, color: "hsl(45, 93%, 58%)" },
  { name: "Konsumsi", value: 18, color: "hsl(152, 69%, 46%)" },
  { name: "Telekomunikasi", value: 10, color: "hsl(200, 70%, 50%)" },
  { name: "Industri", value: 10, color: "hsl(280, 60%, 55%)" },
  { name: "Teknologi", value: 12, color: "hsl(340, 65%, 55%)" },
  { name: "Ritel", value: 8, color: "hsl(25, 80%, 55%)" },
];

export function formatRupiah(value: number): string {
  if (value >= 1e15) return `Rp${(value / 1e12).toFixed(0)}T`;
  if (value >= 1e12) return `Rp${(value / 1e12).toFixed(1)}T`;
  if (value >= 1e9) return `Rp${(value / 1e9).toFixed(1)}M`;
  return `Rp${value.toLocaleString("id-ID")}`;
}

export function formatVolume(value: number): string {
  if (value >= 1e9) return `${(value / 1e9).toFixed(1)}B`;
  if (value >= 1e6) return `${(value / 1e6).toFixed(1)}M`;
  if (value >= 1e3) return `${(value / 1e3).toFixed(1)}K`;
  return value.toString();
}
