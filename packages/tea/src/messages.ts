/** @public Request graceful program termination. */
export class QuitMsg {
  readonly _tag = 'quit'
}

/** @public Interrupt the program (SIGINT). */
export class InterruptMsg {
  readonly _tag = 'interrupt'
}

/** @public Suspend the program (Ctrl+Z). */
export class SuspendMsg {
  readonly _tag = 'suspend'
}

/** @public Resume the program after suspension. */
export class ResumeMsg {
  readonly _tag = 'resume'
}

/** @public Report the current terminal width and height. */
export class WindowSizeMsg {
  readonly _tag = 'window-size'
  constructor(
    public readonly width: number,
    public readonly height: number,
  ) {}
}

/** @public Terminal focus gained. */
export class FocusMsg {
  readonly _tag = 'focus'
}

/** @public Terminal focus lost. */
export class BlurMsg {
  readonly _tag = 'blur'
}

/** @public Clear the terminal screen. */
export class ClearScreenMsg {
  readonly _tag = 'clear-screen'
}

/** @public Enter the alternate screen buffer. */
export class EnterAltScreenMsg {
  readonly _tag = 'enter-alt-screen'
}

/** @public Exit the alternate screen buffer. */
export class ExitAltScreenMsg {
  readonly _tag = 'exit-alt-screen'
}

/** @public Enable cell-based mouse reporting. */
export class EnableMouseCellMotionMsg {
  readonly _tag = 'enable-mouse-cell-motion'
}

/** @public Enable all-motion mouse reporting. */
export class EnableMouseAllMotionMsg {
  readonly _tag = 'enable-mouse-all-motion'
}

/** @public Disable mouse reporting. */
export class DisableMouseMsg {
  readonly _tag = 'disable-mouse'
}

/** @public Show the cursor. */
export class ShowCursorMsg {
  readonly _tag = 'show-cursor'
}

/** @public Hide the cursor. */
export class HideCursorMsg {
  readonly _tag = 'hide-cursor'
}

/** @public Enable focus in/out reporting. */
export class EnableReportFocusMsg {
  readonly _tag = 'enable-report-focus'
}

/** @public Disable focus in/out reporting. */
export class DisableReportFocusMsg {
  readonly _tag = 'disable-report-focus'
}

/** @public Set the terminal window title. */
export class SetWindowTitleMsg {
  readonly _tag = 'set-window-title'
  constructor(public readonly title: string) {}
}
