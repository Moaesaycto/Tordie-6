import { useStatus } from "@/components/status-provider"
import { useTheme } from "@/components/theme-provider"
import { CommandKey } from "@/types"

const modifierSymbols: Record<string, string> = {
    cmd: "⌘",
    ctrl: "Ctrl",
    shift: "⇧",
    alt: "⌥",
    fn: "fn",
}

const sizeStyles: Record<string, string> = {
    small: "text-xs",
    medium: "text-sm",
    large: "text-md",
}

export function useKeyHint() {
    const { os } = useStatus()
    return os === "macos" ? "cmd" : "ctrl"
}

export function formatKeyHint(keys: CommandKey[]): string {
    return keys
        .map((key) => modifierSymbols[key] || key.toUpperCase())
        .join(" + ")
}

export function useFontSize() {
    const { textSize } = useTheme()
    return sizeStyles[textSize];
}