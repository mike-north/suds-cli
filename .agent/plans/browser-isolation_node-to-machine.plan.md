# Browser Isolation Plan: Isolate Node.js to @suds-cli/machine

**Goal**: Make all public packages browser-compatible by isolating Node.js dependencies to `@suds-cli/machine`.

**Status**: In Progress

---

## Phase 1: Extend @suds-cli/machine with New Abstractions

### 1.1 FileSystemAdapter Interface

**Location**: `packages/machine/src/types.ts`

```typescript
export interface FileStat {
  readonly size: number
  readonly mode: number
  readonly mtime: Date
  readonly isDirectory: boolean
  readonly isFile: boolean
  readonly isSymbolicLink: boolean
}

export interface DirectoryEntry {
  readonly name: string
  readonly isDirectory: () => boolean
  readonly isFile: () => boolean
  readonly isSymbolicLink: () => boolean
}

export interface FileSystemAdapter {
  readdir(path: string, options?: { withFileTypes?: boolean }): Promise<DirectoryEntry[] | string[]>
  stat(path: string): Promise<FileStat>
  readFile(path: string, encoding?: string): Promise<string>
  writeFile(path: string, content: string): Promise<void>
  exists(path: string): Promise<boolean>
  mkdir(path: string, options?: { recursive?: boolean }): Promise<void>
  unlink(path: string): Promise<void>
  rmdir(path: string, options?: { recursive?: boolean; force?: boolean }): Promise<void>
  rename(src: string, dst: string): Promise<void>
  copyFile(src: string, dst: string): Promise<void>
  cwd(): string
  homedir(): string
}
```

### 1.2 PathAdapter Interface

**Location**: `packages/machine/src/types.ts`

```typescript
export interface PathAdapter {
  join(...segments: string[]): string
  dirname(path: string): string
  basename(path: string, ext?: string): string
  extname(path: string): string
  resolve(...segments: string[]): string
  isAbsolute(path: string): boolean
  normalize(path: string): string
  readonly sep: string
}
```

### 1.3 StyleAdapter Interface (Chalk Replacement)

**Location**: `packages/machine/src/types.ts`

Pure JS ANSI string utilities that work in both Node.js and xterm.js browser contexts.

```typescript
export interface StyleFn {
  (text: string): string

  // Modifiers
  readonly bold: StyleFn
  readonly dim: StyleFn
  readonly italic: StyleFn
  readonly underline: StyleFn
  readonly strikethrough: StyleFn
  readonly inverse: StyleFn
  readonly hidden: StyleFn
  readonly reset: StyleFn

  // Colors (foreground)
  readonly black: StyleFn
  readonly red: StyleFn
  readonly green: StyleFn
  readonly yellow: StyleFn
  readonly blue: StyleFn
  readonly magenta: StyleFn
  readonly cyan: StyleFn
  readonly white: StyleFn
  readonly gray: StyleFn
  readonly grey: StyleFn

  // Bright colors
  readonly blackBright: StyleFn
  readonly redBright: StyleFn
  readonly greenBright: StyleFn
  readonly yellowBright: StyleFn
  readonly blueBright: StyleFn
  readonly magentaBright: StyleFn
  readonly cyanBright: StyleFn
  readonly whiteBright: StyleFn

  // Background colors
  readonly bgBlack: StyleFn
  readonly bgRed: StyleFn
  // ... etc

  // Extended colors
  hex(color: string): StyleFn
  rgb(r: number, g: number, b: number): StyleFn
  bgHex(color: string): StyleFn
  bgRgb(r: number, g: number, b: number): StyleFn
}

export interface StyleAdapter {
  readonly style: StyleFn
  readonly enabled: boolean
  readonly level: number  // 0=none, 1=basic, 2=256, 3=truecolor
}
```

### 1.4 ArchiveAdapter Interface

**Location**: `packages/machine/src/types.ts`

```typescript
export interface ArchiveAdapter {
  zip(sourceDir: string, destPath: string): Promise<void>
  unzip(archivePath: string, destDir: string): Promise<void>
  isAvailable(): boolean
}
```

