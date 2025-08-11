import { useFontSize } from "@/lib/format";
import { Separator } from "@/components/ui/separator";

const ExportController = () => {
    const fontSize = useFontSize();

    return (
        <div className={`w-full space-y-1 ${fontSize}`}>
            Nothing to see here
            <Separator />
        </div>
    );
};

export default ExportController;
