import { useState } from "react";
import { useStatus } from "@/components/status-provider";
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table";
import { Input } from "@/components/ui/input";
import { useFontSize, useInputHeight } from "@/lib/format";
import { Separator } from "@/components/ui/separator";

const DocumentController = () => {
    const { documentWidth, setDocumentWidth, documentHeight, setDocumentHeight } = useStatus().canvas;
    const fontSize = useFontSize();
    const heightClass = useInputHeight();

    const documentAttributes = [
        { key: "width", label: "Width", value: documentWidth, setter: setDocumentWidth },
        { key: "height", label: "Height", value: documentHeight, setter: setDocumentHeight }
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

    const cellClass = `py-0 px-0 pl-2 ${fontSize}`;
    const inputClass = "py-0 px-2 rounded-none h-6";

    return (
        <div className={fontSize}>
            <Table>
                <TableHeader>
                    <TableRow>
                        <TableHead className={`w-[70%] ${cellClass} font-bold`}>Document Attribute</TableHead>
                        <TableHead className={`text-right ${cellClass} font-bold`}>Value</TableHead>
                    </TableRow>
                </TableHeader>
                <TableBody>
                    {documentAttributes.map(({ key, label, setter }) => (
                        <TableRow key={key}>
                            <TableCell className={cellClass}>{label}</TableCell>
                            <TableCell className={`text-right ${cellClass}`}>
                                <Input
                                    className={`${inputClass} ${fontSize} ${heightClass}`}
                                    type="number"
                                    value={inputs[key]}
                                    onChange={(e) => handleChange(key, e.target.value)}
                                    onKeyDown={(e) => e.key === "Enter" && handleSubmit(key, setter)}
                                    onBlur={() => handleSubmit(key, setter)}
                                />
                            </TableCell>
                        </TableRow>
                    ))}
                </TableBody>
            </Table>
            <Separator />
        </div>
    );
};

export default DocumentController;
