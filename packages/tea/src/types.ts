/**
 * Message - any value that triggers an update.
 */
/**
 * @public
 * Message - must be discriminated for safe matching.
 */
export type Msg = { readonly _tag: string }

/** @public Effect that can produce one or more messages synchronously. */
export type Effect<M extends Msg = Msg> = M | M[] | null | undefined
/** @public Function producing an effectful message or messages. */
export type EffectFn<M extends Msg = Msg> = () => Effect<M> | Promise<Effect<M>>

/**
 * @public
 * Command - an async side effect that eventually yields a message.
 * Use `null` to indicate no-op.
 */
export type Cmd<M extends Msg = Msg> = EffectFn<M> | null

/**
 * @public
 * Elm-like model contract.
 */
export interface Model<
  M extends Msg = Msg,
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  Self extends Model<M, Self> = any,
> {
  init(): Cmd<M>
  update(msg: M): [Self, Cmd<M>]
  view(): string
}

/** @public Outcome of running a program. */
export type ProgramResult<M extends Model> = {
  model: M
  error?: unknown
}

/** @public Infer the message type carried by a model. */
export type ModelMsg<M> =
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  M extends Model<infer MsgT, any> ? MsgT : Msg
