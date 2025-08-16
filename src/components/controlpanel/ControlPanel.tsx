import { ScrollArea, ScrollBar } from "@/components/ui/scroll-area";
import { Input } from "@/components/ui/input";
import { useRef, useEffect, useState, type ComponentType } from "react";
import { useAppState } from "@/components/state-provider";
import type { Panel } from "@/types/state";
import { useFontSize } from "@/lib/format";
import { FileTextIcon, InfoIcon } from "lucide-react";
import { BiExport } from "react-icons/bi";
import { MdOutlineCreate } from "react-icons/md";

import DocumentPanel from "./DocumentPanel";
import ExportPanel from "./ExportPanel";
import DiagramPanel from "./DiagramPanel";

type PanelDef = {
  label: string;
  component: ComponentType;
  icon: any;
  color?: string;
};

const PANELS: Record<Panel, PanelDef> = {
  diagram: { label: "Diagram", component: DiagramPanel, icon: MdOutlineCreate, color: "#61b56a" },
  document: { label: "Document", component: DocumentPanel, icon: FileTextIcon, color: "#d6765c" },
  export: { label: "Export", component: ExportPanel, icon: BiExport, color: "#5762db" },
};

export function ControlPanel() {
  const wrapperRef = useRef<HTMLDivElement>(null);
  const headerRef = useRef<HTMLDivElement>(null);
  const [scrollHeight, setScrollHeight] = useState(0);

  const { currentState } = useAppState();
  const [value, setValue] = useState<Panel>(currentState.panelState);

  useEffect(() => setValue(currentState.panelState), [currentState.panelState]);

  useEffect(() => {
    const updateHeight = () => {
      if (!wrapperRef.current || !headerRef.current) return;
      setScrollHeight(wrapperRef.current.clientHeight - headerRef.current.clientHeight);
    };
    requestAnimationFrame(updateHeight);
    let t: ReturnType<typeof setTimeout>;
    const onResize = () => { clearTimeout(t); t = setTimeout(updateHeight, 100); };
    window.addEventListener("resize", onResize);
    return () => { clearTimeout(t); window.removeEventListener("resize", onResize); };
  }, []);

  const PanelComponent = PANELS[value].component;

  return (
    <div ref={wrapperRef} className="flex flex-col w-full h-full overflow-hidden">
      <div ref={headerRef} className="shrink-0 border-b mt-1">
        <PanelSelect
          value={value}
          onChange={(id: Panel) => setValue(id)}
        />
      </div>

      <ScrollArea className=" flex-1 w-full" style={{ height: scrollHeight }}>
        <div style={{ height: scrollHeight }}>
          <PanelComponent />
        </div>
        <ScrollBar orientation="vertical" />
      </ScrollArea>
    </div>
  );
}


type PanelSelectProps = {
  value: Panel;
  onChange: (id: Panel) => void;
};

const PanelSelect = ({ value, onChange }: PanelSelectProps) => {
  const [selected, setSelected] = useState<(PanelDef & { id: Panel })>();

  useEffect(() => {
    setSelected({ id: value, ...PANELS[value] });
  }, [value]);

  return (
    <div>
      <div className="flex gap-1 px-2">
        {(Object.keys(PANELS) as Panel[]).map((id) => {
          const { label, icon: Icon, color } = PANELS[id];

          return (
            <div key={id} className="flex items-center gap-1">
              <span
                className="flex items-center justify-center rounded-t"
                title={label}
                style={{
                  backgroundColor: color,
                  borderWidth: 2,
                  width: 24,
                  height: 24,
                  borderBottom: "none",
                }}
                onClick={() => {
                  setSelected({ id, ...PANELS[id] });
                  onChange(id);
                }}
                role="button"
                aria-pressed={selected?.id === id}
              >
                <Icon className="h-4 w-4" style={{ color: "white" }} />
              </span>
            </div>
          );
        })}
      </div>
      <div
        className="border w-full text-center text-sm uppercase rounded-t"
        style={{
          borderColor: selected?.color,
          backgroundColor: selected?.color,
          color: "white",
          borderWidth: 2,
        }}
      >
        {selected?.label}
      </div>
    </div>
  );
};


type PanelPageProps = { children: React.ReactNode };
export const PanelPage = ({ children }: PanelPageProps) => {
  const fontSize = useFontSize();
  return (
    <div className={`flex h-full min-h-0 flex-col w-full ${fontSize} gap-2 p-1 bg-accent `}>
      {children}
    </div>
  );
};


type InputRowProps = {
  label: string;
  title?: string;
  value?: string;                 // controlled
  onChange?: (v: string) => void; // controlled
  defaultValue?: string;          // uncontrolled fallback
  placeholder?: string;
  end?: React.ReactNode;
  onCommit: (v: string) => void;
};

export const InputRow = ({
  label,
  title,
  value,
  onChange,
  defaultValue,
  placeholder,
  onCommit,
  end,
}: InputRowProps) => {
  const isControlled = value !== undefined;

  // Uncontrolled internal state
  const [internal, setInternal] = useState<string>(defaultValue ?? "");
  useEffect(() => {
    if (!isControlled) setInternal(defaultValue ?? "");
  }, [defaultValue, isControlled]);

  const draft = isControlled ? (value as string) : internal;

  const handleChange = (v: string) => {
    if (isControlled) onChange?.(v);
    else setInternal(v);
  };

  const commit = () => {
    const trimmed = draft.trim();
    if (trimmed) onCommit(trimmed);
  };

  return (
    <div className="flex items-center overflow-hidden">
      <span className="basis-1/3 text-xs text-left">{label}</span>
      <Input
        className="flex-1 h-full rounded-none focus-visible:ring-0 px-2 !text-xs"
        value={draft}
        placeholder={placeholder}
        onChange={(e) => handleChange(e.target.value)}
        onBlur={commit}
        onKeyDown={(e) => {
          if (e.key === "Enter") e.currentTarget.blur();
        }}
      />
      {title && (
        <div title={title}>
          <InfoIcon className="h-4 w-6" />
        </div>
      )}
      {end}
    </div>
  );
};