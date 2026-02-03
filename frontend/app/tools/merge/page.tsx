"use client";

import BaseTool from "../../components/BaseTool";
import { Merge } from "lucide-react";

export default function MergePdfPage() {
  return (
    <BaseTool
      title="Merge PDF"
      description="United documents. Seamlessly combine multiple PDFs into a single, cohesive file."
      icon={Merge}
      endpoint="/merge-pdf"
      multiple={true}
      fileInputName="pdfs"
      downloadName="merged.pdf"
    />
  );
}
