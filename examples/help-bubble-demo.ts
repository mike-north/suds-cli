/**
 * Suds Demo: Help Bubble
 *
 * Shows a scrollable help bubble component matching the teacup help example.
 *
 * Controls:
 *   j / ↓      - scroll down
 *   k / ↑      - scroll up
 *   f / PgDn   - page down
 *   b / PgUp   - page up
 *   d / ctrl+d - half page down
 *   u / ctrl+u - half page up
 *   q / ctrl+c / esc - quit
 */

import {
  Program,
  KeyMsg,
  WindowSizeMsg,
  quit,
  type Cmd,
  type Model,
  type Msg,
} from '@suds-cli/tea'
import { HelpBubble, type Entry } from '@suds-cli/help'
import { matches, newBinding } from '@suds-cli/key'

const quitBinding = newBinding({ keys: ['q', 'ctrl+c', 'esc'] })

class HelpBubbleDemo implements Model<Msg, HelpBubbleDemo> {
  readonly help: HelpBubble

  constructor(help?: HelpBubble) {
    const entries: Entry[] = [
      { key: 'ctrl+c', description: 'Exit FM' },
      { key: 'j/up', description: 'Move up' },
      { key: 'k/down', description: 'Move down' },
      { key: 'h/left', description: 'Go back a directory' },
      { key: 'l/right', description: 'Read file or enter directory' },
      { key: 'p', description: 'Preview directory' },
      { key: 'G', description: 'Jump to bottom' },
      { key: '~', description: 'Go to home directory' },
      { key: '.', description: 'Toggle hidden files' },
      { key: 'y', description: 'Copy file path to clipboard' },
      { key: 'Z', description: 'Zip currently selected tree item' },
      { key: 'U', description: 'Unzip currently selected tree item' },
      { key: 'n', description: 'Create new file' },
      { key: 'N', description: 'Create new directory' },
      { key: 'ctrl+d', description: 'Delete currently selected tree item' },
      { key: 'M', description: 'Move currently selected tree item' },
      { key: 'enter', description: 'Process command' },
      { key: 'E', description: 'Edit currently selected tree item' },
      { key: 'C', description: 'Copy currently selected tree item' },
      { key: 'esc', description: 'Reset FM to initial state' },
      { key: 'tab', description: 'Toggle between boxes' },
    ]

    this.help =
      help ??
      HelpBubble.new(
        true,
        'Help',
        {
          background: { light: '62', dark: '62' },
          foreground: { light: '#ffffff', dark: '#ffffff' },
        },
        entries,
      )
  }

  init(): Cmd<Msg> {
    return null
  }

  update(msg: Msg): [HelpBubbleDemo, Cmd<Msg>] {
    if (msg instanceof WindowSizeMsg) {
      const nextHelp = this.help.setSize(msg.width, msg.height)
      return [new HelpBubbleDemo(nextHelp), null]
    }

    if (msg instanceof KeyMsg) {
      if (matches(msg, quitBinding)) {
        return [this, quit()]
      }
    }

    const [nextHelp, cmd] = this.help.update(msg)
    if (nextHelp !== this.help) {
      return [new HelpBubbleDemo(nextHelp), cmd]
    }

    return [this, cmd]
  }

  view(): string {
    return this.help.view()
  }
}

async function main() {
  console.clear()
  const program = new Program(new HelpBubbleDemo())
  await program.run()
}

main().catch(console.error)
