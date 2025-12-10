import { Style, width as stringWidth, clampWidth } from "@suds-cli/chapstick";
import { CursorModel, CursorMode } from "@suds-cli/cursor";
import { matches } from "@suds-cli/key";
import { batch, type Cmd, type Msg, KeyMsg, KeyType } from "@suds-cli/tea";
import { newSanitizer } from "@suds-cli/runeutil";
import GraphemeSplitter from "grapheme-splitter";
import { PasteErrorMsg, PasteMsg, pasteCommand } from "./messages.js";
import {
  EchoMode,
  type KeyMap,
  type TextInputOptions,
  type ValidateFunc,
  defaultKeyMap,
} from "./types.js";

const splitter = new GraphemeSplitter();
const sanitizer = newSanitizer({ replaceNewLine: " ", replaceTab: " " });

type TextInputState = {
  value: string;
  position: number;
  focused: boolean;
  placeholder: string;
  echoMode: EchoMode;
  echoCharacter: string;
  charLimit: number;
  width: number;
  prompt: string;
  promptStyle: Style;
  textStyle: Style;
  placeholderStyle: Style;
  cursorStyle: Style;
  validateFn?: ValidateFunc;
  keyMap: KeyMap;
  cursor: CursorModel;
  error: Error | null;
};

/**
 * Single-line text input model with cursor control and clipboard support.
 * @public
 */
export class TextInputModel {
  readonly value: string;
  readonly position: number;
  readonly focused: boolean;
  readonly placeholder: string;
  readonly echoMode: EchoMode;
  readonly echoCharacter: string;
  readonly charLimit: number;
  readonly width: number;
  readonly prompt: string;
  readonly promptStyle: Style;
  readonly textStyle: Style;
  readonly placeholderStyle: Style;
  readonly cursorStyle: Style;
  readonly validateFn?: ValidateFunc;
  readonly keyMap: KeyMap;
  readonly cursor: CursorModel;
  readonly error: Error | null;

  private constructor(state: TextInputState) {
    this.value = state.value;
    this.position = state.position;
    this.focused = state.focused;
    this.placeholder = state.placeholder;
    this.echoMode = state.echoMode;
    this.echoCharacter = state.echoCharacter;
    this.charLimit = state.charLimit;
    this.width = state.width;
    this.prompt = state.prompt;
    this.promptStyle = state.promptStyle;
    this.textStyle = state.textStyle;
    this.placeholderStyle = state.placeholderStyle;
    this.cursorStyle = state.cursorStyle;
    this.validateFn = state.validateFn;
    this.keyMap = state.keyMap;
    this.cursor = state.cursor;
    this.error = state.error;
  }

  /** Create a new text input model. */
  static new(options: TextInputOptions = {}): TextInputModel {
    const sanitized = clampToLimit(
      sanitizeValue(options.value ?? ""),
      options.charLimit ?? 0,
    );
    const baseTextStyle = options.textStyle ?? new Style();
    const cursorMode = options.cursorMode ?? CursorMode.Blink;
    const cursor = new CursorModel({
      style: options.cursorStyle ?? new Style(),
      textStyle: baseTextStyle,
      mode: cursorMode,
      focused: false,
      char: " ",
    });

    const model = new TextInputModel({
      value: sanitized,
      position: runeCount(sanitized),
      focused: false,
      placeholder: options.placeholder ?? "",
      echoMode: options.echoMode ?? EchoMode.Normal,
      echoCharacter: options.echoCharacter ?? "•",
      charLimit: options.charLimit ?? 0,
      width: options.width ?? 0,
      prompt: options.prompt ?? "> ",
      promptStyle: options.promptStyle ?? new Style(),
      textStyle: baseTextStyle,
      placeholderStyle: options.placeholderStyle ?? new Style(),
      cursorStyle: options.cursorStyle ?? new Style(),
      validateFn: options.validate,
      keyMap: options.keyMap ?? defaultKeyMap,
      cursor,
      error: null,
    });

    return model.#withError(model.#runValidation(sanitized));
  }

  /** Initial command (none needed by default). */
  init(): Cmd<Msg> {
    return null;
  }

  /** Current value. */
  valueOf(): string {
    return this.value;
  }

  /** Length in graphemes. */
  length(): number {
    return runeCount(this.value);
  }

