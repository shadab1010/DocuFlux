"use client";

import BaseTool from "../../components/BaseTool";
import { FileArchive } from "lucide-react";

export default function CompressPdfPage() {
  return (
    <BaseTool
      title="Compress PDF"
      description="Weightless documents. Shave off megabytes while preserving professional visual quality."
      icon={FileArchive}
      endpoint="/compress-pdf"
      fileInputName="pdf"
      downloadName="compressed.pdf"
    />
  );
}
