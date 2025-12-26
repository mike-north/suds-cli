/**
 * Boba Demo: Help Bubble
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

import type { PlatformAdapter } from '\@boba-cli/machine'
import { Style } from '\@boba-cli/chapstick'
import {
  Program,
  KeyMsg,
  WindowSizeMsg,
  quit,
  type Cmd,
  type Model,
  type Msg,
} from '\@boba-cli/tea'
import { HelpBubble, type Entry } from '\@boba-cli/help'
import { matches, newBinding } from '\@boba-cli/key'

const quitBinding = newBinding({ keys: ['q', 'ctrl+c', 'esc'] })

const headerStyle = new Style().bold(true).foreground('#ff79c6')
const helpStyle = new Style().foreground('#6272a4').italic(true)

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
      // Constrain height to show scrolling feature (show ~10 entries at a time)
      const constrainedHeight = Math.min(msg.height, 12)
      const nextHelp = this.help.setSize(msg.width, constrainedHeight)
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
    const header = headerStyle.render('🧋 Boba Demo — Help Bubble')
    const help = helpStyle.render('Scroll with j/k • q/esc to quit')
    return [header, '', this.help.view(), '', help].join('\n')
  }
}

/**
 * Run the help bubble demo with the given platform adapter.
 * @param platform - Platform adapter for terminal I/O
 */
export default async function run(platform: PlatformAdapter): Promise<void> {
  console.clear()
  const program = new Program(new HelpBubbleDemo(), { platform })
  await program.run()
}
