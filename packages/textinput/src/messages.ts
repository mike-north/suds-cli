import clipboard from 'clipboardy'
import type { Cmd, Msg } from '@suds-cli/tea'

/**
 * Clipboard paste content.
 * @public
 */
export class PasteMsg implements Msg {
  readonly _tag = 'textinput/paste'
  constructor(public readonly text: string) {}
}

/**
 * Clipboard read failed.
 * @public
 */
export class PasteErrorMsg implements Msg {
  readonly _tag = 'textinput/paste-error'
  constructor(public readonly error: unknown) {}
}

/**
 * Command to read from the system clipboard.
 * Resolves to a PasteMsg on success or PasteErrorMsg on failure.
 * @public
 */
export function pasteCommand(): Cmd<PasteMsg | PasteErrorMsg> {
  return async () => {
    try {
      const text = await clipboard.read()
      return new PasteMsg(text ?? '')
    } catch (error) {
      return new PasteErrorMsg(error)
    }
  }
}
