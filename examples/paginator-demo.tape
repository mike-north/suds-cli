# Page navigation dots and numbers

Output "paginator-demo.gif"

Set Shell "bash"
Set FontSize 86
Set Width 1900
Set Height 2375
Set Theme "Catppuccin Mocha"
Set Padding 40
Set Framerate 30

Type "npx tsx paginator-demo.ts"
Sleep 500ms
Enter
Sleep 1500ms

# Navigate pages
Sleep 500ms
Type "d"
Sleep 600ms
Type "d"
Sleep 600ms
Type "d"
Sleep 600ms

# Go back
Type "u"
Sleep 600ms

# Toggle to arabic view
Type "t"
Sleep 800ms
Type "d"
Sleep 600ms
Type "d"
Sleep 800ms

# Toggle back to dots
Type "t"
Sleep 800ms

# Exit
Sleep 500ms
Type "q"
Sleep 500ms
