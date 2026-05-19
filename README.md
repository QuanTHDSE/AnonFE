# EXE101 Frontend

React + Vite frontend for EXE101. The original design is available in Figma.

## Requirements

- Node.js 18 or newer
- npm

## Project layout

```text
src/
  app/        router, root layout, route guards
  features/   feature-owned pages and UI
  mocks/      local mock data used by development services
  services/   mock service layer that can be swapped for real APIs
  shared/     shared components and UI primitives
  styles/     global Tailwind and theme styles
  types/      shared domain types
```

## Scripts

```bash
npm install
npm run dev
npm run typecheck
npm run lint
npm run test
npm run build
npm run preview
npm run check
```

`npm run dev` starts the local development server. `npm run build` type-checks the project before creating the production bundle.
`npm run check` runs typecheck, lint, tests, and the production build in one command.

## Mock auth

The current app uses a local mock auth service while backend APIs are not connected yet.
Use `example@gmail.com` with password `12345678` to sign in during development.

## CI/CD

GitHub Actions runs formatting, typecheck, lint, tests, and build on pushes and pull requests to `main`.
Vercel is connected to the GitHub repository for production deployment from `main`.
