# Repository Guidelines

## Project Structure & Module Organization
- `app/` hosts Next.js App Router pages; the landing view (`app/page.tsx`) wires `ImageUploader`, while `app/[imageId]/page.tsx` renders shared canvases. Place API routes under `app/api/*` (e.g., `app/api/upload/route.ts` for Vercel Blob uploads).
- `components/` contains reusable UI such as `ImageUploader.tsx` and `CanvasDisplay.tsx`. Prefer colocating feature-specific hooks/utilities next to these components.
- `public/` stores static assets; `lib/` is reserved for future cross-cutting utilities; config files (Tailwind, ESLint, tsconfig) live at the repo root.

## Build, Test & Development Commands
- `bun install` (or `npm install`): install dependencies.
- `bun dev` / `npm run dev`: start the local server on http://localhost:3000 with hot reload.
- `bun run build` / `npm run build`: create the production build; fails fast on type or lint errors.
- `bun start` / `npm start`: run the compiled app locally.
- `bun run lint` / `npm run lint`: execute the ESLint configuration defined in `eslint.config.mjs`.

## Coding Style & Naming Conventions
- TypeScript strict mode is enforced; add explicit types for props, callbacks, and refs.
- React code should remain functional-component-only, with hooks at the top level and descriptive handler names (`handleUpload`, `renderCanvas`).
- Use PascalCase for components/files, camelCase for functions/variables, and Tailwind utility classes for styling (dark mode via `dark:` prefixes). Import shared paths through the `@/*` alias when possible.

## Testing Guidelines
- No automated tests exist yet; when adding them, prefer Playwright for end-to-end drops/downloads and Testing Library for component behavior. Name specs `*.spec.tsx` and colocate near the component.
- Until automated coverage lands, manually verify: (1) drag-and-drop upload, (2) canvas rendering accuracy, (3) download button output, and (4) `/api/upload` edge behavior with the Vercel Blob stub.

## Commit & Pull Request Guidelines
- Recent commits are terse (`works`, `aa`); move toward imperative, scoped messages such as `feat: add canvas zoom controls`. Keep the first line ≤72 chars, describe “what/why,” and group related changes.
- Pull requests should include: summary of UI/UX impact, screenshots or screen recordings for visual tweaks, test evidence (commands run), and linked issue IDs or task references before requesting review.

## Security & Configuration Tips
- Store any Vercel Blob credentials or API tokens via `vercel env` or local `.env` files ignored by git. Never hardcode secrets in components or API routes.
- When handling user files, always revoke object URLs after use and validate MIME types before invoking `put` from `@vercel/blob`.
