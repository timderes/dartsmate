# Copilot Instructions for DartsMate

## Project Overview

- DartsMate is a cross-platform desktop app for tracking and analyzing dart games, built with Nextron (Electron + Next.js) and Mantine for UI.
- The codebase is organized into two main areas:
  - `main/`: Electron main process (app lifecycle, window management, IPC)
  - `renderer/`: Next.js React frontend (UI, pages, components, hooks, lib)

## Key Workflows

- **Development:**
  - Use `npm run dev` to start the local development server (hot reloads both Electron and Next.js).
- **Builds:**
  - Use `npm run build:all` for production builds across platforms.
  - Platform-specific builds: `npm run build:win32`, `npm run build:win64`, `npm run build:mac`, `npm run build:linux`.
- **Linting & Formatting:**
  - Run `npm run lint` and `npm run lint:fix` for code quality.
  - Use `npm run format` to auto-format codebase.
- **Testing:**
  - Use `npm run test` (Vitest config in `vitest.config.js`).

## Architecture & Patterns

- **IPC Communication:**
  - Electron IPC is handled in `main/helpers/ipc.ts` and `renderer/utils/ipc/send.ts`.
  - Use IPC for cross-process communication (e.g., database access, system info).
- **Data Storage:**
  - Local database logic in `renderer/lib/db/` (profiles, matches, misc).
- **Internationalization:**
  - Multi-language support via Next.js i18n config (`next-i18next.config.js`).
  - Locale files in `public/locales/`.
- **Component Structure:**
  - UI components in `renderer/components/`.
  - Layouts in `renderer/layouts/`.
- **Type Safety:**
  - Shared types in `renderer/types/`.
- **UI Framework:**
  - Mantine packages used: `@mantine/core`, `@mantine/hooks`, `@mantine/dates`, `@mantine/notifications`.
  - Use Mantine for UI components and styling.

## Conventions & Tips

- Prefer TypeScript for new code.
- Use hooks from `renderer/hooks/` for profile and form logic.
- Follow Next.js page conventions in `renderer/pages/` (dynamic routes for locales).
- Use Mantine for UI components and styling.
- Reference `README.md` for up-to-date scripts and project status.

## Integration Points

- Electron main/renderer process boundary (IPC).
- Next.js routing and i18n.
- Local database for match/profile data.

## Examples

- IPC usage: see `main/helpers/ipc.ts` and `renderer/utils/ipc/send.ts`.
- Adding a profile: see `renderer/lib/db/profiles/addProfile.ts`.
- Creating a match: see `renderer/lib/db/matches/addMatch.ts`.

---

For questions about unclear conventions or missing documentation, ask for feedback or clarification from maintainers.
