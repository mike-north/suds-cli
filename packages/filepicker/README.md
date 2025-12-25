# @boba-cli/filepicker

File system browser component for Boba terminal UIs. Ported from the Charm `bubbles/filepicker` component.

<img src="../../examples/filepicker-demo.gif" width="950" alt="Filepicker component demo" />

## Usage

```ts
import { FilepickerModel } from '@boba-cli/filepicker'

const [picker, cmd] = FilepickerModel.new({
  currentDir: process.cwd(),
  showHidden: false,
})
```
