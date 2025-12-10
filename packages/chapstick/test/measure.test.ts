import { describe, expect, test } from "vitest";
import { width, clampWidth, wrapWidth, padLines } from "../src/measure.js";

describe("measure utilities", () => {
  describe("width", () => {
    test("returns 0 for empty string", () => {
      expect(width("")).toBe(0);
    });

    test("returns correct width for ASCII", () => {
      expect(width("hello")).toBe(5);
    });

    test("handles null/undefined input", () => {
      expect(width(null as unknown as string)).toBe(0);
      expect(width(undefined as unknown as string)).toBe(0);
    });

    test("ignores ANSI escape sequences", () => {
      const colored = "\x1b[31mred\x1b[0m";
      expect(width(colored)).toBe(3);
    });

    test("handles wide characters (CJK)", () => {
      // Chinese character typically takes 2 columns
      expect(width("中")).toBe(2);
      expect(width("中文")).toBe(4);
    });

    test("handles emoji", () => {
      // Emoji width varies by terminal, but string-width handles it
      const w = width("👋");
      expect(w).toBeGreaterThanOrEqual(1);
    });
  });

  describe("clampWidth", () => {
    test("returns text unchanged if no maxWidth", () => {
      expect(clampWidth("hello", undefined)).toBe("hello");
      expect(clampWidth("hello", 0)).toBe("hello");
    });

    test("truncates long lines", () => {
      expect(clampWidth("hello world", 5)).toBe("hello");
    });

    test("preserves text shorter than maxWidth", () => {
      expect(clampWidth("hi", 10)).toBe("hi");
    });

    test("handles multiline text", () => {
      const result = clampWidth("hello\nworld", 3);
      expect(result).toBe("hel\nwor");
    });

    test("handles ANSI sequences correctly", () => {
      const colored = "\x1b[31mhello world\x1b[0m";
      const result = clampWidth(colored, 5);
      // Should truncate to 5 visible characters
      expect(width(result)).toBeLessThanOrEqual(5);
    });
  });

  describe("wrapWidth", () => {
    test("returns text unchanged if no maxWidth", () => {
      expect(wrapWidth("hello", undefined)).toBe("hello");
      expect(wrapWidth("hello", 0)).toBe("hello");
    });

    test("wraps long text at word boundaries", () => {
      const result = wrapWidth("hello world", 6);
      expect(result.split("\n").length).toBeGreaterThan(1);
    });

    test("preserves text shorter than maxWidth", () => {
      expect(wrapWidth("hi", 10)).toBe("hi");
    });

    test("handles already multiline text", () => {
      const result = wrapWidth("ab\ncd", 10);
      expect(result).toBe("ab\ncd");
    });
  });

  describe("padLines", () => {
    test("returns text unchanged if no padding", () => {
      expect(padLines("hello", 0, 0)).toBe("hello");
    });

    test("adds left padding", () => {
      expect(padLines("hello", 2, 0)).toBe("  hello");
    });

    test("adds right padding", () => {
      expect(padLines("hello", 0, 2)).toBe("hello  ");
    });

    test("adds both left and right padding", () => {
      expect(padLines("hello", 2, 3)).toBe("  hello   ");
    });

    test("pads each line in multiline text", () => {
      const result = padLines("a\nb\nc", 1, 1);
      expect(result).toBe(" a \n b \n c ");
    });

    test("handles negative values gracefully", () => {
      // Should not throw
      expect(() => padLines("test", -1, -1)).not.toThrow();
    });
  });
});






