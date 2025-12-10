import fs from "node:fs/promises";
import fsSync from "node:fs";
import path from "node:path";
import os from "node:os";
import archiver from "archiver";
import unzipper from "unzipper";
import { createWriteStream, createReadStream } from "node:fs";

/**
 * Directory shortcuts.
 * @public
 */
export const CurrentDirectory = ".";

/**
 * Previous directory shortcut.
 * @public
 */
export const PreviousDirectory = "..";

/**
 * Home directory shortcut.
 * @public
 */
export const HomeDirectory = "~";

/**
 * Root directory shortcut.
 * @public
 */
export const RootDirectory = "/";

/**
 * Listing type for directories only.
 * @public
 */
export const DirectoriesListingType = "directories";

/**
 * Listing type for files only.
 * @public
 */
export const FilesListingType = "files";

/**
 * Generates a timestamped filename for a copy or archive operation.
 * @param filePath - The original file path
 * @param extension - The extension to use (e.g., "" for copy, ".zip" for zip)
 * @returns The new filename with timestamp
 */
function generateTimestampedFilename(
  filePath: string,
  extension: string,
): string {
  const timestamp = Math.floor(Date.now() / 1000);
  const ext = path.extname(filePath);
  const basename = path.basename(filePath, ext);
  const dirname = path.dirname(filePath);
  const filename = path.basename(filePath);

  let output: string;

  if (filename.startsWith(".") && ext === "") {
    // Hidden file with no extension (e.g., ".gitignore")
    output = path.join(dirname, `${filename}_${timestamp}${extension}`);
  } else if (filename.startsWith(".") && ext !== "") {
    // Hidden file with extension (e.g., ".config.json")
    output = path.join(dirname, `${basename}_${timestamp}${ext}${extension}`);
  } else if (ext !== "" && extension === "") {
    // Regular file with extension, copying (preserve original extension)
    output = path.join(dirname, `${basename}_${timestamp}${ext}`);
  } else if (ext !== "" && extension !== "") {
    // Regular file with extension, archiving (replace with new extension)
    output = path.join(dirname, `${basename}_${timestamp}${extension}`);
  } else {
    // File without extension
    output = path.join(dirname, `${filename}_${timestamp}${extension}`);
  }

  return output;
}

/**
 * Directory entry type matching Node.js fs.Dirent.
 * @public
 */
export interface DirectoryEntry {
  name: string;
  isDirectory: () => boolean;
  isFile: () => boolean;
  isSymbolicLink: () => boolean;
}

/**
 * Returns a list of files and directories within a given directory.
 * @param dir - The directory path to list
 * @param showHidden - Whether to include hidden files (starting with .)
 * @returns Array of directory entries
 * @public
 */
export async function getDirectoryListing(
  dir: string,
  showHidden: boolean = false,
): Promise<DirectoryEntry[]> {
  const entries = await fs.readdir(dir, { withFileTypes: true });

  if (!showHidden) {
    return entries.filter((entry) => !entry.name.startsWith("."));
  }

  return entries;
}

/**
 * Returns a directory listing based on type (directories | files).
 * @param dir - The directory path to list
 * @param listingType - Type of listing: "directories" or "files"
 * @param showHidden - Whether to include hidden files (starting with .)
 * @returns Array of directory entries matching the type
 * @public
 */
export async function getDirectoryListingByType(
  dir: string,
  listingType: typeof DirectoriesListingType | typeof FilesListingType,
  showHidden: boolean = false,
): Promise<DirectoryEntry[]> {
  const entries = await fs.readdir(dir, { withFileTypes: true });

  return entries.filter((entry) => {
    const isHidden = entry.name.startsWith(".");

    if (!showHidden && isHidden) {
      return false;
    }

    if (listingType === DirectoriesListingType) {
      return entry.isDirectory();
    } else if (listingType === FilesListingType) {
      return entry.isFile();
    }

    return false;
  });
}

/**
 * Returns the user's home directory.
 * @returns The home directory path
 * @public
 */
export function getHomeDirectory(): string {
  return os.homedir();
}

/**
 * Returns the current working directory.
 * @returns The current working directory path
 * @public
 */
export function getWorkingDirectory(): string {
  return process.cwd();
}

/**
 * Returns the contents of a file.
 * @param name - The file path to read
 * @returns The file contents as a string
 * @public
 */
export async function readFileContent(name: string): Promise<string> {
  const content = await fs.readFile(name, "utf-8");
  return content;
}

/**
 * Calculates size of a directory or file.
 * @param itemPath - The path to calculate size for
 * @returns The size in bytes
 * @public
 */
export async function getDirectoryItemSize(itemPath: string): Promise<number> {
  const stats = await fs.stat(itemPath);

  if (!stats.isDirectory()) {
    return stats.size;
  }

  let totalSize = 0;
  const entries = await fs.readdir(itemPath, { withFileTypes: true });

  for (const entry of entries) {
    const fullPath = path.join(itemPath, entry.name);
    if (entry.isDirectory()) {
      totalSize += await getDirectoryItemSize(fullPath);
    } else {
      const fileStats = await fs.stat(fullPath);
      totalSize += fileStats.size;
    }
  }

  return totalSize;
}

