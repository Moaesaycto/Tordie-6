import { useState } from "react";
import { useStatus } from "@/components/status-provider";
import { Input } from "@/components/ui/input";
import { useFontSize } from "@/lib/format";
import { Separator } from "@/components/ui/separator";

const DocumentController = () => {
    const {
        documentWidth,
        setDocumentWidth,
        documentHeight,
        setDocumentHeight,
        offsetX,
        setOffsetX,
        offsetY,
        setOffsetY,
        rotation,
        setRotation,
        zoom,
        setZoom
    } = useStatus().canvas;
    const fontSize = useFontSize();
    const heightClass = "h-5";

    const documentAttributes = [
        { key: "width", label: "Width", value: documentWidth, setter: setDocumentWidth, unit: "px" },
        { key: "height", label: "Height", value: documentHeight, setter: setDocumentHeight, unit: "px" },
        { key: "xoffset", label: "X-Offset", value: offsetX, setter: setOffsetX, unit: "px" },
        { key: "yoffset", label: "Y-Offset", value: offsetY, setter: setOffsetY, unit: "px" },
        { key: "rotation", label: "Rotation", value: rotation, setter: setRotation, unit: "px" },
        { key: "zoom", label: "Zoom", value: zoom, setter: setZoom, unit: null },
    ];

    const [inputs, setInputs] = useState(() =>
        Object.fromEntries(documentAttributes.map(attr => [attr.key, attr.value.toString()]))
    );

    const handleChange = (key: string, value: string) => {
        setInputs(prev => ({ ...prev, [key]: value }));
    };

    const handleSubmit = (key: string, setter: (v: number) => void) => {
        const parsed = Number(inputs[key]);
        if (!isNaN(parsed)) setter(parsed);
    };

    return (
        <div className={`w-full space-y-1 ${fontSize}`}>
            {documentAttributes.map(({ key, label, setter, unit }) => (
                <div key={key} className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-0.5 sm:gap-2">
                    <label className="font-medium w-full sm:w-[40%] leading-tight">{label}</label>
                    <div className="flex items-center w-full sm:w-[60%] gap-1">
                        <Input
                            className={`w-full ${heightClass} ${fontSize} py-0 px-1 rounded-sm`}
                            type="number"
                            value={inputs[key]}
                            onChange={(e) => handleChange(key, e.target.value)}
                            onKeyDown={(e) => e.key === "Enter" && handleSubmit(key, setter)}
                            onBlur={() => handleSubmit(key, setter)}
                        />
                        {unit && <span className="text-muted-foreground text-xs">{unit}</span>}
                    </div>
                </div>
            ))}
            <Separator />
        </div>
    );
};

export default DocumentController;
