import { describe, it, expect } from "vitest";
import { renderMarkdown } from "../src/renderer.js";

describe("renderMarkdown", () => {
  it("should render basic markdown text", () => {
    const input = "# Hello World\n\nThis is a test.";
    const output = renderMarkdown(input, { width: 80 });
    expect(output).toBeTruthy();
    expect(output.length).toBeGreaterThan(0);
  });

  it("should render code blocks", () => {
    const input = "```typescript\nconst x = 1;\n```";
    const output = renderMarkdown(input, { width: 80 });
    expect(output).toBeTruthy();
    expect(output.length).toBeGreaterThan(0);
  });

  it("should render lists", () => {
    const input = "- Item 1\n- Item 2\n- Item 3";
    const output = renderMarkdown(input, { width: 80 });
    expect(output).toBeTruthy();
    expect(output.length).toBeGreaterThan(0);
  });

  it("should handle empty content", () => {
    const output = renderMarkdown("", { width: 80 });
    expect(output).toBe("");
  });
});
