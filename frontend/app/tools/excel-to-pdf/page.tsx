"use client";

import BaseTool from "../../components/BaseTool";
import { FileSpreadsheet } from "lucide-react";

export default function ExcelToPdfPage() {
    return (
        <BaseTool
            title="Excel to PDF"
            description="Spreadsheets made shareable. Convert your Excel sheets into pixel-perfect PDF reports."
            icon={FileSpreadsheet}
            endpoint="/convert-excel-to-pdf"
            fileInputName="excel"
            allowedExtensions={[".xlsx", ".xls"]}
            downloadName="converted.pdf"
        />
    );
}
