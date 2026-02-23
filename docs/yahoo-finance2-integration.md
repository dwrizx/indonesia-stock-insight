# Yahoo Finance2 Integration Notes

## Why This Uses a Sync Script (Not Direct Browser Calls)

`yahoo-finance2` is designed for server-side runtimes (Node/Bun), not browser bundles. In this repo, data is fetched by a Bun script and written to a local snapshot file consumed by the React app.

## Data Flow

1. Run `bun run data:sync:idx-tickers` to refresh IDX ticker universe into `data/idx-tickers.json`.
2. Run `bun run data:sync:yahoo` to fetch quotes for the full ticker universe and key indices.
3. Script writes `src/data/yahooSnapshot.ts`.
4. `src/data/stockData.ts` merges snapshot values into static fallback data.
5. Symbols that are not in static dummy data are added automatically as `sector: "Lainnya"` with safe default fundamentals.
6. If Yahoo data is missing/error, UI still uses static dummy values.

For one-shot sync, run: `bun run data:sync:all`.

## Data Contract Used

### Stock fields

- `name` <- `longName` / `shortName`
- `price` <- `regularMarketPrice`
- `change` <- `regularMarketChange`
- `changePercent` <- `regularMarketChangePercent`
- `volume` <- `regularMarketVolume`
- `marketCap` <- `marketCap`
- `open` <- `regularMarketOpen`
- `high` <- `regularMarketDayHigh`
- `low` <- `regularMarketDayLow`
- `prevClose` <- `regularMarketPreviousClose`

### Index fields

- `value` <- `regularMarketPrice`
- `change` <- `regularMarketChange`
- `changePercent` <- `regularMarketChangePercent`

## Dummy/Fallback Behavior

- `staticStocks` and `staticMarketIndices` in `stockData.ts` are the source of truth fallback.
- Snapshot data only overrides fields that are valid numbers.
- New live tickers are appended to `stocks` using generated defaults for missing fundamental fields.
- Failed symbols are recorded in `yahooSnapshot.failures`.

## MCP Exa Research Status

Attempted in this environment via MCP (`server: exa`), but startup handshake timed out. Integration was validated against the package behavior and runtime errors directly (`new YahooFinance()` requirement) during implementation and execution.
