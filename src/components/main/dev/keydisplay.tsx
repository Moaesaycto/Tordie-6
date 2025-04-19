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
      ControlLeft: "CTRL",
      ControlRight: "CTRL",
      ShiftLeft: "SHIFT",
      ShiftRight: "SHIFT",
      AltLeft: "ALT",
      AltRight: "ALT",
      MetaLeft: "META",
      MetaRight: "META",
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
      Space: "SPACE",
    };

    if (code in modMap) return modMap[code];
    if (code in symbolMap) return symbolMap[code];
    if (code.startsWith("Key")) return code.slice(3).toUpperCase();
    if (code.startsWith("Digit")) return code.slice(5);
    return code.toUpperCase();
  };

  const weight: Record<string, number> = {
    CTRL: 1,
    SHIFT: 2,
    ALT: 3,
    META: 4,
  };

  const labels = pressed.map(mapKey);
  const modifiers = labels.filter(l => l in weight).sort((a, b) => weight[a] - weight[b]);
  const others = labels.filter(l => !(l in weight));

  const display = [...modifiers, ...others].slice(0, 4).join("+");

  return (
    <div
      className="inline-block w-[20ch] whitespace-nowrap overflow-hidden text-ellipsis select-none font-mono"
      aria-label="currently pressed keys"
    >
      {display}
    </div>
  );
}
