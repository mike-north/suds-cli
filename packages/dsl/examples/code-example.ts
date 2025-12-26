/**
 * Example: Code Viewer Component with DSL
 *
 * This example demonstrates how to use the code() component builder to create
 * a syntax-highlighted code viewer with the DSL API.
 */

import { createApp, code, text, vstack } from '../src/index.js'
import { NodeFileSystemAdapter, NodePathAdapter } from '@boba-cli/machine/node'

// Create the app with a code viewer component
const app = createApp()
  .component('codeViewer', code({
    filesystem: new NodeFileSystemAdapter(),
    path: new NodePathAdapter(),
    active: true,
    theme: 'dracula',
    width: 80,
    height: 20,
  }))
  .onKey('q', ({ quit }) => quit())
  .view(({ components }) => vstack(
    text('Code Viewer Example').bold(),
    text('Press q to quit').dim(),
    text(''),
    components.codeViewer
  ))
  .build()

// Note: To actually load and display a file, you would need to access the
// underlying CodeModel and call setFileName(). The DSL doesn't currently
// provide direct access to component models from event handlers, so you
// would need to use the raw TEA approach or extend the DSL API.

export default app
