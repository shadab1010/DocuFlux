"use client";

import Navbar from "../components/Navbar";
import Footer from "../components/Footer";
import { Upload, Zap, Download, CheckCircle } from "lucide-react";

export default function HowItWorksPage() {
  const steps = [
    {
      icon: Upload,
      title: "1. Upload Your File",
      description: "Select and upload your document from your computer or drag and drop it into the upload area.",
    },
    {
      icon: Zap,
      title: "2. We Process It",
      description: "Our servers instantly process your file with advanced algorithms and conversion technology.",
    },
    {
      icon: CheckCircle,
      title: "3. Review Results",
      description: "Preview the converted file to ensure it meets your quality standards.",
    },
    {
      icon: Download,
      title: "4. Download",
      description: "Download your converted file. Files are automatically deleted after 24 hours for security.",
    },
  ];

  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      <main className="flex-1 pt-24 pb-16 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h1 className="text-5xl font-bold text-gray-900 mb-6">
              How It Works
            </h1>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto">
              Converting your documents is as simple as 1-2-3-4. Follow these easy steps
              to transform your files in seconds.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 mb-16">
            {steps.map((step, index) => (
              <div key={index} className="bg-white rounded-lg shadow-lg p-8 text-center">
                <step.icon className="w-16 h-16 text-blue-600 mx-auto mb-4" />
                <h3 className="text-xl font-bold mb-3">{step.title}</h3>
                <p className="text-gray-600">{step.description}</p>
              </div>
            ))}
          </div>

          <div className="bg-blue-600 text-white rounded-lg p-12 text-center">
            <h2 className="text-3xl font-bold mb-4">Security & Privacy</h2>
            <p className="text-xl mb-6 max-w-3xl mx-auto">
              Your files are encrypted during upload and processing. We automatically delete
              all files from our servers within 24 hours. We never share your data with third parties.
            </p>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mt-8">
              <div>
                <div className="text-4xl font-bold mb-2">256-bit</div>
                <div>SSL Encryption</div>
              </div>
              <div>
                <div className="text-4xl font-bold mb-2">24hr</div>
                <div>Auto File Deletion</div>
              </div>
              <div>
                <div className="text-4xl font-bold mb-2">0%</div>
                <div>Data Sharing</div>
              </div>
            </div>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
}
