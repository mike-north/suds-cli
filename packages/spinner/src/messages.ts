/**
 * Message indicating the spinner should advance one frame.
 * @public
 */
export class TickMsg {
  readonly _tag = 'spinner:tick'

  constructor(
    /** The time at which the tick occurred */
    public readonly time: Date,
    /** The ID of the spinner this message belongs to */
    public readonly id: number,
    /** Internal tag for deduplication */
    public readonly tag: number,
  ) {}
}