  /** True if no content. */
  isEmpty(): boolean {
    return this.length() === 0;
  }

  /** Cursor position in graphemes. */
  cursorPosition(): number {
    return this.position;
  }

  /** Focus the input (shows cursor, enables key handling). */
  focus(): [TextInputModel, Cmd<Msg>] {
    if (this.focused) {
      return [this, null];
    }
    const [cursor, cmd] = this.cursor.focus();
    const next = this.#with({ focused: true, cursor });
    return [next, cmd];
  }

  /** Blur the input (hides cursor, ignores key handling). */
  blur(): TextInputModel {
    if (!this.focused) {
      return this;
    }
    return this.#with({ focused: false, cursor: this.cursor.blur() });
  }

  /** Move cursor to start. */
  cursorStart(): TextInputModel {
    return this.#withPosition(0);
  }

  /** Move cursor to end. */
  cursorEnd(): TextInputModel {
    return this.#withPosition(this.length());
  }

  /** Move cursor left by n (default 1). */
  cursorLeft(n = 1): TextInputModel {
    return this.#withPosition(Math.max(0, this.position - Math.max(1, n)));
  }

  /** Move cursor right by n (default 1). */
  cursorRight(n = 1): TextInputModel {
    return this.#withPosition(Math.min(this.length(), this.position + Math.max(1, n)));
  }

  /** Move cursor one word to the left. */
  wordLeft(): TextInputModel {
    if (this.position === 0 || this.isEmpty()) {
      return this;
    }
    if (this.echoMode !== EchoMode.Normal) {
      return this.cursorStart();
    }
    const graphemes = splitGraphemes(this.value);
    let i = this.position - 1;
    while (i >= 0) {
      const g = graphemes[i];
      if (g && isWhitespace(g)) {
        i--;
        continue;
      }
      break;
    }
    while (i >= 0) {
      const g = graphemes[i];
      if (g && !isWhitespace(g)) {
        i--;
        continue;
      }
      break;
    }
    return this.#withPosition(Math.max(0, i + 1));
  }

  /** Move cursor one word to the right. */
  wordRight(): TextInputModel {
    if (this.position >= this.length() || this.isEmpty()) {
      return this;
    }
    if (this.echoMode !== EchoMode.Normal) {
      return this.cursorEnd();
    }
    const graphemes = splitGraphemes(this.value);
    let i = this.position;
    while (i < graphemes.length) {
      const g = graphemes[i];
      if (g && isWhitespace(g)) {
        i++;
        continue;
      }
      break;
    }
    while (i < graphemes.length) {
      const g = graphemes[i];
      if (g && !isWhitespace(g)) {
        i++;
        continue;
      }
      break;
    }
    return this.#withPosition(Math.min(this.length(), i));
  }

