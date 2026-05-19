# DN Overview

A rate, item enhance, and drop rate calculator for the Dragon Nest SEA MMO game.

**Live site:** https://wayansam.github.io/dn-overview

## Features

- Ancient equipment enhancement rates
- Bestie (companion) calculations
- Skill Jade planning
- Talisman enhancements
- Equipment drop rate analysis
- Trading house conversions
- VIP account calculations
- Dark mode support

## Tech Stack

- [React 18](https://react.dev/) + [TypeScript](https://www.typescriptlang.org/)
- [Vite](https://vitejs.dev/) — build tool and dev server
- [Ant Design 5](https://ant.design/) — UI component library
- [Redux Toolkit](https://redux-toolkit.js.org/) + [Redux Saga](https://redux-saga.js.org/) — state management
- [@ant-design/charts](https://charts.ant.design/) — data visualization

## Getting Started

```bash
# Install dependencies
bun install

# Start dev server (http://localhost:3000)
bun run dev

# Production build (outputs to dist/)
bun run build

# Preview production build locally
bun run preview
```

## Deployment

The app is deployed to GitHub Pages via the `gh-pages` branch.

```bash
bun run deploy
```

This runs `vite build` then publishes `dist/` to GitHub Pages.
