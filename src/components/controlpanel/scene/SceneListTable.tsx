import { getGeometryIcon } from '@/domain/Geometry/icons';
import { SceneItemLabel } from '@/types/scene';
import { Tree } from 'react-arborist';
import type { NodeRendererProps } from 'react-arborist';
import AutoSizer from 'react-virtualized-auto-sizer';
import { ChevronDown, ChevronUp, EyeIcon, EyeClosedIcon } from 'lucide-react';
import { useMemo, useState } from 'react';
import { useTheme } from '@/components/theme-provider';
import { Input } from '@/components/ui/input';

type Props = {
  items: SceneItemLabel[];
};

const ROW_HEIGHT = 20;

const SceneListTable = ({ items }: Props) => {
  const [term, setTerm] = useState("");
  const searchTerm = useMemo(() => term.trim(), [term]);

  return (
    <div className="flex flex-col h-50 min-w-0 overflow-hidden border-2 bg-primary-foreground rounded">
      <div className="px-3 py-1 border-b-2 shrink-0 bg-primary-accent flex gap-4 items-center">
        <span>Items</span>
        <Input
          className="h-6 bg-primary-foreground rounded"
          placeholder="Search"
          value={term}
          onChange={(e) => setTerm(e.currentTarget.value)}
        />
      </div>

      <div className="flex-1 min-h-0">
        <AutoSizer>
          {({ width, height }) => (
            <Tree<SceneItemLabel>
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
              rowClassName="flex items-center justify-between text-sm hover:bg-neutral-600/20
                            even:bg-secondary odd:bg-primary-foreground"
              disableMultiSelection={false}
            >
              {Node}
            </Tree>
          )}
        </AutoSizer>
      </div>
    </div>
  );
};


function Node({ node, style, dragHandle }: NodeRendererProps<SceneItemLabel>) {
  const entry = getGeometryIcon(node.data.type);
  const Icon = entry.icon;
  const { resolvedTheme } = useTheme();
  const [visible, setVisible] = useState(true);

  const hoverStyle = resolvedTheme === "light" ? "hover:bg-neutral-300" : "hover:bg-neutral-600";
  const dropBg = node.isInternal && node.willReceiveDrop ? "bg-blue-500/40" : "";
  const selectedBg = node.isSelected ? "bg-primary text-primary-foreground" : "";

  return (
    <div
      ref={dragHandle}
      style={style}
      className={`flex items-center justify-between w-full text-sm px-2 ${hoverStyle} ${dropBg} ${selectedBg}`}
      title={`Item ID: ${node.id}`}
      onClick={() => node.isInternal && node.toggle()}
    >
      <div
        className={`flex items-center gap-2 ${visible ? "" : "opacity-30"} ${node.level ? "border-l-2 pl-2" : "pl-1"}`}
        style={{ marginLeft: node.level * 10 }}
      >
        <Icon style={{ color: entry.color }} size={18} aria-hidden />
        <span className="truncate">{node.data.name}</span>
      </div>

      <div className="flex items-center gap-1 p-1 opacity-70">
        {node.isInternal ? (
          node.isOpen ? <ChevronDown className="h-4 w-4" /> : <ChevronUp className="h-4 w-4" />
        ) : null}
        {visible ? (
          <EyeIcon
            onClick={(e) => { e.stopPropagation(); setVisible(false); }}
            className="h-4 w-4 cursor-pointer"
          />
        ) : (
          <EyeClosedIcon
            onClick={(e) => { e.stopPropagation(); setVisible(true); }}
            className="h-4 w-4 cursor-pointer"
          />
        )}
      </div>
    </div>
  );
}


export default SceneListTable;