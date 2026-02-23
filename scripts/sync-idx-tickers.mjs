import { writeFile } from "node:fs/promises";
import { resolve } from "node:path";

const SOURCE_URL = "https://stockanalysis.com/list/indonesia-stock-exchange/";

async function main() {
  const response = await fetch(SOURCE_URL, {
    headers: {
      "user-agent":
        "Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/122.0.0.0 Safari/537.36",
    },
  });

  if (!response.ok) {
    throw new Error(`Failed to fetch ticker source: ${response.status}`);
  }

  const html = await response.text();
  const matches = [...html.matchAll(/>([A-Z]{3,5})<\/a>/g)].map((m) => m[1]);

  const tickers = [...new Set(matches)]
    .filter((symbol) => symbol.length >= 3 && symbol.length <= 5)
    .map((symbol) => `${symbol}.JK`)
    .sort();

  if (tickers.length < 100) {
    throw new Error(
      `Ticker extraction looks too small (${tickers.length}). Source page may have changed.`,
    );
  }

  const outFile = resolve(process.cwd(), "data/idx-tickers.json");
  await writeFile(outFile, `${JSON.stringify(tickers, null, 2)}\n`, "utf8");

  console.log(`Saved ${tickers.length} IDX tickers to ${outFile}`);
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
