import { describe, expect, it } from "vitest";
import { getIndicator, getIcon } from "../src/icons.js";
import { IconDef, IconSet } from "../src/glyphs.js";

// File mode constants for testing
const S_IFDIR = 0o040000; // directory
const S_IFIFO = 0o010000; // FIFO
const S_IFLNK = 0o120000; // symbolic link
const S_IFSOCK = 0o140000; // socket
const S_IFREG = 0o100000; // regular file
const S_IXUSR = 0o000100; // owner execute permission
const S_IRUSR = 0o000400; // owner read permission
const S_IWUSR = 0o000200; // owner write permission

describe("getIndicator", () => {
  it("returns / for directory", () => {
    expect(getIndicator(S_IFDIR | S_IRUSR | S_IWUSR | S_IXUSR)).toBe("/");
  });

  it("returns | for named pipe", () => {
    expect(getIndicator(S_IFIFO | S_IRUSR | S_IWUSR)).toBe("|");
  });

  it("returns @ for symbolic link", () => {
    expect(getIndicator(S_IFLNK | S_IRUSR | S_IWUSR | S_IXUSR)).toBe("@");
  });

  it("returns = for socket", () => {
    expect(getIndicator(S_IFSOCK | S_IRUSR | S_IWUSR)).toBe("=");
  });

  it("returns * for executable file", () => {
    expect(getIndicator(S_IFREG | S_IRUSR | S_IWUSR | S_IXUSR)).toBe("*");
  });

  it("returns empty string for regular file", () => {
    expect(getIndicator(S_IFREG | S_IRUSR | S_IWUSR)).toBe("");
  });
});

