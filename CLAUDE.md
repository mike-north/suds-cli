# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

Boba CLI is a TypeScript TUI (Terminal User Interface) component library and framework. It's a TypeScript port of Go libraries from the Charm ecosystem (Bubble Tea, Bubbles, Lip Gloss). The main API is a declarative DSL builder (`@boba-cli/dsl`), with a low-level Elm Architecture API available for advanced use cases.

## Common Commands

```bash
# Install dependencies
pnpm install

# Build all packages
pnpm build

# Run all tests
pnpm test

# Run a single package's tests
pnpm --filter @boba-cli/list test

# Run tests in watch mode (in a package directory)
cd packages/list && pnpm vitest

# Lint and type-check all packages
pnpm check

# Auto-fix lint and formatting issues
pnpm fix

# Run an example
pnpm demo                              # Default (progress)
pnpm -C examples ex:spinner            # Animated spinner (DSL)
pnpm -C examples ex:list               # Interactive list
pnpm -C examples ex:textarea           # Multi-line text editor
pnpm -C examples ex:table              # Tabular data
pnpm -C examples ex:filetree           # File tree browser
pnpm -C examples ex:spinner-low-level  # Spinner using low-level TEA API

# Generate/update API reports after changing public API
pnpm generate:api-report

# Create a changeset for versioning
pnpm changeset
```

## Architecture

### Package Hierarchy

```
Core Layer (no internal deps):
  @boba-cli/machine   → Platform abstraction (Node/Browser)
  @boba-cli/core      → Shared utilities
  @boba-cli/key       → Keybinding definitions
  @boba-cli/runeutil  → Text/grapheme handling

Framework Layer:
  @boba-cli/dsl       → Declarative builder API (main API)
  @boba-cli/tea       → Runtime engine (low-level Elm Architecture)
  @boba-cli/chapstick → Terminal styling (colors, borders, padding)

Component Layer (basic):
  @boba-cli/spinner, progress, textinput, textarea, viewport, paginator,
  timer, stopwatch, cursor, icons

Component Layer (composite - depend on basic components):
  @boba-cli/table, list, help, filepicker, filetree, markdown, code, statusbar

Examples (private, not published):
  @boba-cli/examples → Interactive demos of all components
```

### DSL Builder (Main API)

`@boba-cli/dsl` provides a declarative builder API for creating TUI applications:

```typescript
import { createApp, spinner, text, vstack } from '@boba-cli/dsl'

const app = createApp()
  .state({ loading: true })
  .component('spin', spinner())
  .onKey('q', ({ quit }) => quit())
  .view(({ state, components }) =>
    vstack(text('Loading...'), components.spin)
  )
  .build()

await app.run()
```

### Low-Level Elm Architecture

For advanced use cases requiring fine-grained control, use `@boba-cli/tea` directly:

```typescript
class MyModel implements Model<Msg, MyModel> {
  init(): Cmd<Msg> { }                         // Initial command (side effects)
  update(msg: Msg): [MyModel, Cmd<Msg>] { }    // Handle messages, return new state
  view(): string { }                           // Render state to string
}
```

Key concepts:
- **Msg** - Tagged union messages with `_tag` discriminator
- **Cmd** - Async side effects that produce messages (or `null` for no-op)
- **Model** - Immutable state; `update()` returns a new instance

### Platform Abstraction (`@boba-cli/machine`)

All Node.js-specific code must go through `@boba-cli/machine`. ESLint enforces this - direct imports of `fs`, `path`, `os`, `process`, `child_process`, etc. are blocked in package source (except in `machine` itself). This enables browser compatibility.

## Build & Tooling

- **Bundler**: tsup (ESM + CJS dual output)
- **Test Framework**: Vitest (runtime tests), tsd (type tests in `test-d/`)
- **API Documentation**: API Extractor generates `.api.md` reports in `api-reports/`
- **Linting**: ESLint with strict-type-checked preset
- **Formatting**: Prettier
- **Monorepo**: Nx for task orchestration (caching, dependency graph)

### API Extractor

Every exported symbol must have a release tag (`@public`, `@beta`, `@alpha`, `@internal`). After changing a package's public API:

```bash
pnpm --filter @boba-cli/<package> generate:api-report
```

This updates `api-reports/<package>.api.md`. Commit the updated report.

### Changesets

When making changes that should be released, create a changeset:

```bash
pnpm changeset
```

Select affected packages and describe the change. Changesets are used for versioning and changelog generation.

<!-- nx configuration start-->
<!-- Leave the start & end comments to automatically receive updates. -->

## Nx Configuration

- Always run tasks through `nx` (via npm scripts) rather than underlying tools directly
- Use `nx_workspace` MCP tool to understand workspace architecture
- Use `nx_project_details` MCP tool for individual project details
- Use `nx_docs` MCP tool for Nx configuration questions

<!-- nx configuration end-->
