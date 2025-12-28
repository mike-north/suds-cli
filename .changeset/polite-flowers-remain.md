---
"@boba-cli/list": patch
---

Fixes filter character input handling. When in filtering mode (after pressing `/`), typing characters now properly appends to the filter value and filters the list. Backspace removes the last character from the filter, the `/` key adds to the filter when already in filtering mode, space key is handled correctly, and Alt+character combinations are ignored during filtering.
