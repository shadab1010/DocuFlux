"use client";

import { useState } from "react";
import Navbar from "../../components/Navbar";
import Footer from "../../components/Footer";
import { Upload, Merge } from "lucide-react";

export default function MergePDFPage() {
  const [files, setFiles] = useState<File[]>([]);
  const [merging, setMerging] = useState(false);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      setFiles(Array.from(e.target.files));
    }
  };

  const handleMerge = async () => {
    if (files.length < 2) return;
    setMerging(true);
    setTimeout(() => setMerging(false), 2000);
  };

  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      <main className="flex-1 pt-24 pb-16 bg-gray-50">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <Merge className="w-16 h-16 text-blue-600 mx-auto mb-4" />
            <h1 className="text-4xl font-bold text-gray-900 mb-4">
              Merge PDF Files
            </h1>
            <p className="text-xl text-gray-600">
              Combine multiple PDF files into a single document
            </p>
          </div>

          <div className="bg-white rounded-lg shadow-lg p-8">
            <div className="border-2 border-dashed border-gray-300 rounded-lg p-12 text-center">
              <Upload className="w-16 h-16 text-gray-400 mx-auto mb-4" />
              <label className="cursor-pointer">
                <span className="bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 inline-block">
                  Select PDF Files
                </span>
                <input
                  type="file"
                  accept=".pdf"
                  multiple
                  onChange={handleFileChange}
                  className="hidden"
                />
              </label>
              {files.length > 0 && (
                <div className="mt-4 space-y-2">
                  {files.map((file, index) => (
                    <p key={index} className="text-gray-700">
                      {index + 1}. {file.name}
                    </p>
                  ))}
                </div>
              )}
            </div>

            {files.length >= 2 && (
              <button
                onClick={handleMerge}
                disabled={merging}
                className="w-full mt-6 bg-blue-600 text-white px-8 py-3 rounded-lg font-semibold hover:bg-blue-700 disabled:bg-gray-400"
              >
                {merging ? "Merging..." : `Merge ${files.length} PDFs`}
              </button>
            )}
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
}
