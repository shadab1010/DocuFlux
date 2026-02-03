"use client";

import Link from "next/link";
import {
  FileText,
  Image,
  Merge,
  Split,
  Compress,
  Edit,
  FileSpreadsheet,
  Presentation,
} from "lucide-react";

const services = [
  {
    icon: FileText,
    title: "PDF to Word",
    description: "Convert PDF to editable Word documents",
    href: "/tools/pdf-to-word",
  },
  {
    icon: FileText,
    title: "Word to PDF",
    description: "Convert Word documents to PDF format",
    href: "/tools/word-to-pdf",
  },
  {
    icon: Image,
    title: "PDF to JPG",
    description: "Convert PDF pages to JPG images",
    href: "/tools/pdf-to-jpg",
  },
  {
    icon: Image,
    title: "PDF to PNG",
    description: "Convert PDF pages to PNG images",
    href: "/tools/pdf-to-png",
  },
  {
    icon: FileSpreadsheet,
    title: "PDF to Excel",
    description: "Convert PDF tables to Excel spreadsheets",
    href: "/tools/pdf-to-excel",
  },
  {
    icon: Presentation,
    title: "PDF to PowerPoint",
    description: "Convert PDF to PowerPoint presentations",
    href: "/tools/pdf-to-powerpoint",
  },
  {
    icon: Merge,
    title: "Merge PDF",
    description: "Combine multiple PDFs into one",
    href: "/tools/merge",
  },
  {
    icon: Split,
    title: "Split PDF",
    description: "Split PDF into separate files",
    href: "/tools/split",
  },
  {
    icon: Compress,
    title: "Compress PDF",
    description: "Reduce PDF file size",
    href: "/tools/compress",
  },
  {
    icon: Edit,
    title: "Edit PDF",
    description: "Edit PDF content directly",
    href: "/tools/edit-pdf",
  },
];

export default function Services() {
  return (
    <section className="py-16 bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-12">
          <h2 className="text-4xl font-bold text-gray-900 mb-4">
            Our PDF Tools
          </h2>
          <p className="text-xl text-gray-600">
            Everything you need to work with PDF documents
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-6">
          {services.map((service, index) => (
            <Link
              key={index}
              href={service.href}
              className="bg-white p-6 rounded-lg shadow hover:shadow-xl transition group"
            >
              <service.icon className="w-10 h-10 text-blue-600 mb-4 group-hover:scale-110 transition" />
              <h3 className="text-lg font-semibold mb-2 group-hover:text-blue-600 transition">
                {service.title}
              </h3>
              <p className="text-gray-600 text-sm">{service.description}</p>
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
}
