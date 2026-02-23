# Repository Guidelines

## Project Structure & Module Organization

- `src/` contains all application code.
- `src/components/` holds feature and UI components; `src/components/ui/` is the shared shadcn/ui layer.
- `src/pages/` defines route-level screens (`Index.tsx`, `StockDetail.tsx`, `NotFound.tsx`).
- `src/data/stockData.ts` is the central in-repo market dataset and helper utilities.
- `src/test/` contains Vitest tests and setup (`setup.ts`, `example.test.ts`).
- `public/` stores static assets (favicon, robots, social preview image).
- Root config files: `vite.config.ts`, `tailwind.config.ts`, `eslint.config.js`, `vitest.config.ts`, `tsconfig*.json`.

## Build, Test, and Development Commands

- `bun install`: install dependencies.
- `bun run dev`: start Vite dev server.
- `bun run build`: production build to `dist/`.
- `bun run preview`: preview built app locally.
- `bun run test`: run test suite once.
- `bun run test:watch`: watch mode for tests.
- `bun run typecheck`: fast TypeScript check with `tsgo`.
- `bun run lint`: run Oxlint.
- `bun run fmt` / `bun run fmt:check`: format or check formatting with Oxfmt.
- `bun run check`: full quality gate (`typecheck + lint + format check`).

## Coding Style & Naming Conventions

- Language stack: TypeScript + React (function components).
- Follow Oxfmt output; do not hand-format style-sensitive files.
- Use path alias `@/` for imports from `src/`.
- Components/pages/hooks use PascalCase for components and camelCase for hooks/utilities.
- Keep files focused: UI primitives in `src/components/ui`, domain features elsewhere.

## Testing Guidelines

- Framework: Vitest + Testing Library (`jsdom` environment).
- Place tests in `src/test` or alongside modules as `*.test.ts`/`*.test.tsx`.
- Prefer behavior-oriented assertions over implementation details.
- Run `bun run test` and `bun run check` before opening a PR.

## Commit & Pull Request Guidelines

- Existing history contains many generic messages (`Changes`, `Update ...`); prefer clearer commits.
- Use imperative, scoped commit subjects, e.g. `feat(stock): add sector heatmap filter`.
- Keep PRs focused and include:
  - what changed and why,
  - screenshots for UI changes,
  - verification notes (`bun run check`, `bun run test`),
  - linked issue/task if available.
