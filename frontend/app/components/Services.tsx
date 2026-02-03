"use client";

import Link from "next/link";
import {
  FileText, Image, Merge as MergeIcon, SplitSquareHorizontal, FileArchive, Edit,
  FileSpreadsheet, Presentation, Sparkles, FolderOpen, ShieldCheck, RefreshCw,
  ScanLine, Lock, Unlock, PenTool, Type, FileCode, Crop, Eraser, Files, Maximize,
  Pipette, Stamp
} from "lucide-react";

const services = [
  // Conversion Tools
  { icon: FileText, title: "PDF to Word", description: "Convert PDF to editable Word doc", href: "/tools/pdf-to-word" },
  { icon: FileText, title: "Word to PDF", description: "Convert Word docs to PDF", href: "/tools/word-to-pdf" },
  { icon: FileSpreadsheet, title: "PDF to Excel", description: "Convert PDF data to Excel", href: "/tools/pdf-to-excel" },
  { icon: FileSpreadsheet, title: "Excel to PDF", description: "Convert Excel sheets to PDF", href: "/tools/excel-to-pdf" },
  { icon: Presentation, title: "PDF to PowerPoint", description: "Convert PDF to PPT slides", href: "/tools/pdf-to-powerpoint" },
  { icon: Presentation, title: "PowerPoint to PDF", description: "Convert PPT slides to PDF", href: "/tools/powerpoint-to-pdf" },

  // Image Tools
  { icon: Image, title: "PDF to JPG", description: "Extract images from PDF", href: "/tools/pdf-to-jpg" },
  { icon: Image, title: "JPG to PDF", description: "Convert images to PDF", href: "/tools/jpg-to-pdf" },

  // Modification Tools
  { icon: MergeIcon, title: "Merge PDF", description: "Combine multiple PDFs", href: "/tools/merge" },
  { icon: SplitSquareHorizontal, title: "Split PDF", description: "Extract pages from PDF", href: "/tools/split" },
  { icon: FileArchive, title: "Compress PDF", description: "Reduce file size", href: "/tools/compress" },
  { icon: Edit, title: "Edit PDF", description: "Add text, shapes & images", href: "/tools/edit-pdf" },

  // Advanced Tools (Row 3)
  { icon: PenTool, title: "Sign PDF", description: "Add electronic signatures", href: "/tools/sign" },
  { icon: Stamp, title: "Watermark", description: "Add image or text watermark", href: "/tools/watermark" },
  { icon: RefreshCw, title: "Rotate PDF", description: "Rotate pages 90, 180 or 270 degrees", href: "/tools/rotate" },
  { icon: FileCode, title: "HTML to PDF", description: "Convert webpages to PDF", href: "/tools/html-to-pdf" },
  { icon: Unlock, title: "Unlock PDF", description: "Remove PDF password security", href: "/tools/unlock" },
  { icon: Lock, title: "Protect PDF", description: "Encrypt PDF with password", href: "/tools/protect" },

  // Row 4
  { icon: FolderOpen, title: "Organize PDF", description: "Sort, delete, and rearrange pages", href: "/tools/organize" },
  { icon: FileText, title: "PDF to PDF/A", description: "Convert to ISO-standardized PDF", href: "/tools/pdf-a" },
  { icon: RefreshCw, title: "Repair PDF", description: "Recover data from corrupt PDF", href: "/tools/repair" },
  { icon: Type, title: "Page Numbers", description: "Add page numbers to PDF", href: "/tools/page-numbers" },
  { icon: ScanLine, title: "Scan to PDF", description: "Capture docs from mobile", href: "/tools/scan" },
  { icon: Sparkles, title: "OCR PDF", description: "Make scanned text searchable", href: "/tools/ocr" },

  // Row 5
  { icon: Files, title: "Compare PDF", description: "Side-by-side comparison", href: "/tools/compare" },
  { icon: Eraser, title: "Redact PDF", description: "Permanently remove sensitive info", href: "/tools/redact" },
  { icon: Crop, title: "Crop PDF", description: "Trim margins of PDF pages", href: "/tools/crop" }
];

export default function Services() {
  return (
    <section id="services" className="py-24 bg-white relative">
      <div className="absolute top-0 left-0 w-full h-px bg-gradient-to-r from-transparent via-gray-200 to-transparent" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16">
          <div className="inline-block p-3 rounded-full bg-emerald-50 text-emerald-600 mb-4">
            <Sparkles className="w-6 h-6" />
          </div>
          <h2 className="text-3xl md:text-5xl font-bold text-gray-900 mb-6 font-display">
            All the Tools You Need
          </h2>
          <p className="text-gray-500 text-lg max-w-2xl mx-auto">
            The most comprehensive suite of PDF tools on the market. Simple, fast, and secure.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 xl:grid-cols-6 gap-4">
          {services.map((service, index) => {
            const Icon = service.icon;
            return (
              <Link
                key={index}
                href={service.href}
                className="group p-5 rounded-xl hover:bg-white hover:shadow-[0_8px_30px_rgb(0,0,0,0.04)] border border-transparent hover:border-gray-100 transition-all duration-200 flex flex-col items-start gap-3 bg-gray-50/50"
              >
                <div className="text-emerald-700 group-hover:scale-110 transition-transform duration-300">
                  <Icon className="w-6 h-6" strokeWidth={1.5} />
                </div>
                <div>
                  <h3 className="font-bold text-gray-900 text-sm mb-1 font-display">
                    {service.title}
                  </h3>
                  <p className="text-gray-500 text-xs leading-relaxed">
                    {service.description}
                  </p>
                </div>
              </Link>
            );
          })}
        </div>
      </div>
    </section>
  );
}
