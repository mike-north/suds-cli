/**
 * Boba Demo: Code Viewer
 *
 * Demonstrates \@boba-cli/code with syntax highlighting and scrolling.
 *
 * Controls:
 *   j / ↓      - scroll down 1 line
 *   k / ↑      - scroll up 1 line
 *   f / PgDn   - page down
 *   b / PgUp   - page up
 *   d / ctrl+d - half page down
 *   u / ctrl+u - half page up
 *   g          - go to top
 *   q / esc    - quit
 */

import { Style } from '@boba-cli/chapstick'
import { newBinding, matches } from '@boba-cli/key'
import { CodeModel } from '@boba-cli/code'
import { NodeFileSystemAdapter, NodePathAdapter, createNodePlatform } from '@boba-cli/machine/node'
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

const gotoTopBinding = newBinding({ keys: ['g', 'G'] }).withHelp('g', 'top')

const headerStyle = new Style().bold(true).foreground('#8be9fd')
const helpStyle = new Style().foreground('#6272a4').italic(true)

const filesystem = new NodeFileSystemAdapter()
const path = new NodePathAdapter()

class DemoModel implements Model<Msg, DemoModel> {
  readonly code: CodeModel

  constructor(code?: CodeModel) {
    this.code = code ?? CodeModel.new({ filesystem, path, active: true })
  }

  init(): Cmd<Msg> {
    // Load the current file to display - just return the command
    // The model update will happen in the update handler
    const [, cmd] = this.code.setFileName('code-demo.ts')
    return cmd
  }

  update(msg: Msg): [DemoModel, Cmd<Msg>] {
    if (msg instanceof KeyMsg && matches(msg, quitBinding)) {
      return [this, quit()]
    }

    if (msg instanceof KeyMsg && matches(msg, gotoTopBinding)) {
      const nextCode = this.code.gotoTop()
      return [new DemoModel(nextCode), null]
    }

    // Resize the code viewer when terminal size changes
    if (msg instanceof WindowSizeMsg) {
      const nextCode = this.code.setSize(msg.width, msg.height - 4)
      return [new DemoModel(nextCode), null]
    }

    const [nextCode, cmd] = this.code.update(msg)
    if (nextCode !== this.code) {
      return [new DemoModel(nextCode), cmd]
    }

    return [this, cmd]
  }

  view(): string {
    const header = headerStyle.render('🧼 Boba Demo — Code Viewer')
    const help = helpStyle.render(
      'Scroll with j/k, f/b, d/u, PgUp/PgDn • g=top • q/esc to quit',
    )
    return [header, '', this.code.view(), '', help].join('\n')
  }
}

async function main(): Promise<void> {
  console.clear()
  const program = new Program(new DemoModel(), { platform: createNodePlatform() })
  await program.run()
}

main().catch(console.error)
