/**
 * Message indicating a progress animation frame should be rendered.
 * @public
 */
export class FrameMsg {
  readonly _tag = 'progress:frame'

  constructor(
    /** Unique progress ID for routing */
    public readonly id: number,
    /** Internal tag to prevent duplicate ticks */
    public readonly tag: number,
    /** Timestamp when the frame was scheduled */
    public readonly time: Date,
  ) {}
}
