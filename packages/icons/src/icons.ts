// Package icons provides a set of unicode icons based on type and extension.
// Ported from: https://github.com/mistakenelf/teacup/tree/main/icons

import { IconDef, IconSet } from "./glyphs.js";
import { IconDir } from "./directories.js";
import { IconExt } from "./extensions.js";
import { IconFileName } from "./filenames.js";
import { IconSubExt } from "./sub-extensions.js";
import type { IconInfo, IconResult } from "./types.js";

// File mode bit constants (from Node.js fs.constants)
const S_IFMT = 0o170000; // bit mask for the file type bit fields
const S_IFDIR = 0o040000; // directory
const S_IFIFO = 0o010000; // FIFO/named pipe
const S_IFLNK = 0o120000; // symbolic link
const S_IFSOCK = 0o140000; // socket
const S_IXUSR = 0o000100; // owner has execute permission

/**
 * Returns the indicator for the given file mode.
 * @public
 *
 * @param mode - File mode bits (from fs.Stats.mode)
 * @returns Indicator character:
 *   - "/" for directory
 *   - "|" for named pipe
 *   - `@` for symbolic link
 *   - "=" for socket
 *   - "*" for executable
 *   - "" for regular file
 *
 * @example
 * ```typescript
 * const stats = fs.statSync('myfile');
 * const indicator = getIndicator(stats.mode);
 * ```
 */
export function getIndicator(mode: number): string {
  const fileType = mode & S_IFMT;

  if (fileType === S_IFDIR) {
    return "/";
  }
  if (fileType === S_IFIFO) {
    return "|";
  }
  if (fileType === S_IFLNK) {
    return "@";
  }
  if (fileType === S_IFSOCK) {
    return "=";
  }
  // Check if executable bit is set
  if (mode & S_IXUSR) {
    return "*";
  }

  return "";
}

/**
 * Returns the icon glyph and color based on filename, extension, and indicator.
 * @public
 *
 * The lookup order is:
 * 1. For directories: check IconDir, then default to hiddendir or dir
 * 2. For files:
 *    - Check IconFileName for exact filename matches
 *    - Check for special cases (e.g., Go test files)
 *    - Check IconSubExt for compound extensions (e.g., .test.ts)
 *    - Check IconExt for file extensions
 *    - Default to hiddenfile or file based on hidden status
 * 3. For executables: apply green color
 *
 * @param name - Base filename without extension
 * @param ext - File extension including the dot (e.g., ".ts")
 * @param indicator - File indicator from getIndicator()
 * @returns Object with glyph (unicode character) and color (ANSI escape code)
 *
 * @example
 * ```typescript
 * const { glyph, color } = getIcon('example', '.ts', '');
 * console.log(`${color}${glyph}\x1b[0m example.ts`);
 * ```
 */
export function getIcon(
  name: string,
  ext: string,
  indicator: string,
): IconResult {
  let iconInfo: IconInfo | undefined;
  const DOT = ".";

  if (indicator === "/") {
    // Directory lookup
    const dirKey = (name + ext).toLowerCase();
    iconInfo = IconDir[dirKey as keyof typeof IconDir];
    
    if (!iconInfo) {
      if (name.length === 0 || name[0] === DOT) {
        iconInfo = IconDef.hiddendir;
      } else {
        iconInfo = IconDef.dir;
      }
    }
  } else {
    // File lookup
    const fullName = (name + ext).toLowerCase();

    // Check if it's a hidden file first (starts with dot)
    const isHidden = name.length === 0 || name[0] === DOT;

    // Check exact filename
    iconInfo = IconFileName[fullName as keyof typeof IconFileName];
    
    // Special case: Go test files
    if (!iconInfo && ext === ".go" && name.endsWith("_test")) {
      iconInfo = IconSet["go-test"];
    }
    
    // Check sub-extension (e.g., test.ts -> test + .ts)
    if (!iconInfo) {
      const parts = name.split(".");

      // Only check sub-extensions if the name doesn't start with a dot
      if (parts.length > 1 && parts[0] !== "") {
        const subExtKey = (parts[parts.length - 1] + ext).toLowerCase();
        iconInfo = IconSubExt[subExtKey as keyof typeof IconSubExt];
      }
    }

    if (!iconInfo) {
      // Check extension
      const extKey = ext.startsWith(".") ? ext.slice(1).toLowerCase() : ext.toLowerCase();
      iconInfo = IconExt[extKey as keyof typeof IconExt];
      
      if (!iconInfo) {
        iconInfo = isHidden ? IconDef.hiddenfile : IconDef.file;
      }
    }
  }

  // Handle executable files
  let isExecutable = false;
  if (indicator === "*") {
    // If it's already the generic file icon, change to exe icon
    if (iconInfo.glyph === IconDef.file.glyph) {
      iconInfo = IconDef.exe;
    }
    isExecutable = true;
  }

  // Generate color
  const color = isExecutable
    ? "\x1b[38;2;76;175;80m" // Green for executables
    : `\x1b[38;2;${iconInfo.color[0]};${iconInfo.color[1]};${iconInfo.color[2]}m`;

  return {
    glyph: iconInfo.glyph,
    color,
  };
}
