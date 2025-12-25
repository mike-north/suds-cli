/**
 * Boba Demo: Markdown Viewer
 *
 * Demonstrates \@boba-cli/markdown with file rendering and scrolling.
 *
 * Controls:
 *   j / ↓      - scroll down 1 line
 *   k / ↑      - scroll up 1 line
 *   f / PgDn   - page down
 *   b / PgUp   - page up
 *   d / ctrl+d - half page down
 *   u / ctrl+u - half page up
 *   mouse wheel - scroll
 *   q / ctrl+c / esc - quit
 */

import { Style } from '@boba-cli/chapstick'
import { newBinding, matches } from '@boba-cli/key'
import { MarkdownModel } from '@boba-cli/markdown'
import { NodeFileSystemAdapter, createNodePlatform } from '@boba-cli/machine/node'
import {
  KeyMsg,
  Program,
  WindowSizeMsg,
  quit,
  type Cmd,
  type Model,
  type Msg,
} from '@boba-cli/tea'

const quitBinding = newBinding({ keys: ['q', 'Q', 'ctrl+c', 'esc'] }).withHelp(
  'q',
  'quit',
)

const headerStyle = new Style().bold(true).foreground('#8be9fd')
const helpStyle = new Style().foreground('#6272a4').italic(true)
const viewportStyle = new Style()
  .border(true)
  .borderForeground('#bd93f9')
  .padding(0, 1)

const filesystem = new NodeFileSystemAdapter()

class DemoModel implements Model<Msg, DemoModel> {
  readonly markdown: MarkdownModel

  constructor(markdown?: MarkdownModel) {
    this.markdown =
      markdown ??
      MarkdownModel.new({
        filesystem,
        active: true,
        width: 72,
        height: 16,
        style: viewportStyle,
      })
  }

  init(): Cmd<Msg> {
    // Load the README.md file from the repository root
    const readmePath = new URL('../README.md', import.meta.url).pathname
    const [, cmd] = this.markdown.setFileName(readmePath)
    // Note: The updated model with filename set will be applied when
    // the command resolves and RenderMarkdownMsg is received in update()
    return cmd
  }

  update(msg: Msg): [DemoModel, Cmd<Msg>] {
    if (msg instanceof KeyMsg && matches(msg, quitBinding)) {
      return [this, quit()]
    }

    // Resize the viewport when terminal size changes
    if (msg instanceof WindowSizeMsg) {
      const [nextMarkdown, cmd] = this.markdown.setSize(
        Math.max(20, msg.width - 8),
        Math.max(6, msg.height - 6),
      )
      if (nextMarkdown !== this.markdown) {
        return [new DemoModel(nextMarkdown), cmd]
      }
      return [this, null]
    }

    const [nextMarkdown, cmd] = this.markdown.update(msg)
    if (nextMarkdown !== this.markdown) {
      return [new DemoModel(nextMarkdown), cmd]
    }

    return [this, cmd]
  }

  view(): string {
    const header = headerStyle.render('🧼 Boba Demo — Markdown Viewer')
    const help = helpStyle.render(
      'Scroll with j/k, f/b, d/u, PgUp/PgDn, mouse wheel • q to quit',
    )
    return [header, '', this.markdown.view(), '', help, ''].join('\n')
  }
}

async function main(): Promise<void> {
  console.clear()
  const program = new Program(new DemoModel(), { platform: createNodePlatform() })
  await program.run()
}

main().catch(console.error)
