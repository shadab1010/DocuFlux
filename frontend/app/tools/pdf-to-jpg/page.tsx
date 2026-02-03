"use client";

import BaseTool from "../../components/BaseTool";
import { Image } from "lucide-react";

export default function PdfToJpgPage() {
  return (
    <BaseTool
      title="PDF to JPG"
      description="Visual extraction. Convert every page of your PDF into high-resolution JPG images."
      icon={Image}
      endpoint="/convert-pdf-to-image"
      fileInputName="pdf"
      additionalParams={{ format: "jpg" }}
      downloadName="images.zip"
    />
  );
}
