# Dragon Nest Overview — Project Guide

## Project Overview

**DN Overview** is a comprehensive rate, item enhance, and drop rate calculator for the Dragon Nest MMO game. It provides players with detailed calculations and analysis tools for:
- Ancient equipment enhancement rates
- Bestie (companion) calculations
- Skill Jade planning
- Talisman enhancements
- Equipment drop rate analysis
- Trading house conversions
- And more specialized game mechanics

**Live site**: https://wayansam.github.io/dn-overview

---

## Tech Stack

### Current (CRA)
- **Framework**: React 18.2.0 + TypeScript
- **Build Tool**: Create React App (`react-scripts` 5.0.1)
- **State Management**: Redux Toolkit + Redux Saga
- **UI Library**: Ant Design 5.x
- **Charts**: @ant-design/charts 2.x
- **Package Manager**: npm
- **Deployment**: GitHub Pages via `gh-pages`

### Migration Target (Vite)
- **Build Tool**: Vite + `@vitejs/plugin-react`
- **Test Runner**: Vitest (replaces Jest/CRA test runner)
- **Everything else**: unchanged

---

## Project Structure

```
src/
├── components/          # Reusable UI components
│   ├── ChartsCard.tsx
│   ├── CustomSlider.tsx
│   ├── EquipmentTable.tsx
│   ├── ListingCard.tsx
│   ├── ReleaseNotes.tsx
│   ├── SkillJadeCalcComp.tsx
│   └── TradingHouseCalc.tsx
├── screen/
│   ├── content/         # One file per calculator screen
│   │   ├── AncientEqContent.tsx
│   │   ├── BestieContent.tsx
│   │   ├── SkillJadeContent.tsx
│   │   ├── VIPAccContent.tsx
│   │   └── ... (20+ content files)
│   ├── MainPage.tsx     # Root layout (Header/Sider/Content/Footer)
│   └── SideBar.tsx      # Navigation sidebar
├── data/                # Static game data
├── interface/           # TypeScript interfaces
├── constants/           # App constants, color schemes, sidebar items
├── utils/               # Utility/calculation helpers
├── store.tsx            # Redux store configuration
├── slice/               # Redux reducers (UIState, etc.)
├── sagas/               # Redux Saga side effects
├── App.tsx              # Root — wraps MainPage in Redux Provider
└── index.tsx            # Entry point (ReactDOM.createRoot)
```

---

## CRA → Vite Migration Plan

### Why Migrate?
Vite gives instant HMR, much faster builds, and better aligns with the current React ecosystem. `react-scripts` is effectively unmaintained.

### Key Differences

| Aspect | CRA | Vite |
|---|---|---|
| Entry point | `public/index.html` references bundle | `index.html` at root, `<script type="module" src="/src/index.tsx">` |
| Env vars | `REACT_APP_*` | `VITE_*` |
| Build output | `build/` | `dist/` |
| Deploy script | `gh-pages -d build` | `gh-pages -d dist` |
| Dev server | port 3000 | port 5173 |
| Test runner | Jest (via react-scripts) | Vitest |

### Migration Steps

#### Phase 1 — Scaffold Vite config
- [ ] Install `vite`, `@vitejs/plugin-react`
- [ ] Remove `react-scripts`, `@testing-library/jest-dom` (jest-based)
- [ ] Create `vite.config.ts` with React plugin and `base: '/dn-overview/'`
- [ ] Create `index.html` at repo root
- [ ] Create `tsconfig.node.json` for Vite config file itself
- [ ] Update `tsconfig.json` target from `es5` to `ES2020`
- [ ] Replace `src/react-app-env.d.ts` with `src/vite-env.d.ts`

#### Phase 2 — Update package.json scripts
```json
"scripts": {
  "dev": "vite",
  "build": "tsc -b && vite build",
  "preview": "vite preview",
  "predeploy": "npm run build",
  "deploy": "gh-pages -d dist",
  "test": "vitest"
}
```

#### Phase 3 — Code fixes
- Replace any `process.env.REACT_APP_*` with `import.meta.env.VITE_*`
- Remove CRA global type augmentations (`NodeJS.ProcessEnv`)
- Ensure all SVG imports are compatible (Vite treats SVGs as URLs by default; use `?react` suffix for component imports, or add `vite-plugin-svgr`)

