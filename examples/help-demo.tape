# Contextual help display

Output "help-demo.gif"

Set Shell "bash"
Set FontSize 49
Set Width 1900
Set Height 950
Set Theme "Catppuccin Mocha"
Set Padding 40
Set Framerate 30

Type "npx tsx help-demo.ts"
Sleep 500ms
Enter
Sleep 1500ms

# Navigate the list
Sleep 500ms
Type "j"
Sleep 400ms
Type "j"
Sleep 400ms

# Select an item
Enter
Sleep 800ms

# Toggle full help
Type "?"
Sleep 1200ms

# Toggle back to short help
Type "?"
Sleep 800ms

# Navigate more
Type "k"
Sleep 400ms
Enter
Sleep 800ms

# Exit
Sleep 500ms
Type "q"
Sleep 500ms
