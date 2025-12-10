/**
 * Sync viewport lines when content changes.
 * @public
 */
export class SyncMsg {
  readonly _tag = "viewport-sync";

  constructor(
    public readonly lines: string[],
    public readonly topLine: number,
    public readonly bottomLine: number,
  ) {}
}

/**
 * Viewport scrolled notification.
 * @public
 */
export class ScrollMsg {
  readonly _tag = "viewport-scroll";

  constructor(
    public readonly percent: number,
    public readonly topLine: number,
  ) {}
}



