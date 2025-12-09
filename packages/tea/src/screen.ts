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
  WindowSizeMsg
} from './messages.js';
import type { Cmd, Msg } from './types.js';

export const clearScreen = (): Cmd<Msg> => () => new ClearScreenMsg();
export const enterAltScreen = (): Cmd<Msg> => () => new EnterAltScreenMsg();
export const exitAltScreen = (): Cmd<Msg> => () => new ExitAltScreenMsg();
export const enableMouseCellMotion = (): Cmd<Msg> => () => new EnableMouseCellMotionMsg();
export const enableMouseAllMotion = (): Cmd<Msg> => () => new EnableMouseAllMotionMsg();
export const disableMouse = (): Cmd<Msg> => () => new DisableMouseMsg();
export const showCursor = (): Cmd<Msg> => () => new ShowCursorMsg();
export const hideCursor = (): Cmd<Msg> => () => new HideCursorMsg();
export const setWindowTitle = (title: string): Cmd<Msg> => () => new SetWindowTitleMsg(title);
export const windowSize = (): Cmd<Msg> => () =>
  new WindowSizeMsg(process.stdout.columns ?? 0, process.stdout.rows ?? 0);

