import { Style } from '@suds-cli/chapstick'
import type { KeyMap as HelpKeyMap } from '@suds-cli/help'
import type { Binding } from '@suds-cli/key'

/** Metadata for a file system entry. @public */
export interface FileInfo {
  name: string
  path: string
  isDir: boolean
  isHidden: boolean
  size: number
  mode: number
}

/** Keyboard bindings for the filepicker. @public */
export interface FilepickerKeyMap extends HelpKeyMap {
  up: Binding
  down: Binding
  select: Binding
  back: Binding
  open: Binding
  toggleHidden: Binding
  pageUp: Binding
  pageDown: Binding
  gotoTop: Binding
  gotoBottom: Binding
  shortHelp(): Binding[]
  fullHelp(): Binding[][]
}

/** Style hooks for rendering the file list. @public */
export interface FilepickerStyles {
  directory: Style
  file: Style
  hidden: Style
  selected: Style
  cursor: Style
  status: Style
}

/** Options for constructing a {@link FilepickerModel}. @public */
export interface FilepickerOptions {
  currentDir?: string
  allowedTypes?: string[]
  showHidden?: boolean
  showPermissions?: boolean
  showSize?: boolean
  dirFirst?: boolean
  height?: number
  styles?: Partial<FilepickerStyles>
  keyMap?: FilepickerKeyMap
}
