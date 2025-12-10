# Countdown timer with controls

Output "timer-demo.gif"

Set Shell "bash"
Set FontSize 43
Set Width 1900
Set Height 475
Set Theme "Catppuccin Mocha"
Set Padding 40
Set Framerate 30

Type "npx tsx timer-demo.ts"
Sleep 500ms
Enter
Sleep 1500ms

# Let timer run
Sleep 2s

# Pause
Space
Sleep 1s

# Resume
Space
Sleep 1500ms

# Restart
Type "r"
Sleep 2s

# Exit
Sleep 500ms
Type "q"
Sleep 500ms
