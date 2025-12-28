# Text input demo using DSL builder

Output "../../animations/textinput.gif"

Source ../../common.tape

Set Height 634
Set FontSize 38

Hide
Type "pnpm ex:textinput"
Enter
Wait+Screen /Demo/
Show

Sleep 1s

# Type some text
Type "Jo"
Sleep 500ms
Type "hn"
Sleep 500ms
Type " Smith"
Sleep 1s

# Exit
Type "q"
Sleep 500ms
