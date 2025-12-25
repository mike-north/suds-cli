/**
 * Boba Demo: Scrollable Viewport
 *
 * Demonstrates \@boba/viewport with keyboard and mouse scrolling.
 *
 * Controls:
 *   j / ↓      - scroll down 1 line
 *   k / ↑      - scroll up 1 line
 *   f / PgDn   - page down
 *   b / PgUp   - page up
 *   d / ctrl+d - half page down
 *   u / ctrl+u - half page up
 *   mouse wheel - scroll
 *   q          - quit
 */

import { Style } from '@boba-cli/chapstick'
import { newBinding, matches } from '@boba-cli/key'
import { ViewportModel } from '@boba-cli/viewport'
import {
  KeyMsg,
  Program,
  WindowSizeMsg,
  quit,
  type Cmd,
  type Model,
  type Msg,
} from '@boba-cli/tea'
import { createNodePlatform } from '@boba-cli/machine/node'

const quitBinding = newBinding({ keys: ['q', 'Q', 'ctrl+c'] }).withHelp(
  'q',
  'quit',
)

const headerStyle = new Style().bold(true).foreground('#8be9fd')
const helpStyle = new Style().foreground('#6272a4').italic(true)
const viewportStyle = new Style()
  .border(true)
  .borderForeground('#bd93f9')
  .padding(0, 1)

// Some long text to scroll through
const CONTENT = `
Boba Viewport Demo

This example shows a scrollable text
area using the @boba-cli/viewport
package. Use the provided keybindings
or your mouse wheel to move through
the content.

The viewport model exposes simple
methods for scrolling:
- lineUp / lineDown
- halfViewUp / halfViewDown
- viewUp / viewDown
- gotoLine

It also emits ScrollMsg for observers
when the offset changes, and SyncMsg
for renderers that need the visible
slice.

Lorem ipsum dolor sit amet,
consectetur adipiscing elit.
Phasellus hendrerit magna in
consequat gravida. Curabitur tempus,
arcu sit amet porttitor mattis, ipsum
arcu ullamcorper lacus, sed tristique
mauris lorem non ipsum.

Vivamus sit amet convallis dui. Morbi
leo nulla, pulvinar sed finibus non,
elementum vitae massa. Praesent
pharetra, elit ac facilisis luctus,
arcu elit viverra libero, quis
vulputate dui tellus sed metus.
Vestibulum ante ipsum primis in
faucibus orci luctus et ultrices
posuere cubilia curae; Maecenas
volutpat tellus leo, a suscipit massa
placerat eu.

Suspendisse potenti. Integer ut
cursus erat. Integer condimentum sed
neque ut fringilla. In pharetra nisl
mi, nec faucibus arcu mollis sit
amet. Sed in facilisis ex. Integer
condimentum placerat nulla sed
volutpat. Nulla hendrerit mauris
felis, eu mollis ligula hendrerit
eget. Donec eget sapien euismod,
congue felis at, commodo nulla. Etiam
ac arcu vitae justo tristique
finibus.

Ut sed laoreet mi. Nullam vitae
placerat eros. Suspendisse a commodo
nibh, ac varius metus. Phasellus
finibus blandit ligula, sit amet
tristique leo porta at. Nullam
venenatis, eros non gravida
dignissim, nunc velit feugiat nibh,
vitae cursus justo lacus eget metus.
Mauris in diam non risus fermentum
pharetra in sit amet tellus.
`.trim()

class DemoModel implements Model<Msg, DemoModel> {
  readonly viewport: ViewportModel

  constructor(viewport?: ViewportModel) {
    this.viewport =
      viewport ??
      ViewportModel.new({
        width: 72,
        height: 16,
        style: viewportStyle,
      }).setContent(CONTENT)
  }

  init(): Cmd<Msg> {
    return null
  }

  update(msg: Msg): [DemoModel, Cmd<Msg>] {
    if (msg instanceof KeyMsg && matches(msg, quitBinding)) {
      return [this, quit()]
    }

    // Resize the viewport when terminal size changes
    if (msg instanceof WindowSizeMsg) {
      const nextViewport = this.viewport
        .setWidth(Math.max(20, msg.width - 8))
        .setHeight(Math.max(6, msg.height - 6))
      if (nextViewport !== this.viewport) {
        return [new DemoModel(nextViewport), null]
      }
      return [this, null]
    }

    const [nextViewport, cmd] = this.viewport.update(msg)
    if (nextViewport !== this.viewport) {
      return [new DemoModel(nextViewport), cmd]
    }

    return [this, cmd]
  }

  view(): string {
    const header = headerStyle.render('🧼 Boba Demo — Viewport')
    const help = helpStyle.render(
      'Scroll with j/k, f/b, d/u, PgUp/PgDn, mouse wheel • q to quit',
    )
    return [header, '', this.viewport.view(), '', help, ''].join('\n')
  }
}

async function main(): Promise<void> {
  console.clear()
  const program = new Program(new DemoModel(), { platform: createNodePlatform() })
  await program.run()
}

main().catch(console.error)
