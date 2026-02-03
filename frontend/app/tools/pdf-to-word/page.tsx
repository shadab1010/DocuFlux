"use client";

import BaseTool from "../../components/BaseTool";
import { FileText } from "lucide-react";

export default function PdfToWordPage() {
  return (
    <BaseTool
      title="PDF to Word"
      description="Magic conversion. Turn your non-editable PDFs into fully formatted, editable Word documents."
      icon={FileText}
      endpoint="/convert-pdf-to-word"
      fileInputName="pdf"
      downloadName="converted.docx"
    />
  );
}
