import type { PlatformAdapter } from '@suds-cli/machine'
import {
  ClearScreenMsg,
  DisableMouseMsg,
  EnableMouseAllMotionMsg,
  EnableMouseCellMotionMsg,
  EnterAltScreenMsg,
  ExitAltScreenMsg,
  HideCursorMsg,
  SetWindowTitleMsg,
  ShowCursorMsg,
  WindowSizeMsg,
} from './messages.js'
import type { Cmd, Msg } from './types.js'

/** @public Clear the terminal screen. */
export const clearScreen = (): Cmd<Msg> => () => new ClearScreenMsg()
/** @public Enter the alternate screen buffer. */
export const enterAltScreen = (): Cmd<Msg> => () => new EnterAltScreenMsg()
/** @public Exit the alternate screen buffer. */
export const exitAltScreen = (): Cmd<Msg> => () => new ExitAltScreenMsg()
/** @public Enable cell-motion mouse reporting. */
export const enableMouseCellMotion = (): Cmd<Msg> => () =>
  new EnableMouseCellMotionMsg()
/** @public Enable all-motion mouse reporting. */
export const enableMouseAllMotion = (): Cmd<Msg> => () =>
  new EnableMouseAllMotionMsg()
/** @public Disable mouse reporting. */
export const disableMouse = (): Cmd<Msg> => () => new DisableMouseMsg()
/** @public Show the cursor. */
export const showCursor = (): Cmd<Msg> => () => new ShowCursorMsg()
/** @public Hide the cursor. */
export const hideCursor = (): Cmd<Msg> => () => new HideCursorMsg()
/** @public Set the terminal window title. */
export const setWindowTitle =
  (title: string): Cmd<Msg> =>
  () =>
    new SetWindowTitleMsg(title)
/**
 * @public
 * Emit the current window size.
 * @param platform - Optional platform adapter to get terminal size from
 */
export const windowSize =
  (platform?: PlatformAdapter): Cmd<Msg> =>
  () => {
    if (platform) {
      const size = platform.terminal.getSize()
      return new WindowSizeMsg(size.columns, size.rows)
    }
    return new WindowSizeMsg(0, 0)
  }
