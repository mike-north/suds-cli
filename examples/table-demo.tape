# Scrollable data table

Output "table-demo.gif"

Set Shell "bash"
Set FontSize 43
Set Width 1900
Set Height 1188
Set Theme "Catppuccin Mocha"
Set Padding 40
Set Framerate 30

Type "npx tsx table-demo.ts"
Sleep 500ms
Enter
Sleep 1500ms

# Navigate the table
Sleep 500ms
Type "j"
Sleep 400ms
Type "j"
Sleep 400ms
Type "j"
Sleep 600ms

# Go back up
Type "k"
Sleep 400ms
Type "k"
Sleep 600ms

# Jump to bottom
Type "G"
Sleep 800ms

# Jump to top
Type "g"
Sleep 800ms

# Exit
Sleep 500ms
Type "q"
Sleep 500ms
