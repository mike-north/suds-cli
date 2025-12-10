import { describe, expect, it } from "vitest";
import { KeyMsg, KeyType } from "@suds-cli/tea";
import { TextareaModel } from "../src/index.js";

function key(type: KeyType, runes = "", alt = false): KeyMsg {
  return new KeyMsg({ type, runes, alt, paste: false });
}

describe("TextareaModel", () => {
  it("inserts newlines and maintains cursor", () => {
    let model = TextareaModel.new({ value: "hello" });
    const [focused] = model.focus();
    model = focused.insertRunes(" world");
    model = model.insertNewline();
    model = model.insertRunes("second line");
    expect(model.lineCount()).toBe(2);
    expect(model.lineContent(0)).toBe("hello world");
    expect(model.lineContent(1)).toBe("second line");
    expect(model.currentLine()).toBe(1);
  });

  it("deletes across lines with backspace", () => {
    let model = TextareaModel.new({ value: "a\nb" });
    const [focused] = model.focus();
    model = focused.gotoLineStart().lineDown();
    model = model.deleteLeft();
    expect(model.lineCount()).toBe(1);
    expect(model.value()).toBe("ab");
  });

  it("handles key updates for enter and runes", () => {
    let model = TextareaModel.new({ value: "" });
    const [focused] = model.focus();
    model = focused;
    const [afterA] = model.update(key(KeyType.Runes, "A"));
    const [afterEnter] = afterA.update(key(KeyType.Enter));
    const [afterB] = afterEnter.update(key(KeyType.Runes, "B"));
    expect(afterB.value()).toBe("A\nB");
    expect(afterB.currentLine()).toBe(1);
  });

  it("duplicates and deletes lines", () => {
    let model = TextareaModel.new({ value: "one\ntwo" });
    const [focused] = model.focus();
    model = focused;
    model = model.duplicateLine();
    expect(model.lineCount()).toBe(3);
    expect(model.lineContent(1)).toBe("two");
    model = model.lineDown().deleteLine();
    expect(model.lineCount()).toBe(2);
  });

  it("moves cursor left/right across lines and deletes last char", () => {
    let model = TextareaModel.new({ value: "ab\nc" });
    const [focused] = model.focus();
    model = focused.gotoLine(0).gotoLineEnd(); // end of first line
    model = model.cursorRight(); // move to start of next line
    model = model.deleteLeft(); // delete newline -> joins lines
    expect(model.value()).toBe("abc");
    model = model.gotoLineEnd();
    model = model.deleteLeft();
    expect(model.value()).toBe("ab");
  });
});



