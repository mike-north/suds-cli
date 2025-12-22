import { describe, it, expect } from "vitest";
import { StatusbarModel, Height } from "../src/model.js";
import type { ColorConfig } from "../src/types.js";
import { WindowSizeMsg } from "@suds-cli/tea";

describe("StatusbarModel", () => {
  const defaultColors: ColorConfig = {
    foreground: "#ffffff",
    background: "#000000",
  };

  const pinkColors: ColorConfig = {
    foreground: "#ffffff",
    background: "#F25D94",
  };

  const grayColors: ColorConfig = {
    foreground: "#ffffff",
    background: "#3c3836",
  };

  const purpleColors: ColorConfig = {
    foreground: "#ffffff",
    background: "#A550DF",
  };

  const indigoColors: ColorConfig = {
    foreground: "#ffffff",
    background: "#6124DF",
  };

  describe("new", () => {
    it("creates a statusbar with default state", () => {
      const sb = StatusbarModel.new(
        defaultColors,
        defaultColors,
        defaultColors,
        defaultColors,
      );
      expect(sb).toBeDefined();
    });

    it("has height constant equal to 1", () => {
      expect(Height).toBe(1);
    });
  });

  describe("setSize", () => {
    it("updates the width", () => {
      const sb = StatusbarModel.new(
        defaultColors,
        defaultColors,
        defaultColors,
        defaultColors,
      );
      const updated = sb.setSize(100);
      expect(updated).toBeDefined();
      // Width is reflected in the view
      const view = updated.view();
      expect(view.length).toBeGreaterThan(0);
    });

    it("handles zero width", () => {
      const sb = StatusbarModel.new(
        defaultColors,
        defaultColors,
        defaultColors,
        defaultColors,
      ).setSize(0);
      expect(sb.view()).toBe("");
    });

    it("handles negative width as zero", () => {
      const sb = StatusbarModel.new(
        defaultColors,
        defaultColors,
        defaultColors,
        defaultColors,
      ).setSize(-10);
      expect(sb.view()).toBe("");
    });
  });

  describe("setContent", () => {
    it("updates all column content", () => {
      const sb = StatusbarModel.new(
        pinkColors,
        grayColors,
        purpleColors,
        indigoColors,
      )
        .setSize(80)
        .setContent("test.txt", "~/.config/nvim", "1/23", "SB");

      const view = sb.view();
      expect(view).toContain("test.txt");
      expect(view).toContain("~/.config/nvim");
      expect(view).toContain("1/23");
      expect(view).toContain("SB");
    });
  });

  describe("setColors", () => {
    it("updates column colors", () => {
      const sb = StatusbarModel.new(
        defaultColors,
        defaultColors,
        defaultColors,
        defaultColors,
      ).setColors(pinkColors, grayColors, purpleColors, indigoColors);

      expect(sb).toBeDefined();
    });
  });

  describe("update", () => {
    it("handles WindowSizeMsg", () => {
      const sb = StatusbarModel.new(
        defaultColors,
        defaultColors,
        defaultColors,
        defaultColors,
      );
      const msg = new WindowSizeMsg(120, 40);
      const [updated, cmd] = sb.update(msg);

      expect(updated).toBeDefined();
      expect(cmd).toBeNull();
    });

    it("ignores other messages", () => {
      const sb = StatusbarModel.new(
        defaultColors,
        defaultColors,
        defaultColors,
        defaultColors,
      );
      const msg = { _tag: "custom" } as any;
      const [updated, cmd] = sb.update(msg);

      expect(updated).toBe(sb);
      expect(cmd).toBeNull();
    });
  });

  describe("view", () => {
    it("renders empty string with zero width", () => {
      const sb = StatusbarModel.new(
        defaultColors,
        defaultColors,
        defaultColors,
        defaultColors,
      );
      expect(sb.view()).toBe("");
    });

    it("renders statusbar with content", () => {
      const sb = StatusbarModel.new(
        pinkColors,
        grayColors,
        purpleColors,
        indigoColors,
      )
        .setSize(80)
        .setContent("file.txt", "/path/to/dir", "10/100", "OK");

      const view = sb.view();
      expect(view).toBeTruthy();
      expect(view.length).toBeGreaterThan(0);
    });

    it("truncates first column when too long", () => {
      const longText = "a".repeat(50);
      const sb = StatusbarModel.new(
        pinkColors,
        grayColors,
        purpleColors,
        indigoColors,
      )
        .setSize(80)
        .setContent(longText, "second", "third", "fourth");

      const view = sb.view();
      expect(view).toContain("...");
      expect(view).toContain("second");
    });

    it("truncates second column when space is limited", () => {
      const longSecond = "b".repeat(100);
      const sb = StatusbarModel.new(
        pinkColors,
        grayColors,
        purpleColors,
        indigoColors,
      )
        .setSize(50)
        .setContent("first", longSecond, "third", "fourth");

      const view = sb.view();
      expect(view).toBeTruthy();
    });

    it("handles very narrow width gracefully", () => {
      const sb = StatusbarModel.new(
        pinkColors,
        grayColors,
        purpleColors,
        indigoColors,
      )
        .setSize(10)
        .setContent("a", "b", "c", "d");

      const view = sb.view();
      expect(view).toBeTruthy();
    });
  });
});