#### Phase 4 — Testing migration
- Install `vitest`, `@vitest/ui`, `jsdom`, `@testing-library/react`
- Add `test` config block to `vite.config.ts`
- Update test file imports if needed

#### Phase 5 — Deploy verification
- Confirm `base: '/dn-overview/'` in `vite.config.ts`
- Run `npm run build` → check `dist/` output
- Run `npm run deploy` → verify GitHub Pages

### Known Gotchas
1. **SVG logo**: `src/logo.svg` is imported as a React component in some CRA setups — check `App.tsx` or anywhere SVG is imported as a component; may need `vite-plugin-svgr`.
2. **`reportWebVitals.ts`**: CRA-specific, can be deleted.
3. **`setupTests.ts`**: Needs to be referenced in `vitest.config` or `vite.config` `test.setupFiles`.
4. **GitHub Pages base path**: Without `base: '/dn-overview/'`, assets 404 on the Pages subdomain.

---

## UI/UX Improvement Goals

### Current Issues
- Inline styles scattered across components (hard to maintain)
- No design tokens beyond what Ant Design provides
- Sidebar navigation uses plain buttons with no active indicator beyond `type="primary"`
- Header only shows the current screen name — no branding
- Footer is minimal

### Phase 1 — Visual Polish
- [ ] Establish a color palette aligned with Dragon Nest branding (dark blue/gold tones)
- [ ] Add a logo/brand mark to the sidebar header
- [ ] Improve typography hierarchy (consistent heading sizes)
- [ ] Add a visible active state for sidebar items (left accent bar)
- [ ] Consistent card spacing across all content screens

### Phase 2 — Component Cleanup
- [ ] Extract all inline `style={{}}` into Ant Design `token`-based or CSS module styles
- [ ] Standardize calculator input form layouts (label alignment, input widths)
- [ ] Improve chart cards: add titles, tooltips, and empty states
- [ ] Make `EquipmentTable` sortable and filterable

### Phase 3 — Responsive & Accessibility
- [ ] Verify sidebar collapse behavior on mobile (xs breakpoint)
- [ ] Add `aria-label` to icon-only controls
- [ ] Keyboard navigation through the sidebar item list
- [ ] Test dark mode on every screen

### Phase 4 — Performance
- [ ] Lazy-load heavy content screens (React.lazy + Suspense)
- [ ] Memoize expensive selectors in Redux slices with `reselect`
- [ ] Optimize chart re-renders

---

## Development Guidelines

### Running the App
```bash
npm start          # CRA dev server (current)
# After migration:
npm run dev        # Vite dev server (port 5173)
npm run build      # Production build
npm run preview    # Preview production build locally
```

### State Management Pattern
- **Redux slice** (`src/slice/`) — synchronous state (UI flags, selected screen, settings)
- **Redux Saga** (`src/sagas/`) — async side effects (data fetching)
- **Local state** — component-level ephemeral state only

### Adding a New Calculator Screen
1. Create `src/screen/content/MyNewContent.tsx`
2. Add an entry to the sidebar config in `src/constants/Common.constants.ts` (TAB_GROUP_LIST)
3. Wire it into `src/screen/content/MainContent.tsx`
4. Add any required data to `src/data/`

### Code Style
- TypeScript strict mode — no `any` unless unavoidable
- Functional components + hooks only (no class components)
- Ant Design components for all UI; avoid raw HTML elements for interactive controls
- No inline styles for anything that repeats — use Ant Design `token` or a CSS module

---

## Deployment

```bash
npm run deploy    # builds and pushes to gh-pages branch
```

Homepage is served from `https://wayansam.github.io/dn-overview`. The `homepage` field in `package.json` and Vite's `base` config must match this path.

---

## Dependencies Reference

| Package | Purpose | Keep? |
|---|---|---|
| `antd` | UI component library | Yes |
| `@ant-design/charts` | Chart components | Yes |
| `@reduxjs/toolkit` | Redux state management | Yes |
| `redux-saga` | Async side effects | Yes |
| `axios` | HTTP client | Yes |
| `react-scripts` | CRA build toolchain | **Remove** (replace with Vite) |
| `gh-pages` | GitHub Pages deploy | Yes |
| `redux-logger` | Dev-only Redux logging | Yes (devDependency) |
