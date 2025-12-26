/**
 * Boba Demo: Statusbar
 *
 * Demonstrates \@boba-cli/tea, \@boba-cli/statusbar, \@boba-cli/chapstick, and \@boba-cli/key.
 *
 * Controls:
 *   q      - Quit
 *   Ctrl+C - Quit
 *   esc    - Quit
 */

import type { PlatformAdapter } from '\@boba-cli/machine'
import {
  Program,
  KeyMsg,
  WindowSizeMsg,
  quit,
  type Cmd,
  type Model,
  type Msg,
} from '\@boba-cli/tea'
import { StatusbarModel, Height } from '\@boba-cli/statusbar'
import { Style, joinVertical } from '\@boba-cli/chapstick'
import { newBinding, matches } from '\@boba-cli/key'

// Keybindings
const keys = {
  quit: newBinding({ keys: ['q', 'Q', 'ctrl+c', 'esc'] }).withHelp('q', 'quit'),
}

// Demo model
class DemoModel implements Model<Msg, DemoModel> {
  constructor(
    readonly statusbar: StatusbarModel = StatusbarModel.new(
      {
        foreground: { dark: '#ffffff', light: '#ffffff' },
        background: { light: '#F25D94', dark: '#F25D94' },
      }, // Pink
      {
        foreground: { light: '#ffffff', dark: '#ffffff' },
        background: { light: '#3c3836', dark: '#3c3836' },
      }, // Gray
      {
        foreground: { light: '#ffffff', dark: '#ffffff' },
        background: { light: '#A550DF', dark: '#A550DF' },
      }, // Purple
      {
        foreground: { light: '#ffffff', dark: '#ffffff' },
        background: { light: '#6124DF', dark: '#6124DF' },
      }, // Indigo
    ),
    readonly height: number = 0,
  ) {}

  init(): Cmd<Msg> {
    return null
  }

  update(msg: Msg): [DemoModel, Cmd<Msg>] {
    // Handle window resize
    if (msg instanceof WindowSizeMsg) {
      const updatedStatusbar = this.statusbar
        .setSize(msg.width)
        .setContent('test.txt', '~/.config/nvim', '1/23', 'SB')
      return [new DemoModel(updatedStatusbar, msg.height), null]
    }

    // Handle key events
    if (msg instanceof KeyMsg) {
      if (matches(msg, keys.quit)) {
        return [this, quit()]
      }
    }

    return [this, null]
  }

  view(): string {
    const contentStyle = new Style().height(Math.max(0, this.height - Height))
    const content = contentStyle.render('Content')

    return joinVertical(content, this.statusbar.view())
  }
}

/**
 * Run the statusbar demo with the given platform adapter.
 * @param platform - Platform adapter for terminal I/O
 */
export default async function run(platform: PlatformAdapter): Promise<void> {
  console.clear()
  const program = new Program(new DemoModel(), { altScreen: true, platform })
  await program.run()
}
