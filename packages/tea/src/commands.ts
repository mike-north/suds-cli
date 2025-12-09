import { QuitMsg } from './messages.js';
import { Cmd, Effect, Msg } from './types.js';
import {
  clearScreen,
  disableMouse,
  enableMouseAllMotion,
  enableMouseCellMotion,
  enterAltScreen,
  exitAltScreen,
  hideCursor,
  setWindowTitle,
  showCursor,
  windowSize
} from './screen.js';

type MsgOrArray<M extends Msg> = M | M[];

const now = () => new Date();

export function batch<M extends Msg>(...cmds: Array<Cmd<M>>): Cmd<M> {
  const valid = cmds.filter((cmd): cmd is Cmd<M> => Boolean(cmd));
  if (valid.length === 0) {
    return null;
  }
  if (valid.length === 1) {
    const [only] = valid;
    return only ?? null;
  }
  return async () => {
    const results = await Promise.all(valid.map((cmd) => Promise.resolve(cmd?.())));
    return flatten(results);
  };
}

export function sequence<M extends Msg>(...cmds: Array<Cmd<M>>): Cmd<M> {
  const valid = cmds.filter((cmd): cmd is Cmd<M> => Boolean(cmd));
  if (valid.length === 0) {
    return null;
  }
  if (valid.length === 1) {
    const [only] = valid;
    return only ?? null;
  }
  return async () => {
    const messages: Array<MsgOrArray<M>> = [];
    for (const cmd of valid) {
      const result = await Promise.resolve(cmd?.());
      if (result !== null && result !== undefined) {
        messages.push(result);
      }
    }
    return flatten(messages);
  };
}

export function tick<M extends Msg>(ms: number, fn: (t: Date) => M): Cmd<M> {
  return () =>
    new Promise<M>((resolve) => {
      setTimeout(() => resolve(fn(now())), ms);
    });
}

/**
 * Schedule a single message aligned to the next interval boundary.
 * Call again from your update loop to continue a repeating cadence.
 */
export function every<M extends Msg>(ms: number, fn: (t: Date) => M): Cmd<M> {
  return () =>
    new Promise<M>((resolve) => {
      const current = now();
      const delay = alignToInterval(current, ms);
      setTimeout(() => resolve(fn(now())), delay);
    });
}

export const msg = <M extends Msg>(value: M): Cmd<M> => () => value;
export const quit = (): Cmd<Msg> => msg(new QuitMsg());
export {
  clearScreen,
  enterAltScreen,
  exitAltScreen,
  enableMouseCellMotion,
  enableMouseAllMotion,
  disableMouse,
  showCursor,
  hideCursor,
  setWindowTitle,
  windowSize
};

function flatten<M extends Msg>(values: Array<Effect<M>>): MsgOrArray<M> | null {
  const results: M[] = [];
  for (const value of values) {
    if (value === null || value === undefined) {
      continue;
    }
    if (Array.isArray(value)) {
      results.push(...value);
    } else {
      results.push(value);
    }
  }
  if (results.length === 0) {
    return null;
  }
  if (results.length === 1) {
    return results[0] as M;
  }
  return results;
}

function alignToInterval(date: Date, ms: number): number {
  const next = new Date(date);
  next.setMilliseconds(0);
  const remainder = date.getTime() % ms;
  return remainder === 0 ? ms : ms - remainder;
}

