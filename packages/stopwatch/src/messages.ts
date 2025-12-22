/** Tick message for stopwatch increments. @public */
export class TickMsg {
  readonly _tag = 'stopwatch-tick'

  constructor(
    /** Unique stopwatch ID */
    public readonly id: number,
    /** Internal tag for deduplication */
    public readonly tag: number,
  ) {}
}

/** Message that starts or stops the stopwatch. @public */
export class StartStopMsg {
  readonly _tag = 'stopwatch-start-stop'

  constructor(
    public readonly id: number,
    public readonly running: boolean,
  ) {}
}

/** Message that resets the stopwatch. @public */
export class ResetMsg {
  readonly _tag = 'stopwatch-reset'

  constructor(public readonly id: number) {}
}
