import type { Cmd, Msg } from '@boba-cli/tea'
import {
  FiletreeModel,
  type FiletreeKeyMap,
  type FiletreeStyles,
} from '@boba-cli/filetree'
import type { FileSystemAdapter, PathAdapter } from '@boba-cli/machine'
import type { ComponentBuilder } from '../types.js'

/**
 * Options for the filetree component builder.
 *
 * @remarks
 * Configure the filetree component with directory items, styling, and behavior
 * when creating a filetree component.
 *
 * @public
 */
export interface FiletreeBuilderOptions {
  /**
   * Filesystem adapter for file operations (required).
   *
   * @remarks
   * Provides filesystem operations like reading directories and checking file stats.
   * Use the adapter from `@boba-cli/machine`.
   */
  filesystem: FileSystemAdapter
  /**
   * Path adapter for path operations (required).
   *
   * @remarks
   * Provides path manipulation utilities like join, resolve, and basename.
   * Use the adapter from `@boba-cli/machine`.
   */
  path: PathAdapter
  /**
   * Initial directory to display.
   *
   * @remarks
   * If not provided, defaults to the current working directory from the filesystem adapter.
   */
  currentDirectory?: string
  /**
   * Whether to show hidden files (default: false).
   */
  showHidden?: boolean
  /**
   * Height of the filetree component in lines.
   *
   * @remarks
   * Controls the viewport size for scrolling. If not provided, defaults to 24.
   */
  height?: number
  /**
   * Width of the filetree component in characters.
   *
   * @remarks
   * Used for text wrapping and rendering. If not provided, defaults to 80.
   */
  width?: number
  /**
   * Custom styles for the filetree components.
   *
   * @remarks
   * Uses `Style` from `@boba-cli/chapstick` to apply terminal colors and formatting.
   * Partial styles are merged with defaults.
   */
  styles?: Partial<FiletreeStyles>
  /**
   * Custom key mappings for filetree navigation.
   *
   * @remarks
   * Provides control over which keys trigger navigation actions like moving up/down.
   * If not provided, uses default key bindings.
   */
  keyMap?: FiletreeKeyMap
}

/**
 * Create a filetree component builder.
 *
 * @remarks
 * Creates a `ComponentBuilder` wrapping the `@boba-cli/filetree` package.
 * The filetree provides keyboard navigation through directory listings with
 * scrolling viewport support.
 *
 * @example
 * Basic usage:
 * ```typescript
 * import { filetree } from '@boba-cli/dsl'
 * import { filesystem, path } from '@boba-cli/machine'
 *
 * const app = createApp()
 *   .component('files', filetree({
 *     filesystem,
 *     path,
 *   }))
 *   .view(({ components }) => components.files)
 *   .build()
 * ```
 *
 * @example
 * With custom styling and directory:
 * ```typescript
 * import { filetree } from '@boba-cli/dsl'
 * import { filesystem, path } from '@boba-cli/machine'
 * import { Style } from '@boba-cli/chapstick'
 *
 * const app = createApp()
 *   .component('files', filetree({
 *     filesystem,
 *     path,
 *     currentDirectory: '/home/user/projects',
 *     showHidden: true,
 *     height: 20,
 *     width: 80,
 *     styles: {
 *       selectedItem: new Style().foreground('#50fa7b').bold(),
 *       normalItem: new Style().foreground('#f8f8f2'),
 *     },
 *   }))
 *   .view(({ components }) => vstack(
 *     text('File Browser').bold(),
 *     components.files
 *   ))
 *   .build()
 * ```
 *
 * @param options - Configuration options for the filetree
 * @returns A `ComponentBuilder` ready to use with `AppBuilder.component`
 *
 * @public
 */
export function filetree(
  options: FiletreeBuilderOptions,
): ComponentBuilder<FiletreeModel> {
  return {
    init(): [FiletreeModel, Cmd<Msg>] {
      const model = FiletreeModel.new({
        filesystem: options.filesystem,
        path: options.path,
        currentDir: options.currentDirectory,
        showHidden: options.showHidden,
        height: options.height,
        width: options.width,
        styles: options.styles,
        keyMap: options.keyMap,
      })
      return [model, model.init()]
    },

    update(model: FiletreeModel, msg: Msg): [FiletreeModel, Cmd<Msg>] {
      return model.update(msg)
    },

    view(model: FiletreeModel): string {
      return model.view()
    },
  }
}

// Re-export DirectoryItem type for convenience
export type { DirectoryItem } from '@boba-cli/filetree'