describe("getIcon", () => {
  describe("directory icons", () => {
    it("returns correct icon for .git directory", () => {
      const result = getIcon(".git", "", "/");
      expect(result.glyph).toBe(IconSet["dir-git"]!.glyph);
    });

    it("returns correct icon for node_modules", () => {
      const result = getIcon("node_modules", "", "/");
      expect(result.glyph).toBe(IconSet["dir-npm"]!.glyph);
    });

    it("returns hidden directory icon for hidden dirs", () => {
      const result = getIcon(".hidden", "", "/");
      expect(result.glyph).toBe(IconDef.hiddendir.glyph);
    });

    it("returns default directory icon for unknown dirs", () => {
      const result = getIcon("mydir", "", "/");
      expect(result.glyph).toBe(IconDef.dir.glyph);
    });
  });

  describe("filename icons", () => {
    it("returns correct icon for Dockerfile", () => {
      const result = getIcon("Dockerfile", "", "");
      expect(result.glyph).toBe(IconSet.docker!.glyph);
    });

    it("returns correct icon for package.json", () => {
      const result = getIcon("package", ".json", "");
      expect(result.glyph).toBe(IconSet.nodejs!.glyph);
    });

    it("returns correct icon for .gitignore", () => {
      const result = getIcon(".gitignore", "", "");
      expect(result.glyph).toBe(IconSet.git!.glyph);
    });

    it("returns correct icon for Makefile", () => {
      const result = getIcon("Makefile", "", "");
      expect(result.glyph).toBe(IconSet.makefile!.glyph);
    });
  });

  describe("extension icons", () => {
    it("returns correct icon for .ts files", () => {
      const result = getIcon("example", ".ts", "");
      expect(result.glyph).toBe(IconSet.typescript!.glyph);
    });

    it("returns correct icon for .js files", () => {
      const result = getIcon("example", ".js", "");
      expect(result.glyph).toBe(IconSet.javascript!.glyph);
    });

    it("returns correct icon for .go files", () => {
      const result = getIcon("example", ".go", "");
      expect(result.glyph).toBe(IconSet.go!.glyph);
    });

    it("returns correct icon for .py files", () => {
      const result = getIcon("example", ".py", "");
      expect(result.glyph).toBe(IconSet.python!.glyph);
    });

    it("returns correct icon for .md files", () => {
      const result = getIcon("example", ".md", "");
      expect(result.glyph).toBe(IconSet.markdown!.glyph);
    });

    it("handles extension without leading dot", () => {
      const result = getIcon("example", "ts", "");
      expect(result.glyph).toBe(IconSet.typescript!.glyph);
    });
  });

  describe("sub-extension icons", () => {
    it("returns correct icon for .test.ts files", () => {
      const result = getIcon("example.test", ".ts", "");
      expect(result.glyph).toBe(IconSet["test-ts"]!.glyph);
    });

    it("returns correct icon for .spec.ts files", () => {
      const result = getIcon("example.spec", ".ts", "");
      expect(result.glyph).toBe(IconSet["test-ts"]!.glyph);
    });

    it("returns correct icon for .d.ts files", () => {
      const result = getIcon("example.d", ".ts", "");
      expect(result.glyph).toBe(IconSet["typescript-def"]!.glyph);
    });

    it("returns correct icon for .test.js files", () => {
      const result = getIcon("example.test", ".js", "");
      expect(result.glyph).toBe(IconSet["test-js"]!.glyph);
    });

    it("returns correct icon for .spec.jsx files", () => {
      const result = getIcon("example.spec", ".jsx", "");
      expect(result.glyph).toBe(IconSet["test-jsx"]!.glyph);
    });
  });

  describe("special cases", () => {
    it("returns correct icon for Go test files", () => {
      const result = getIcon("example_test", ".go", "");
      expect(result.glyph).toBe(IconSet["go-test"]!.glyph);
    });

    it("returns extension icon for hidden files with known extensions", () => {
      // Hidden files with known extensions use the extension icon, not hiddenfile
      const result = getIcon(".hidden", ".txt", "");
      expect(result.glyph).toBe(IconSet.document!.glyph);
    });

    it("returns hidden file icon for hidden files with unknown extensions", () => {
      const result = getIcon(".hidden", ".xyz", "");
      expect(result.glyph).toBe(IconDef.hiddenfile.glyph);
    });

    it("returns default file icon for unknown files", () => {
      const result = getIcon("unknown", ".xyz", "");
      expect(result.glyph).toBe(IconDef.file.glyph);
    });
  });

  describe("executable files", () => {
    it("applies executable color to executable files", () => {
      const result = getIcon("script", ".sh", "*");
      expect(result.color).toBe("\x1b[38;2;76;175;80m");
    });

    it("changes generic file icon to exe icon for executables", () => {
      const result = getIcon("unknown", ".xyz", "*");
      expect(result.glyph).toBe(IconDef.exe.glyph);
      expect(result.color).toBe("\x1b[38;2;76;175;80m");
    });

    it("keeps specific icon but applies green color for known executables", () => {
      const result = getIcon("script", ".sh", "*");
      // Should keep shell icon but with green color
      expect(result.color).toBe("\x1b[38;2;76;175;80m");
    });
  });

  describe("color formatting", () => {
    it("returns ANSI color code", () => {
      const result = getIcon("example", ".ts", "");
      expect(result.color).toMatch(/^\x1b\[38;2;\d+;\d+;\d+m$/);
    });

    it("returns correct RGB values in color", () => {
      const result = getIcon("example", ".ts", "");
      const tsColor = IconSet.typescript!.color;
      expect(result.color).toBe(
        `\x1b[38;2;${tsColor[0]};${tsColor[1]};${tsColor[2]}m`,
      );
    });
  });

  describe("case insensitivity", () => {
    it("handles uppercase extensions", () => {
      const result = getIcon("example", ".TS", "");
      expect(result.glyph).toBe(IconSet.typescript!.glyph);
    });

    it("handles mixed case filenames", () => {
      const result = getIcon("DOCKERFILE", "", "");
      expect(result.glyph).toBe(IconSet.docker!.glyph);
    });

    it("handles uppercase directory names", () => {
      const result = getIcon("NODE_MODULES", "", "/");
      expect(result.glyph).toBe(IconSet["dir-npm"]!.glyph);
    });
  });
});
