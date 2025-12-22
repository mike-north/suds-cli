import { describe, it, expect } from "vitest";
import { MarkdownModel } from "../src/model.js";
import { RenderMarkdownMsg, ErrorMsg } from "../src/messages.js";

describe("MarkdownModel", () => {
  it("should create a new model", () => {
    const model = MarkdownModel.new({ active: true });
    expect(model).toBeDefined();
    expect(model.active).toBe(true);
    expect(model.fileName).toBe("");
  });

  it("should set active state", () => {
    const model = MarkdownModel.new({ active: false });
    expect(model.active).toBe(false);
    
    const activeModel = model.setIsActive(true);
    expect(activeModel.active).toBe(true);
  });

  it("should set size", () => {
    const model = MarkdownModel.new();
    const [updated] = model.setSize(80, 24);
    expect(updated.viewport.width).toBe(80);
    expect(updated.viewport.height).toBe(24);
  });

  it("should go to top", () => {
    const model = MarkdownModel.new({ width: 80, height: 24 });
    const scrolledModel = model.gotoTop();
    expect(scrolledModel.viewport.yOffset).toBe(0);
  });

  it("should init with no command", () => {
    const model = MarkdownModel.new();
    const cmd = model.init();
    expect(cmd).toBeNull();
  });

  it("should set filename and return command", () => {
    const model = MarkdownModel.new({ width: 80, height: 24 });
    const [updated, cmd] = model.setFileName("test.md");
    
    expect(updated.fileName).toBe("test.md");
    expect(cmd).not.toBeNull();
    expect(typeof cmd).toBe("function");
  });

  it("should update viewport content when RenderMarkdownMsg is received", () => {
    const model = MarkdownModel.new({ width: 80, height: 24 });
    const content = "# Hello\n\nThis is a test.";
    const msg = new RenderMarkdownMsg(content);

    const [updated, cmd] = model.update(msg);

    expect(updated).not.toBe(model);
    // Content is padded to viewport width, so check each line is present
    const view = updated.viewport.view();
    expect(view).toContain("# Hello");
    expect(view).toContain("This is a test.");
    expect(cmd).toBeNull();
  });

  it("should handle ErrorMsg and clear filename", () => {
    const model = MarkdownModel.new({ width: 80, height: 24 });
    const [modelWithFile] = model.setFileName("test.md");
    expect(modelWithFile.fileName).toBe("test.md");
    
    const error = new Error("File not found");
    const errorMsg = new ErrorMsg(error);
    const [updated, cmd] = modelWithFile.update(errorMsg);
    
    expect(updated.fileName).toBe("");
    expect(updated.viewport.view()).toContain("File not found");
    expect(cmd).toBeNull();
  });
});
