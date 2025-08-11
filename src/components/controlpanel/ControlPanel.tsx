import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import DocumentController from "./DocumentPanel"
import { ScrollArea, ScrollBar } from "@/components/ui/scroll-area"
import { useRef, useEffect, useState } from "react"

export function ControlPanel() {
    const wrapperRef = useRef<HTMLDivElement>(null)
    const headerRef = useRef<HTMLDivElement>(null)
    const [scrollHeight, setScrollHeight] = useState<number>(0)

    useEffect(() => {
        const updateHeight = () => {
            if (wrapperRef.current && headerRef.current) {
                const totalHeight = wrapperRef.current.clientHeight
                const headerHeight = headerRef.current.clientHeight
                setScrollHeight(totalHeight - headerHeight)
            }
        }

        requestAnimationFrame(updateHeight)

        let resizeTimer: ReturnType<typeof setTimeout>
        const handleResize = () => {
            clearTimeout(resizeTimer)
            resizeTimer = setTimeout(updateHeight, 100)
        }

        window.addEventListener("resize", handleResize)

        return () => {
            clearTimeout(resizeTimer)
            window.removeEventListener("resize", handleResize)
        }
    }, [])


    return (
        <div ref={wrapperRef} className="flex flex-col w-full h-full overflow-hidden">
            <Tabs defaultValue="document" className="w-full h-full">
                <div ref={headerRef} className="shrink-0 border-b">
                    <TabsList className="grid grid-cols-2 w-full p-0 rounded-none">
                        <TabsTrigger value="document" className="rounded-none">
                            Document
                        </TabsTrigger>
                        <TabsTrigger value="shapes" className="rounded-none">
                            Shapes
                        </TabsTrigger>
                    </TabsList>
                </div>

                <ScrollArea
                    className="w-full"
                    style={{ height: scrollHeight }}
                >
                    <div className="p-2">
                        <TabsContent value="document">
                            <DocumentController />
                        </TabsContent>
                        <TabsContent value="shapes">
                            <div className="text-sm text-muted-foreground">
                                Nothing here just yet...
                            </div>
                        </TabsContent>
                    </div>
                    <ScrollBar orientation="vertical" />
                </ScrollArea>
            </Tabs>
        </div>
    )
}
