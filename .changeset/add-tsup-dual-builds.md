---
'@suds-cli/chapstick': minor
'@suds-cli/code': minor
'@suds-cli/cursor': minor
'@suds-cli/filepicker': minor
'@suds-cli/filesystem': minor
'@suds-cli/filetree': minor
'@suds-cli/help': minor
'@suds-cli/icons': minor
'@suds-cli/key': minor
'@suds-cli/list': minor
'@suds-cli/machine': minor
'@suds-cli/markdown': minor
'@suds-cli/paginator': minor
'@suds-cli/progress': minor
'@suds-cli/runeutil': minor
'@suds-cli/spinner': minor
'@suds-cli/statusbar': minor
'@suds-cli/stopwatch': minor
'@suds-cli/table': minor
'@suds-cli/tea': minor
'@suds-cli/textarea': minor
'@suds-cli/textinput': minor
'@suds-cli/timer': minor
'@suds-cli/viewport': minor
---

Add dual CJS/ESM builds using tsup bundler

All packages now provide both CommonJS and ESM output with proper TypeScript type declarations for each module system. Package exports are configured with conditional exports for seamless consumption in both CJS and ESM environments.