  /** Insert runes at the cursor position. */
  insertRunes(runes: string): TextInputModel {
    if (!runes) {
      return this;
    }
    const sanitized = sanitizeValue(runes);
    if (!sanitized) {
      return this;
    }

    const before = sliceGraphemes(this.value, 0, this.position);
    const after = sliceGraphemes(this.value, this.position);
    const insertion = clampGraphemes(sanitized, this.#remainingCapacity(before + after));

    const nextValue = before + insertion + after;
    const nextPos = this.position + runeCount(insertion);
    return this.#withValue(nextValue, nextPos);
  }

  /** Delete up to n runes to the left of the cursor. */
  deleteLeft(n = 1): TextInputModel {
    if (this.position === 0 || n <= 0) {
      return this;
    }
    const remove = Math.min(n, this.position);
    const before = sliceGraphemes(this.value, 0, this.position - remove);
    const after = sliceGraphemes(this.value, this.position);
    return this.#withValue(before + after, this.position - remove);
  }

  /** Delete up to n runes to the right of the cursor. */
  deleteRight(n = 1): TextInputModel {
    if (this.position >= this.length() || n <= 0) {
      return this;
    }
    const before = sliceGraphemes(this.value, 0, this.position);
    const after = sliceGraphemes(this.value, this.position + Math.max(1, n));
    return this.#withValue(before + after, this.position);
  }

  /** Delete the word to the left of the cursor. */
  deleteWordLeft(): TextInputModel {
    if (this.position === 0 || this.isEmpty()) {
      return this;
    }
    if (this.echoMode !== EchoMode.Normal) {
      return this.deleteToStart();
    }
    const graphemes = splitGraphemes(this.value);
    let start = this.position;
    // Walk left over whitespace
    while (start > 0) {
      const g = graphemes[start - 1];
      if (g && isWhitespace(g)) {
        start--;
        continue;
      }
      break;
    }
    // Walk left over word
    while (start > 0) {
      const g = graphemes[start - 1];
      if (g && !isWhitespace(g)) {
        start--;
        continue;
      }
      break;
    }
    const before = graphemes.slice(0, start).join("");
    const after = graphemes.slice(this.position).join("");
    return this.#withValue(before + after, start);
  }

  /** Delete the word to the right of the cursor. */
  deleteWordRight(): TextInputModel {
    if (this.position >= this.length() || this.isEmpty()) {
      return this;
    }
    if (this.echoMode !== EchoMode.Normal) {
      return this.deleteToEnd();
    }
    const graphemes = splitGraphemes(this.value);
    let end = this.position;
    while (end < graphemes.length) {
      const g = graphemes[end];
      if (g && isWhitespace(g)) {
        end++;
        continue;
      }
      break;
    }
    while (end < graphemes.length) {
      const g = graphemes[end];
      if (g && !isWhitespace(g)) {
        end++;
        continue;
      }
      break;
    }
    const before = graphemes.slice(0, this.position).join("");
    const after = graphemes.slice(end).join("");
    return this.#withValue(before + after, this.position);
  }

  /** Delete everything before the cursor. */
  deleteToStart(): TextInputModel {
    const after = sliceGraphemes(this.value, this.position);
    return this.#withValue(after, 0);
  }

  /** Delete everything after the cursor. */
  deleteToEnd(): TextInputModel {
    const before = sliceGraphemes(this.value, 0, this.position);
    return this.#withValue(before, before.length === 0 ? 0 : runeCount(before));
  }

  /** Reset to empty value and cursor at start. */
  reset(): TextInputModel {
    return this.#withValue("", 0);
  }

  /** Replace the value and re-run validation. */
  setValue(value: string): TextInputModel {
    const sanitized = clampToLimit(sanitizeValue(value), this.charLimit);
    return this.#withValue(sanitized, Math.min(this.position, runeCount(sanitized)));
  }

  /** Run validation and return the error (if any). */
  validate(): Error | null {
    return this.#runValidation(this.value);
  }

  /** Set a new validation function (re-validates current value). */
  setValidateFunc(fn: ValidateFunc): TextInputModel {
    const next = this.#with({ validateFn: fn });
    return next.#withError(next.#runValidation(next.value));
  }

  /** Command to paste from the clipboard. */
  paste(): [TextInputModel, Cmd<Msg>] {
    return [this, pasteCommand() as Cmd<Msg>];
  }

  /** Handle Tea messages (keys, cursor, paste). */
  update(msg: Msg): [TextInputModel, Cmd<Msg>] {
    // eslint-disable-next-line @typescript-eslint/no-this-alias
    let model: TextInputModel = this;
    const cmds: Cmd<Msg>[] = [];

    if (msg instanceof KeyMsg) {
      if (model.focused) {
        const [nextModel, keyCmd] = model.#handleKey(msg);
        model = nextModel;
        if (keyCmd) {
          cmds.push(keyCmd);
        }
      }
    } else if (msg instanceof PasteMsg) {
      model = model.insertRunes(msg.text);
    } else if (msg instanceof PasteErrorMsg) {
      model = model.#withError(asError(msg.error));
    }

    const [cursor, cursorCmd] = model.cursor.update(msg);
    model = model.#with({ cursor });
    if (cursorCmd) {
      cmds.push(cursorCmd as Cmd<Msg>);
    }

    return [model, batch(...cmds)];
  }

  /** Render the input with prompt, text, and cursor. */
  view(): string {
    const promptRendered = this.promptStyle.inline(true).render(this.prompt);
    const availableWidth =
      this.width > 0
        ? Math.max(0, this.width - stringWidth(promptRendered))
        : Number.POSITIVE_INFINITY;

    if (this.isEmpty() && this.placeholder) {
      const placeholder = this.#placeholderView(availableWidth);
      return promptRendered + placeholder;
    }

    const rendered = this.#valueView(availableWidth);
    return promptRendered + rendered;
  }

  #handleKey(msg: KeyMsg): [TextInputModel, Cmd<Msg> | null] {
    // eslint-disable-next-line @typescript-eslint/no-this-alias
    let next: TextInputModel = this;
    let cmd: Cmd<Msg> | null = null;
    const keyMap = this.keyMap;

    switch (true) {
      case matches(msg, keyMap.deleteWordBackward):
        next = next.deleteWordLeft();
        break;
      case matches(msg, keyMap.deleteCharacterBackward):
        next = next.deleteLeft();
        break;
      case matches(msg, keyMap.wordBackward):
        next = next.wordLeft();
        break;
      case matches(msg, keyMap.characterBackward):
        next = next.cursorLeft();
        break;
      case matches(msg, keyMap.wordForward):
        next = next.wordRight();
        break;
      case matches(msg, keyMap.characterForward):
        next = next.cursorRight();
        break;
      case matches(msg, keyMap.lineStart):
        next = next.cursorStart();
        break;
      case matches(msg, keyMap.deleteCharacterForward):
        next = next.deleteRight();
        break;
      case matches(msg, keyMap.lineEnd):
        next = next.cursorEnd();
        break;
      case matches(msg, keyMap.deleteAfterCursor):
        next = next.deleteToEnd();
        break;
      case matches(msg, keyMap.deleteBeforeCursor):
        next = next.deleteToStart();
        break;
      case matches(msg, keyMap.paste):
        cmd = pasteCommand() as Cmd<Msg>;
        break;
      case matches(msg, keyMap.deleteWordForward):
        next = next.deleteWordRight();
        break;
      default:
        if (
          (msg.key.type === KeyType.Runes || msg.key.type === KeyType.Space) &&
          !msg.key.alt
        ) {
          next = next.insertRunes(msg.key.runes);
        }
        break;
    }
    return [next, cmd];
  }

