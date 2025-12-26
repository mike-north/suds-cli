/**
 * Boba Demo: Paginator
 *
 * Laptop-friendly bindings to move:
 *   Prev page: u / k / ↑
 *   Next page: d / j / ↓
 *
 * Extra controls:
 *   t        - toggle dots/arabic view
 *   q / Ctrl+C - quit
 */

import {
  Program,
  KeyMsg,
  quit,
  type Cmd,
  type Model,
  type Msg,
} from '@boba-cli/tea'
import { PaginatorModel, PaginatorType } from '@boba-cli/paginator'
import { newBinding, matches } from '@boba-cli/key'
import { createNodePlatform } from '@boba-cli/machine/node'

// Sample data to paginate
const ITEMS = Array.from({ length: 23 }, (_, i) => `Item ${i + 1}`)

const keys = {
  toggleView: newBinding({ keys: ['t', 'T'] }).withHelp('t', 'toggle view'),
  quit: newBinding({ keys: ['q', 'Q', 'ctrl+c'] }).withHelp('q', 'quit'),
}

// Override paginator keymap for laptop-friendly controls
const paginatorKeyMap = {
  prevPage: newBinding({ keys: ['u', 'k', 'up'] }),
  nextPage: newBinding({ keys: ['d', 'j', 'down'] }),
}

class PaginatorDemo implements Model<Msg, PaginatorDemo> {
  readonly paginator: PaginatorModel
  readonly items: string[]

  constructor(paginator?: PaginatorModel, items = ITEMS) {
    const base =
      paginator ??
      PaginatorModel.new({
        perPage: 5,
        keyMap: paginatorKeyMap,
      })
    this.items = items
    // Keep totalPages in sync with item count
    this.paginator = base.setTotalPages(items.length)
  }

  init(): Cmd<Msg> {
    return null
  }

  update(msg: Msg): [PaginatorDemo, Cmd<Msg>] {
    if (msg instanceof KeyMsg) {
      if (matches(msg, keys.quit)) {
        return [this, quit()]
      }

      if (matches(msg, keys.toggleView)) {
        const nextType =
          this.paginator.type === PaginatorType.Dots
            ? PaginatorType.Arabic
            : PaginatorType.Dots
        const nextPaginator = PaginatorModel.new({
          type: nextType,
          page: this.paginator.page,
          perPage: this.paginator.perPage,
          totalPages: this.paginator.totalPages,
          activeDot: this.paginator.activeDot,
          inactiveDot: this.paginator.inactiveDot,
          arabicFormat: this.paginator.arabicFormat,
          keyMap: this.paginator.keyMap,
        }).setTotalPages(this.items.length)

        return [new PaginatorDemo(nextPaginator, this.items), null]
      }
    }

    // Let the paginator handle navigation keys
    const [nextPaginator, cmd] = this.paginator.update(msg)
    if (nextPaginator !== this.paginator) {
      return [
        new PaginatorDemo(
          nextPaginator.setTotalPages(this.items.length),
          this.items,
        ),
        cmd,
      ]
    }

    return [this, cmd]
  }

  view(): string {
    const [start, end] = this.paginator.getSliceBounds(this.items.length)
    const visible = this.items.slice(start, end)

    const header = `🧼 Boba Paginator (${this.paginator.view()})`
    const body = visible
      .map((item, idx) => {
        const lineNum = start + idx + 1
        return `${lineNum.toString().padStart(2, ' ')}. ${item}`
      })
      .join('\n')

    const footer = [
      '',
      'Controls:',
      '  Prev: u / k / ↑',
      '  Next: d / j / ↓',
      '  t: toggle dots/arabic view',
      '  q: quit',
    ].join('\n')

    return [header, '', body, footer].join('\n')
  }
}

async function main() {
  console.clear()
  const program = new Program(new PaginatorDemo(), { platform: createNodePlatform() })
  await program.run()
}

main().catch(console.error)
