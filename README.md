# Project ZENTRIX

Project ZENTRIX is a learning platform for coding practice and project-based study.

This repository contains:

- `apps/web` for the user-facing web app
- `apps/api` for the backend API
- shared packages for UI, TypeScript, and linting setup

## Requirements

- Node.js 24 or newer
- pnpm 11

## Quick Start

```bash
pnpm install
pnpm dev
```

## Available Scripts

- `pnpm dev` starts the development environment
- `pnpm build` builds all apps and packages
- `pnpm lint` runs lint checks
- `pnpm format` formats the codebase
- `pnpm typecheck` runs TypeScript checks
- `pnpm test:e2e` runs the web end-to-end tests

## Project Status

ZENTRIX is under active development. The current focus is the core learning flow, account pages, and backend support for the platform.

## Notes

- The web app is built with Next.js.
- The API service is built with NestJS.
- Shared UI components live in `packages/ui`.
