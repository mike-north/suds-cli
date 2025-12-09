import { PassThrough } from 'node:stream';
import { describe, expect, test, vi } from 'vitest';
import { Program } from '../src/program.js';
import type { Cmd, Model, Msg } from '../src/types.js';
import { EnterAltScreenMsg, QuitMsg, WindowSizeMsg } from '../src/messages.js';
import { TerminalController } from '../src/terminal.js';

class NoopModel implements Model<Msg, NoopModel> {
  init(): Cmd<Msg> {
    return null;
  }

  update(msg: Msg): [NoopModel, Cmd<Msg>] {
    if (msg instanceof QuitMsg) {
      return [this, null];
    }
    return [this, null];
  }

  view(): string {
    return 'noop';
  }
}

describe('Program', () => {
  test('run resolves and cleans up on quit', async () => {
    // Stub terminal methods to avoid mutating real stdout
    const restore = stubTerminal();
    const program = new Program(new NoopModel(), { altScreen: false, mouseMode: false });
    const resultPromise = program.run();
    // Simulate external quit
    program.send(new QuitMsg());
    const result = await resultPromise;
    expect(result.model).toBeInstanceOf(NoopModel);
    restore();
  });

  test('forwards window size messages to the model', async () => {
    const output = Object.assign(new PassThrough(), { columns: 80, rows: 25 });
    const input = new PassThrough();
    const model = new CollectModel();
    const program = new Program(model, { input, output, altScreen: false, mouseMode: false });

    const resultPromise = program.run();
    (output as PassThrough).emit('resize');
    program.send(new QuitMsg());

    await resultPromise;
    expect(model.messages.some((m) => m instanceof WindowSizeMsg)).toBe(true);
  });

  test('screen control messages perform side effects and reach the model', async () => {
    const enterSpy = vi.spyOn(TerminalController.prototype, 'enterAltScreen');
    const output = new PassThrough();
    const input = new PassThrough();
    const model = new CollectModel();
    const program = new Program(model, { input, output });

    const resultPromise = program.run();
    program.send(new EnterAltScreenMsg());
    program.send(new QuitMsg());
    await resultPromise;

    expect(enterSpy).toHaveBeenCalled();
    expect(model.messages.some((m) => m instanceof EnterAltScreenMsg)).toBe(true);
    enterSpy.mockRestore();
  });
});

function stubTerminal() {
  const origWrite = process.stdout.write;
  // @ts-expect-error overriding for test
  process.stdout.write = () => true;
  return () => {
    process.stdout.write = origWrite;
  };
}

class CollectModel implements Model<Msg, CollectModel> {
  messages: Msg[] = [];

  init(): Cmd<Msg> {
    return null;
  }

  update(msg: Msg): [CollectModel, Cmd<Msg>] {
    this.messages.push(msg);
    return [this, null];
  }

  view(): string {
    return 'collect';
  }
}

