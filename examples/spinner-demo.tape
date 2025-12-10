# Animated spinners with multiple styles

Output "spinner-demo.gif"

Set Shell "bash"
Set FontSize 57
Set Width 1900
Set Height 634
Set Theme "Catppuccin Mocha"
Set Padding 40
Set Framerate 30

Type "npx tsx spinner-demo.ts"
Sleep 500ms
Enter
Sleep 1500ms

# Cycle through spinner styles
Sleep 1s
Type "s"
Sleep 800ms
Type "s"
Sleep 800ms
Type "s"
Sleep 800ms
Type "s"
Sleep 800ms
Type "s"
Sleep 1s

# Exit
Sleep 500ms
Type "q"
Sleep 500ms
