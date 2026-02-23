import { readFile, writeFile } from "node:fs/promises";
import { resolve } from "node:path";
import YahooFinance from "yahoo-finance2";

const yahooFinance = new YahooFinance({ suppressNotices: ["yahooSurvey"] });
const CONCURRENCY = 6;

function asText(value) {
  return typeof value === "string" && value.trim() ? value.trim() : undefined;
}

function normalizeSectorName(raw) {
  const text = (raw ?? "").trim().toLowerCase();
  if (!text) return "Lainnya";

  if (text.includes("energy")) return "Energi";
  if (text.includes("basic material")) return "Bahan Baku";
  if (text.includes("industrial")) return "Perindustrian";
  if (text.includes("consumer defensive")) return "Konsumen Primer";
  if (text.includes("consumer cyclical")) return "Konsumen Non-Primer";
  if (text.includes("healthcare")) return "Kesehatan";
  if (text.includes("financial")) return "Keuangan";
  if (text.includes("real estate")) return "Properti & Real Estat";
  if (text.includes("technology")) return "Teknologi";
  if (text.includes("communication")) return "Infrastruktur";
  if (text.includes("utility")) return "Utilitas";
  if (text.includes("transportation")) return "Transportasi & Logistik";
  if (text.includes("logistic")) return "Transportasi & Logistik";
  return "Lainnya";
}

async function loadTickers() {
  const file = resolve(process.cwd(), "data/idx-tickers.json");
  const raw = await readFile(file, "utf8");
  const parsed = JSON.parse(raw);
  if (!Array.isArray(parsed)) return [];
  return [...new Set(parsed)]
    .filter((v) => typeof v === "string" && v.endsWith(".JK"))
    .sort();
}

async function pool(items, worker, size = CONCURRENCY) {
  const queue = [...items];
  const running = [];
  const run = async () => {
    while (queue.length > 0) {
      const item = queue.shift();
      if (!item) break;
      await worker(item);
    }
  };
  for (let i = 0; i < size; i += 1) running.push(run());
  await Promise.all(running);
}

function toModule(map) {
  return `export const idxSectorByTicker: Record<string, string> = ${JSON.stringify(
    map,
    null,
    2,
  )};\n`;
}

async function main() {
  const tickers = await loadTickers();
  const entries = {};
  const failures = [];
  let done = 0;

  await pool(tickers, async (ticker) => {
    try {
      const summary = await yahooFinance.quoteSummary(ticker, {
        modules: ["summaryProfile"],
      });
      const profile = summary?.summaryProfile;
      entries[ticker] = normalizeSectorName(
        asText(profile?.sectorDisp) ??
          asText(profile?.sector) ??
          asText(profile?.industryDisp) ??
          asText(profile?.industry),
      );
    } catch (error) {
      failures.push(
        `${ticker}: ${error instanceof Error ? error.message : String(error)}`,
      );
    } finally {
      done += 1;
      if (done % 25 === 0 || done === tickers.length) {
        console.log(`progress ${done}/${tickers.length}`);
      }
    }
  });

  const outFile = resolve(process.cwd(), "src/data/idxSectorByTicker.ts");
  await writeFile(outFile, toModule(entries));
  console.log(`Sector map written to ${outFile}`);
  console.log(
    `Sectors synced: ${Object.keys(entries).length}/${tickers.length}, failures: ${failures.length}`,
  );
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