### 1.5 Update PlatformAdapter

Add new adapters to the combined interface:

```typescript
export interface PlatformAdapter extends Disposable {
  readonly terminal: TerminalAdapter
  readonly signals: SignalAdapter
  readonly clipboard: ClipboardAdapter
  readonly environment: EnvironmentAdapter
  readonly filesystem: FileSystemAdapter  // NEW
  readonly path: PathAdapter              // NEW
  readonly style: StyleAdapter            // NEW
  readonly archive: ArchiveAdapter        // NEW
}
```

---

## Phase 2: Implement Node.js Adapters

### 2.1 NodeFileSystemAdapter
- **File**: `packages/machine/src/node/filesystem.ts`
- Wraps `node:fs/promises`, `node:os`, `node:process`

### 2.2 NodePathAdapter
- **File**: `packages/machine/src/node/path.ts`
- Wraps `node:path`

### 2.3 StyleAdapter (Pure JS - shared)
- **File**: `packages/machine/src/style/index.ts`
- Pure JS ANSI string utilities (no Node.js dependencies)
- Works identically in Node.js and browser/xterm.js
- Color detection via EnvironmentAdapter (Node) or hardcoded (browser)

### 2.4 NodeArchiveAdapter
- **File**: `packages/machine/src/node/archive.ts`
- Wraps `archiver` and `unzipper` packages
- Move implementation from `@suds-cli/filesystem`

---

## Phase 3: Implement Browser Adapters

### 3.1 BrowserFileSystemAdapter
- **File**: `packages/machine/src/browser/filesystem.ts`
- Virtual/in-memory filesystem or throws "not supported"

### 3.2 BrowserPathAdapter
- **File**: `packages/machine/src/browser/path.ts`
- Pure JS path operations (forward slashes)

### 3.3 BrowserArchiveAdapter
- **File**: `packages/machine/src/browser/archive.ts`
- Throws "not supported in browser"

---

## Phase 4: Package Migrations

### 4.1 @suds-cli/chapstick
**Current Node.js usage:**
- `chalk` for terminal styling
- `supports-color` for color detection
- `process.env` for terminal background detection

**Changes:**
- Remove `chalk` and `supports-color` dependencies
- Use `StyleAdapter` from machine
- Use `EnvironmentAdapter` for color detection

**Files to modify:**
- `packages/chapstick/src/colors.ts`
- `packages/chapstick/src/style.ts`
- `packages/chapstick/package.json`

### 4.2 @suds-cli/tea
**Current Node.js usage:**
- `node:process` for signals (SIGINT, SIGTERM)
- `node:buffer` for input processing
- `process.stdout.columns/rows` for terminal size

**Changes:**
- Accept `PlatformAdapter` in Program constructor
- Use `platform.signals` instead of `process.on('SIGINT')`
- Use `platform.terminal` for I/O and size
- Use byte utilities from machine instead of Buffer

**Files to modify:**
- `packages/tea/src/program.ts`
- `packages/tea/src/input.ts`
- `packages/tea/src/terminal.ts`
- `packages/tea/src/renderer.ts`

### 4.3 @suds-cli/filesystem
**Current Node.js usage:**
- `node:fs`, `node:fs/promises`, `node:path`, `node:os`
- `archiver`, `unzipper` for archives

**Changes:**
- Accept `FileSystemAdapter` and `PathAdapter`
- Remove archive functions (moved to machine)
- Export browser-compatible API

**Files to modify:**
- `packages/filesystem/src/filesystem.ts`
- `packages/filesystem/package.json`

### 4.4 @suds-cli/filetree
**Current Node.js usage:**
- `node:fs/promises` for readdir, stat
- `node:path` for path operations

**Changes:**
- Accept adapters from machine
- Update model to use injected filesystem

**Files to modify:**
- `packages/filetree/src/fs.ts`
- `packages/filetree/src/model.ts`

### 4.5 @suds-cli/filepicker
**Current Node.js usage:**
- Same as filetree

