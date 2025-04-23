import { useEffect, useState } from "react";

export default function PressedKeys() {
  const [pressed, setPressed] = useState<string[]>([]);

  useEffect(() => {
    const add = (e: KeyboardEvent) => {
      if (e.repeat) return;
      setPressed(prev => (prev.includes(e.code) ? prev : [...prev, e.code]));
    };

    const remove = (e: KeyboardEvent) => {
      setPressed(prev => prev.filter(code => code !== e.code));
    };

    const clear = () => setPressed([]);

    window.addEventListener("keydown", add);
    window.addEventListener("keyup", remove);
    window.addEventListener("blur", clear);
    document.addEventListener("visibilitychange", () => {
      if (document.visibilityState === "hidden") clear();
    });

    return () => {
      window.removeEventListener("keydown", add);
      window.removeEventListener("keyup", remove);
      window.removeEventListener("blur", clear);
      document.removeEventListener("visibilitychange", clear);
    };
  }, []);

  const mapKey = (code: string): string => {
    const modMap: Record<string, string> = {
      ControlLeft: "Ctrl",
      ControlRight: "Ctrl",
      ShiftLeft: "Shift",
      ShiftRight: "Shift",
      AltLeft: "Alt",
      AltRight: "Alt",
      MetaLeft: "Meta",
      MetaRight: "Meta",
    };

    const symbolMap: Record<string, string> = {
      Backquote: "`",
      Minus: "-",
      Equal: "=",
      BracketLeft: "[",
      BracketRight: "]",
      Backslash: "\\",
      Semicolon: ";",
      Quote: "'",
      Comma: ",",
      Period: ".",
      Slash: "/",
      Space: "Space",
    };

    if (code in modMap) return modMap[code];
    if (code in symbolMap) return symbolMap[code];
    if (code.startsWith("Key")) return code.slice(3).toUpperCase();
    if (code.startsWith("Digit")) return code.slice(5);
    return code.toUpperCase();
  };

  const weight: Record<string, number> = {
    Ctrl: 1,
    Shift: 2,
    Alt: 3,
    Meta: 4,
  };

  const labels = pressed.map(mapKey);
  const modifiers = labels.filter(l => l in weight).sort((a, b) => weight[a] - weight[b]);
  const others = labels.filter(l => !(l in weight));
  const display = [...modifiers, ...others].slice(0, 4).join(" + ");

  return (
    <div
      className="flex flex-col h-full px-2 text-[0.625rem] font-medium font-mono select-none w-[24ch] overflow-hidden whitespace-nowrap"
      aria-label="Currently pressed keys"
    >
      <p>Pressed Key:</p>
      {display || <span className="text-muted-foreground">None</span>}
    </div>
  );
}
