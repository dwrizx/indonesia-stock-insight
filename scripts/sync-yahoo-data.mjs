import { readFile, writeFile } from "node:fs/promises";
import { resolve } from "node:path";
import YahooFinance from "yahoo-finance2";

const DEFAULT_STOCK_TICKERS = [
  "BBCA.JK",
  "BBRI.JK",
  "TLKM.JK",
  "ASII.JK",
  "UNVR.JK",
  "BMRI.JK",
  "GOTO.JK",
  "BRIS.JK",
  "ICBP.JK",
  "ACES.JK",
  "BBNI.JK",
  "INDF.JK",
  "EMTK.JK",
  "MAPI.JK",
];

const INDEX_SYMBOLS = [
  { name: "IHSG", symbol: "^JKSE" },
  { name: "LQ45", symbol: "^JKLQ45" },
  { name: "IDX30", symbol: "^JKIDX30" },
  { name: "JII", symbol: "^JKII" },
];

const BATCH_SIZE = 50;
const yahooFinance = new YahooFinance({ suppressNotices: ["yahooSurvey"] });

function asNumber(value) {
  return typeof value === "number" && Number.isFinite(value)
    ? value
    : undefined;
}

function asString(value) {
  return typeof value === "string" && value.trim() ? value.trim() : undefined;
}

async function loadTickers() {
  try {
    const file = resolve(process.cwd(), "data/idx-tickers.json");
    const raw = await readFile(file, "utf8");
    const parsed = JSON.parse(raw);
    if (!Array.isArray(parsed)) return DEFAULT_STOCK_TICKERS;

    const unique = [...new Set(parsed)]
      .filter((v) => typeof v === "string" && v.endsWith(".JK"))
      .sort();

    return unique.length > 0 ? unique : DEFAULT_STOCK_TICKERS;
  } catch {
    return DEFAULT_STOCK_TICKERS;
  }
}

function chunk(values, size) {
  const result = [];
  for (let i = 0; i < values.length; i += size) {
    result.push(values.slice(i, i + size));
  }
  return result;
}

async function fetchQuoteBatch(symbols) {
  try {
    const quotes = await yahooFinance.quote(symbols, { return: "array" });
    return { symbols, quotes };
  } catch (error) {
    return {
      symbols,
      error: error instanceof Error ? error.message : String(error),
    };
  }
}

function buildStockSnapshot(quote) {
  return {
    ticker: quote.symbol,
    name: asString(quote.longName) ?? asString(quote.shortName),
    exchange: asString(quote.fullExchangeName) ?? asString(quote.exchange),
    price: asNumber(quote.regularMarketPrice),
    change: asNumber(quote.regularMarketChange),
    changePercent: asNumber(quote.regularMarketChangePercent),
    volume: asNumber(quote.regularMarketVolume),
    marketCap: asNumber(quote.marketCap),
    high: asNumber(quote.regularMarketDayHigh),
    low: asNumber(quote.regularMarketDayLow),
    open: asNumber(quote.regularMarketOpen),
    prevClose: asNumber(quote.regularMarketPreviousClose),
  };
}

function buildIndexSnapshot(name, quote) {
  return {
    name,
    value: asNumber(quote.regularMarketPrice),
    change: asNumber(quote.regularMarketChange),
    changePercent: asNumber(quote.regularMarketChangePercent),
  };
}

function toSnapshotModule(snapshot) {
  return `export interface YahooStockSnapshot {\n  ticker: string;\n  name?: string;\n  exchange?: string;\n  price?: number;\n  change?: number;\n  changePercent?: number;\n  volume?: number;\n  marketCap?: number;\n  high?: number;\n  low?: number;\n  open?: number;\n  prevClose?: number;\n}\n\nexport interface YahooIndexSnapshot {\n  name: string;\n  value?: number;\n  change?: number;\n  changePercent?: number;\n}\n\nexport interface YahooSnapshot {\n  generatedAt: string;\n  source: string;\n  stockUniverseSize: number;\n  stocks: Record<string, YahooStockSnapshot>;\n  indices: Record<string, YahooIndexSnapshot>;\n  failures: string[];\n}\n\nexport const yahooSnapshot: YahooSnapshot = ${JSON.stringify(snapshot, null, 2)};\n`;
}

async function main() {
  const stockTickers = await loadTickers();
  const stockBatches = chunk(stockTickers, BATCH_SIZE);

  const stocks = {};
  const indices = {};
  const failures = [];

  for (const [index, symbols] of stockBatches.entries()) {
    const result = await fetchQuoteBatch(symbols);

    if (result.error || !result.quotes) {
      failures.push(
        `batch ${index + 1}/${stockBatches.length}: ${
          result.error ?? "No quotes returned"
        }`,
      );
      continue;
    }

    const seen = new Set(result.quotes.map((q) => q.symbol));
    for (const quote of result.quotes) {
      if (!quote?.symbol || !quote.symbol.endsWith(".JK")) continue;
      stocks[quote.symbol] = buildStockSnapshot(quote);
    }

    for (const symbol of symbols) {
      if (!seen.has(symbol)) {
        failures.push(`${symbol}: No quote returned by Yahoo`);
      }
    }
  }

  const indexResults = await Promise.all(
    INDEX_SYMBOLS.map(async (item) => {
      try {
        const quote = await yahooFinance.quote(item.symbol);
        return { ...item, quote };
      } catch (error) {
        return {
          ...item,
          error: error instanceof Error ? error.message : String(error),
        };
      }
    }),
  );

  for (const result of indexResults) {
    if (result.error || !result.quote) {
      failures.push(
        `${result.symbol}: ${result.error ?? "No quote returned by Yahoo"}`,
      );
      continue;
    }

    indices[result.name] = buildIndexSnapshot(result.name, result.quote);
  }

  const snapshot = {
    generatedAt: new Date().toISOString(),
    source: "yahoo-finance2",
    stockUniverseSize: stockTickers.length,
    stocks,
    indices,
    failures,
  };

  const outFile = resolve(process.cwd(), "src/data/yahooSnapshot.ts");
  await writeFile(outFile, toSnapshotModule(snapshot), "utf8");

  console.log(`Snapshot written to ${outFile}`);
  console.log(
    `Stocks synced: ${Object.keys(stocks).length}/${stockTickers.length}, indices: ${Object.keys(indices).length}/${INDEX_SYMBOLS.length}`,
  );
  if (failures.length > 0) {
    console.log(`Failures: ${failures.length}`);
  }
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
