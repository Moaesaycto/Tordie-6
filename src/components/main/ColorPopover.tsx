import * as React from "react";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { HexColorPicker } from "react-colorful";
import { cn } from "@/lib/utils";
import { normaliseHex, toHex } from "@/lib/color";

export function ColorPopover({
    value,
    onChange,
    presets = [],
    className,
    side = "bottom",
    align = "end",
}: {
    value: string;
    onChange: (hex: string) => void;
    presets?: string[];
    className?: string;
    side?: "top" | "right" | "bottom" | "left";
    align?: "start" | "center" | "end";
}) {
    const [open, setOpen] = React.useState(false);
    const [text, setText] = React.useState(value);
    React.useEffect(() => setText(value), [value]);

    const contentRef = React.useRef<HTMLDivElement>(null);
    const triggerRef = React.useRef<HTMLButtonElement>(null);

    const close = React.useCallback(() => {
        setOpen(false);
        setTimeout(() => triggerRef.current?.focus(), 0);
    }, []);

    return (
        <Popover open={open} onOpenChange={setOpen} modal={false}>
            <PopoverTrigger asChild>
                <button ref={triggerRef}
                    type="button" onClick={() => setOpen((o) => !o)}
                    className={cn(
                        "tauri-no-drag ml-2 inline-flex items-center rounded-md border bg-muted/30 p-0.5 shadow-sm",
                        className
                    )}
                    aria-label="Open colour picker"
                >
                    <span className="h-6 w-6 rounded-sm border" style={{ backgroundColor: value }} />
                </button>
            </PopoverTrigger>

            <PopoverContent
                side={side}
                align={align}
                tabIndex={-1} ref={contentRef}
                onOpenAutoFocus={(e) => { e.preventDefault(); contentRef.current?.focus(); }}
                onPointerDownOutside={(e) => {
                    const target = (e.target || null) as Node | null;
                    const contentEl = contentRef.current;
                    const triggerEl = triggerRef.current;
                    if ((contentEl && target && contentEl.contains(target)) || (triggerEl && target && triggerEl.contains(target))) {
                        e.preventDefault();
                        return;
                    }
                    e.preventDefault();
                    close();
                }}
                onFocusOutside={(e) => {
                    const target = (e.target || null) as Node | null;
                    const contentEl = contentRef.current;
                    const triggerEl = triggerRef.current;
                    if ((contentEl && target && contentEl.contains(target)) || (triggerEl && target && triggerEl.contains(target))) {
                        e.preventDefault();
                    }
                }}
                onKeyDown={(e) => {
                    if (e.key === 'Enter') close();
                }}
                onEscapeKeyDown={() => setOpen(false)}
            >
                <div className="flex items-center gap-2">
                    <div className="relative h-10 flex-1 overflow-hidden rounded-md border">
                        <div className="absolute inset-0 bg-[linear-gradient(45deg,#0000_25%,#0000000d_25%,#0000000d_50%,#0000_50%,#0000_75%,#0000000d_75%,#0000000d)] bg-[length:12px_12px]" />
                        <div className="absolute inset-0" style={{ backgroundColor: value }} />
                    </div>
                    <span className="w-20 text-right font-mono text-xs opacity-80">{value}</span>
                </div>

                {/* Wrap the picker so we can detect interactions reliably */}
                <div data-color-picker>
                    <HexColorPicker color={value} onChange={(v) => {

                        onChange(normaliseHex(v))
                    }
                    } />
                </div>

                {presets.length > 0 && (
                    <div className="flex flex-wrap gap-1.5">
                        {presets.map((p) => (
                            <button
                                key={p}
                                type="button"
                                className="h-5 w-5 rounded-sm border"
                                style={{ backgroundColor: p }}
                                onClick={() => onChange(p)}
                                aria-label={`Preset ${p}`}
                                title={p}
                            />
                        ))}
                    </div>
                )}

                <div className="flex items-center gap-2">
                    <Input
                        className="font-mono text-xs"
                        value={text}
                        onChange={(e) => {
                            setText(e.target.value)
                        }}
                        onBlur={() => {
                            const hex = toHex(text);
                            if (hex) onChange(hex);
                            setText(hex ?? value);
                        }}
                        onKeyDown={(e) => {
                            if (e.key === "Enter") (e.currentTarget as HTMLInputElement).blur();
                        }}
                        placeholder="#ffffff"
                        spellCheck={false}
                    />
                    <Button
                        variant="outline"
                        size="sm"
                        onClick={() => navigator.clipboard?.writeText(value)}
                    >
                        Copy
                    </Button>
                    <Button size="sm" onClick={close}>
                        Done
                    </Button>
                </div>
            </PopoverContent>
        </Popover>
    );
}
