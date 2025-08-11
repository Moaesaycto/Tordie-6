import {
    Menubar,
    MenubarMenu,
    MenubarSub,
} from "@/components/ui/menubar"

import { useTheme } from "@/components/theme-provider"
import { useApp } from "@/components/app-provider"
import { TextSize, Theme } from "@/types"
import { formatKeyHint, useKeyHint } from "@/lib/format"
import { CompactCheckboxItem, CompactContent, CompactItem, compactMenubarStyles, CompactRadioGroup, CompactSeparator, CompactSubContent, CompactSubTrigger, CompactTrigger } from "./compact-menubar-items"
import { useExportLayerSVG } from "@/components/hooks/document/Export"

export function HeaderMenubar() {
    return (
        <Menubar className="rounded-none w-full p-0 gap-0 h-auto min-h-0" loop>
            <FileMenu />
            <ViewMenu />
            <HelpHemu />
        </Menubar>
    )
}

const FileMenu = () => {
    const modKey = useKeyHint()
    const exportLayerSVG = useExportLayerSVG();

    return (
        <MenubarMenu>
            <CompactTrigger>File</CompactTrigger>
            <CompactContent>
                <CompactItem shortcut={formatKeyHint([modKey, "t"])}>
                    Example
                </CompactItem>
                <CompactSeparator />
                <CompactItem
                    shortcut={formatKeyHint([modKey, "t"])}
                    onClick={exportLayerSVG}
                >
                    Export
                </CompactItem>
                <CompactItem disabled>Disabled</CompactItem>
            </CompactContent>
        </MenubarMenu>
    )
}

const ViewMenu = () => {
    const { theme, setTheme, textSize, setTextSize } = useTheme()
    const { devMode, setDevMode } = useApp()

    return (
        <MenubarMenu>
            <CompactTrigger>View</CompactTrigger>
            <CompactContent>
                <MenubarSub>
                    <CompactSubTrigger>
                        Theme
                    </CompactSubTrigger>
                    <CompactSubContent className={compactMenubarStyles.content}>
                        <CompactRadioGroup
                            value={theme}
                            onChange={(v) => setTheme(v as Theme)}
                            options={[
                                { label: "Dark", value: "dark" },
                                { label: "Light", value: "light" },
                                { label: "System", value: "system" },
                            ]}
                        />
                    </CompactSubContent>
                </MenubarSub>
                <MenubarSub>
                    <CompactSubTrigger>
                        Text Size
                    </CompactSubTrigger>
                    <CompactSubContent className={compactMenubarStyles.content}>
                        <CompactRadioGroup
                            value={textSize}
                            onChange={(v) => setTextSize(v as TextSize)}
                            options={[
                                { label: "Small", value: "small" },
                                { label: "Medium", value: "medium" },
                                { label: "Large", value: "large" },
                            ]}
                        />
                    </CompactSubContent>
                </MenubarSub>

                <CompactSeparator />

                <MenubarSub>
                    <CompactSubTrigger>
                        Advanced
                    </CompactSubTrigger>
                    <CompactSubContent>
                        <CompactCheckboxItem
                            checked={devMode}
                            onCheckedChange={() => setDevMode(!devMode)}
                        >
                            Developer Mode
                        </CompactCheckboxItem>
                    </CompactSubContent>
                </MenubarSub>
            </CompactContent>
        </MenubarMenu>
    )
}

const HelpHemu = () => {

    return (
        <MenubarMenu>
            <CompactTrigger>Help</CompactTrigger>
            <CompactContent>
                <CompactItem disabled>
                    About Tordie 6
                </CompactItem>
            </CompactContent>
        </MenubarMenu>
    )
}
