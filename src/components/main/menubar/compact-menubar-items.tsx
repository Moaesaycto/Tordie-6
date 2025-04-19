// lib/components/compact-menubar.tsx
import React from "react"
import {
    MenubarTrigger,
    MenubarItem,
    MenubarSeparator,
    MenubarShortcut,
    MenubarContent,
    MenubarRadioGroup,
    MenubarRadioItem,
    MenubarCheckboxItem,
    MenubarSubTrigger,
    MenubarSubContent,
} from "@/components/ui/menubar"
import { Check } from "lucide-react"
import { useFontSize } from "@/lib/format"

export const compactMenubarStyles = {
    trigger: "m-0 rounded-none px-2 py-1",
    item: "px-2 py-1 m-0 rounded-none",
    content: "gap-0 m-0 p-0 rounded-none",
    separator: "m-0",
}

export const CompactTrigger = ({
    children,
}: {
    children: React.ReactNode
}) => (
    <MenubarTrigger className={`${compactMenubarStyles.trigger} ${useFontSize()}`}>
        {children}
    </MenubarTrigger>
)

export const CompactSubTrigger = ({
    children,
    ...props
}: React.ComponentProps<typeof MenubarSubTrigger>) => {
    return (
        <MenubarSubTrigger
            className={`${compactMenubarStyles.item} ${useFontSize()}`}
            {...props}
        >
            {children}
        </MenubarSubTrigger>
    )
}

export const CompactItem = ({
    children,
    shortcut,
    ...props
}: React.ComponentProps<typeof MenubarItem> & {
    shortcut?: string
}) => (
    <MenubarItem className={`${compactMenubarStyles.item} ${useFontSize()}`} {...props}>
        {children}
        {shortcut && <MenubarShortcut>{shortcut}</MenubarShortcut>}
    </MenubarItem>
)

export const CompactContent = ({
    children,
}: {
    children: React.ReactNode
}) => (
    <MenubarContent
        align="start"
        sideOffset={0}
        alignOffset={0}
        className={compactMenubarStyles.content}
    >
        {children}
    </MenubarContent>
)

export const CompactSubContent = ({
    children,
    ...props
}: React.ComponentProps<typeof MenubarSubContent>) => {
    return (
        <MenubarSubContent
            sideOffset={0}
            className={`${compactMenubarStyles.content} w-full`}
            {...props}
        >
            {children}
        </MenubarSubContent>
    )
}

export const CompactSeparator = () => (
    <MenubarSeparator className={compactMenubarStyles.separator} />
)

export const CompactRadioGroup = <T extends string>({
    value,
    onChange,
    options,
}: {
    value: T
    onChange: (value: T) => void
    options: { label: string; value: T }[]
}) => (
    <MenubarRadioGroup value={value} onValueChange={(v) => onChange(v as T)}>
        {options.map((opt) => (
            <MenubarRadioItem
                key={opt.value}
                value={opt.value}
                className={`${compactMenubarStyles.item} ${useFontSize()} flex items-center justify-between`}
            >
                <span className={useFontSize()}>{opt.label}</span>
                {value === opt.value && <span><Check /></span>}
            </MenubarRadioItem>
        ))}
    </MenubarRadioGroup>
)

export const CompactCheckboxItem = ({
    children,
    checked,
    onCheckedChange,
}: {
    children: React.ReactNode
    checked: boolean
    onCheckedChange: () => void
}) => (
    <MenubarCheckboxItem
        checked={checked}
        onCheckedChange={onCheckedChange}
        className={`${compactMenubarStyles.item} ${useFontSize()} flex items-center justify-between`}
    >
        <span className={useFontSize()}>{children}</span>
        {checked && <span ><Check /></span>}
    </MenubarCheckboxItem>
)