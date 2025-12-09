import process from 'node:process';
import { startInput } from './input.js';
import {
  ClearScreenMsg,
  DisableMouseMsg,
  EnableMouseAllMotionMsg,
  EnableMouseCellMotionMsg,
  EnterAltScreenMsg,
  ExitAltScreenMsg,
  HideCursorMsg,
  InterruptMsg,
  QuitMsg,
  ResumeMsg,
  SetWindowTitleMsg,
  ShowCursorMsg
} from './messages.js';
import { StandardRenderer } from './renderer.js';
import { TerminalController } from './terminal.js';
import type { Cmd, Model, ModelMsg, Msg, ProgramResult } from './types.js';
import { WindowSizeMsg } from './messages.js';

export interface ProgramOptions {
  altScreen?: boolean;
  mouseMode?: 'cell' | 'all' | false;
  input?: NodeJS.ReadableStream;
  output?: NodeJS.WritableStream;
  fps?: number;
  reportFocus?: boolean;
  bracketedPaste?: boolean;
}

export class Program<M extends Model> {
  private model: M;
  private readonly terminal: TerminalController;
  private readonly renderer: StandardRenderer;
  private readonly opts: ProgramOptions;
  private stopInput?: () => void;
  private running = false;
  private queue: Array<ModelMsg<M>> = [];
  private draining = false;
  private result: ProgramResult<M> | null = null;

  constructor(model: M, options: ProgramOptions = {}) {
    this.model = model;
    this.opts = options;
    this.terminal = new TerminalController(options.input, options.output);
    this.renderer = new StandardRenderer({ output: options.output, fps: options.fps });
  }

  async run(): Promise<ProgramResult<M>> {
    this.running = true;
    this.setupTerminal();
    this.setupSignals();
    this.renderer.start();

    try {
      await this.runCmd(this.model.init());
      this.renderer.write(this.model.view());
      this.startInputLoop();
      await this.drainQueue();
      this.result = { model: this.model };
    } catch (err) {
      this.result = { model: this.model, error: err };
    } finally {
      this.shutdown();
    }

    return this.result ?? { model: this.model };
  }

  send(msg: ModelMsg<M>): void {
    if (!msg) {
      return;
    }
    this.queue.push(msg);
    if (!this.draining) {
      void this.drainQueue();
    }
  }

  quit(): void {
    this.send(new QuitMsg());
  }

  kill(): void {
    this.running = false;
    this.shutdown();
  }

  private async drainQueue(): Promise<void> {
    if (this.draining) {
      return;
    }
    this.draining = true;

    while (this.running && this.queue.length > 0) {
      const msg = this.queue.shift();
      if (msg === undefined) {
        continue;
      }

      const consumed = this.handleInternal(msg);
      if (consumed) {
        continue;
      }

      const [nextModel, cmd] = this.model.update(msg);
      this.model = nextModel;

      await this.runCmd(cmd);
      this.renderer.write(this.model.view());
    }

    this.draining = false;
  }

  private handleInternal(msg: ModelMsg<M>): boolean {
    if (msg instanceof QuitMsg || msg instanceof InterruptMsg) {
      this.running = false;
      return true;
    }
    if (msg instanceof ClearScreenMsg) {
      this.terminal.clearScreen();
      return false;
    }
    if (msg instanceof EnterAltScreenMsg) {
      this.terminal.enterAltScreen();
      this.renderer.repaint();
      return false;
    }
    if (msg instanceof ExitAltScreenMsg) {
      this.terminal.exitAltScreen();
      this.renderer.repaint();
      return false;
    }
    if (msg instanceof EnableMouseCellMotionMsg) {
      this.terminal.enableMouseCellMotion();
      return false;
    }
    if (msg instanceof EnableMouseAllMotionMsg) {
      this.terminal.enableMouseAllMotion();
      return false;
    }
    if (msg instanceof DisableMouseMsg) {
      this.terminal.disableMouse();
      return false;
    }
    if (msg instanceof ShowCursorMsg) {
      this.terminal.showCursor();
      return false;
    }
    if (msg instanceof HideCursorMsg) {
      this.terminal.hideCursor();
      return false;
    }
    if (msg instanceof SetWindowTitleMsg) {
      this.terminal.setWindowTitle(msg.title);
      return false;
    }
    if (msg instanceof ResumeMsg) {
      return false;
    }
    return false;
  }

  private async runCmd(cmd: Cmd<ModelMsg<M>> | undefined): Promise<void> {
    if (!cmd) {
      return;
    }
    const result = await Promise.resolve(cmd());
    if (result === null || result === undefined) {
      return;
    }
    if (Array.isArray(result)) {
      for (const msg of result) {
        this.send(msg);
      }
    } else {
      this.send(result);
    }
  }

  private setupTerminal(): void {
    this.terminal.enableRawMode();
    this.terminal.hideCursor();

    if (this.opts.altScreen) {
      this.terminal.enterAltScreen();
      this.terminal.clearScreen();
    }

    if (this.opts.mouseMode === 'cell') {
      this.terminal.enableMouseCellMotion();
    } else if (this.opts.mouseMode === 'all') {
      this.terminal.enableMouseAllMotion();
    }

    if (this.opts.bracketedPaste !== false) {
      this.terminal.enableBracketedPaste();
    }

    if (this.opts.reportFocus) {
      this.terminal.enableReportFocus();
    }
  }

  private startInputLoop(): void {
    this.stopInput = startInput({
      input: this.opts.input,
      onMessage: (msg) => this.send(msg as ModelMsg<M>)
    });
  }

  private setupSignals(): void {
    const output = this.opts.output ?? process.stdout;
    const handleResize = () => {
      const { columns, rows } = getSize(output);
      const w = columns ?? 0;
      const h = rows ?? 0;
      this.send(new WindowSizeMsg(w, h));
    };

    process.on('SIGINT', this.onSigInt);
    process.on('SIGTERM', this.onSigTerm);
    if ('on' in output && typeof (output as NodeJS.Process['stdout']).on === 'function') {
      (output as NodeJS.Process['stdout']).on('resize', handleResize);
    }

    // Initial size
    handleResize();

    this.disposeSignals = () => {
      process.off('SIGINT', this.onSigInt);
      process.off('SIGTERM', this.onSigTerm);
      if ('off' in output && typeof (output as NodeJS.Process['stdout']).off === 'function') {
        (output as NodeJS.Process['stdout']).off('resize', handleResize);
      }
    };
  }

  private disposeSignals: (() => void) | null = null;

  private onSigInt = (): void => {
    this.send(new InterruptMsg());
  };

  private onSigTerm = (): void => {
    this.send(new QuitMsg());
  };

  private shutdown(): void {
    if (this.disposeSignals) {
      this.disposeSignals();
      this.disposeSignals = null;
    }
    if (this.stopInput) {
      this.stopInput();
      this.stopInput = undefined;
    }
    this.renderer.stop();
    this.terminal.cleanup();
  }
}

function getSize(stream: NodeJS.WritableStream) {
  const s = stream as { columns?: number; rows?: number };
  return { columns: s.columns, rows: s.rows };
}

