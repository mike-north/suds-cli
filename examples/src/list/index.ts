/**
 * Boba Demo: List
 *
 * Demonstrates \@boba-cli/list with filtering, pagination, and help.
 *
 * Controls (built into the list keymap):
 *   j / k / arrows  - move selection
 *   /               - start filtering
 *   enter           - accept filter
 *   esc             - clear filter / quit filtering
 *   pgup / pgdn     - paginate
 *   g / G           - go to top / bottom
 *   ?               - toggle full help
 *   q               - quit
 */

import type { PlatformAdapter } from '\@boba-cli/machine'
import { Style } from '\@boba-cli/chapstick'
import { DefaultItem, ListModel } from '\@boba-cli/list'
import { newBinding, matches } from '\@boba-cli/key'
import {
  KeyMsg,
  Program,
  WindowSizeMsg,
  quit,
  type Cmd,
  type Model,
  type Msg,
} from '\@boba-cli/tea'

const quitBinding = newBinding({ keys: ['q', 'Q', 'ctrl+c'] }).withHelp(
  'q',
  'quit',
)

const headerStyle = new Style().bold(true).foreground('#8be9fd')
const helpStyle = new Style().foreground('#6272a4').italic(true)

const items = [
  new DefaultItem('Wire UI', 'Connect list view to data'),
  new DefaultItem('Add filter', 'Enable fuzzy search'),
  new DefaultItem('Hook paginator', 'Slice visible items'),
  new DefaultItem('Style delegates', 'Custom item renderers'),
  new DefaultItem('Write tests', 'Filter, paging, selection'),
  new DefaultItem('Docs', 'Usage and API reference'),
  new DefaultItem('Polish demo', 'Make it look nice'),
]

class DemoModel implements Model<Msg, DemoModel> {
  readonly list: ListModel<DefaultItem>

  constructor(list?: ListModel<DefaultItem>) {
    this.list =
      list ??
      ListModel.new({
        items,
        title: 'Backlog',
        height: 12,
        showFilter: true,
        showPagination: true,
        showHelp: true,
      })
  }

  init(): Cmd<Msg> {
    return this.list.init()
  }

  update(msg: Msg): [DemoModel, Cmd<Msg>] {
    if (msg instanceof KeyMsg && matches(msg, quitBinding)) {
      return [this, quit()]
    }

    if (msg instanceof WindowSizeMsg) {
      const next = this.list
        .setWidth(msg.width)
        .setHeight(Math.max(8, msg.height - 6))
      if (next !== this.list) {
        return [new DemoModel(next), null]
      }
    }

    const [nextList, cmd] = this.list.update(msg)
    if (nextList !== this.list) {
      return [new DemoModel(nextList), cmd]
    }
    return [this, cmd]
  }

  view(): string {
    const header = headerStyle.render('🧋 Boba Demo — List')
    const help = helpStyle.render("Try '/', pgup/pgdn, ?, and q to quit.")
    return [header, '', this.list.view(), '', help, ''].join('\n')
  }
}

/**
 * Run the list demo with the given platform adapter.
 * @param platform - Platform adapter for terminal I/O
 */
export default async function run(platform: PlatformAdapter): Promise<void> {
  console.clear()
  const program = new Program(new DemoModel(), { platform })
  await program.run()
}
