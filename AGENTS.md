# AGENTS.md

## Project Overview
- Vite + React + TypeScript marketing/site build for `Dev Cell Club`.
- Main app code lives in `src/`.
- Static assets live in `public/` and `finalphotos/`.

## Useful Commands
- `npm run dev` starts the local Vite dev server.
- `npm run build` runs TypeScript build checks and produces the production bundle.
- `npm run typecheck` runs TypeScript without creating a bundle.
- `npm run prepare:cockpit` prepares the cockpit image sequence assets.

## App Structure
- `src/App.tsx` owns the lightweight custom router, title updates, and route switching.
- `src/pages/` contains page-level screens such as `HomePage.tsx`, `CommunityPage.tsx`, and others.
- `src/pages/homeData.ts` stores homepage content arrays.
- `src/components/cinematic-hero/` contains the cockpit-style hero and navbar pieces.
- `src/components/ui/` contains shared UI and motion components.
- `src/hooks/` contains reusable React hooks.

## Conventions
- Keep the homepage hero cinematic, but use more natural student-facing copy outside the hero unless asked otherwise.
- Prefer editing page content in `src/pages/*` and shared display data in `src/pages/homeData.ts`.
- Keep `App.tsx` focused on routing concerns rather than page markup.
- Reuse existing UI components before adding new one-off patterns.

## Verification
- Run `npm run build` after meaningful UI or routing changes.
- If changing navigation, verify pathname-based title updates still make sense for every route.
