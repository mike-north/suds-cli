/**
 * Suds DSL Demo: Text Input
 *
 * Demonstrates the \@suds-cli/dsl package with text input validation.
 *
 * Compare this to textinput-demo.ts to see the reduction in boilerplate:
 * - Original: 128 lines with class, manual state management, complex update logic
 * - DSL version: ~45 lines with declarative API
 *
 * Note: This demo shows a simpler, more declarative approach. The DSL handles
 * the text input state internally - we just display the rendered component.
 *
 * Controls:
 *   type to edit
 *   ctrl+v to paste
 *   ctrl+c or q to quit
 */

import {
  createApp,
  textInput,
  vstack,
  text,
  Style,
  EchoMode,
  type ValidateFunc,
} from '@suds-cli/dsl'

// Styles
const titleStyle = new Style().bold(true).foreground('#00d7ff')
const labelStyle = new Style().foreground('#c792ea')
const placeholderStyle = new Style().foreground('#5c6773').italic(true)
const promptStyle = new Style().foreground('#6ee7b7').bold(true)
const textStyle = new Style().foreground('#e0def4')

// Validation function
const validateName: ValidateFunc = (value) => {
  if (value.trim().length < 3) {
    return new Error('Name must be at least 3 characters')
  }
  return null
}

// Build and run the app
const app = createApp()
  .component(
    'nameInput',
    textInput({
      placeholder: 'Type your name…',
      width: 40,
      echoMode: EchoMode.Normal,
      charLimit: 100,
      prompt: '> ',
      promptStyle,
      textStyle,
      placeholderStyle,
      validate: validateName,
    }),
  )
  .onKey(['q', 'Q', 'ctrl+c'], (ctx) => {
    ctx.quit()
  })
  .view(({ components }) =>
    vstack(
      titleStyle.render('🧼 Suds DSL Text Input Demo'),
      text(''),
      labelStyle.render('Name:'),
      components.nameInput,
      text(''),
      text('Controls: type to edit • ctrl+v to paste • q/ctrl+c to quit').dim(),
      text(''),
    ),
  )
  .build()

async function main() {
  console.clear()
  await app.run()
}

main().catch(console.error)
