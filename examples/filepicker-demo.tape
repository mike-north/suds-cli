# Filesystem browser

Output "filepicker-demo.gif"

Set Shell "bash"
Set FontSize 33
Set Width 1900
Set Height 1188
Set Theme "Catppuccin Mocha"
Set Padding 40
Set Framerate 30

Type "npx tsx filepicker-demo.ts"
Sleep 500ms
Enter
Sleep 1500ms

# Navigate the file picker
Sleep 800ms
Down
Sleep 400ms
Down
Sleep 400ms
Down
Sleep 600ms

# Enter a directory
Enter
Sleep 800ms

# Navigate inside
Down
Sleep 400ms
Down
Sleep 600ms

# Go back up
Backspace
Sleep 800ms

# Toggle hidden files
Type "."
Sleep 1000ms

# Toggle hidden files off
Type "."
Sleep 800ms

# Exit
Sleep 500ms
Type "q"
Sleep 500ms
