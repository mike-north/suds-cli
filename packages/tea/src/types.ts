/**
 * Message - any value that triggers an update.
 */
/**
 * Message - must be discriminated for safe matching.
 */
export type Msg = { readonly _tag: string };

export type Effect<M extends Msg = Msg> = M | M[] | null | undefined;
export type EffectFn<M extends Msg = Msg> = () => Effect<M> | Promise<Effect<M>>;

/**
 * Command - an async side effect that eventually yields a message.
 * Use `null` to indicate no-op.
 */
export type Cmd<M extends Msg = Msg> = EffectFn<M> | null;

/**
 * Elm-like model contract.
 */
export interface Model<M extends Msg = Msg, Self extends Model<M, Self> = any> {
  init(): Cmd<M>;
  update(msg: M): [Self, Cmd<M>];
  view(): string;
}

export type ProgramResult<M extends Model> = {
  model: M;
  error?: unknown;
};

export type ModelMsg<M> = M extends Model<infer MsgT, any> ? MsgT : Msg;

