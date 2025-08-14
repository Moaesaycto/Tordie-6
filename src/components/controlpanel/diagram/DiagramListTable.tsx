import { getGeometryIcon } from '@/domain/Geometry/icons';
import { DiagramItemLabel } from '@/types/diagram';
import { Tree } from 'react-arborist';
import type { NodeRendererProps } from 'react-arborist';
import AutoSizer from 'react-virtualized-auto-sizer';
import { ChevronDown, ChevronUp, EyeIcon, EyeClosedIcon, PlusIcon } from 'lucide-react';
import { useEffect, useMemo, useState } from 'react';
import { useTheme } from '@/components/theme-provider';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';

type Props = {
  items: DiagramItemLabel[];
  selectedId: string | null;
  onSelect: (item: DiagramItemLabel | null) => void;
};

const ROW_HEIGHT = 20;

const DiagramListTable = ({ items, selectedId, onSelect }: Props) => {
  const [term, setTerm] = useState("");
  const searchTerm = useMemo(() => term.trim(), [term]);

  return (
    <div className="flex flex-col h-full min-h-0 min-w-0 overflow-hidden bg-primary-foreground">
      <div className="p-1 border-b-2 shrink-0 bg-primary-accent flex gap-4 items-center">
        <span>Items</span>
        <Input
          className="h-6 bg-primary-foreground rounded"
          placeholder="Search"
          value={term}
          onChange={(e) => setTerm(e.currentTarget.value)}
        />
        <Button
          className="h-6 w-6 rounded-sm"
          title={"Create new Item"}
          onClick={() => onSelect(null)}
        ><PlusIcon />
        </Button>
      </div>

      <div className="flex-1 min-h-0">
        <AutoSizer>
          {({ width, height }) => (
            <Tree<DiagramItemLabel>
              initialData={items}
              width={Math.max(1, width)}
              height={Math.max(1, height)}
              rowHeight={ROW_HEIGHT}
              indent={12}
              openByDefault={false}
              overscanCount={4}
              padding={0}
              className="ra-tree scrollbar-thin"
              searchTerm={searchTerm}
              searchMatch={(node, t) =>
                node.data.name.toLowerCase().includes(t.toLowerCase())
              }
              // controlled selection
              selection={selectedId ? selectedId : ""}
              onSelect={(ids) => {
                const id = Array.isArray(ids) ? ids[0] : ids;
                // If id is a NodeApi object, extract its id property
                const selectedId = typeof id === "string" ? id : id?.id;
                const item = items.find(it => it.id === selectedId) ?? null;
                onSelect(item);
              }}
              rowClassName="flex items-center justify-between text-sm hover:bg-neutral-600/20
                            even:bg-secondary odd:bg-primary-foreground"
            >
              {(p) => <Node {...p} onSelect={onSelect} />}
            </Tree>
          )}
        </AutoSizer>
      </div>
    </div>
  );
};


function Node(
  { node, style, dragHandle, onSelect, onVisibilityChange }:
    NodeRendererProps<DiagramItemLabel> & {
      onSelect: (item: DiagramItemLabel | null) => void;
      onVisibilityChange?: (id: string, visible: boolean) => void;
    }
) {
  const entry = getGeometryIcon(node.data.type);
  const Icon = entry.icon;
  const { resolvedTheme } = useTheme();
  const [visible, setVisible] = useState<boolean>(node.data.visible ?? true);

  useEffect(() => {
    setVisible(node.data.visible ?? true);
  }, [node.data.visible]);

  const hoverStyle = resolvedTheme === "light" ? "hover:bg-neutral-300" : "hover:bg-neutral-600";
  const dropBg = node.isInternal && node.willReceiveDrop ? "bg-blue-500/40" : "";

  const handleClick = () => {
    if (node.isInternal) node.toggle();
    node.select();
    onSelect(node.data);
  };

  const toggleVisibility = (e: React.MouseEvent) => {
    e.stopPropagation();
    const next = !visible;
    setVisible(next);
    node.data.visible = next;
    onVisibilityChange?.(node.id, next);
  };

  return (
    <div
      ref={dragHandle}
      style={style}
      className={`flex items-center justify-between w-full text-sm px-2 ${hoverStyle} ${dropBg} ${node.isSelected ? "bg-primary/20" : ""}`}
      title={`Item ID: ${node.id}`}
      onClick={handleClick}
    >
      <div className={`flex items-center gap-2 ${visible ? "" : "opacity-30"} ${node.level ? "border-l-2 pl-2" : "pl-1"}`}>
        <Icon style={{ color: entry.color }} size={18} aria-hidden />
        <span className="truncate text-xs">{node.data.name}</span>
      </div>

      <div className="flex items-center gap-1 p-1 opacity-70" onClick={(e) => e.stopPropagation()}>
        {node.isInternal ? (node.isOpen ? <ChevronDown className="h-4 w-4" /> : <ChevronUp className="h-4 w-4" />) : null}
        {visible ? (
          <EyeIcon onClick={toggleVisibility} className="h-4 w-4 cursor-pointer" aria-label="Hide item" />
        ) : (
          <EyeClosedIcon onClick={toggleVisibility} className="h-4 w-4 cursor-pointer" aria-label="Show item" />
        )}
      </div>
    </div>
  );
}




export default DiagramListTable;