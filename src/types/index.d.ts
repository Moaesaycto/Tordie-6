export type Theme = "light" | "dark" | "system"

export type TextSize = "small" | "medium" | "large"

export type ValidOS = "macos" | "windows" | "linux" | null

export type CommandKey =
    | LowercaseLetter
    | UppercaseLetter
    | ModifierKey

type LowercaseLetter =
    | "a" | "b" | "c" | "d" | "e" | "f" | "g" | "h" | "i" | "j"
    | "k" | "l" | "m" | "n" | "o" | "p" | "q" | "r" | "s" | "t"
    | "u" | "v" | "w" | "x" | "y" | "z"

type UppercaseLetter =
    | "A" | "B" | "C" | "D" | "E" | "F" | "G" | "H" | "I" | "J"
    | "K" | "L" | "M" | "N" | "O" | "P" | "Q" | "R" | "S" | "T"
    | "U" | "V" | "W" | "X" | "Y" | "Z"

type ModifierKey =
    | "shift"
    | "fn"
    | "alt"
    | "ctrl"
    | "cmd"
