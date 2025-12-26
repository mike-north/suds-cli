import type { Cmd, Msg } from '@boba-cli/tea'
import type { FileSystemAdapter, PathAdapter } from '@boba-cli/machine'
import { CodeModel } from '@boba-cli/code'
import type { ComponentBuilder } from '../types.js'

/**
 * Options for the code component builder.
 *
 * @remarks
 * Configure the code viewer when creating a code component. The code component
 * displays syntax-highlighted source code with scrolling support.
 *
 * Note: The code component requires filesystem and path adapters to read and
 * display files. These must be provided in the options.
 *
 * @public
 */
export interface CodeBuilderOptions {
  /**
   * Filesystem adapter for file operations.
   *
   * @remarks
   * For Node.js environments, use `NodeFileSystemAdapter` from `@boba-cli/machine/node`.
   * For browser environments, provide a custom implementation or memory-based adapter.
   */
  filesystem: FileSystemAdapter

  /**
   * Path adapter for path operations.
   *
   * @remarks
   * For Node.js environments, use `NodePathAdapter` from `@boba-cli/machine/node`.
   * For browser environments, provide a custom implementation.
   */
  path: PathAdapter

  /**
   * Whether the component is active and receives keyboard input (default: `false`).
   *
   * @remarks
   * When active, the code viewer responds to keyboard navigation (arrow keys,
   * page up/down, etc.) for scrolling through the code.
   */
  active?: boolean

  /**
   * Syntax highlighting theme to use (default: `"dracula"`).
   *
   * @remarks
   * Common themes include `"dracula"`, `"monokai"`, `"github-light"`, `"nord"`.
   * Uses Shiki for syntax highlighting under the hood.
   */
  theme?: string

  /**
   * Width of the code viewer in characters.
   *
   * @remarks
   * If not specified, defaults to 0. Typically you'll want to update this
   * dynamically based on terminal size via the model's `setSize()` method.
   */
  width?: number

  /**
   * Height of the code viewer in lines.
   *
   * @remarks
   * If not specified, defaults to 0. Typically you'll want to update this
   * dynamically based on terminal size via the model's `setSize()` method.
   */
  height?: number
}

/**
 * Create a code viewer component builder.
 *
 * @remarks
 * Creates a `ComponentBuilder` wrapping the `@boba-cli/code` package.
 * The code viewer displays syntax-highlighted source code from files with
 * scrolling support and keyboard navigation.
 *
 * The component requires filesystem and path adapters to read files. You must
 * provide these in the options. After creating the component, use the model's
 * `setFileName()` method to load and display a file.
 *
 * @example
 * Basic usage with Node.js adapters:
 * ```typescript
 * import { NodeFileSystemAdapter, NodePathAdapter } from '@boba-cli/machine/node'
 *
 * const app = createApp()
 *   .component('code', code({
 *     filesystem: new NodeFileSystemAdapter(),
 *     path: new NodePathAdapter(),
 *     active: true,
 *     width: 80,
 *     height: 24,
 *   }))
 *   .view(({ components }) => components.code)
 *   .build()
 * ```
 *
 * @example
 * With custom theme:
 * ```typescript
 * const app = createApp()
 *   .component('viewer', code({
 *     filesystem: new NodeFileSystemAdapter(),
 *     path: new NodePathAdapter(),
 *     theme: 'monokai',
 *     active: true,
 *   }))
 *   .view(({ components }) => vstack(
 *     text('Source Code').bold(),
 *     components.viewer
 *   ))
 *   .build()
 * ```
 *
 * @example
 * Loading a file (typically done in a key handler or init):
 * ```typescript
 * // In the raw TEA model, you would call:
 * const [nextCode, cmd] = codeModel.setFileName('src/example.ts')
 *
 * // Note: The DSL doesn't currently provide direct access to component models
 * // from event handlers, so you may need to manage file loading differently
 * // or use the raw TEA approach for now.
 * ```
 *
 * @param options - Configuration options for the code viewer (requires filesystem and path adapters)
 * @returns A `ComponentBuilder` ready to use with `AppBuilder.component`
 *
 * @public
 */
export function code(options: CodeBuilderOptions): ComponentBuilder<CodeModel> {
  return {
    init(): [CodeModel, Cmd<Msg>] {
      const model = CodeModel.new({
        filesystem: options.filesystem,
        path: options.path,
        active: options.active ?? false,
        syntaxTheme: options.theme ?? 'dracula',
        width: options.width ?? 0,
        height: options.height ?? 0,
      })
      return [model, model.init()]
    },

    update(model: CodeModel, msg: Msg): [CodeModel, Cmd<Msg>] {
      return model.update(msg)
    },

    view(model: CodeModel): string {
      return model.view()
    },
  }
}
