import { TextSize, Theme } from "@/types"
import { createContext, useContext, useEffect, useState } from "react"

type ThemeProviderProps = {
    children: React.ReactNode
    defaultTheme?: Theme
    defaultTextSize?: TextSize
    storageKey?: string
}

type ThemeProviderState = {
    theme: Theme
    resolvedTheme: "light" | "dark"
    setTheme: (theme: Theme) => void
    textSize: TextSize
    setTextSize: (size: TextSize) => void
}

const initialState: ThemeProviderState = {
    theme: "system",
    resolvedTheme: "light",
    setTheme: () => null,
    textSize: "medium",
    setTextSize: () => null,
}

const ThemeProviderContext = createContext<ThemeProviderState>(initialState)

export function ThemeProvider({
    children,
    defaultTheme = "system",
    defaultTextSize = "medium",
    storageKey = "vite-ui-theme",
}: ThemeProviderProps) {
    const [theme, setThemeState] = useState<Theme>(
        () => (localStorage.getItem(storageKey) as Theme) || defaultTheme
    )

    const [resolvedTheme, setResolvedTheme] = useState<"light" | "dark">(() => {
        if (theme === "system") {
            return window.matchMedia("(prefers-color-scheme: dark)").matches
                ? "dark"
                : "light"
        }
        return theme
    })

    const [textSize, setTextSizeState] = useState<TextSize>(
        () => (localStorage.getItem(`${storageKey}-textSize`) as TextSize) || defaultTextSize
    )

    useEffect(() => {
        const root = document.documentElement

        const appliedTheme =
            theme === "system"
                ? window.matchMedia("(prefers-color-scheme: dark)").matches
                    ? "dark"
                    : "light"
                : theme

        setResolvedTheme(appliedTheme)

        root.classList.remove("light", "dark")
        root.classList.add(appliedTheme)

        root.classList.remove("text-small", "text-medium", "text-large")
        root.classList.add(`text-${textSize}`)
    }, [theme, textSize])

    const setTheme = (newTheme: Theme) => {
        localStorage.setItem(storageKey, newTheme)
        setThemeState(newTheme)
    }

    const setTextSize = (size: TextSize) => {
        localStorage.setItem(`${storageKey}-textSize`, size)
        setTextSizeState(size)
    }

    const value: ThemeProviderState = {
        theme,
        resolvedTheme,
        setTheme,
        textSize,
        setTextSize,
    }

    return (
        <ThemeProviderContext.Provider value={value}>
            {children}
        </ThemeProviderContext.Provider>
    )
}

export const useTheme = () => {
    const context = useContext(ThemeProviderContext)

    if (context === undefined)
        throw new Error("useTheme must be used within a ThemeProvider")

    return context
}
