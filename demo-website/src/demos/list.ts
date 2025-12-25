import type { Terminal } from '@xterm/xterm'
import { createBrowserPlatform } from '@boba-cli/machine/browser'
import { DefaultItem, ListModel } from '@boba-cli/list'
import { newBinding, matches } from '@boba-cli/key'
import {
  KeyMsg,
  Program,
  WindowSizeMsg,
  quit,
  type Cmd,
  type Model,
  type Msg,
} from '@boba-cli/tea'
import { createStyle } from '../browser-style'

const quitBinding = newBinding({ keys: ['q', 'Q', 'ctrl+c'] }).withHelp(
  'q',
  'quit',
)

// Styles with browser color support
const headerStyle = createStyle().bold(true).foreground('#8be9fd')
const helpStyle = createStyle().foreground('#6272a4').italic(true)

const items = [
  new DefaultItem('Wire UI', 'Connect list view to data'),
  new DefaultItem('Add filter', 'Enable fuzzy search'),
  new DefaultItem('Hook paginator', 'Slice visible items'),
  new DefaultItem('Style delegates', 'Custom item renderers'),
  new DefaultItem('Write tests', 'Filter, paging, selection'),
  new DefaultItem('Docs', 'Usage and API reference'),
  new DefaultItem('Polish demo', 'Make it look nice'),
  new DefaultItem('Release v1.0', 'Publish to npm'),
  new DefaultItem('Add examples', 'Create usage examples'),
  new DefaultItem('Performance', 'Optimize rendering'),
]

class ListDemoModel implements Model<Msg, ListDemoModel> {
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

  update(msg: Msg): [ListDemoModel, Cmd<Msg>] {
    if (msg instanceof KeyMsg && matches(msg, quitBinding)) {
      return [this, quit()]
    }

    if (msg instanceof WindowSizeMsg) {
      const next = this.list
        .setWidth(msg.width)
        .setHeight(Math.max(8, msg.height - 6))
      if (next !== this.list) {
        return [new ListDemoModel(next), null]
      }
    }

    const [nextList, cmd] = this.list.update(msg)
    if (nextList !== this.list) {
      return [new ListDemoModel(nextList), cmd]
    }
    return [this, cmd]
  }

  view(): string {
    const header = headerStyle.render('Boba Demo - List')
    const help = helpStyle.render("Try '/', pgup/pgdn, ?, and q to quit.")
    return [header, '', this.list.view(), '', help, ''].join('\n')
  }
}

export function createListDemo(terminal: Terminal): { stop: () => void } {
  const platform = createBrowserPlatform({ terminal })
  const program = new Program(new ListDemoModel(), { platform })

  program.run().catch(console.error)

  return {
    stop: () => {
      program.kill()
    },
  }
}
