import { useState } from "react";
import { useStatus } from "../status-provider";
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table";
import { Input } from "@/components/ui/input";

const DocumentController = () => {
    const { documentWidth, setDocumentWidth, documentHeight, setDocumentHeight } = useStatus().canvas;

    const documentAttributes = [
        {
            key: "width",
            label: "Width",
            value: documentWidth,
            setter: setDocumentWidth,
        },
        {
            key: "height",
            label: "Height",
            value: documentHeight,
            setter: setDocumentHeight,
        }
    ];

    const [inputs, setInputs] = useState(() =>
        Object.fromEntries(
            documentAttributes.map(attr => [attr.key, attr.value.toString()])
        )
    );

    const handleChange = (key: string, value: string) => {
        setInputs(prev => ({ ...prev, [key]: value }));
    };

    const handleSubmit = (key: string, setter: (v: number) => void) => {
        const parsed = Number(inputs[key]);
        if (!isNaN(parsed)) {
            setter(parsed);
        }
    };

    return (
        <div>
            <Table>
                <TableHeader>
                    <TableRow>
                        <TableHead className="w-[70%] p-0">Document Attribute</TableHead>
                        <TableHead className="text-right p-0">Value</TableHead>
                    </TableRow>
                </TableHeader>
                <TableBody>
                    {documentAttributes.map((attr) => (
                        <TableRow key={attr.key}>
                            <TableCell className="font-medium p-0">{attr.label}</TableCell>
                            <TableCell className="text-right p-0">
                                <Input
                                    className="p-2 m-0 rounded-none h-6"
                                    type="number"
                                    value={inputs[attr.key]}
                                    onChange={(e) => handleChange(attr.key, e.target.value)}
                                    onKeyDown={(e) => {
                                        if (e.key === "Enter") {
                                            handleSubmit(attr.key, attr.setter);
                                        }
                                    }}
                                    onBlur={() => {
                                        handleSubmit(attr.key, attr.setter);
                                    }}
                                />
                            </TableCell>
                        </TableRow>
                    ))}
                </TableBody>
            </Table>
        </div>
    );
};

export default DocumentController;
