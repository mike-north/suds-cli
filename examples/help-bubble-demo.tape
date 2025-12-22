# Scrollable help bubble

Output "help-bubble-demo.gif"

Set Shell "bash"
Set FontSize 40
Set Width 1900
Set Height 1006
Set Theme "Catppuccin Mocha"
Set Padding 40
Set Framerate 30

Type "npx tsx help-bubble-demo.ts"
Sleep 500ms
Enter
Sleep 1500ms

# Scroll down to see more entries
Sleep 500ms
Type "j"
Sleep 300ms
Type "j"
Sleep 300ms
Type "j"
Sleep 300ms
Type "j"
Sleep 500ms

# Page down
Type "f"
Sleep 800ms

# Page up
Type "b"
Sleep 800ms

# Half page down
Type "d"
Sleep 600ms

# Scroll up
Type "k"
Sleep 300ms
Type "k"
Sleep 300ms
Type "k"
Sleep 500ms

# Exit
Sleep 500ms
Type "q"
Sleep 500ms
