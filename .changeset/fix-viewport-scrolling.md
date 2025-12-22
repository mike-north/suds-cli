---
"@suds-cli/code": patch
"@suds-cli/markdown": patch
"@suds-cli/help": patch
---

Fix viewport scrolling and layout issues in code, markdown, and help components.

- **code**: Fix scrolling not working due to `Style.height()` truncating content before viewport receives it
- **markdown**: Fix scrolling and viewport width jitter by removing `Style.height()` and adding `alignHorizontal('left')` for consistent line padding
- **help**: Fix column alignment in HelpBubble by using `padEnd()` for consistent key column width
