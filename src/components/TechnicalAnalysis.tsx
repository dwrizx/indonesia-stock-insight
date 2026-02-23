import { useMemo } from "react";
import {
  LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip,
  ResponsiveContainer, ReferenceLine, Area, ComposedChart, Bar
} from "recharts";
import { generateChartData } from "@/data/stockData";
import { motion } from "framer-motion";

interface TechnicalAnalysisProps {
  basePrice: number;
  ticker: string;
}

// RSI calculation
function calculateRSI(prices: number[], period = 14): (number | null)[] {
  const rsi: (number | null)[] = [];
  for (let i = 0; i < prices.length; i++) {
    if (i < period) { rsi.push(null); continue; }
    let gains = 0, losses = 0;
    for (let j = i - period + 1; j <= i; j++) {
      const diff = prices[j] - prices[j - 1];
      if (diff >= 0) gains += diff;
      else losses -= diff;
    }
    const avgGain = gains / period;
    const avgLoss = losses / period;
    const rs = avgLoss === 0 ? 100 : avgGain / avgLoss;
    rsi.push(Math.round((100 - 100 / (1 + rs)) * 100) / 100);
  }
  return rsi;
}

// MACD calculation
function calculateEMA(prices: number[], period: number): number[] {
  const ema: number[] = [];
  const k = 2 / (period + 1);
  ema[0] = prices[0];
  for (let i = 1; i < prices.length; i++) {
    ema[i] = prices[i] * k + ema[i - 1] * (1 - k);
  }
  return ema;
}

function calculateMACD(prices: number[]) {
  const ema12 = calculateEMA(prices, 12);
  const ema26 = calculateEMA(prices, 26);
  const macdLine = ema12.map((v, i) => i >= 25 ? Math.round((v - ema26[i]) * 100) / 100 : null);
  const macdValues = macdLine.filter(v => v !== null) as number[];
  const signalFull = calculateEMA(macdValues, 9);
  const signal: (number | null)[] = new Array(macdLine.length).fill(null);
  let idx = 0;
  for (let i = 0; i < macdLine.length; i++) {
    if (macdLine[i] !== null) {
      signal[i] = idx < signalFull.length ? Math.round(signalFull[idx] * 100) / 100 : null;
      idx++;
    }
  }
  const histogram = macdLine.map((v, i) => v !== null && signal[i] !== null ? Math.round((v - signal[i]!) * 100) / 100 : null);
  return { macdLine, signal, histogram };
}

// Bollinger Bands
function calculateBollinger(prices: number[], period = 20, mult = 2) {
  const upper: (number | null)[] = [];
  const middle: (number | null)[] = [];
  const lower: (number | null)[] = [];
  for (let i = 0; i < prices.length; i++) {
    if (i < period - 1) { upper.push(null); middle.push(null); lower.push(null); continue; }
    const slice = prices.slice(i - period + 1, i + 1);
    const avg = slice.reduce((a, b) => a + b, 0) / period;
    const std = Math.sqrt(slice.reduce((a, b) => a + (b - avg) ** 2, 0) / period);
    middle.push(Math.round(avg));
    upper.push(Math.round(avg + mult * std));
    lower.push(Math.round(avg - mult * std));
  }
  return { upper, middle, lower };
}

const tooltipStyle = {
  backgroundColor: "hsl(222, 20%, 8%)",
  border: "1px solid hsl(222, 14%, 16%)",
  borderRadius: "12px",
  fontSize: "11px",
  boxShadow: "0 20px 40px rgba(0,0,0,0.5)",
  padding: "10px",
};

