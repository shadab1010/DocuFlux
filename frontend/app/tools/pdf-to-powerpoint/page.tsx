"use client";

import BaseTool from "../../components/BaseTool";
import { Presentation } from "lucide-react";

export default function PdfToPowerPointPage() {
  return (
    <BaseTool
      title="PDF to PowerPoint"
      description="Presentation ready. Transform static PDFs into dynamic, editable PowerPoint slides."
      icon={Presentation}
      endpoint="/convert-pdf-to-powerpoint"
      fileInputName="pdf"
      downloadName="converted.pptx"
    />
  );
}
