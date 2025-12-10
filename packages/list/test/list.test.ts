import { describe, expect, it } from "vitest";
import { DefaultItem, ListModel } from "../src/index.js";

describe("ListModel", () => {
  it("creates a model with default items", () => {
    const model = ListModel.new({
      items: [new DefaultItem("Alpha"), new DefaultItem("Beta")],
      showPagination: false,
    });
    expect(model.selectedItem()?.title()).toBe("Alpha");
    expect(model.visibleItems()).toHaveLength(2);
  });

  it("filters items with fuzzy matching", () => {
    const model = ListModel.new({
      items: [new DefaultItem("Alpha"), new DefaultItem("Beta")],
      showPagination: false,
    });

    const filtered = model.setFilter("alp").acceptFilter();
    expect(filtered.filteredItems.map((i) => i.title())).toEqual(["Alpha"]);
    expect(filtered.filterState).toBe("applied");
  });
});


