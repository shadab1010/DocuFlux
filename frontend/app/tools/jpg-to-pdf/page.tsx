"use client";

import BaseTool from "../../components/BaseTool";
import { Image } from "lucide-react";

export default function JpgToPdfPage() {
    return (
        <BaseTool
            title="JPG to PDF"
            description="Gallery to Document. Combine multiple images into a single, high-quality PDF."
            icon={Image}
            endpoint="/convert-jpg-to-pdf"
            multiple={true}
            fileInputName="images"
            allowedExtensions={[".jpg", ".jpeg", ".png"]}
            downloadName="converted.pdf"
        />
    );
}
