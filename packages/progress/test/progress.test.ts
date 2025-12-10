import { width as textWidth } from "@suds-cli/chapstick";
import { afterEach, describe, expect, it, vi } from "vitest";
import { interpolateColor } from "../src/gradient.js";
import { FrameMsg } from "../src/messages.js";
import { ProgressModel } from "../src/model.js";

const ANSI_REGEX = /\u001b\[[0-9;]*m/g;
function stripAnsi(input: string): string {
  return input.replace(ANSI_REGEX, "");
}

describe("ProgressModel", () => {
  afterEach(() => {
    vi.useRealTimers();
  });

  it("clamps target percent", () => {
    const model = ProgressModel.new();
    const [next] = model.setPercent(2);
    expect(next.targetPercent()).toBe(1);
  });

  it("renders bar width without percentage", () => {
    const model = ProgressModel.new({
      width: 10,
      showPercentage: false,
      full: "#",
      empty: ".",
      fullColor: "#ffffff",
      emptyColor: "#333333",
    });
    const output = model.viewAs(0.4);
    expect(textWidth(output)).toBe(10);
    const bare = stripAnsi(output);
    expect(bare.split("#").length - 1).toBe(4);
    expect(bare.split(".").length - 1).toBe(6);
  });

  it("formats percentage text", () => {
    const model = ProgressModel.new({ percentFormat: " %.0f%%" });
    const output = model.viewAs(0.5);
    expect(output.trimEnd().endsWith("50%")).toBe(true);
  });

  it("ignores messages for other IDs", () => {
    const model = ProgressModel.new();
    const foreign = new FrameMsg(model.id() + 1, 0, new Date());
    const [next, cmd] = model.update(foreign);
    expect(next).toBe(model);
    expect(cmd).toBeNull();
  });

  it("animates toward target then stops", async () => {
    vi.useFakeTimers();
    let [model, cmd] = ProgressModel.new().setPercent(1);

    let frames = 0;
    while (cmd && frames < 200) {
      const promise = cmd();
      vi.runOnlyPendingTimers();
      const msg = await promise;
      [model, cmd] = model.update(msg);
      frames++;
    }

    expect(cmd).toBeNull();
    expect(model.percent()).toBeGreaterThan(0.999);
  });
});

describe("gradient", () => {
  it("interpolates colors in RGB space", () => {
    const mid = interpolateColor("#ff0000", "#00ff00", 0.5);
    expect(mid.toLowerCase()).toBe("#808000");
  });
});