**Changes:**
- Same pattern as filetree

### 4.6 @suds-cli/code
**Current Node.js usage:**
- `node:path` for `path.extname()`

**Changes:**
- Use `PathAdapter` from machine

**Files to modify:**
- `packages/code/src/model.ts`

### 4.7 @suds-cli/markdown
**Current Node.js usage:**
- `chalk` for styling (via marked-terminal)

**Changes:**
- After chapstick migration, use machine's styling
- May need custom marked renderer

---

## Phase 5: ESLint Configuration

**File**: `eslint.config.mts`

Add `no-restricted-imports` rule:

```typescript
// Prevent Node.js imports in packages (except machine)
{
  files: ['packages/*/src/**/*.ts'],
  ignores: [
    'packages/machine/src/**/*.ts',
    'packages/*/test/**/*.ts',  // Exempt tests
  ],
  rules: {
    'no-restricted-imports': [
      'error',
      {
        patterns: [
          { group: ['node:*'], message: 'Use @suds-cli/machine abstractions instead.' },
          { group: ['fs', 'fs/*'], message: 'Use @suds-cli/machine FileSystemAdapter.' },
          { group: ['path'], message: 'Use @suds-cli/machine PathAdapter.' },
          { group: ['os'], message: 'Use @suds-cli/machine abstractions.' },
          { group: ['process'], message: 'Use @suds-cli/machine PlatformAdapter.' },
        ],
        paths: [
          { name: 'chalk', message: 'Use @suds-cli/machine StyleAdapter.' },
          { name: 'supports-color', message: 'Use @suds-cli/machine EnvironmentAdapter.' },
        ],
      },
    ],
  },
}
```

---

## Implementation Workstreams (Parallelizable)

### Workstream A: FileSystemAdapter + PathAdapter
- Define interfaces in types.ts
- Implement NodeFileSystemAdapter
- Implement NodePathAdapter
- Implement BrowserFileSystemAdapter
- Implement BrowserPathAdapter
- Update platform adapters
- Add tests

### Workstream B: StyleAdapter (Pure JS ANSI)
- Create pure JS ANSI string utilities
- Implement chainable style functions
- Support modifiers, colors, hex/rgb
- Use EnvironmentAdapter for color level detection (Node)
- Always-enabled for browser
- Add tests

### Workstream C: ArchiveAdapter
- Define interface in types.ts
- Move zip/unzip from filesystem to machine
- Implement NodeArchiveAdapter (wraps archiver/unzipper)
- Implement BrowserArchiveAdapter (throws not supported)
- Update filesystem package to remove archive code
- Add tests

### Workstream D: ESLint Configuration
- Add no-restricted-imports rules
- Test that violations are caught
- Exempt test files

---

## Checklist

### Phase 1: Machine Abstractions
- [ ] FileSystemAdapter interface defined
- [ ] PathAdapter interface defined
- [ ] StyleAdapter interface defined
- [ ] ArchiveAdapter interface defined
- [ ] PlatformAdapter updated

### Phase 2: Node.js Implementations
- [ ] NodeFileSystemAdapter implemented
- [ ] NodePathAdapter implemented
- [ ] StyleAdapter (pure JS) implemented
- [ ] NodeArchiveAdapter implemented

### Phase 3: Browser Implementations
- [ ] BrowserFileSystemAdapter implemented
- [ ] BrowserPathAdapter implemented
- [ ] BrowserArchiveAdapter implemented

### Phase 4: Package Migrations
- [ ] chapstick migrated (removes chalk, supports-color)
- [ ] tea migrated (uses PlatformAdapter)
- [ ] filesystem migrated (uses adapters, archive removed)
- [ ] filetree migrated
- [ ] filepicker migrated
- [ ] code migrated
- [ ] markdown migrated

### Phase 5: ESLint
- [ ] no-restricted-imports configured
- [ ] All packages pass lint

### Phase 6: Cleanup
- [ ] Remove @types/node from non-machine packages
- [ ] Update documentation
- [ ] Verify all tests pass