  #placeholderView(availableWidth: number): string {
    const graphemes = splitGraphemes(this.placeholder);
    const cursorChar = graphemes[0] ?? " ";
    const rest = graphemes.slice(1).join("");

    const budget = Number.isFinite(availableWidth)
      ? Math.max(0, availableWidth - stringWidth(cursorChar))
      : undefined;
    const visibleRest =
      budget === undefined ? rest : clampWidth(rest, budget);

    const cursorView = this.cursor.withChar(cursorChar || " ").view();
    const styledRest = this.placeholderStyle.inline(true).render(visibleRest);

    const usedWidth = stringWidth(cursorChar + visibleRest);
    const padding =
      Number.isFinite(availableWidth) && availableWidth > 0
        ? Math.max(0, availableWidth - usedWidth)
        : 0;

    return cursorView + styledRest + " ".repeat(padding);
  }

  #valueView(availableWidth: number): string {
    const graphemes = splitGraphemes(this.value);
    const displayGraphemes = graphemes.map((g) => this.#echoTransform(g));
    const widths = displayGraphemes.map((g) => stringWidth(g));

    const [start, end] = visibleRange(widths, this.position, availableWidth);
    const slice = displayGraphemes.slice(start, end);
    const cursorOffset = clamp(this.position - start, 0, slice.length);

    const before = slice.slice(0, cursorOffset).join("");
    const after =
      cursorOffset < slice.length
        ? slice.slice(cursorOffset + 1).join("")
        : "";

    const cursorChar =
      cursorOffset < slice.length
        ? slice[cursorOffset] ?? " "
        : " ";

    const beforeStyled = this.textStyle.inline(true).render(before);
    const afterStyled = this.textStyle.inline(true).render(after);
    const cursorView = this.cursor.withChar(cursorChar || " ").view();

    const usedWidth =
      stringWidth(before) +
      stringWidth(cursorChar || " ") +
      stringWidth(after);
    const padding =
      Number.isFinite(availableWidth) && availableWidth > 0
        ? Math.max(0, availableWidth - usedWidth)
        : 0;

    return beforeStyled + cursorView + afterStyled + " ".repeat(padding);
  }

  #echoTransform(s: string): string {
    switch (this.echoMode) {
      case EchoMode.Password:
        return this.echoCharacter.repeat(Math.max(0, runeCount(s)));
      case EchoMode.None:
        return "";
      case EchoMode.Normal:
      default:
        return s;
    }
  }

  #withPosition(position: number): TextInputModel {
    const clamped = clamp(position, 0, this.length());
    if (clamped === this.position) {
      return this;
    }
    return this.#with({ position: clamped });
  }

  #withValue(value: string, position?: number): TextInputModel {
    const clamped = clampToLimit(value, this.charLimit);
    const pos = clamp(position ?? this.position, 0, runeCount(clamped));
    const next = this.#with({ value: clamped, position: pos });
    return next.#withError(next.#runValidation(clamped));
  }

  #withError(error: Error | null): TextInputModel {
    if (error === this.error) {
      return this;
    }
    return this.#with({ error });
  }

  #with(patch: Partial<TextInputState>): TextInputModel {
    return new TextInputModel({
      value: this.value,
      position: this.position,
      focused: this.focused,
      placeholder: this.placeholder,
      echoMode: this.echoMode,
      echoCharacter: this.echoCharacter,
      charLimit: this.charLimit,
      width: this.width,
      prompt: this.prompt,
      promptStyle: this.promptStyle,
      textStyle: this.textStyle,
      placeholderStyle: this.placeholderStyle,
      cursorStyle: this.cursorStyle,
      validateFn: this.validateFn,
      keyMap: this.keyMap,
      cursor: this.cursor,
      error: this.error,
      ...patch,
    });
  }

  #runValidation(value: string): Error | null {
    return this.validateFn ? this.validateFn(value) : null;
  }

  #remainingCapacity(current: string): number {
    if (this.charLimit <= 0) {
      return Number.POSITIVE_INFINITY;
    }
    const remaining = this.charLimit - runeCount(current);
    return Math.max(0, remaining);
  }
}

