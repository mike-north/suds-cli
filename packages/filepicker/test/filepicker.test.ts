import { describe, expect, it } from "vitest";
import { sortFiles } from "../src/fs.js";
import { DirReadMsg } from "../src/messages.js";
import { FilepickerModel } from "../src/model.js";
import type { FileInfo } from "../src/types.js";

function stubFile(name: string, isDir = false): FileInfo {
  return {
    name,
    path: `/tmp/${name}`,
    isDir,
    isHidden: name.startsWith("."),
    size: 0,
    mode: 0o644,
  };
}

describe("filepicker", () => {
  it("sorts directories before files", () => {
    const files = [stubFile("b.txt"), stubFile("a", true)];
    const sorted = [...files].sort((a, b) => sortFiles(a, b, true));
    expect(sorted[0].isDir).toBe(true);
  });

  it("handles directory read messages", () => {
    const [model] = FilepickerModel.new({ showHidden: false });
    const files = [stubFile("one.txt"), stubFile("sub", true)];
    const [updated] = model.update(new DirReadMsg(model.currentDir, files));
    expect(updated.files).toHaveLength(2);
    expect(updated.selectedFile?.name).toBe("one.txt");
  });
});


