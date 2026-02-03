"use client";

import BaseTool from "../../components/BaseTool";
import { Presentation } from "lucide-react";

export default function PowerPointToPdfPage() {
    return (
        <BaseTool
            title="PowerPoint to PDF"
            description="Deck delivery. Convert your slides into professional, shareable PDF documents."
            icon={Presentation}
            endpoint="/convert-powerpoint-to-pdf"
            fileInputName="powerpoint"
            allowedExtensions={[".pptx", ".ppt"]}
            downloadName="converted.pdf"
        />
    );
}
