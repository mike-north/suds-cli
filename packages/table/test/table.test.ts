import { describe, expect, it } from "vitest";
import { Style, borderStyles } from "@suds-cli/chapstick";
import { TableModel } from "../src/model.js";
import type { TableStyles } from "../src/styles.js";
import type { Row } from "../src/types.js";

// Styles with padding like Go's defaults (padding 0,1 = 1 space each side)
const SIMPLE_STYLES: TableStyles = {
  header: new Style().padding(0, 1),
  cell: new Style().padding(0, 1),
  selected: new Style(),
  border: new Style(),
  borderStyle: borderStyles.normal,
};

describe("TableModel rendering", () => {
  it("renders an unbordered view", () => {
    const rows: Row[] = [
      ["Alice", "30"],
      ["Bob", "25"],
      ["Caroline", "28"],
    ];

    const table = TableModel.new({
      columns: [
        { title: "Name", width: 10 },
        { title: "Age", width: 3 },
      ],
      rows,
      height: 2,
      styles: SIMPLE_STYLES,
    });

    expect(table.view()).toMatchInlineSnapshot(`
      " Name        Age 
       Alice       30  
       Bob         25  "
    `);
  });

  it("renders a bordered view with padding rows", () => {
    const table = TableModel.new({
      columns: [
        { title: "Item", width: 8 },
        { title: "Qty", width: 3 },
      ],
      rows: [
        ["Cookies", "12"],
        ["Cake", "4"],
      ],
      height: 3,
      bordered: true,
      styles: SIMPLE_STYLES,
    });

    expect(table.view()).toMatchInlineSnapshot(`
      "┌───────────────┐
      │ Item      Qty │
      │───────────────│
      │ Cookies   12  │
      │ Cake      4   │
      │               │
      └───────────────┘"
    `);
  });
});

describe("TableModel navigation", () => {
  it("keeps the cursor visible when moving down", () => {
    let table = TableModel.new({
      columns: [
        { title: "A", width: 3 },
        { title: "B", width: 3 },
      ],
      rows: [
        ["1", "a"],
        ["2", "b"],
        ["3", "c"],
      ],
      height: 2,
      styles: SIMPLE_STYLES,
      focused: true,
    });

    table = table.moveDown(2);
    expect(table.selectedIndex()).toBe(2);
    expect(table.offset).toBe(1);
  });

  it("scales column widths when constrained", () => {
    const table = TableModel.new({
      columns: [
        { title: "Wide", width: 10 },
        { title: "Narrow", width: 6 },
      ],
      rows: [],
      width: 12,
      styles: SIMPLE_STYLES,
    });

    // Available width is 12, scaled proportionally with flooring.
    expect(table.columnWidths.reduce((a, b) => a + b, 0)).toBe(11);
    expect(table.columnWidths[0]).toBe(7);
    expect(table.columnWidths[1]).toBe(4);
  });
});



