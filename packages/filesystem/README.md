# @boba-cli/filesystem

Filesystem utility functions for Boba terminal UIs. This package provides a collection of helper functions for working with the filesystem, ported from the [teacup](https://github.com/mistakenelf/teacup) Go library.

This package uses `@boba-cli/machine` abstractions to ensure browser compatibility and platform independence.

## Installation

```bash
npm install @boba-cli/filesystem @boba-cli/machine
```

## Features

### Directory Constants

- `CurrentDirectory` - Current directory (`.`)
- `PreviousDirectory` - Previous directory (`..`)
- `HomeDirectory` - Home directory (`~`)
- `RootDirectory` - Root directory (`/`)

### Listing Types

- `DirectoriesListingType` - Filter for directories only
- `FilesListingType` - Filter for files only

## Usage

All functions require `FileSystemAdapter` and/or `PathAdapter` instances from `@boba-cli/machine`. This design allows the package to work in both Node.js and browser environments.

```typescript
import { NodeFileSystemAdapter, NodePathAdapter } from '@boba-cli/machine/node'
import { getDirectoryListing } from '@boba-cli/filesystem'

// Create adapter instances
const fs = new NodeFileSystemAdapter()
const path = new NodePathAdapter()

// Use with functions
const entries = await getDirectoryListing(fs, '/path/to/dir')
```

## API

### Directory Listing

#### `getDirectoryListing(fs: FileSystemAdapter, dir: string, showHidden?: boolean): Promise<DirectoryEntry[]>`

Returns a list of files and directories within a given directory.

```typescript
import { NodeFileSystemAdapter } from '@boba-cli/machine/node'
import { getDirectoryListing } from '@boba-cli/filesystem'

const fs = new NodeFileSystemAdapter()
const entries = await getDirectoryListing(fs, '/path/to/dir')
const allEntries = await getDirectoryListing(fs, '/path/to/dir', true) // includes hidden files
```

#### `getDirectoryListingByType(fs: FileSystemAdapter, dir: string, listingType: string, showHidden?: boolean): Promise<DirectoryEntry[]>`

Returns a directory listing filtered by type (directories or files).

```typescript
import { NodeFileSystemAdapter } from '@boba-cli/machine/node'
import {
  getDirectoryListingByType,
  DirectoriesListingType,
  FilesListingType,
} from '@boba-cli/filesystem'

const fs = new NodeFileSystemAdapter()
const dirs = await getDirectoryListingByType(
  fs,
  '/path/to/dir',
  DirectoriesListingType,
)
const files = await getDirectoryListingByType(fs, '/path/to/dir', FilesListingType)
```

### Directory Navigation

#### `getHomeDirectory(fs: FileSystemAdapter): string`

Returns the user's home directory.

```typescript
import { NodeFileSystemAdapter } from '@boba-cli/machine/node'
import { getHomeDirectory } from '@boba-cli/filesystem'

const fs = new NodeFileSystemAdapter()
const home = getHomeDirectory(fs)
```

#### `getWorkingDirectory(fs: FileSystemAdapter): string`

Returns the current working directory.

```typescript
import { NodeFileSystemAdapter } from '@boba-cli/machine/node'
import { getWorkingDirectory } from '@boba-cli/filesystem'

const fs = new NodeFileSystemAdapter()
const cwd = getWorkingDirectory(fs)
```

### File Reading

#### `readFileContent(fs: FileSystemAdapter, name: string): Promise<string>`

Returns the contents of a file as a string.

```typescript
import { NodeFileSystemAdapter } from '@boba-cli/machine/node'
import { readFileContent } from '@boba-cli/filesystem'

const fs = new NodeFileSystemAdapter()
const content = await readFileContent(fs, '/path/to/file.txt')
```

### Size Calculation

#### `getDirectoryItemSize(fs: FileSystemAdapter, path: PathAdapter, itemPath: string): Promise<number>`

Calculates the size of a directory or file in bytes.

```typescript
import { NodeFileSystemAdapter, NodePathAdapter } from '@boba-cli/machine/node'
import { getDirectoryItemSize } from '@boba-cli/filesystem'

const fs = new NodeFileSystemAdapter()
const path = new NodePathAdapter()
const size = await getDirectoryItemSize(fs, path, '/path/to/item')
console.log(`Size: ${size} bytes`)
```

### File Search

#### `findFilesByName(fs: FileSystemAdapter, path: PathAdapter, name: string, dir: string): Promise<{ paths: string[]; entries: DirectoryEntry[] }>`

Searches for files by name (supports partial matches).

```typescript
import { NodeFileSystemAdapter, NodePathAdapter } from '@boba-cli/machine/node'
import { findFilesByName } from '@boba-cli/filesystem'

const fs = new NodeFileSystemAdapter()
const path = new NodePathAdapter()
const { paths, entries } = await findFilesByName(fs, path, '*.txt', '/path/to/search')
```

### File Operations

#### `createFile(fs: FileSystemAdapter, name: string): Promise<void>`

Creates a new file.

```typescript
import { NodeFileSystemAdapter } from '@boba-cli/machine/node'
import { createFile } from '@boba-cli/filesystem'

const fs = new NodeFileSystemAdapter()
await createFile(fs, '/path/to/newfile.txt')
```

#### `deleteFile(fs: FileSystemAdapter, name: string): Promise<void>`

Deletes a file.

```typescript
import { NodeFileSystemAdapter } from '@boba-cli/machine/node'
import { deleteFile } from '@boba-cli/filesystem'

const fs = new NodeFileSystemAdapter()
await deleteFile(fs, '/path/to/file.txt')
```

#### `writeToFile(fs: FileSystemAdapter, filePath: string, content: string): Promise<void>`

Writes content to a file (overwrites if exists).

```typescript
import { NodeFileSystemAdapter } from '@boba-cli/machine/node'
import { writeToFile } from '@boba-cli/filesystem'

const fs = new NodeFileSystemAdapter()
await writeToFile(fs, '/path/to/file.txt', 'Hello, World!')
```

#### `copyFile(fs: FileSystemAdapter, path: PathAdapter, name: string): Promise<string>`

Copies a file with a timestamp suffix and returns the new file path.

```typescript
import { NodeFileSystemAdapter, NodePathAdapter } from '@boba-cli/machine/node'
import { copyFile } from '@boba-cli/filesystem'

const fs = new NodeFileSystemAdapter()
const path = new NodePathAdapter()
const newPath = await copyFile(fs, path, '/path/to/file.txt')
// Returns: /path/to/file_1234567890.txt
```

### Directory Operations

#### `createDirectory(fs: FileSystemAdapter, name: string): Promise<void>`

Creates a new directory.

```typescript
import { NodeFileSystemAdapter } from '@boba-cli/machine/node'
import { createDirectory } from '@boba-cli/filesystem'

const fs = new NodeFileSystemAdapter()
await createDirectory(fs, '/path/to/newdir')
```

#### `deleteDirectory(fs: FileSystemAdapter, name: string): Promise<void>`

Deletes a directory recursively.

```typescript
import { NodeFileSystemAdapter } from '@boba-cli/machine/node'
import { deleteDirectory } from '@boba-cli/filesystem'

const fs = new NodeFileSystemAdapter()
await deleteDirectory(fs, '/path/to/dir')
```

#### `copyDirectory(fs: FileSystemAdapter, path: PathAdapter, name: string): Promise<string>`

Copies a directory recursively with a timestamp suffix and returns the new directory path.

```typescript
import { NodeFileSystemAdapter, NodePathAdapter } from '@boba-cli/machine/node'
import { copyDirectory } from '@boba-cli/filesystem'

const fs = new NodeFileSystemAdapter()
const path = new NodePathAdapter()
const newPath = await copyDirectory(fs, path, '/path/to/dir')
// Returns: /path/to/dir_1234567890
```

### Rename and Move Operations

#### `renameDirectoryItem(fs: FileSystemAdapter, src: string, dst: string): Promise<void>`

Renames a file or directory.

```typescript
import { NodeFileSystemAdapter } from '@boba-cli/machine/node'
import { renameDirectoryItem } from '@boba-cli/filesystem'

const fs = new NodeFileSystemAdapter()
await renameDirectoryItem(fs, '/path/to/old.txt', '/path/to/new.txt')
```

#### `moveDirectoryItem(fs: FileSystemAdapter, src: string, dst: string): Promise<void>`

Moves a file or directory to a new location.

```typescript
import { NodeFileSystemAdapter } from '@boba-cli/machine/node'
import { moveDirectoryItem } from '@boba-cli/filesystem'

const fs = new NodeFileSystemAdapter()
await moveDirectoryItem(fs, '/path/to/file.txt', '/new/path/file.txt')
```

## Archive Operations

Archive operations (zip/unzip) have been moved to `@boba-cli/machine`. Use the `ArchiveAdapter` from that package:

```typescript
import { NodeArchiveAdapter } from '@boba-cli/machine/node'

const archive = new NodeArchiveAdapter()
await archive.zip('/path/to/source', '/path/to/output.zip')
await archive.unzip('/path/to/archive.zip', '/path/to/extract')
```

## Types

### `DirectoryEntry`

Represents a directory entry with the following properties and methods:

- `name: string` - The name of the entry
- `isDirectory(): boolean` - Returns true if the entry is a directory
- `isFile(): boolean` - Returns true if the entry is a file
- `isSymbolicLink(): boolean` - Returns true if the entry is a symbolic link

## Cross-Platform Compatibility

All functions use `@boba-cli/machine` adapters to ensure compatibility across Node.js and browser environments. The adapters handle platform-specific implementation details, allowing this package to provide a consistent API regardless of the runtime environment.

## License

MIT