function sanitizeValue(value: string): string {
  return sanitizer.sanitize(value ?? "");
}

function clampToLimit(value: string, charLimit: number): string {
  if (charLimit <= 0) {
    return value;
  }
  return clampGraphemes(value, charLimit);
}

function clampGraphemes(value: string, limit: number): string {
  if (limit <= 0) {
    return "";
  }
  const graphemes = splitGraphemes(value);
  if (graphemes.length <= limit) {
    return graphemes.join("");
  }
  return graphemes.slice(0, limit).join("");
}

function splitGraphemes(value: string): string[] {
  return splitter.splitGraphemes(value ?? "");
}

function sliceGraphemes(value: string, start: number, end?: number): string {
  const graphemes = splitGraphemes(value);
  return graphemes.slice(start, end).join("");
}

function runeCount(value: string): number {
  return splitter.countGraphemes(value ?? "");
}

function clamp(value: number, min: number, max: number): number {
  const lower = Math.min(min, max);
  const upper = Math.max(min, max);
  return Math.min(upper, Math.max(lower, value));
}

function isWhitespace(grapheme: string): boolean {
  return /^\s+$/.test(grapheme);
}

function visibleRange(widths: number[], position: number, maxWidth: number): [number, number] {
  const len = widths.length;
  if (!Number.isFinite(maxWidth) || maxWidth <= 0) {
    return [0, len];
  }
  if (len === 0) {
    return [0, 0];
  }

  const widthAt = (i: number) => (i >= 0 && i < len ? widths[i] ?? 0 : 0);
  const budget = maxWidth;

  let start = Math.min(position, len);
  let end = start;
  let current = 0;

  if (position < len) {
    current = widthAt(position);
    start = position;
    end = position + 1;
  } else {
    // Cursor is at the end - reserve 1 cell for the cursor space character
    current = 1;
  }

  while (start > 0) {
    const w = widthAt(start - 1);
    if (current > 0 && current + w > budget) {
      break;
    }
    start--;
    current += w;
    if (current >= budget) {
      break;
    }
  }

  while (end < len) {
    const w = widthAt(end);
    if (current > 0 && current + w > budget) {
      break;
    }
    end++;
    current += w;
    if (current >= budget) {
      break;
    }
  }

  while (current > budget && start < end) {
    current -= widthAt(start);
    start++;
  }

  return [start, end];
}

function asError(err: unknown): Error {
  if (err instanceof Error) {
    return err;
  }
  if (typeof err === "string") return new Error(err);
  if (typeof err === "number" || typeof err === "boolean") return new Error(String(err));
  return new Error("clipboard error");
}
