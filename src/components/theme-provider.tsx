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
    setTheme: (theme: Theme) => void
    textSize: TextSize
    setTextSize: (size: TextSize) => void
}

const initialState: ThemeProviderState = {
    theme: "system",
    setTheme: () => null,
    textSize: "medium",
    setTextSize: () => null,
}

const ThemeProviderContext = createContext<ThemeProviderState>(initialState)

export function ThemeProvider({
    children,
    defaultTheme = "system",
    storageKey = "vite-ui-theme",
    ...props
}: ThemeProviderProps) {
    const [theme, setTheme] = useState<Theme>(
        () => (localStorage.getItem(storageKey) as Theme) || defaultTheme
    )

    useEffect(() => {
        const root = window.document.documentElement

        root.classList.remove("light", "dark")

        if (theme === "system") {
            const systemTheme = window.matchMedia("(prefers-color-scheme: dark)")
                .matches
                ? "dark"
                : "light"

            root.classList.add(systemTheme)
            return
        }

        root.classList.add(theme)
    }, [theme])


    const [textSize, setTextSize] = useState<TextSize>(
        () => (localStorage.getItem(`${storageKey}-textSize`) as TextSize) || "medium"
    )

    useEffect(() => {
        const root = document.documentElement

        root.classList.remove("light", "dark")
        root.classList.add(theme === "system"
            ? window.matchMedia("(prefers-color-scheme: dark)").matches
                ? "dark"
                : "light"
            : theme)

        root.classList.remove("text-small", "text-medium", "text-large")
        root.classList.add(`text-${textSize}`)
    }, [theme, textSize])

    const value: ThemeProviderState = {
        theme,
        setTheme: (theme: Theme) => {
            localStorage.setItem(storageKey, theme)
            setTheme(theme)
        },
        textSize,
        setTextSize: (size: TextSize) => {
            localStorage.setItem(`${storageKey}-textSize`, size)
            setTextSize(size)
        },
    }

    return (
        <ThemeProviderContext.Provider {...props} value={value}>
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
