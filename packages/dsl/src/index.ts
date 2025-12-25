// App builder
export { createApp, AppBuilder } from './app-builder.js'

// Types
export type {
  App,
  ComponentBuilder,
  ComponentView,
  EventContext,
  KeyHandler,
  LayoutNode,
  TextNode,
  ViewFunction,
  ViewNode,
} from './types.js'

// View DSL
export { text, vstack, hstack, spacer, divider, when, choose, map } from './view/nodes.js'
export { render } from './view/renderer.js'

// Component builders
export { spinner, type SpinnerBuilderOptions } from './components/spinner.js'
export { textInput, type TextInputBuilderOptions } from './components/textinput.js'

// Re-export useful types from dependencies
export { Style } from '@suds-cli/chapstick'
export {
  type Spinner,
  line,
  dot,
  miniDot,
  pulse,
  points,
  moon,
  meter,
  ellipsis,
} from '@suds-cli/spinner'
export {
  type TextInputModel,
  EchoMode,
  CursorMode,
  type ValidateFunc,
} from '@suds-cli/textinput'
