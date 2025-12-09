import { describe, expect, test, vi } from 'vitest';
import { batch, clearScreen, every, msg, quit, sequence, tick } from '../src/commands.js';
import { ClearScreenMsg, QuitMsg } from '../src/messages.js';

const resolved = <T>(value: T) => () => value;

describe('commands', () => {
  test('batch resolves multiple commands', async () => {
    const cmd = batch(resolved(1), resolved(2));
    const result = await cmd?.();
    expect(result).toEqual([1, 2]);
  });

  test('sequence preserves order and skips nulls', async () => {
    const calls: number[] = [];
    const cmd = sequence(
      () => {
        calls.push(1);
        return 1;
      },
      null,
      () => {
        calls.push(2);
        return 2;
      }
    );
    const result = await cmd?.();
    expect(calls).toEqual([1, 2]);
    expect(result).toEqual([1, 2]);
  });

  test('tick waits specified duration', async () => {
    vi.useFakeTimers();
    const cmd = tick(500, (t) => t.getTime());
    const promise = cmd?.() as Promise<number>;
    vi.advanceTimersByTime(499);
    await Promise.resolve();
    expect(vi.getTimerCount()).toBeGreaterThan(0);
    vi.advanceTimersByTime(1);
    const result = await promise;
    expect(result).toBeGreaterThan(0);
    vi.useRealTimers();
  });

  test('every aligns to next interval boundary', async () => {
    vi.useFakeTimers();
    vi.setSystemTime(new Date('2020-01-01T00:00:00.500Z'));
    const cmd = every(1000, (t) => t.getTime());
    const promise = cmd?.() as Promise<number>;
    vi.advanceTimersByTime(499);
    await Promise.resolve();
    expect(vi.getTimerCount()).toBeGreaterThan(0);
    vi.advanceTimersByTime(1);
    const result = await promise;
    expect(result).toBe(new Date('2020-01-01T00:00:01.000Z').getTime());
    expect(vi.getTimerCount()).toBe(0);
    vi.useRealTimers();
  });

  test('msg lifts message into command', async () => {
    const cmd = msg(new QuitMsg());
    const result = await cmd?.();
    expect(result).toBeInstanceOf(QuitMsg);
  });

  test('screen helper commands yield messages', async () => {
    const clear = clearScreen();
    const quitCmd = quit();
    expect(await clear?.()).toBeInstanceOf(ClearScreenMsg);
    expect(await quitCmd?.()).toBeInstanceOf(QuitMsg);
  });
});

