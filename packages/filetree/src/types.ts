/**
 * Represents a file or directory item in the file tree.
 * @public
 */
export interface DirectoryItem {
  /** Name of the file or directory */
  name: string;
  /** Formatted details string (e.g., "2024-01-15 10:30:00 -rw-r--r-- 1.2K") */
  details: string;
  /** Full path to the item */
  path: string;
  /** File extension (empty for directories) */
  extension: string;
  /** Whether this item is a directory */
  isDirectory: boolean;
  /** Parent directory path */
  currentDirectory: string;
}
