import { useCallback, useEffect, useState } from "react";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
// import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { HexColorPicker } from "react-colorful";
import { cn } from "@/lib/utils";
import { normaliseHex, readableTextColour } from "@/lib/color"; // toHex
import { PencilIcon, LockIcon, UnlockIcon } from "lucide-react";

type Props = {
  value: string;
  onChange: (hex: string) => void;
  locked?: boolean;                 // controlled by provider
  onToggleLock?: () => void;        // controlled by provider
  presets?: string[];
  className?: string;
  side?: "top" | "right" | "bottom" | "left";
  align?: "start" | "center" | "end";
};

export function ColorPopover({
  value,
  onChange,
  locked = false,
  onToggleLock,
  presets = [
    "#F9FAFB", "#161719",
    "#FFFFFF", "#F5F5F5", "#E5E7EB", "#D1D5DB",
    "#FDF6E3", "#FFF8E1", "#FFFBEB",
    "#F0F9FF", "#ECFDF5", "#FAF5FF", "#FCE7F3"
  ],
  className,
  side = "bottom",
  align = "end",
}: Props) {
  const [open, setOpen] = useState(false);

  const [text, setText] = useState(value);
  void text; // left here for future use if input returns

  useEffect(() => setText(value), [value]);

  // Only allow changes when unlocked.
  const safeChange = useCallback(
    (hex: string) => {
      if (!locked) onChange(hex);
    },
    [locked, onChange]
  );

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <button
          type="button"
          onClick={() => setOpen((o) => !o)}
          className={cn(
            "group inline-flex items-center border-y-2 border-r-2 border-l-none bg-muted/30 shadow-sm overflow-visible rounded-r-sm",
            className
          )}
          aria-label="Open colour picker"
        >
          <span
            className="relative h-6 w-6 flex justify-center items-center overflow-visible"
            style={{ backgroundColor: value, color: readableTextColour(value) }}
          >
            <PencilIcon className="w-4 h-4 opacity-0 group-hover:opacity-100" />
            <div
              className={cn(
                "absolute -left-5 top-1/2 -translate-y-1/2 z-10 pointer-events-none"
              )}
              aria-hidden
            >
              {locked ? (
                <LockIcon className="w-3 h-3 text-destructive" />
              ) : (
                <UnlockIcon className="w-3 h-3 text-primary" />
              )}
            </div>
          </span>
        </button>
      </PopoverTrigger>

      {/* PopoverContent now hugs its content width */}
      <PopoverContent side={side} align={align} className="inline-flex flex-col gap-2 rounded-xs w-auto">
        {/* Lock toggle row */}
        <div className="flex flex-row-reverse border-none items-center justify-between">
          <Button
            className="w-6 h-6 rounded-none"
            type="button"
            variant={locked ? "destructive" : "outline"}
            size="sm"
            onClick={onToggleLock}
            aria-pressed={locked}
            aria-label={locked ? "Unlock colour" : "Lock colour"}
            title={locked ? "Unlock colour" : "Lock colour"}
          >
            {locked ? <LockIcon className="w-3 h-3" /> : <UnlockIcon className="w-3 h-3" />}
          </Button>

          {/* Preview swatch */}
          <div
            className={cn(
              "relative py-1 w-full flex-1 overflow-hidden rounded-xs border flex justify-center items-center",
              locked && "opacity-90"
            )}
            style={{ backgroundColor: value }}
          >
            <span className="font-mono text-xs" style={{ color: readableTextColour(value) }}>
              {value}
            </span>
            {locked && (
              <div className="absolute inset-0 cursor-not-allowed" aria-hidden />
            )}
          </div>
        </div>

        {/* Picker + presets row – controls final width of popover */}
        <div
          data-color-picker
          className={cn(
            "flex justify-center items-start w-auto", // remove flex-1/w-full to hug content
            locked && "pointer-events-none opacity-60"
          )}
        >
          {/* Main picker */}
          <div className="hex-color-picker">
            <HexColorPicker
              color={value}
              onChange={(v) => safeChange(normaliseHex(v))}
              // Force main region unrounded but keep selector handles untouched
              className="!rounded-none [&_.react-colorful__saturation]:!rounded-none [&_.react-colorful__hue]:!rounded-none"
            />
          </div>

          {/* Preset swatches */}
          {presets.length > 0 && (
            <div className={cn("flex flex-col items-center", locked && "opacity-60")}>
              {presets.map((p) => (
                <button
                  key={p}
                  type="button"
                  className="h-6 w-6 rounded-none border"
                  style={{ backgroundColor: p }}
                  onClick={() => safeChange(p)}
                  aria-label={`Preset ${p}`}
                  title={p}
                  disabled={locked}
                />
              ))}
            </div>
          )}
        </div>

        {/* 
        // Input + copy/done buttons (kept commented as original)
        <div className="flex items-center gap-2">
          <Input
            className="font-mono text-xs"
            value={text}
            onChange={(e) => setText(e.target.value)}
            onBlur={() => {
              const hex = toHex(text);
              if (hex) safeChange(hex);
              setText(hex ?? value);
            }}
            onKeyDown={(e) => {
              if (e.key === "Enter") (e.currentTarget as HTMLInputElement).blur();
            }}
            placeholder="#ffffff"
            spellCheck={false}
            disabled={locked}
          />
          <Button variant="outline" size="sm" onClick={() => navigator.clipboard?.writeText(value)}>
            Copy
          </Button>
          <Button size="sm" onClick={() => setOpen(false)}>Done</Button>
        </div> 
        */}
      </PopoverContent>
    </Popover>
  );
}
