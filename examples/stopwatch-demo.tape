# Stopwatch with start/stop/reset

Output "stopwatch-demo.gif"

Set Shell "bash"
Set FontSize 57
Set Width 1900
Set Height 634
Set Theme "Catppuccin Mocha"
Set Padding 40
Set Framerate 30

Type "npx tsx stopwatch-demo.ts"
Sleep 500ms
Enter
Sleep 1500ms

# Let stopwatch run
Sleep 2s

# Pause
Space
Sleep 1s

# Resume
Space
Sleep 1500ms

# Reset
Type "r"
Sleep 1s

# Run again
Sleep 2s

# Exit
Sleep 500ms
Type "q"
Sleep 500ms
