/**
 * Suds Demo: Table
 *
 * Demonstrates @suds-cli/table with scrolling and selection.
 *
 * Controls:
 *   j / ↓        - move down
 *   k / ↑        - move up
 *   f / PgDn     - page down
 *   b / PgUp     - page up
 *   d / ctrl+d   - half page down
 *   u / ctrl+u   - half page up
 *   g / home     - go to top
 *   G / end      - go to bottom
 *   q            - quit
 */

import { Style, borderStyles } from "@suds-cli/chapstick";
import { newBinding, matches } from "@suds-cli/key";
import { TableModel } from "@suds-cli/table";
import {
  KeyMsg,
  Program,
  WindowSizeMsg,
  quit,
  type Cmd,
  type Model,
  type Msg,
} from "@suds-cli/tea";

const quitBinding = newBinding({ keys: ["q", "Q", "ctrl+c"] }).withHelp(
  "q",
  "quit",
);

const headerStyle = new Style().bold(true).foreground("#8be9fd");
const helpStyle = new Style().foreground("#6272a4").italic(true);

const columns = [
  { title: "ID", width: 6 },
  { title: "Task", width: 26 },
  { title: "Owner", width: 12 },
  { title: "Status", width: 10 },
];

const rows: string[][] = [
  ["001", "Wire up table model", "Alex", "Done"],
  ["002", "Style header", "Jordan", "In Progress"],
  ["003", "Hook up scrolling", "Casey", "In Review"],
  ["004", "Add selection", "Riley", "Done"],
  ["005", "Write tests", "Sam", "In Progress"],
  ["006", "Update docs", "Jamie", "Todo"],
  ["007", "Polish demo", "Taylor", "Todo"],
];

class DemoModel implements Model<Msg, DemoModel> {
  readonly table: TableModel;

  constructor(table?: TableModel) {
    this.table =
      table ??
      TableModel.new({
        columns,
        rows,
        height: 6,
        // No fixed width - let it auto-size based on column widths
        focused: true,
        bordered: true,
        borderStyle: borderStyles.rounded,
        styles: {
          selected: new Style()
            .background("#282a36")
            .foreground("#f1fa8c")
            .bold(true),
        },
      });
  }

  init(): Cmd<Msg> {
    return null;
  }

  update(msg: Msg): [DemoModel, Cmd<Msg>] {
    if (msg instanceof KeyMsg && matches(msg, quitBinding)) {
      return [this, quit()];
    }

    if (msg instanceof WindowSizeMsg) {
      const nextHeight = Math.max(4, msg.height - 6);
      const resized = this.table.setHeight(nextHeight);
      if (resized !== this.table) {
        return [new DemoModel(resized), null];
      }
      return [this, null];
    }

    const [nextTable, cmd] = this.table.update(msg);
    if (nextTable !== this.table) {
      return [new DemoModel(nextTable), cmd];
    }

    return [this, cmd];
  }

  view(): string {
    const header = headerStyle.render("🧼 Suds Demo — Table");
    const help = helpStyle.render(
      "Move with j/k, f/b, d/u, g/G, PgUp/PgDn • q to quit",
    );
    return [header, "", this.table.view(), "", help, ""].join("\n");
  }
}

async function main(): Promise<void> {
  console.clear();
  const program = new Program(new DemoModel());
  await program.run();
}

main().catch(console.error);



