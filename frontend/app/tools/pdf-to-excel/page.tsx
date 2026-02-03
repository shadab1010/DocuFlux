"use client";

import BaseTool from "../../components/BaseTool";
import { FileSpreadsheet } from "lucide-react";

export default function PdfToExcelPage() {
  return (
    <BaseTool
      title="PDF to Excel"
      description="Data liberation. Extract tables and data from your PDF into structured Excel sheets."
      icon={FileSpreadsheet}
      endpoint="/convert-pdf-to-excel"
      fileInputName="pdf"
      downloadName="converted.xlsx"
    />
  );
}
