"use client";

import BaseTool from "../../components/BaseTool";
import { Hash } from "lucide-react";

export default function PageNumbersPage() {
    return (
        <BaseTool
            title="Page Numbers"
            description="Document order. Automatically insert professional page numbering into your PDF files."
            icon={Hash}
            endpoint="/page-numbers"
            fileInputName="pdf"
            downloadName="numbered.pdf"
        />
    );
}
