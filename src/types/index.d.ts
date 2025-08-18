export type Theme = "light" | "dark" | "system"

export type TextSize = "small" | "medium" | "large"

export type ValidOS = "macos" | "windows" | "linux" | null

export type CommandKey =
    | LowercaseLetter
    | UppercaseLetter
    | ModifierKey

export type Vector2 = {
    x: number,
    y: number,
}

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

export type UUID = string & { readonly __uuid: unique symbol };

export type SaveDoc = {
    version: string;
    documentUUID: UUID;
    backgroundColor: string;
    items: any[];
};