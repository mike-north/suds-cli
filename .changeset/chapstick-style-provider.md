---
"@suds-cli/chapstick": minor
"@suds-cli/help": patch
"@suds-cli/table": patch
"@suds-cli/list": patch
---

Add dependency injection for Style providers to enable testability

Introduces a `StyleProvider` abstraction layer for style creation, addressing ES module mocking limitations that prevent reliable unit testing.

**Core changes to @suds-cli/chapstick:**
- New `StyleProvider` interface with `createStyle()` and `semanticStyles` accessors
- `ChapstickStyleProvider` as the default implementation
- `SemanticStyles` interface for success/error/warning/info/muted/highlight/header styles
- Exports `defaultStyleProvider` singleton

**Updates to help, table, and list packages:**
- Accept optional `styleProvider` parameter in options and `defaultStyles()` functions
- Allows tests to inject mock providers without ES module mocking

All existing APIs remain backward compatible with default parameters.
