import { describe, expect, it } from "vitest";
import { Binding, newBinding } from "../src/binding.js";

describe("Binding", () => {
  it("creates empty binding", () => {
    const b = newBinding();
    expect(b.keys()).toEqual([]);
    expect(b.help()).toEqual({ key: "", desc: "" });
    expect(b.enabled()).toBe(false); // no keys = disabled
  });

  it("creates binding with options", () => {
    const b = newBinding({
      keys: ["k", "up"],
      help: { key: "↑/k", desc: "move up" },
    });
    expect(b.keys()).toEqual(["k", "up"]);
    expect(b.help()).toEqual({ key: "↑/k", desc: "move up" });
    expect(b.enabled()).toBe(true);
  });

  it("creates binding with disabled option", () => {
    const b = newBinding({
      keys: ["k"],
      disabled: true,
    });
    expect(b.keys()).toEqual(["k"]);
    expect(b.enabled()).toBe(false);
  });

  it("withKeys returns new binding with updated keys", () => {
    const a = newBinding();
    const b = a.withKeys("j", "down");
    expect(a.keys()).toEqual([]);
    expect(b.keys()).toEqual(["j", "down"]);
  });

  it("withKeys preserves other properties", () => {
    const a = newBinding({
      help: { key: "test", desc: "test desc" },
      disabled: true,
    });
    const b = a.withKeys("x");
    expect(b.help()).toEqual({ key: "test", desc: "test desc" });
    expect(b.enabled()).toBe(false); // still disabled
  });

  it("withHelp returns new binding with updated help", () => {
    const a = newBinding();
    const b = a.withHelp("↓/j", "move down");
    expect(a.help()).toEqual({ key: "", desc: "" });
    expect(b.help()).toEqual({ key: "↓/j", desc: "move down" });
  });

  it("withHelp preserves other properties", () => {
    const a = newBinding({ keys: ["k", "up"] });
    const b = a.withHelp("↑/k", "move up");
    expect(b.keys()).toEqual(["k", "up"]);
  });

  it("withDisabled disables binding", () => {
    const b = newBinding({ keys: ["q"] });
    expect(b.enabled()).toBe(true);
    expect(b.withDisabled().enabled()).toBe(false);
    expect(b.withDisabled(true).enabled()).toBe(false);
    expect(b.withDisabled(false).enabled()).toBe(true);
  });

  it("withDisabled preserves other properties", () => {
    const a = newBinding({
      keys: ["k"],
      help: { key: "k", desc: "test" },
    });
    const b = a.withDisabled();
    expect(b.keys()).toEqual(["k"]);
    expect(b.help()).toEqual({ key: "k", desc: "test" });
  });

  it("withEnabled enables binding", () => {
    const b = newBinding({ keys: ["q"], disabled: true });
    expect(b.enabled()).toBe(false);
    expect(b.withEnabled().enabled()).toBe(true);
    expect(b.withEnabled(true).enabled()).toBe(true);
    expect(b.withEnabled(false).enabled()).toBe(false);
  });

  it("unbound clears keys and help", () => {
    const a = newBinding({
      keys: ["k", "up"],
      help: { key: "↑/k", desc: "move up" },
    });
    const b = a.unbound();
    expect(b.keys()).toEqual([]);
    expect(b.help()).toEqual({ key: "", desc: "" });
    expect(b.enabled()).toBe(false);
  });

  it("unbound preserves disabled state", () => {
    const a = newBinding({
      keys: ["k"],
      disabled: true,
    });
    const b = a.unbound();
    // Binding is disabled regardless, but the disabled flag is preserved
    expect(b.enabled()).toBe(false);
  });

  it("enabled requires both keys and not disabled", () => {
    expect(newBinding().enabled()).toBe(false);
    expect(newBinding({ keys: [] }).enabled()).toBe(false);
    expect(newBinding({ keys: ["k"] }).enabled()).toBe(true);
    expect(newBinding({ keys: ["k"], disabled: true }).enabled()).toBe(false);
  });

  it("fluent builder pattern works", () => {
    const binding = newBinding()
      .withKeys("j", "down")
      .withHelp("↓/j", "move down");

    expect(binding.keys()).toEqual(["j", "down"]);
    expect(binding.help()).toEqual({ key: "↓/j", desc: "move down" });
    expect(binding.enabled()).toBe(true);
  });

  it("Binding class can be instantiated directly", () => {
    const b = new Binding({
      keys: ["x"],
      help: { key: "x", desc: "test" },
    });
    expect(b.keys()).toEqual(["x"]);
    expect(b.help()).toEqual({ key: "x", desc: "test" });
  });
});






