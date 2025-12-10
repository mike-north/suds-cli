import { describe, expect, it } from "vitest";
import { Style } from "@suds-cli/chapstick";
import { newBinding } from "@suds-cli/key";
import { HelpModel, type HelpStyles } from "@/index.js";

function plainStyles(): HelpStyles {
  const style = new Style();
  return {
    ellipsis: style,
    shortKey: style,
    shortDesc: style,
    shortSeparator: style,
    fullKey: style,
    fullDesc: style,
    fullSeparator: style,
  };
}

function binding(key: string, desc: string, disabled = false) {
  return newBinding({
    keys: [key],
    help: { key, desc },
    disabled,
  });
}

describe("HelpModel short help", () => {
  it("renders enabled bindings with separators", () => {
    const model = HelpModel.new({ styles: plainStyles() });
    const text = model.shortHelpView([
      binding("a", "up"),
      binding("b", "down"),
    ]);
    expect(text).toBe("a up • b down");
  });

  it("truncates with ellipsis when width is exceeded", () => {
    const model = HelpModel.new({
      width: 10,
      shortSeparator: " ",
      styles: plainStyles(),
    });
    const text = model.shortHelpView([
      binding("a", "alpha"),
      binding("b", "beta"),
    ]);
    expect(text.endsWith("…")).toBe(true);
  });

  it("skips disabled bindings", () => {
    const model = HelpModel.new({ styles: plainStyles() });
    const text = model.shortHelpView([
      binding("a", "up", true),
      binding("b", "down"),
    ]);
    expect(text).toBe("b down");
  });
});

describe("HelpModel full help", () => {
  it("renders columns of bindings", () => {
    const model = HelpModel.new({ styles: plainStyles() });
    const text = model.fullHelpView([
      [binding("a", "alpha"), binding("b", "beta")],
      [binding("c", "gamma")],
    ]);

    const [line1, line2] = text.split("\n");
    expect((line1 ?? "").replace(/\s+$/, "")).toBe("a alpha    c gamma");
    expect((line2 ?? "").replace(/\s+$/, "")).toBe("b beta");
  });

  it("view() switches between short and full help", () => {
    const keyMap = {
      shortHelp: () => [binding("a", "alpha")],
      fullHelp: () => [[binding("a", "alpha")]],
    };

    const short = HelpModel.new({ showAll: false, styles: plainStyles() });
    expect(short.view(keyMap)).toContain("alpha");

    const full = HelpModel.new({ showAll: true, styles: plainStyles() });
    expect(full.view(keyMap)).toContain("alpha");
  });
});



