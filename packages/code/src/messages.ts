/**
 * Message containing syntax-highlighted content after async processing.
 * @public
 */
export class SyntaxMsg {
  readonly _tag = "code-syntax";
  constructor(public readonly content: string) {}
}

/**
 * Message containing an error if file read or highlighting fails.
 * @public
 */
export class ErrorMsg {
  readonly _tag = "code-error";
  constructor(public readonly error: Error) {}
}
