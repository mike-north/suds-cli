---
"@boba-cli/machine": minor
"@boba-cli/tea": major
"@boba-cli/dsl": major
---

Require explicit platform adapter for Program and DSL apps

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
