import * as React from "react";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { HexColorPicker } from "react-colorful";
import { cn } from "@/lib/utils";
import { normaliseHex, readableTextColour, toHex } from "@/lib/color";
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
    "#111827", "#374151", "#6B7280", "#9CA3AF", "#D1D5DB", "#F9FAFB",
    "#EF4444", "#F59E0B", "#FBBF24", "#10B981", "#3B82F6", "#8B5CF6",
    "#EC4899", "#14B8A6", "#22D3EE", "#F97316"
  ],
  className,
  side = "bottom",
  align = "end",
}: Props) {
  const [open, setOpen] = React.useState(false);
  const [text, setText] = React.useState(value);
  React.useEffect(() => setText(value), [value]);

  // Only allow changes when unlocked.
  const safeChange = React.useCallback(
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
            "group inline-flex items-center border bg-muted/30 shadow-sm overflow-visible rounded-sm",
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

      <PopoverContent side={side} align={align} className="flex flex-col gap-4">
        <div className="flex items-center justify-between">
          <div className="text-xs text-muted-foreground">Background colour</div>
          <Button
            className="w-6 h-6 rounded-sm"
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
        </div>

        <div
          className={cn(
            "relative py-2 w-full flex-1 overflow-hidden rounded-sm border flex justify-center items-center",
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

        <div
          data-color-picker
          className={cn("w-full flex justify-center", locked && "pointer-events-none opacity-60")}
        >
          <HexColorPicker color={value} onChange={(v) => safeChange(normaliseHex(v))} />
        </div>

        {presets.length > 0 && (
          <div className={cn("flex flex-wrap gap-1.5", locked && "opacity-60")}>
            {presets.map((p) => (
              <button
                key={p}
                type="button"
                className="h-5 w-5 rounded-sm border"
                style={{ backgroundColor: p }}
                onClick={() => safeChange(p)}
                aria-label={`Preset ${p}`}
                title={p}
                disabled={locked}
              />
            ))}
          </div>
        )}

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
      </PopoverContent>
    </Popover>
  );
}
