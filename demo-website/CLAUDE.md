# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

This is the interactive demo website for the Suds CLI monorepo. It showcases terminal UI components (Spinner, Progress, List) running in a browser via xterm.js. The site is deployed to GitHub Pages at `/suds-cli/`.

## Commands

```bash
pnpm dev         # Start Vite dev server on port 3000
pnpm build       # TypeScript compile + Vite production build
pnpm preview     # Preview production build locally
```

From the monorepo root (`/Users/mnorth/agentrc/suds-cli/`):
```bash
pnpm build       # Build all packages (required before demo-website build)
pnpm check       # Run all linting and type checks
pnpm test        # Run all tests
```

## Architecture

### Elm Architecture Pattern

All demos implement the Elm Architecture from `@suds-cli/tea`:

```typescript
class DemoModel implements Model<Msg, DemoModel> {
  init(): Cmd<Msg>                              // Initial command (e.g., start tick)
  update(msg: Msg): [DemoModel, Cmd<Msg>]       // State transitions
  view(): string                                // Render to ANSI string
}
```

### Browser Platform Abstraction

The `@suds-cli/machine` package provides platform-agnostic APIs. For browser usage:

1. **`browser-style.ts`** - Sets up color support globally via `setDefaultContext()` before any component imports
2. **`createBrowserPlatform({ terminal })`** - Creates a platform adapter that bridges xterm.js to Suds components

This pattern is critical: import `browser-style.ts` before any Suds component imports to ensure all `Style` instances use browser colors.

### Demo Structure

Each demo in `src/demos/` follows this pattern:
- Define keybindings with `@suds-cli/key`
- Create styles with `createStyle()` from `browser-style.ts`
- Implement a `Model` class with `init`, `update`, `view`
- Export a `createXxxDemo(terminal: Terminal): { stop: () => void }` factory

### Key Dependencies

| Package | Purpose |
|---------|---------|
| `@suds-cli/tea` | Elm Architecture runtime (Program, KeyMsg, quit, Cmd) |
| `@suds-cli/chapstick` | ANSI styling (Style, StyleContext) |
| `@suds-cli/machine` | Platform abstraction (createBrowserPlatform, ColorSupport) |
| `@suds-cli/key` | Key binding utilities (newBinding, matches) |
| `@xterm/xterm` | Terminal emulator |

## Monorepo Context

This package depends on workspace packages that must be built first:
```bash
# From monorepo root
pnpm build  # Builds all packages including dependencies
```

The demo-website is excluded from `pnpm test` and linting tasks in the monorepo as it's a demo application, not a library.
