# @suds-cli/dsl

## 1.0.0-alpha.4

### Patch Changes

- Updated dependencies [[`eabe864`](https://github.com/mike-north/boba-cli/commit/eabe86448f61f5495202e1cf80cae9a1aa06843c)]:
  - @boba-cli/progress@0.1.0-alpha.4

## 1.0.0-alpha.3

### Patch Changes

- Updated dependencies [[`898fa1b`](https://github.com/mike-north/boba-cli/commit/898fa1bfbc5ab788d9ded63228e46b69c9e7acc6)]:
  - @boba-cli/list@0.1.0-alpha.4

## 1.0.0-alpha.2

### Major Changes

- [#47](https://github.com/mike-north/boba-cli/pull/47) [`0a45b65`](https://github.com/mike-north/boba-cli/commit/0a45b65722c56f8f299e0e20998f9f3780d6f23e) Thanks [@mike-north](https://github.com/mike-north)! - Require explicit platform adapter for Program and DSL apps

  **BREAKING CHANGE**: The `platform` option is now required when creating a `Program` or running a DSL app. This ensures that browser builds don't accidentally bundle Node.js-specific code.

  **Before:**

  ```typescript
  import { Program } from '@boba-cli/tea'

  const program = new Program(model)
  await program.run() // Platform was auto-detected (pulled in Node.js code)
  ```

  **After:**

  ```typescript
  import { Program } from '@boba-cli/tea'
  import { createNodePlatform } from '@boba-cli/machine/node'

  const program = new Program(model, { platform: createNodePlatform() })
  await program.run()
  ```

  For browser environments:

  ```typescript
  import { createBrowserPlatform } from '@boba-cli/machine/browser'
  const platform = createBrowserPlatform({ terminal })
  const program = new Program(model, { platform })
  ```

  The main `@boba-cli/machine` entry point no longer exports `autoDetectPlatform` or `createPlatform`. Environment detection utilities `isNodeEnvironment()` and `isBrowserEnvironment()` are still available for runtime checks.

### Minor Changes

- [#49](https://github.com/mike-north/boba-cli/pull/49) [`b37aba0`](https://github.com/mike-north/boba-cli/commit/b37aba018e2b343ed3f5d30d876fcf5e1ec17a1e) Thanks [@mike-north](https://github.com/mike-north)! - Adds comprehensive component builder exports for building rich CLI applications. The DSL package now exports 17 component builders covering common UI patterns: code viewer, file system navigation (filepicker, filetree), help systems (help, helpBubble), interactive lists, markdown rendering, pagination, animated progress bars with gradients, spinners, status bars, time tracking (stopwatch, timer), data tables, text input (textArea, textInput), and scrollable viewports. Each component builder provides a declarative API that integrates seamlessly with the App builder pattern.

### Patch Changes

- Updated dependencies [[`67cd786`](https://github.com/mike-north/boba-cli/commit/67cd7869dd69156aafb7cedcff270fb27341879d), [`0a45b65`](https://github.com/mike-north/boba-cli/commit/0a45b65722c56f8f299e0e20998f9f3780d6f23e)]:
  - @boba-cli/machine@0.1.0-alpha.2
  - @boba-cli/chapstick@0.1.0-alpha.3
  - @boba-cli/tea@1.0.0-alpha.2
  - @boba-cli/code@0.1.0-alpha.3
  - @boba-cli/filepicker@0.1.0-alpha.3
  - @boba-cli/filetree@0.1.0-alpha.3
  - @boba-cli/markdown@0.1.0-alpha.3
  - @boba-cli/help@0.1.0-alpha.3
  - @boba-cli/list@0.1.0-alpha.3
  - @boba-cli/progress@0.1.0-alpha.3
  - @boba-cli/spinner@0.1.0-alpha.3
  - @boba-cli/statusbar@0.1.0-alpha.3
  - @boba-cli/table@0.1.0-alpha.3
  - @boba-cli/textarea@0.1.0-alpha.3
  - @boba-cli/textinput@0.1.0-alpha.3
  - @boba-cli/viewport@0.1.0-alpha.3
  - @boba-cli/paginator@0.1.0-alpha.2
  - @boba-cli/stopwatch@0.1.0-alpha.2
  - @boba-cli/timer@0.1.0-alpha.2

## 0.1.0-alpha.1

### Minor Changes

- [#41](https://github.com/mike-north/boba-cli/pull/41) [`b499f15`](https://github.com/mike-north/boba-cli/commit/b499f15d35675af1e740d92468da921344dda321) Thanks [@mike-north](https://github.com/mike-north)! - Add declarative DSL for building CLI applications with minimal boilerplate

  Introduces a SwiftUI-inspired builder API that reduces typical application code by 65-76% compared to raw TEA while maintaining full type safety through phantom types.

  Key features:
  - Fluent builder pattern: `.state()`, `.component()`, `.onKey()`, `.view()`, `.build()`
  - View DSL primitives: `text`, `vstack`, `hstack`, `spacer`, `divider`
  - Conditional rendering helpers: `when`, `choose`, `map`
  - Component builders for `spinner` and `textInput` with automatic lifecycle management
  - Event context API with `state`, `update`, `setState`, `quit` methods
  - Full TypeScript inference without requiring type annotations

- [`91d1441`](https://github.com/mike-north/boba-cli/commit/91d144145cacb3b0464ea244ad05a61a2b83bd0f) Thanks [@mike-north](https://github.com/mike-north)! - Deprecate @suds-cli/_ packages in favor of @boba-cli/_

  All packages in this scope are being renamed from `@suds-cli/*` to `@boba-cli/*`. Please update your dependencies to use the new package names.

### Patch Changes

- Updated dependencies [[`91d1441`](https://github.com/mike-north/boba-cli/commit/91d144145cacb3b0464ea244ad05a61a2b83bd0f)]:
  - @suds-cli/chapstick@0.1.0-alpha.2
  - @suds-cli/key@0.1.0-alpha.1
  - @suds-cli/spinner@0.1.0-alpha.2
  - @suds-cli/tea@0.1.0-alpha.1
  - @suds-cli/textinput@0.1.0-alpha.2
