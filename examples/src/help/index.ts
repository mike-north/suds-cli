/**
 * Boba Demo: Help
 *
 * Shows how \@boba-cli/help renders short and full help from key bindings.
 *
 * Controls:
 *   k / ↑   - move up
 *   j / ↓   - move down
 *   enter   - select
 *   ?       - toggle full help
 *   q       - quit
 */

import type { PlatformAdapter } from '\@boba-cli/machine'
import {
  Program,
  KeyMsg,
  quit,
  type Cmd,
  type Model,
  type Msg,
} from '\@boba-cli/tea'
import { HelpModel, type KeyMap } from '\@boba-cli/help'
import { newBinding, matches, type Binding } from '\@boba-cli/key'

const items = ['Apples', 'Bananas', 'Cherries', 'Dates', 'Elderberry']

const bindings = {
  up: newBinding({ keys: ['k', 'up'] }).withHelp('k/↑', 'up'),
  down: newBinding({ keys: ['j', 'down'] }).withHelp('j/↓', 'down'),
  select: newBinding({ keys: ['enter'] }).withHelp('enter', 'select'),
  toggleHelp: newBinding({ keys: ['?'] }).withHelp('?', 'toggle help'),
  quit: newBinding({ keys: ['q', 'ctrl+c'] }).withHelp('q', 'quit'),
}

class DemoKeyMap implements KeyMap {
  shortHelp(): Binding[] {
    return [
      bindings.up,
      bindings.down,
      bindings.select,
      bindings.toggleHelp,
      bindings.quit,
    ]
  }

  fullHelp(): Binding[][] {
    return [
      [bindings.up, bindings.down],
      [bindings.select],
      [bindings.toggleHelp, bindings.quit],
    ]
  }
}

const demoKeyMap = new DemoKeyMap()

class HelpDemo implements Model<Msg, HelpDemo> {
  readonly help: HelpModel
  readonly cursor: number
  readonly selected: string | null

  constructor(help?: HelpModel, cursor = 0, selected: string | null = null) {
    this.help = help ?? HelpModel.new({ width: 60 })
    this.cursor = Math.max(0, Math.min(cursor, items.length - 1))
    this.selected = selected
  }

  init(): Cmd<Msg> {
    return null
  }

  update(msg: Msg): [HelpDemo, Cmd<Msg>] {
    if (msg instanceof KeyMsg) {
      if (matches(msg, bindings.quit)) {
        return [this, quit()]
      }

      if (matches(msg, bindings.toggleHelp)) {
        const next = this.help.withShowAll(!this.help.showAll)
        return [new HelpDemo(next, this.cursor), null]
      }

      if (matches(msg, bindings.up)) {
        const nextCursor = Math.max(0, this.cursor - 1)
        return [new HelpDemo(this.help, nextCursor), null]
      }

      if (matches(msg, bindings.down)) {
        const nextCursor = Math.min(items.length - 1, this.cursor + 1)
        return [new HelpDemo(this.help, nextCursor), null]
      }

      if (matches(msg, bindings.select)) {
        const selectedItem = items[this.cursor] ?? null
        return [new HelpDemo(this.help, this.cursor, selectedItem), null]
      }
    }

    return [this, null]
  }

  view(): string {
    const list = items
      .map((item, idx) => {
        const pointer = idx === this.cursor ? '➜' : ' '
        const label = idx === this.cursor ? `[${item}]` : item
        return `${pointer} ${label}`
      })
      .join('\n')

    const helpText = this.help.view(demoKeyMap)
    const status = this.selected
      ? `Selected: ${this.selected}`
      : 'Press enter to select'

    return [
      '🧋 Boba Help Demo',
      '',
      list,
      '',
      helpText,
      '',
      status,
      'Press ? to toggle short/full help',
    ].join('\n')
  }
}

/**
 * Run the help demo with the given platform adapter.
 * @param platform - Platform adapter for terminal I/O
 */
export default async function run(platform: PlatformAdapter): Promise<void> {
  console.clear()
  const program = new Program(new HelpDemo(), { platform })
  await program.run()
}
