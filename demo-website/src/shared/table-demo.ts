/**
 * Table Demo - Shared Model
 *
 * Controls:
 *   j/k    - Move up/down
 *   f/b    - Page down/up
 *   g/G    - Go to top/bottom
 *   q      - Quit
 */

import {
  KeyMsg,
  WindowSizeMsg,
  quit,
  type Cmd,
  type Model,
  type Msg,
} from '@suds-cli/tea'
import { TableModel } from '@suds-cli/table'
import { borderStyles } from '@suds-cli/chapstick'
import { newBinding, matches } from '@suds-cli/key'
import { createStyle } from '../browser-style'

const quitBinding = newBinding({ keys: ['q', 'Q', 'ctrl+c'] }).withHelp('q', 'quit')

const headerStyle = createStyle().bold(true).foreground('#f5c2e7')
const helpStyle = createStyle().foreground('#6c7086').italic(true)

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
  ['008', 'Performance tuning', 'Morgan', 'Todo'],
  ['009', 'Add animations', 'Drew', 'In Progress'],
  ['010', 'Code review', 'Quinn', 'Done'],
]

export class TableDemoModel implements Model<Msg, TableDemoModel> {
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
          selected: createStyle()
            .background('#45475a')
            .foreground('#a6e3a1')
            .bold(true),
          header: createStyle()
            .foreground('#cdd6f4')
            .bold(true),
          cell: createStyle().foreground('#bac2de'),
          border: createStyle().foreground('#585b70'),
        },
      })
  }

  init(): Cmd<Msg> {
    return null
  }

  update(msg: Msg): [TableDemoModel, Cmd<Msg>] {
    if (msg instanceof KeyMsg && matches(msg, quitBinding)) {
      return [this, quit()]
    }

    if (msg instanceof WindowSizeMsg) {
      const nextHeight = Math.max(4, msg.height - 6)
      const resized = this.table.setHeight(nextHeight)
      if (resized !== this.table) {
        return [new TableDemoModel(resized), null]
      }
      return [this, null]
    }

    const [nextTable, cmd] = this.table.update(msg)
    if (nextTable !== this.table) {
      return [new TableDemoModel(nextTable), cmd]
    }

    return [this, cmd]
  }

  view(): string {
    const header = headerStyle.render('Suds Table Demo')
    const help = helpStyle.render(
      'Move: j/k, f/b, g/G, PgUp/PgDn | [q] quit',
    )
    return [header, '', this.table.view(), '', help, ''].join('\n')
  }
}
