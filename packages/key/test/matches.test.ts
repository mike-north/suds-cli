import { describe, expect, it } from "vitest";
import { newBinding } from "../src/binding.js";
import { matches, type Matchable } from "../src/matches.js";

describe("matches", () => {
  const up = newBinding({ keys: ["k", "up"] });
  const down = newBinding({ keys: ["j", "down"] });
  const quit = newBinding({ keys: ["q", "ctrl+c"] });
  const disabled = newBinding({ keys: ["x"], disabled: true });

  // Mock KeyMsg-like object
  const key = (str: string): Matchable => ({ toString: () => str });

  it("matches single binding with first key", () => {
    expect(matches(key("k"), up)).toBe(true);
  });

  it("matches single binding with second key", () => {
    expect(matches(key("up"), up)).toBe(true);
  });

  it("does not match when key is not in binding", () => {
    expect(matches(key("j"), up)).toBe(false);
  });

  it("matches multiple bindings - first binding", () => {
    expect(matches(key("k"), up, down)).toBe(true);
  });

  it("matches multiple bindings - second binding", () => {
    expect(matches(key("j"), up, down)).toBe(true);
  });

  it("does not match when key is not in any binding", () => {
    expect(matches(key("q"), up, down)).toBe(false);
  });

  it("matches when key is in one of many bindings", () => {
    expect(matches(key("q"), up, down, quit)).toBe(true);
  });

  it("ignores disabled bindings", () => {
    expect(matches(key("x"), disabled)).toBe(false);
  });

  it("ignores disabled bindings even when other bindings present", () => {
    expect(matches(key("x"), up, disabled)).toBe(false);
  });

  it("returns false for empty bindings array", () => {
    expect(matches(key("k"))).toBe(false);
  });

  it("returns false for binding with no keys", () => {
    expect(matches(key("k"), newBinding())).toBe(false);
  });

  it("matches ctrl sequences", () => {
    expect(matches(key("ctrl+c"), quit)).toBe(true);
  });

  it("does not match similar but different ctrl sequences", () => {
    expect(matches(key("ctrl+x"), quit)).toBe(false);
  });

  it("matches exact strings only", () => {
    expect(matches(key("k"), up)).toBe(true);
    expect(matches(key("K"), up)).toBe(false); // case sensitive
    expect(matches(key("kk"), up)).toBe(false);
    expect(matches(key(" k"), up)).toBe(false);
  });

  it("works with any object implementing Matchable", () => {
    const customKey = {
      toString() {
        return "j";
      },
      otherProperty: "ignored",
    };
    expect(matches(customKey, down)).toBe(true);
  });

  it("works with dynamically disabled bindings", () => {
    const binding = newBinding({ keys: ["k"] });
    expect(matches(key("k"), binding)).toBe(true);
    expect(matches(key("k"), binding.withDisabled())).toBe(false);
    expect(matches(key("k"), binding.withDisabled().withEnabled())).toBe(true);
  });

  it("works with unbound bindings", () => {
    const binding = newBinding({ keys: ["k"] }).unbound();
    expect(matches(key("k"), binding)).toBe(false);
  });
});