const TechnicalAnalysis = ({ basePrice, ticker }: TechnicalAnalysisProps) => {
  const data = useMemo(() => generateChartData(basePrice, 120), [basePrice]);
  const prices = data.map(d => d.price);

  const rsiValues = useMemo(() => calculateRSI(prices), [prices]);
  const macd = useMemo(() => calculateMACD(prices), [prices]);
  const bollinger = useMemo(() => calculateBollinger(prices), [prices]);

  const chartData = useMemo(() =>
    data.map((d, i) => ({
      date: d.date,
      price: d.price,
      rsi: rsiValues[i],
      macd: macd.macdLine[i],
      signal: macd.signal[i],
      histogram: macd.histogram[i],
      bbUpper: bollinger.upper[i],
      bbMiddle: bollinger.middle[i],
      bbLower: bollinger.lower[i],
    }))
  , [data, rsiValues, macd, bollinger]);

  const interval = Math.max(Math.floor(data.length / 6), 1);
  const lastRSI = rsiValues.filter(v => v !== null).pop() ?? 0;
  const lastMACD = macd.macdLine.filter(v => v !== null).pop() ?? 0;
  const rsiSignal = lastRSI > 70 ? "Overbought" : lastRSI < 30 ? "Oversold" : "Netral";
  const macdSignal = lastMACD > 0 ? "Bullish" : "Bearish";

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay: 0.3 }}
      className="space-y-4"
    >
      {/* Signal Summary */}
      <div className="grid grid-cols-3 gap-3">
        {[
          { label: "RSI (14)", value: lastRSI.toFixed(1), signal: rsiSignal, color: lastRSI > 70 ? "text-loss" : lastRSI < 30 ? "text-gain" : "text-primary" },
          { label: "MACD", value: lastMACD.toFixed(2), signal: macdSignal, color: lastMACD > 0 ? "text-gain" : "text-loss" },
          { label: "Bollinger", value: "20, 2", signal: prices[prices.length - 1] > (bollinger.upper[bollinger.upper.length - 1] ?? 0) ? "Di Atas" : prices[prices.length - 1] < (bollinger.lower[bollinger.lower.length - 1] ?? 0) ? "Di Bawah" : "Dalam Band", color: "text-primary" },
        ].map(item => (
          <div key={item.label} className="rounded-xl border border-border bg-card p-4 text-center">
            <p className="text-[9px] text-muted-foreground uppercase tracking-wider mb-1">{item.label}</p>
            <p className={`font-mono text-lg font-extrabold ${item.color}`}>{item.value}</p>
            <p className={`text-[10px] font-bold mt-1 ${item.color}`}>{item.signal}</p>
          </div>
        ))}
      </div>

      {/* Bollinger Bands Chart */}
      <div className="card-shine rounded-xl border border-border p-5">
        <h3 className="mb-4 text-xs font-bold text-muted-foreground uppercase tracking-wider">Bollinger Bands (20, 2)</h3>
        <ResponsiveContainer width="100%" height={250}>
          <ComposedChart data={chartData}>
            <defs>
              <linearGradient id={`bb-fill-${ticker}`} x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="hsl(200, 70%, 50%)" stopOpacity={0.08} />
                <stop offset="100%" stopColor="hsl(200, 70%, 50%)" stopOpacity={0.02} />
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" stroke="hsl(222, 14%, 12%)" vertical={false} />
            <XAxis dataKey="date" tick={{ fill: "hsl(215, 15%, 40%)", fontSize: 9 }} tickLine={false} axisLine={false} interval={interval} />
            <YAxis tick={{ fill: "hsl(215, 15%, 40%)", fontSize: 9 }} tickLine={false} axisLine={false} tickFormatter={v => `${(v / 1000).toFixed(1)}k`} width={42} />
            <Tooltip contentStyle={tooltipStyle} formatter={(v: number, name: string) => {
              const labels: Record<string, string> = { price: "Harga", bbUpper: "Upper", bbMiddle: "SMA(20)", bbLower: "Lower" };
              return [`Rp${v?.toLocaleString("id-ID") ?? "-"}`, labels[name] ?? name];
            }} />
            <Area type="monotone" dataKey="bbUpper" stroke="hsl(200, 70%, 50%)" strokeWidth={1} strokeDasharray="3 3" fill={`url(#bb-fill-${ticker})`} opacity={0.6} dot={false} />
            <Line type="monotone" dataKey="bbMiddle" stroke="hsl(200, 70%, 50%)" strokeWidth={1} dot={false} opacity={0.4} />
            <Line type="monotone" dataKey="bbLower" stroke="hsl(200, 70%, 50%)" strokeWidth={1} strokeDasharray="3 3" dot={false} opacity={0.6} />
            <Line type="monotone" dataKey="price" stroke="hsl(45, 93%, 58%)" strokeWidth={2} dot={false} />
          </ComposedChart>
        </ResponsiveContainer>
      </div>

      {/* RSI Chart */}
      <div className="card-shine rounded-xl border border-border p-5">
        <h3 className="mb-4 text-xs font-bold text-muted-foreground uppercase tracking-wider">RSI (14)</h3>
        <ResponsiveContainer width="100%" height={180}>
          <ComposedChart data={chartData}>
            <CartesianGrid strokeDasharray="3 3" stroke="hsl(222, 14%, 12%)" vertical={false} />
            <XAxis dataKey="date" tick={{ fill: "hsl(215, 15%, 40%)", fontSize: 9 }} tickLine={false} axisLine={false} interval={interval} />
            <YAxis domain={[0, 100]} tick={{ fill: "hsl(215, 15%, 40%)", fontSize: 9 }} tickLine={false} axisLine={false} ticks={[0, 30, 50, 70, 100]} width={30} />
            <Tooltip contentStyle={tooltipStyle} formatter={(v: number) => [v?.toFixed(1) ?? "-", "RSI"]} />
            <ReferenceLine y={70} stroke="hsl(0, 72%, 55%)" strokeDasharray="4 4" opacity={0.5} />
            <ReferenceLine y={30} stroke="hsl(152, 69%, 46%)" strokeDasharray="4 4" opacity={0.5} />
            <ReferenceLine y={50} stroke="hsl(215, 15%, 25%)" strokeDasharray="2 2" opacity={0.3} />
            <defs>
              <linearGradient id={`rsi-grad-${ticker}`} x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="hsl(280, 60%, 55%)" stopOpacity={0.3} />
                <stop offset="100%" stopColor="hsl(280, 60%, 55%)" stopOpacity={0} />
              </linearGradient>
            </defs>
            <Area type="monotone" dataKey="rsi" stroke="hsl(280, 60%, 55%)" strokeWidth={2} fill={`url(#rsi-grad-${ticker})`} dot={false} />
          </ComposedChart>
        </ResponsiveContainer>
        <div className="flex items-center justify-center gap-6 mt-3 text-[10px] text-muted-foreground">
          <div className="flex items-center gap-1.5">
            <div className="h-px w-4 bg-loss" />
            <span>Overbought (70)</span>
          </div>
          <div className="flex items-center gap-1.5">
            <div className="h-px w-4 bg-gain" />
            <span>Oversold (30)</span>
          </div>
        </div>
      </div>

      {/* MACD Chart */}
      <div className="card-shine rounded-xl border border-border p-5">
        <h3 className="mb-4 text-xs font-bold text-muted-foreground uppercase tracking-wider">MACD (12, 26, 9)</h3>
        <ResponsiveContainer width="100%" height={200}>
          <ComposedChart data={chartData}>
            <CartesianGrid strokeDasharray="3 3" stroke="hsl(222, 14%, 12%)" vertical={false} />
            <XAxis dataKey="date" tick={{ fill: "hsl(215, 15%, 40%)", fontSize: 9 }} tickLine={false} axisLine={false} interval={interval} />
            <YAxis tick={{ fill: "hsl(215, 15%, 40%)", fontSize: 9 }} tickLine={false} axisLine={false} width={42} />
            <Tooltip contentStyle={tooltipStyle} formatter={(v: number, name: string) => {
              const labels: Record<string, string> = { macd: "MACD", signal: "Signal", histogram: "Histogram" };
              return [v?.toFixed(2) ?? "-", labels[name] ?? name];
            }} />
            <ReferenceLine y={0} stroke="hsl(215, 15%, 25%)" strokeDasharray="2 2" opacity={0.4} />
            <Bar dataKey="histogram" fill="hsl(152, 69%, 46%)" opacity={0.4} radius={[2, 2, 0, 0]} />
            <Line type="monotone" dataKey="macd" stroke="hsl(45, 93%, 58%)" strokeWidth={2} dot={false} />
            <Line type="monotone" dataKey="signal" stroke="hsl(0, 72%, 55%)" strokeWidth={1.5} strokeDasharray="3 3" dot={false} />
          </ComposedChart>
        </ResponsiveContainer>
        <div className="flex items-center justify-center gap-6 mt-3 text-[10px] text-muted-foreground">
          <div className="flex items-center gap-1.5">
            <div className="h-0.5 w-4 rounded bg-primary" />
            <span>MACD</span>
          </div>
          <div className="flex items-center gap-1.5">
            <div className="h-0.5 w-4 rounded bg-loss" style={{ borderTop: "1px dashed" }} />
            <span>Signal</span>
          </div>
          <div className="flex items-center gap-1.5">
            <div className="h-2.5 w-3 rounded-sm bg-gain/40" />
            <span>Histogram</span>
          </div>
        </div>
      </div>
    </motion.div>
  );
};

export default TechnicalAnalysis;
