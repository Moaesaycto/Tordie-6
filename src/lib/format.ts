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
    large: "text-lg",
}

const inputHeights: Record<string, string> = {
    small: "h-6",
    medium: "h-7",
    large: "h-8",
};

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

export function useInputHeight() {
    const { textSize } = useTheme()
    return inputHeights[textSize];
}

export const formatLabel = (num: number) => {
    const str = Number(num).toPrecision(3);
    return Number(str).toString();
};

export function formatRounded(num: number | null | undefined, decimalPlaces: number = 3): string {
  if (typeof num !== 'number' || isNaN(num)) return "-";
  return num.toFixed(decimalPlaces);
}
