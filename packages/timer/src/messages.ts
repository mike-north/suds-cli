/** Tick message for timer countdown. @public */
export class TickMsg {
  readonly _tag = 'timer-tick'

  constructor(
    /** Unique timer ID */
    public readonly id: number,
    /** Internal tag for deduplication */
    public readonly tag: number,
    /** Whether this tick indicates the timer expired */
    public readonly timeout: boolean,
  ) {}
}

/** Message emitted once when the timer times out. @public */
export class TimeoutMsg {
  readonly _tag = 'timer-timeout'

  constructor(public readonly id: number) {}
}

/** Message that starts or stops the timer. @public */
export class StartStopMsg {
  readonly _tag = 'timer-start-stop'

  constructor(
    /** Unique timer ID */
    public readonly id: number,
    /** True to run, false to pause */
    public readonly running: boolean,
  ) {}
}
