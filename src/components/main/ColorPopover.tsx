import * as React from "react";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { HexColorPicker } from "react-colorful";
import { cn } from "@/lib/utils";
import { normaliseHex, readableTextColour, toHex } from "@/lib/color";
import { PencilIcon } from "lucide-react";

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

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <button
          type="button"
          onClick={() => setOpen((o) => !o)}
          className={cn("group inline-flex items-center border bg-muted/30 shadow-sm", className)}
          aria-label="Open colour picker"
        >
          <span
            className="relative h-6 w-6 flex justify-center items-center"
            style={{ backgroundColor: value, color: readableTextColour(value) }}
          >
            <PencilIcon className="w-4 h-4 opacity-0 group-hover:opacity-100" />
          </span>
        </button>
      </PopoverTrigger>

      <PopoverContent side={side} align={align}>
        <div className="flex items-center gap-2">
          <div
            className="relative h-10 flex-1 overflow-hidden rounded-md border flex justify-center items-center"
            style={{ backgroundColor: value }}
          >
            <span className="font-mono text-xs" style={{ color: readableTextColour(value) }}>
              {value}
            </span>
          </div>
        </div>

        <div data-color-picker>
          <HexColorPicker color={value} onChange={(v) => onChange(normaliseHex(v))} />
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
            onChange={(e) => setText(e.target.value)}
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
          <Button variant="outline" size="sm" onClick={() => navigator.clipboard?.writeText(value)}>
            Copy
          </Button>
          <Button size="sm" onClick={() => setOpen(false)}>Done</Button>
        </div>
      </PopoverContent>
    </Popover>
  );
}
