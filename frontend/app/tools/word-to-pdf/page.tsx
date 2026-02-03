"use client";

import BaseTool from "../../components/BaseTool";
import { FileText } from "lucide-react";

export default function WordToPdfPage() {
  return (
    <BaseTool
      title="Word to PDF"
      description="Professional conversion for your Word documents. Maintaining perfect margins and font clarity."
      icon={FileText}
      endpoint="/convert-word-to-pdf"
      fileInputName="word"
      allowedExtensions={[".docx", ".doc"]}
      downloadName="converted.pdf"
    />
  );
}
