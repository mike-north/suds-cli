> **Deprecation Notice:** This package is being renamed from `@suds-cli/filepicker` to `@boba-cli/filepicker`. Please update your dependencies accordingly.

# @suds-cli/filepicker

File system browser component for Suds terminal UIs. Ported from the Charm `bubbles/filepicker` component.

<img src="../../examples/filepicker-demo.gif" width="950" alt="Filepicker component demo" />

## Usage

```ts
import { FilepickerModel } from '@suds-cli/filepicker'

const [picker, cmd] = FilepickerModel.new({
  currentDir: process.cwd(),
  showHidden: false,
})
```
