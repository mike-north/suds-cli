# @suds-cli/textinput

Single-line text input component for Suds terminal UIs. Port of Charmbracelet Bubbles textinput.

<img src="../../examples/textinput-demo.gif" width="950" />

## Install

```bash
pnpm add @suds-cli/textinput
```

## Quickstart

```ts
import { TextInputModel, EchoMode } from "@suds-cli/textinput";
import type { Cmd, Msg } from "@suds-cli/tea";

let input = TextInputModel.new({
  placeholder: "Type your name…",
  width: 40,
  echoMode: EchoMode.Normal,
});

function init(): Cmd<Msg> {
  const [focused, cmd] = input.focus();
  input = focused;
  return cmd;
}

function update(msg: Msg): [typeof model, Cmd<Msg>] {
  const [nextInput, cmd] = input.update(msg);
  input = nextInput;
  return [model, cmd];
}

function view(): string {
  return [
    "Name:",
    input.view(),
  ].join("\n");
}
```

## Features

- Grapheme-aware cursor movement and editing
- Placeholder text when empty
- Password/hidden echo modes and custom echo character
- Character limit enforcement
- Width-constrained rendering with horizontal scrolling
- Clipboard paste (uses `clipboardy`)
- Validation callback

## Key bindings (defaults)

- Move: `left/right`, `ctrl+b/ctrl+f`
- Word move: `alt+left/right`, `ctrl+left/right`, `alt+b/alt+f`
- Delete char: `backspace`, `delete`, `ctrl+h`, `ctrl+d`
- Delete word: `alt+backspace`, `alt+delete`, `ctrl+w`, `alt+d`
- Delete to start/end: `ctrl+u`, `ctrl+k`
- Home/end: `home`, `end`, `ctrl+a`, `ctrl+e`
- Paste: `ctrl+v`

## API

- `TextInputModel.new(options)` – create a model
- `model.focus()/blur()` – toggle focus (returns new model, plus optional command)
- `model.update(msg)` – handle Tea messages, returns `[model, cmd]`
- `model.view()` – render with prompt and cursor
- Editing helpers: `insertRunes`, `deleteLeft/Right`, `wordLeft/Right`, `deleteWordLeft/Right`, `deleteToStart/End`, `reset`
- Validation: `setValidateFunc(fn)`, `validate()`
- Clipboard: `paste()` (returns `[model, cmd]`) or use `pasteCommand`

## Scripts

- `pnpm -C packages/textinput build`
- `pnpm -C packages/textinput test`
- `pnpm -C packages/textinput lint`
- `pnpm -C packages/textinput generate:api-report`

## License

MIT