/**
 * Search for files by name.
 * @param name - The name or partial name to search for
 * @param dir - The directory to search in
 * @returns Object containing arrays of paths and entries
 * @public
 */
export async function findFilesByName(
  name: string,
  dir: string,
): Promise<{ paths: string[]; entries: DirectoryEntry[] }> {
  const paths: string[] = [];
  const entries: DirectoryEntry[] = [];

  async function search(searchDir: string): Promise<void> {
    try {
      const items = await fs.readdir(searchDir, { withFileTypes: true });

      for (const item of items) {
        const fullPath = path.join(searchDir, item.name);

        if (item.name.includes(name)) {
          paths.push(fullPath);
          entries.push(item);
        }

        if (item.isDirectory()) {
          await search(fullPath);
        }
      }
    } catch {
      // Skip directories we can't access (e.g., permission denied)
      // This allows the search to continue even when some directories are inaccessible
    }
  }

  await search(dir);

  return { paths, entries };
}

/**
 * Creates a new file.
 * @param name - The file path to create
 * @public
 */
export async function createFile(name: string): Promise<void> {
  const handle = await fs.open(name, "w");
  await handle.close();
}

/**
 * Creates a new directory.
 * @param name - The directory path to create
 * @public
 */
export async function createDirectory(name: string): Promise<void> {
  try {
    await fs.access(name);
    // Directory already exists
  } catch {
    await fs.mkdir(name, { recursive: false });
  }
}

/**
 * Deletes a file.
 * @param name - The file path to delete
 * @public
 */
export async function deleteFile(name: string): Promise<void> {
  await fs.unlink(name);
}

/**
 * Deletes a directory recursively.
 * @param name - The directory path to delete
 * @public
 */
export async function deleteDirectory(name: string): Promise<void> {
  await fs.rm(name, { recursive: true, force: true });
}

/**
 * Renames a file or directory.
 * @param src - The source path
 * @param dst - The destination path
 * @public
 */
export async function renameDirectoryItem(
  src: string,
  dst: string,
): Promise<void> {
  await fs.rename(src, dst);
}

/**
 * Moves a file or directory.
 * @param src - The source path
 * @param dst - The destination path
 * @public
 */
export async function moveDirectoryItem(
  src: string,
  dst: string,
): Promise<void> {
  await fs.rename(src, dst);
}

/**
 * Copies a file with timestamp suffix.
 * @param name - The file path to copy
 * @returns The new file path
 * @public
 */
export async function copyFile(name: string): Promise<string> {
  const output = generateTimestampedFilename(name, "");

  await fs.copyFile(name, output);
  return output;
}

/**
 * Copies a directory recursively with timestamp suffix.
 * @param name - The directory path to copy
 * @returns The new directory path
 * @public
 */
export async function copyDirectory(name: string): Promise<string> {
  const timestamp = Math.floor(Date.now() / 1000);
  const output = `${name}_${timestamp}`;

  async function copyRecursive(src: string, dest: string): Promise<void> {
    const stats = await fs.stat(src);

    if (stats.isDirectory()) {
      await fs.mkdir(dest, { recursive: true });
      const entries = await fs.readdir(src, { withFileTypes: true });

      for (const entry of entries) {
        const srcPath = path.join(src, entry.name);
        const destPath = path.join(dest, entry.name);

        if (entry.isDirectory()) {
          await copyRecursive(srcPath, destPath);
        } else {
          await fs.copyFile(srcPath, destPath);
        }
      }
    } else {
      await fs.copyFile(src, dest);
    }
  }

  await copyRecursive(name, output);
  return output;
}

/**
 * Writes content to a file.
 * @param filePath - The file path to write to
 * @param content - The content to write
 * @public
 */
export async function writeToFile(
  filePath: string,
  content: string,
): Promise<void> {
  await fs.writeFile(filePath, content, "utf-8");
}

/**
 * Zips a file or directory.
 * @param name - The path to zip
 * @returns The output zip file path
 * @public
 */
export async function zip(name: string): Promise<string> {
  const output = generateTimestampedFilename(name, ".zip");

  return new Promise((resolve, reject) => {
    const outputStream = createWriteStream(output);
    const archive = archiver("zip", { zlib: { level: 9 } });

    outputStream.on("close", () => {
      resolve(output);
    });

    archive.on("error", (err) => {
      reject(err);
    });

    archive.pipe(outputStream);

    const stats = fsSync.statSync(name);

    if (stats.isDirectory()) {
      archive.directory(name, false);
    } else {
      archive.file(name, { name: path.basename(name) });
    }

    void archive.finalize();
  });
}

/**
 * Extracts a zip archive.
 * @param name - The zip file path to extract
 * @returns The output directory path
 * @public
 */
export async function unzip(name: string): Promise<string> {
  const ext = path.extname(name);
  const basename = path.basename(name, ext);
  const dirname = path.dirname(name);

  const output = path.join(dirname, basename);

  return new Promise((resolve, reject) => {
    createReadStream(name)
      .pipe(unzipper.Extract({ path: output }))
      .on("close", () => {
        resolve(output);
      })
      .on("error", (err) => {
        reject(err);
      });
  });
}
