/**
 * Message types for the markdown component.
 */

/**
 * Message containing rendered markdown content.
 * @public
 */
export class RenderMarkdownMsg {
  readonly _tag = "markdown-render";

  constructor(public readonly content: string) {}
}

/**
 * Message containing an error from file reading or rendering.
 * @public
 */
export class ErrorMsg {
  readonly _tag = "markdown-error";

  constructor(public readonly error: Error) {}
}
