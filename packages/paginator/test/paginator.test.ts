import { describe, expect, it } from "vitest";
import { KeyMsg, KeyType } from "@suds-cli/tea";
import { PaginatorModel, PaginatorType } from "@/index.js";

function key(type: KeyType): KeyMsg {
  return new KeyMsg({ type, runes: "", alt: false, paste: false });
}

describe("PaginatorModel navigation", () => {
  it("does not go below first page", () => {
    const model = PaginatorModel.new({ page: 0 });
    const prev = model.prevPage();
    expect(prev.page).toBe(0);
  });

  it("stops at last page", () => {
    let model = PaginatorModel.new({ totalPages: 3 });
    for (let i = 0; i < 5; i++) {
      model = model.nextPage();
    }
    expect(model.page).toBe(2);
  });

  it("responds to key bindings", () => {
    const model = PaginatorModel.new({ totalPages: 2 });
    const [next] = model.update(key(KeyType.Right));
    expect(next.page).toBe(1);

    const [prev] = next.update(key(KeyType.Left));
    expect(prev.page).toBe(0);
  });

  it("ignores non-key messages", () => {
    const model = PaginatorModel.new();
    const [same, cmd] = model.update({ _tag: "noop" } as any);
    expect(same).toBe(model);
    expect(cmd).toBeNull();
  });
});

describe("PaginatorModel helpers", () => {
  it("rounds total pages up from item count", () => {
    const model = PaginatorModel.new({ perPage: 10 });
    const next = model.setTotalPages(21);
    expect(next.totalPages).toBe(3);
  });

  it("computes slice bounds", () => {
    const model = PaginatorModel.new({ page: 1, perPage: 3 });
    const [start, end] = model.getSliceBounds(8);
    expect(start).toBe(3);
    expect(end).toBe(6);
  });

  it("computes items on current page", () => {
    const middle = PaginatorModel.new({ page: 1, perPage: 5 });
    expect(middle.itemsOnPage(12)).toBe(5);

    const last = PaginatorModel.new({ page: 2, perPage: 5 });
    expect(last.itemsOnPage(12)).toBe(2);
  });
});

describe("PaginatorModel view", () => {
  it("renders arabic style", () => {
    const model = PaginatorModel.new({ page: 1, totalPages: 5 });
    expect(model.view()).toBe("2/5");
  });

  it("renders dots style", () => {
    const model = PaginatorModel.new({
      type: PaginatorType.Dots,
      totalPages: 3,
      page: 1,
    });
    expect(model.view()).toBe("○•○");
  });
});



