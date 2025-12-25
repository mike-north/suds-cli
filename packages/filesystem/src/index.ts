export {
  // Directory constants
  CurrentDirectory,
  PreviousDirectory,
  HomeDirectory,
  RootDirectory,
  // Listing types
  DirectoriesListingType,
  FilesListingType,
  // Core functions
  getDirectoryListing,
  getDirectoryListingByType,
  getHomeDirectory,
  getWorkingDirectory,
  readFileContent,
  getDirectoryItemSize,
  findFilesByName,
  // File operations
  createFile,
  createDirectory,
  deleteFile,
  deleteDirectory,
  renameDirectoryItem,
  moveDirectoryItem,
  copyFile,
  copyDirectory,
  writeToFile,
} from './filesystem.js'

// Re-export types from machine for convenience
export type { DirectoryEntry } from '@suds-cli/machine'
