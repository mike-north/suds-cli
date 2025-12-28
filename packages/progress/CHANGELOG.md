# @boba-cli/progress

## 0.1.0-alpha.4

### Patch Changes

- [#56](https://github.com/mike-north/boba-cli/pull/56) [`eabe864`](https://github.com/mike-north/boba-cli/commit/eabe86448f61f5495202e1cf80cae9a1aa06843c) Thanks [@mike-north](https://github.com/mike-north)! - Fix progress bar animation when setPercent() is called repeatedly in quick succession. Previously, rapid calls would cause animation frames to be rejected, making the progress bar appear stuck. Now the animation smoothly continues toward each new target.

## 0.1.0-alpha.3

### Patch Changes

- Updated dependencies [[`67cd786`](https://github.com/mike-north/boba-cli/commit/67cd7869dd69156aafb7cedcff270fb27341879d), [`0a45b65`](https://github.com/mike-north/boba-cli/commit/0a45b65722c56f8f299e0e20998f9f3780d6f23e)]:
  - @boba-cli/chapstick@0.1.0-alpha.3
  - @boba-cli/tea@1.0.0-alpha.2

## 0.1.0-alpha.2

### Minor Changes

- [`91d1441`](https://github.com/mike-north/boba-cli/commit/91d144145cacb3b0464ea244ad05a61a2b83bd0f) Thanks [@mike-north](https://github.com/mike-north)! - Deprecate @suds-cli/_ packages in favor of @boba-cli/_

  All packages in this scope are being renamed from `@suds-cli/*` to `@boba-cli/*`. Please update your dependencies to use the new package names.

### Patch Changes

- Updated dependencies [[`91d1441`](https://github.com/mike-north/boba-cli/commit/91d144145cacb3b0464ea244ad05a61a2b83bd0f)]:
  - @suds-cli/chapstick@0.1.0-alpha.2
  - @suds-cli/tea@0.1.0-alpha.1

## 0.1.0-alpha.1

### Minor Changes

- [#38](https://github.com/mike-north/suds-cli/pull/38) [`0756ee8`](https://github.com/mike-north/suds-cli/commit/0756ee87bd7470589cdd0181fab0573a90fe3c2d) Thanks [@mike-north](https://github.com/mike-north)! - Add dual CJS/ESM builds using tsup bundler

  All packages now provide both CommonJS and ESM output with proper TypeScript type declarations for each module system. Package exports are configured with conditional exports for seamless consumption in both CJS and ESM environments.

### Patch Changes

- Updated dependencies [[`0756ee8`](https://github.com/mike-north/suds-cli/commit/0756ee87bd7470589cdd0181fab0573a90fe3c2d), [`2fd3d20`](https://github.com/mike-north/suds-cli/commit/2fd3d20da5fd2c57e219f94b8c13d7fc68e1daca)]:
  - @boba-cli/chapstick@0.1.0-alpha.1
  - @boba-cli/tea@0.1.0-alpha.0

## 0.0.1-alpha.0

### Patch Changes

- Updated dependencies [[`a7fe6ab`](https://github.com/mike-north/suds-cli/commit/a7fe6aba10a7074b90a9f9febdd04432d26888c1)]:
  - @boba-cli/chapstick@0.1.0-alpha.0
