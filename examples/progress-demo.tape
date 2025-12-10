# Animated progress bar with gradient

Output "progress-demo.gif"

Set Shell "bash"
Set FontSize 38
Set Width 1900
Set Height 634
Set Theme "Catppuccin Mocha"
Set Padding 40
Set Framerate 30

Type "npx tsx progress-demo.ts"
Sleep 500ms
Enter
Sleep 1500ms

# Increase progress
Sleep 500ms
Type "+"
Sleep 600ms
Type "+"
Sleep 600ms
Type "+"
Sleep 600ms

# Decrease progress
Type "-"
Sleep 600ms

# Toggle gradient mode
Type "g"
Sleep 800ms
Type "+"
Sleep 600ms
Type "+"
Sleep 800ms

# Reset
Type "r"
Sleep 800ms

# Exit
Sleep 500ms
Type "q"
Sleep 500ms
