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
  },
  {
    ticker: "BBRI.JK", name: "Bank Rakyat Indonesia", sector: "Keuangan",
    price: 5425, change: -75, changePercent: -1.36, volume: 89450000,
    marketCap: 820000000000000, pe: 14.2, pbv: 2.6, dividendYield: 3.8,
    high52w: 6100, low52w: 4200, open: 5500, high: 5525, low: 5400, prevClose: 5500,
  },
  {
    ticker: "TLKM.JK", name: "Telkom Indonesia", sector: "Telekomunikasi",
    price: 3940, change: 60, changePercent: 1.55, volume: 62100000,
    marketCap: 390000000000000, pe: 16.8, pbv: 3.1, dividendYield: 4.2,
    high52w: 4300, low52w: 3100, open: 3880, high: 3960, low: 3870, prevClose: 3880,
  },
  {
    ticker: "ASII.JK", name: "Astra International", sector: "Industri",
    price: 5150, change: -25, changePercent: -0.48, volume: 23400000,
    marketCap: 208000000000000, pe: 7.5, pbv: 1.2, dividendYield: 6.1,
    high52w: 5800, low52w: 4150, open: 5175, high: 5200, low: 5100, prevClose: 5175,
  },
  {
    ticker: "UNVR.JK", name: "Unilever Indonesia", sector: "Konsumsi",
    price: 3280, change: 80, changePercent: 2.50, volume: 12800000,
    marketCap: 125000000000000, pe: 32.1, pbv: 28.5, dividendYield: 2.8,
    high52w: 4200, low52w: 2800, open: 3200, high: 3300, low: 3190, prevClose: 3200,
  },
  {
    ticker: "BMRI.JK", name: "Bank Mandiri", sector: "Keuangan",
    price: 6350, change: 100, changePercent: 1.60, volume: 34500000,
    marketCap: 593000000000000, pe: 11.8, pbv: 2.1, dividendYield: 4.5,
    high52w: 7200, low52w: 5100, open: 6250, high: 6375, low: 6225, prevClose: 6250,
  },
  {
    ticker: "GOTO.JK", name: "GoTo Gojek Tokopedia", sector: "Teknologi",
    price: 76, change: 3, changePercent: 4.11, volume: 2340000000,
    marketCap: 89000000000000, pe: -12.5, pbv: 1.8, dividendYield: 0,
    high52w: 108, low52w: 52, open: 73, high: 78, low: 72, prevClose: 73,
  },
  {
    ticker: "BRIS.JK", name: "Bank Syariah Indonesia", sector: "Keuangan",
    price: 2650, change: -30, changePercent: -1.12, volume: 18900000,
    marketCap: 120000000000000, pe: 19.2, pbv: 3.4, dividendYield: 1.0,
    high52w: 3100, low52w: 1900, open: 2680, high: 2700, low: 2630, prevClose: 2680,
  },
  {
    ticker: "ICBP.JK", name: "Indofood CBP Sukses", sector: "Konsumsi",
    price: 11475, change: 175, changePercent: 1.55, volume: 5600000,
    marketCap: 134000000000000, pe: 21.3, pbv: 4.2, dividendYield: 2.1,
    high52w: 12500, low52w: 9800, open: 11300, high: 11500, low: 11275, prevClose: 11300,
  },
  {
    ticker: "ACES.JK", name: "Ace Hardware Indonesia", sector: "Ritel",
    price: 745, change: -10, changePercent: -1.32, volume: 15200000,
    marketCap: 12800000000000, pe: 22.5, pbv: 3.8, dividendYield: 2.5,
    high52w: 900, low52w: 600, open: 755, high: 760, low: 740, prevClose: 755,
  },
];

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
