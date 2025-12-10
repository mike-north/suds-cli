# Filterable list with pagination

Output "list-demo.gif"

Set Shell "bash"
Set FontSize 68
Set Width 1900
Set Height 1900
Set Theme "Catppuccin Mocha"
Set Padding 40
Set Framerate 30

Type "npx tsx list-demo.ts"
Sleep 500ms
Enter
Sleep 1500ms

# Navigate the list
Sleep 500ms
Down
Sleep 400ms
Down
Sleep 400ms
Down
Sleep 600ms

# Go back up
Up
Sleep 400ms
Up
Sleep 600ms

# Try filtering
Type "/"
Sleep 500ms
Type@150ms "test"
Sleep 800ms
Enter
Sleep 800ms

# Clear filter
Escape
Sleep 800ms

# Exit
Sleep 500ms
Type "q"
Sleep 500ms
