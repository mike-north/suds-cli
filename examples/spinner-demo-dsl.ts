/**
 * Suds DSL Demo: Spinner with Styling
 *
 * Demonstrates the \@suds-cli/dsl package for building CLI apps
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

import {
  createApp,
  spinner,
  vstack,
  hstack,
  text,
  Style,
} from '@suds-cli/dsl'

// Styles
const spinnerStyle = new Style().foreground('#50fa7b')

// Build and run the app
const app = createApp()
  .state({ message: 'Loading something amazing...' })
  .component('loading', spinner({ style: spinnerStyle }))
  .onKey(['q', 'Q', 'ctrl+c'], (ctx) => { ctx.quit() })
  .view(({ state, components }) =>
    vstack(
      text(''),
      text('🧼 Suds DSL Demo').bold().foreground('#ff79c6'),
      text(''),
      hstack(components.loading, text('  ' + state.message).foreground('#f8f8f2')),
      text(''),
      text('Press [q] to quit').dim().italic(),
      text(''),
    ),
  )
  .build()

async function main() {
  console.clear()
  await app.run()
}

main().catch(console.error)
