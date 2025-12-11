# @suds-cli/filesystem

Filesystem utility functions for Suds terminal UIs. This package provides a collection of helper functions for working with the filesystem, ported from the [teacup](https://github.com/mistakenelf/teacup) Go library.

## Installation

```bash
npm install @suds-cli/filesystem
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

## API

### Directory Listing

#### `getDirectoryListing(dir: string, showHidden?: boolean): Promise<DirectoryEntry[]>`

Returns a list of files and directories within a given directory.

```typescript
import { getDirectoryListing } from '@suds-cli/filesystem';

const entries = await getDirectoryListing('/path/to/dir');
const allEntries = await getDirectoryListing('/path/to/dir', true); // includes hidden files
```

#### `getDirectoryListingByType(dir: string, listingType: string, showHidden?: boolean): Promise<DirectoryEntry[]>`

Returns a directory listing filtered by type (directories or files).

```typescript
import { getDirectoryListingByType, DirectoriesListingType, FilesListingType } from '@suds-cli/filesystem';

const dirs = await getDirectoryListingByType('/path/to/dir', DirectoriesListingType);
const files = await getDirectoryListingByType('/path/to/dir', FilesListingType);
```

### Directory Navigation

#### `getHomeDirectory(): string`

Returns the user's home directory.

```typescript
import { getHomeDirectory } from '@suds-cli/filesystem';

const home = getHomeDirectory();
```

#### `getWorkingDirectory(): string`

Returns the current working directory.

```typescript
import { getWorkingDirectory } from '@suds-cli/filesystem';

const cwd = getWorkingDirectory();
```

### File Reading

#### `readFileContent(name: string): Promise<string>`

Returns the contents of a file as a string.

```typescript
import { readFileContent } from '@suds-cli/filesystem';

const content = await readFileContent('/path/to/file.txt');
```

### Size Calculation

#### `getDirectoryItemSize(path: string): Promise<number>`

Calculates the size of a directory or file in bytes.

```typescript
import { getDirectoryItemSize } from '@suds-cli/filesystem';

const size = await getDirectoryItemSize('/path/to/item');
console.log(`Size: ${size} bytes`);
```

### File Search

#### `findFilesByName(name: string, dir: string): Promise<{ paths: string[]; entries: DirectoryEntry[] }>`

Searches for files by name (supports partial matches).

```typescript
import { findFilesByName } from '@suds-cli/filesystem';

const { paths, entries } = await findFilesByName('*.txt', '/path/to/search');
```

### File Operations

#### `createFile(name: string): Promise<void>`

Creates a new file.

```typescript
import { createFile } from '@suds-cli/filesystem';

await createFile('/path/to/newfile.txt');
```

#### `deleteFile(name: string): Promise<void>`

Deletes a file.

```typescript
import { deleteFile } from '@suds-cli/filesystem';

await deleteFile('/path/to/file.txt');
```

#### `writeToFile(path: string, content: string): Promise<void>`

Writes content to a file (overwrites if exists).

```typescript
import { writeToFile } from '@suds-cli/filesystem';

await writeToFile('/path/to/file.txt', 'Hello, World!');
```

#### `copyFile(name: string): Promise<string>`

Copies a file with a timestamp suffix and returns the new file path.

```typescript
import { copyFile } from '@suds-cli/filesystem';

const newPath = await copyFile('/path/to/file.txt');
// Returns: /path/to/file_1234567890.txt
```

### Directory Operations

#### `createDirectory(name: string): Promise<void>`

Creates a new directory.

```typescript
import { createDirectory } from '@suds-cli/filesystem';

await createDirectory('/path/to/newdir');
```

#### `deleteDirectory(name: string): Promise<void>`

Deletes a directory recursively.

```typescript
import { deleteDirectory } from '@suds-cli/filesystem';

await deleteDirectory('/path/to/dir');
```

#### `copyDirectory(name: string): Promise<string>`

Copies a directory recursively with a timestamp suffix and returns the new directory path.

```typescript
import { copyDirectory } from '@suds-cli/filesystem';

const newPath = await copyDirectory('/path/to/dir');
// Returns: /path/to/dir_1234567890
```

### Rename and Move Operations

#### `renameDirectoryItem(src: string, dst: string): Promise<void>`

Renames a file or directory.

```typescript
import { renameDirectoryItem } from '@suds-cli/filesystem';

await renameDirectoryItem('/path/to/old.txt', '/path/to/new.txt');
```

#### `moveDirectoryItem(src: string, dst: string): Promise<void>`

Moves a file or directory to a new location.

```typescript
import { moveDirectoryItem } from '@suds-cli/filesystem';

await moveDirectoryItem('/path/to/file.txt', '/new/path/file.txt');
```

### Archive Operations

#### `zip(name: string): Promise<string>`

Creates a zip archive of a file or directory and returns the zip file path.

```typescript
import { zip } from '@suds-cli/filesystem';

const zipPath = await zip('/path/to/file.txt');
// Returns: /path/to/file_1234567890.zip
```

#### `unzip(name: string): Promise<string>`

Extracts a zip archive and returns the output directory path.

```typescript
import { unzip } from '@suds-cli/filesystem';

const extractPath = await unzip('/path/to/archive.zip');
// Returns: /path/to/archive
```

## Types

### `DirectoryEntry`

Represents a directory entry with the following methods:

- `name: string` - The name of the entry
- `isDirectory(): boolean` - Returns true if the entry is a directory
- `isFile(): boolean` - Returns true if the entry is a file
- `isSymbolicLink(): boolean` - Returns true if the entry is a symbolic link

## Cross-Platform Compatibility

All functions are designed to work across Windows, macOS, and Linux. Path handling is done using Node.js's `path` module to ensure cross-platform compatibility.

## License

MIT
