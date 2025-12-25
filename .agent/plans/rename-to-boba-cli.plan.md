# Comprehensive Rename Plan: suds-cli → boba-cli

## Overview

Rename the entire project from `suds-cli` (scoped packages `@suds-cli/*`) to `boba-cli` (scoped packages `@boba-cli/*`), plus create a new `boba-cli` rollup package.

## Scope Analysis

Based on comprehensive search, there are **2719 occurrences** of "suds-cli" across **1661 files**.

### Categories of Changes

---

## 1. Root Configuration Files

### 1.1 Root `package.json`
- Change `name` from `"suds-workspace"` → `"boba-workspace"`
- Update script references: `--exclude suds-workspace` → `--exclude boba-workspace`
- Update filter: `@suds-cli/examples` → `@boba-cli/examples`

### 1.2 `.syncpackrc.json`
- Change `"@suds-cli/**"` → `"@boba-cli/**"`

### 1.3 `.changeset/config.json`
- Change repo from `"mike-north/suds-cli"` → `"mike-north/boba-cli"` (if applicable)

### 1.4 `.changeset/pre.json`
- Update all package names from `@suds-cli/*` → `@boba-cli/*`

### 1.5 All `.changeset/*.md` files
- Update package references from `@suds-cli/*` → `@boba-cli/*`

---

## 2. Package Directories (25 packages)

Each package in `packages/` requires:

| Package | Current Name | New Name |
|---------|--------------|----------|
| chapstick | `@suds-cli/chapstick` | `@boba-cli/chapstick` |
| code | `@suds-cli/code` | `@boba-cli/code` |
| cursor | `@suds-cli/cursor` | `@boba-cli/cursor` |
| dsl | `@suds-cli/dsl` | `@boba-cli/dsl` |
| filepicker | `@suds-cli/filepicker` | `@boba-cli/filepicker` |
| filesystem | `@suds-cli/filesystem` | `@boba-cli/filesystem` |
| filetree | `@suds-cli/filetree` | `@boba-cli/filetree` |
| help | `@suds-cli/help` | `@boba-cli/help` |
| icons | `@suds-cli/icons` | `@boba-cli/icons` |
| key | `@suds-cli/key` | `@boba-cli/key` |
| list | `@suds-cli/list` | `@boba-cli/list` |
| machine | `@suds-cli/machine` | `@boba-cli/machine` |
| markdown | `@suds-cli/markdown` | `@boba-cli/markdown` |
| paginator | `@suds-cli/paginator` | `@boba-cli/paginator` |
| progress | `@suds-cli/progress` | `@boba-cli/progress` |
| runeutil | `@suds-cli/runeutil` | `@boba-cli/runeutil` |
| spinner | `@suds-cli/spinner` | `@boba-cli/spinner` |
| statusbar | `@suds-cli/statusbar` | `@boba-cli/statusbar` |
| stopwatch | `@suds-cli/stopwatch` | `@boba-cli/stopwatch` |
| table | `@suds-cli/table` | `@boba-cli/table` |
| tea | `@suds-cli/tea` | `@boba-cli/tea` |
| textarea | `@suds-cli/textarea` | `@boba-cli/textarea` |
| textinput | `@suds-cli/textinput` | `@boba-cli/textinput` |
| timer | `@suds-cli/timer` | `@boba-cli/timer` |
| viewport | `@suds-cli/viewport` | `@boba-cli/viewport` |

### Per-package files to update:
- `package.json` - `name` field and all `@suds-cli/*` dependencies
- `README.md` - package name references and import examples
- `CHANGELOG.md` - package name references
- Source files (`src/**/*.ts`) - import statements
- Test files (`test/**/*.ts`) - import statements

---

## 3. Source Code Files

### 3.1 TypeScript Source Files
Update all import statements:
```typescript
// Before
import { ... } from '@suds-cli/tea'
// After
import { ... } from '@boba-cli/tea'
```

### 3.2 TypeScript Test Files
Same pattern as source files.

### 3.3 Type Definition Files
Update package references in `.d.ts` files.

---

## 4. Examples Folder

### 4.1 `examples/package.json`
- Change `name` from `"@suds-cli/examples"` → `"@boba-cli/examples"`
- Update all `@suds-cli/*` dependencies → `@boba-cli/*`

### 4.2 Example TypeScript files (`*.ts`)
- Update all import statements

### 4.3 `examples/filetree/README.md`
- Update any references

---

## 5. Demo Website

### 5.1 `demo-website/package.json`
- Update all `@suds-cli/*` dependencies → `@boba-cli/*`

### 5.2 `demo-website/index.html`
- Change title from `"Suds CLI"` → `"Boba CLI"`
- Change logo from `"Suds"` → `"Boba"`
- Change terminal title from `"suds-cli"` → `"boba-cli"`
- Update GitHub link

### 5.3 `demo-website/CLAUDE.md`
- Update project references

### 5.4 TypeScript files in `demo-website/src/`
- Update all import statements

---

## 6. Documentation

### 6.1 Root `README.md`
- Change title from `"🧼 Suds"` → `"🧋 Boba"` (boba tea emoji)
- Change "Suds is..." → "Boba is..."
- Update all package references
- Update installation examples
- Update git clone URL

