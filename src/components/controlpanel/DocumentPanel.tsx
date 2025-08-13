import { useFontSize } from "@/lib/format";
import { Separator } from "@/components/ui/separator";
import { Input } from "@/components/ui/input";
import { useDocument } from "@/components/document-provider";
import { useEffect, useState } from "react";

const DocumentPanel = () => {
  const fontSize = useFontSize();
  const { title, setTitle } = useDocument();
  const [draft, setDraft] = useState(title);

  useEffect(() => setDraft(title), [title]);

  const commit = () => {
    if (draft !== title) setTitle(draft.trim());
  };

  return (
    <div className={`w-full space-y-1 ${fontSize}`}>
      <div>

      </div>
      <div className="flex gap-2">
        <Input
          value={draft}
          onChange={(e) => setDraft(e.target.value)}
          onBlur={commit}
          onKeyDown={(e) => {
            if (e.key === "Enter") {
              e.currentTarget.blur();
            }
          }}
          placeholder="Untitled"
        />
      </div>
      <Separator />
    </div>
  );
};

export default DocumentPanel;
