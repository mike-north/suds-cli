import { type Cmd, type Msg } from '@boba-cli/tea'
import type { FileSystemAdapter, PathAdapter } from '@boba-cli/machine'
import { FilepickerModel, type FilepickerStyles } from '@boba-cli/filepicker'
import type { ComponentBuilder } from '../types.js'

/**
 * Options for the filepicker component builder.
 *
 * @remarks
 * Configure the file picker's behavior, appearance, and file system access.
 * The filesystem and path adapters are required to interact with the file system.
 *
 * @public
 */
export interface FilepickerBuilderOptions {
  /**
   * FileSystem adapter for file operations.
   *
   * @remarks
   * Required for reading directory contents and file metadata.
   * For Node.js, use `platform.filesystem` from `createNodePlatform()`.
   */
  filesystem: FileSystemAdapter

  /**
   * Path adapter for path operations.
   *
   * @remarks
   * Required for path manipulation (dirname, join, etc.).
   * For Node.js, use `platform.path` from `createNodePlatform()`.
   */
  path: PathAdapter

  /**
   * Initial directory to display (default: current working directory).
   *
   * @remarks
   * If not specified, uses the filesystem adapter's current working directory.
   */
  currentDirectory?: string

  /**
   * Maximum height for the file list (default: 0 = unlimited).
   *
   * @remarks
   * Limits the number of visible files. When 0, all files are displayed.
   */
  height?: number

  /**
   * Show hidden files (default: false).
   *
   * @remarks
   * Hidden files typically start with a dot (.) on Unix-like systems.
   */
  showHidden?: boolean

  /**
   * Filter files by allowed extensions (default: all files).
   *
   * @remarks
   * Provide an array of file extensions (e.g., `['.ts', '.js']`) to filter
   * the file list. Directories are always shown regardless of this setting.
   * Empty array or undefined means no filtering.
   *
   * @example
   * ```typescript
   * allowedExtensions: ['.ts', '.tsx', '.js', '.jsx']
   * ```
   */
  allowedExtensions?: string[]

  /**
   * Style hooks for customizing the file picker appearance.
   *
   * @remarks
   * Partial styles object - any omitted styles will use defaults.
   * Available style hooks:
   * - `directory`: Style for directory names
   * - `file`: Style for file names
   * - `hidden`: Style for hidden files
   * - `selected`: Style for the selected item
   * - `cursor`: Style for the cursor indicator
   * - `status`: Style for the status bar (current directory)
   */
  styles?: Partial<FilepickerStyles>
}

/**
 * Create a filepicker component builder.
 *
 * @remarks
 * Creates a `ComponentBuilder` wrapping the `@boba-cli/filepicker` package.
 * The filepicker allows users to navigate the file system and select files.
 * It requires filesystem and path adapters from the platform.
 *
 * @example
 * Basic usage with Node.js platform:
 * ```typescript
 * import { createNodePlatform } from '@boba-cli/machine/node'
 *
 * const platform = createNodePlatform()
 *
 * const app = createApp()
 *   .component('picker', filepicker({
 *     filesystem: platform.filesystem,
 *     path: platform.path
 *   }))
 *   .view(({ components }) => components.picker)
 *   .build()
 * ```
 *
 * @example
 * With custom directory and file filtering:
 * ```typescript
 * const app = createApp()
 *   .component('picker', filepicker({
 *     filesystem: platform.filesystem,
 *     path: platform.path,
 *     currentDirectory: '/home/user/projects',
 *     allowedExtensions: ['.ts', '.tsx', '.js', '.jsx'],
 *     showHidden: true,
 *     height: 20
 *   }))
 *   .view(({ components }) => vstack(
 *     text('Select a TypeScript file:'),
 *     components.picker
 *   ))
 *   .build()
 * ```
 *
 * @example
 * With custom styling:
 * ```typescript
 * const app = createApp()
 *   .component('picker', filepicker({
 *     filesystem: platform.filesystem,
 *     path: platform.path,
 *     styles: {
 *       directory: new Style().foreground('#50fa7b').bold(true),
 *       file: new Style().foreground('#f8f8f2'),
 *       selected: new Style().background('#44475a').foreground('#ff79c6')
 *     }
 *   }))
 *   .view(({ components }) => components.picker)
 *   .build()
 * ```
 *
 * @param options - Configuration options for the filepicker (filesystem and path are required)
 * @returns A `ComponentBuilder` ready to use with `AppBuilder.component`
 *
 * @public
 */
export function filepicker(
  options: FilepickerBuilderOptions,
): ComponentBuilder<FilepickerModel> {
  return {
    init(): [FilepickerModel, Cmd<Msg>] {
      const [model, cmd] = FilepickerModel.new({
        filesystem: options.filesystem,
        path: options.path,
        currentDir: options.currentDirectory,
        height: options.height,
        showHidden: options.showHidden,
        allowedTypes: options.allowedExtensions,
        styles: options.styles,
      })
      return [model, cmd]
    },

    update(model: FilepickerModel, msg: Msg): [FilepickerModel, Cmd<Msg>] {
      return model.update(msg)
    },

    view(model: FilepickerModel): string {
      return model.view()
    },
  }
}