### 6.2 `docs/*.md` files (auto-generated)
- These contain API docs with `@suds-cli` references
- Update package header references

### 6.3 Package README files
- Already covered in section 2

---

## 7. API Reports (`api-reports/*.api.md`)

- Update all `@suds-cli` package headers
- Update import statements in code blocks

---

## 8. GitHub Workflows

### 8.1 `.github/workflows/deploy-demo.yml`
- Change `VITE_BASE_PATH: /suds-cli/` → `/boba-cli/`

### 8.2 Other workflow files
- Check for any other references

---

## 9. Scripts Folder

### 9.1 `scripts/package.json`
- Update any dependencies

### 9.2 `scripts/generate-assets.mts`
- Update any package references

### 9.3 `scripts/CHANGELOG.md`
- Update references

---

## 10. Acceptance Tests

### 10.1 `acceptance-tests/module-consumption.test.ts`
- Update all `@suds-cli/*` imports

---

## 11. Agent/Plans Files

### 11.1 `.agent/plans/*.md`
- Update project references

---

## 12. NEW: Create `boba-cli` Rollup Package

Create a new package at `packages/boba-cli/` that re-exports everything:

### Structure:
```
packages/boba-cli/
├── package.json
├── README.md
├── tsconfig.json
├── tsup.config.ts
└── src/
    └── index.ts
```

### `package.json`:
```json
{
  "name": "boba-cli",
  "description": "Complete Boba CLI framework - all components in one package",
  "version": "0.1.0-alpha.0",
  "dependencies": {
    "@boba-cli/tea": "workspace:*",
    "@boba-cli/chapstick": "workspace:*",
    "@boba-cli/key": "workspace:*",
    "@boba-cli/spinner": "workspace:*",
    "@boba-cli/progress": "workspace:*",
    "@boba-cli/textinput": "workspace:*",
    "@boba-cli/textarea": "workspace:*",
    "@boba-cli/table": "workspace:*",
    "@boba-cli/list": "workspace:*",
    "@boba-cli/viewport": "workspace:*",
    "@boba-cli/paginator": "workspace:*",
    "@boba-cli/timer": "workspace:*",
    "@boba-cli/stopwatch": "workspace:*",
    "@boba-cli/help": "workspace:*",
    "@boba-cli/filepicker": "workspace:*",
    "@boba-cli/cursor": "workspace:*",
    "@boba-cli/runeutil": "workspace:*",
    "@boba-cli/icons": "workspace:*",
    "@boba-cli/machine": "workspace:*",
    "@boba-cli/filesystem": "workspace:*",
    "@boba-cli/code": "workspace:*",
    "@boba-cli/markdown": "workspace:*",
    "@boba-cli/statusbar": "workspace:*",
    "@boba-cli/filetree": "workspace:*",
    "@boba-cli/dsl": "workspace:*"
  }
}
```

### `src/index.ts`:
Re-export all packages with namespaces or flat exports.

---

## 13. Lock File

### 13.1 `pnpm-lock.yaml`
- Will be regenerated after all changes
- Run `pnpm install` to update

---

## Execution Strategy

### Phase 1: Configuration Files
1. Update root `package.json`
2. Update `.syncpackrc.json`
3. Update `.changeset/config.json`
4. Update `.changeset/pre.json`
5. Update all `.changeset/*.md` files

### Phase 2: Package Metadata
1. Update all `packages/*/package.json` (name + dependencies)
2. Update `examples/package.json`
3. Update `demo-website/package.json`
4. Update `scripts/package.json`
5. Update `acceptance-tests/package.json` (if exists)

### Phase 3: Source Code
1. Batch update all `.ts` files with import replacements
2. Update all test files

### Phase 4: Documentation
1. Update root `README.md` (comprehensive rewrite)
2. Update all `packages/*/README.md`
3. Update all `packages/*/CHANGELOG.md`
4. Update `api-reports/*.api.md`
5. Update `docs/*.md`

### Phase 5: Website and Workflows
1. Update `demo-website/index.html`
2. Update `demo-website/CLAUDE.md`
3. Update `demo-website/src/*.ts`
4. Update `.github/workflows/deploy-demo.yml`

### Phase 6: Create Rollup Package
1. Create `packages/boba-cli/` directory
2. Create package.json with all dependencies
3. Create src/index.ts with re-exports
4. Create README.md
5. Create tsconfig.json and tsup.config.ts

### Phase 7: Finalize
1. Run `pnpm install` to regenerate lock file
2. Run `pnpm build` to verify all packages build
3. Run `pnpm test` to verify tests pass

---

## Verification Checklist

After completion, verify:
- [ ] `grep -r "@suds-cli" .` returns no results (except git history)
- [ ] `grep -r "suds-cli" .` returns no results (except git history)
- [ ] `grep -ri "suds" . --include="*.md" --include="*.json" --include="*.ts"` returns no results
- [ ] `pnpm install` succeeds
- [ ] `pnpm build` succeeds
- [ ] `pnpm test` succeeds
- [ ] Demo website builds and runs

---

## Notes

- The emoji in README changes from 🧼 (soap/suds) to 🧋 (boba tea)
- Some descriptions mentioning "Suds" should change to "Boba"
- The theme stays consistent: Bubble Tea framework port, now named "Boba" (bubble tea drink)
