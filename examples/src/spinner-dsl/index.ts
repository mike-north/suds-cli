/**
 * Boba DSL Demo: Spinner with Styling
 *
 * Demonstrates the \@boba-cli/dsl package for building CLI apps
 * with minimal ceremony.
 *
 * Compare this to spinner-demo.ts to see the reduction in boilerplate:
 * - Original: 147 lines with class, manual state management, instanceof checks
 * - DSL version: ~35 lines with declarative API
 *
 * Controls:
 *   q     - Quit
 *   Ctrl+C - Quit
 */

import type { PlatformAdapter } from '\@boba-cli/machine'
import { createApp, spinner, vstack, hstack, text, Style } from '\@boba-cli/dsl'
import { makeDemoHeader } from '../constants.js'
// Styles
const spinnerStyle = new Style().foreground('#50fa7b')

// Build the app
const app = createApp()
  .state({ message: 'Loading something amazing...' })
  .component('loading', spinner({ style: spinnerStyle }))
  .onKey(['q', 'Q', 'ctrl+c'], (ctx) => {
    ctx.quit()
  })
  .view(({ state, components }) =>
    vstack(
      text(''),
      makeDemoHeader('DSL'),
      text(''),
      hstack(
        components.loading,
        text('  ' + state.message).foreground('#f8f8f2'),
      ),
      text(''),
      text('Press [q] to quit').dim().italic(),
      text(''),
    ),
  )
  .build()

/**
 * Run the spinner DSL demo with the given platform adapter.
 * @param platform - Platform adapter for terminal I/O
 */
export default async function run(platform: PlatformAdapter): Promise<void> {
  console.clear()
  await app.run({ platform })
}
