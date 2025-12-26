/**
 * Boba Demo: Table
 *
 * Demonstrates \@boba-cli/table with scrolling and selection.
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

import { Style, borderStyles } from '@boba-cli/chapstick'
import { newBinding, matches } from '@boba-cli/key'
import { TableModel } from '@boba-cli/table'
import {
  KeyMsg,
  Program,
  WindowSizeMsg,
  quit,
  type Cmd,
  type Model,
  type Msg,
} from '@boba-cli/tea'
import { createNodePlatform } from '@boba-cli/machine/node'

const quitBinding = newBinding({ keys: ['q', 'Q', 'ctrl+c'] }).withHelp(
  'q',
  'quit',
)

// Catppuccin Mocha compatible colors
const headerStyle = new Style().bold(true).foreground('#f5c2e7') // pink
const helpStyle = new Style().foreground('#6c7086').italic(true) // overlay0

const columns = [
  { title: 'ID', width: 6 },
  { title: 'Task', width: 26 },
  { title: 'Owner', width: 12 },
  { title: 'Status', width: 10 },
]

const rows: string[][] = [
  ['001', 'Wire up table model', 'Alex', 'Done'],
  ['002', 'Style header', 'Jordan', 'In Progress'],
  ['003', 'Hook up scrolling', 'Casey', 'In Review'],
  ['004', 'Add selection', 'Riley', 'Done'],
  ['005', 'Write tests', 'Sam', 'In Progress'],
  ['006', 'Update docs', 'Jamie', 'Todo'],
  ['007', 'Polish demo', 'Taylor', 'Todo'],
]

class DemoModel implements Model<Msg, DemoModel> {
  readonly table: TableModel

  constructor(table?: TableModel) {
    this.table =
      table ??
      TableModel.new({
        columns,
        rows,
        height: 6,
        focused: true,
        bordered: true,
        borderStyle: borderStyles.rounded,
        styles: {
          selected: new Style()
            .background('#45475a') // surface1
            .foreground('#a6e3a1') // green
            .bold(true),
          header: new Style()
            .foreground('#cdd6f4') // text
            .bold(true),
          cell: new Style().foreground('#bac2de'), // subtext1
          border: new Style().foreground('#585b70'), // surface2
        },
      })
  }

  init(): Cmd<Msg> {
    return null
  }

  update(msg: Msg): [DemoModel, Cmd<Msg>] {
    if (msg instanceof KeyMsg && matches(msg, quitBinding)) {
      return [this, quit()]
    }

    if (msg instanceof WindowSizeMsg) {
      const nextHeight = Math.max(4, msg.height - 6)
      const resized = this.table.setHeight(nextHeight)
      if (resized !== this.table) {
        return [new DemoModel(resized), null]
      }
      return [this, null]
    }

    const [nextTable, cmd] = this.table.update(msg)
    if (nextTable !== this.table) {
      return [new DemoModel(nextTable), cmd]
    }

    return [this, cmd]
  }

  view(): string {
    const header = headerStyle.render('🧼 Boba Demo — Table')
    const help = helpStyle.render(
      'Move with j/k, f/b, d/u, g/G, PgUp/PgDn • q to quit',
    )
    return [header, '', this.table.view(), '', help, ''].join('\n')
  }
}

async function main(): Promise<void> {
  console.clear()
  const program = new Program(new DemoModel(), { platform: createNodePlatform() })
  await program.run()
}

main().catch(console.error)
