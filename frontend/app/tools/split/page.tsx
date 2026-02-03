"use client";

import { useState } from "react";
import Navbar from "../../components/Navbar";
import Footer from "../../components/Footer";
import { Upload, Split } from "lucide-react";

export default function SplitPDFPage() {
  const [file, setFile] = useState<File | null>(null);
  const [splitting, setSplitting] = useState(false);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setFile(e.target.files[0]);
    }
  };

  const handleSplit = async () => {
    if (!file) return;
    setSplitting(true);
    setTimeout(() => setSplitting(false), 2000);
  };

  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      <main className="flex-1 pt-24 pb-16 bg-gray-50">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <Split className="w-16 h-16 text-blue-600 mx-auto mb-4" />
            <h1 className="text-4xl font-bold text-gray-900 mb-4">
              Split PDF File
            </h1>
            <p className="text-xl text-gray-600">
              Extract pages from your PDF into separate files
            </p>
          </div>

          <div className="bg-white rounded-lg shadow-lg p-8">
            <div className="border-2 border-dashed border-gray-300 rounded-lg p-12 text-center">
              <Upload className="w-16 h-16 text-gray-400 mx-auto mb-4" />
              <label className="cursor-pointer">
                <span className="bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 inline-block">
                  Select PDF File
                </span>
                <input
                  type="file"
                  accept=".pdf"
                  onChange={handleFileChange}
                  className="hidden"
                />
              </label>
              {file && (
                <div className="mt-4">
                  <p className="text-gray-700 font-medium">{file.name}</p>
                  <p className="text-gray-500 text-sm">
                    {(file.size / 1024 / 1024).toFixed(2)} MB
                  </p>
                </div>
              )}
            </div>

            {file && (
              <button
                onClick={handleSplit}
                disabled={splitting}
                className="w-full mt-6 bg-blue-600 text-white px-8 py-3 rounded-lg font-semibold hover:bg-blue-700 disabled:bg-gray-400"
              >
                {splitting ? "Splitting..." : "Split PDF"}
              </button>
            )}
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
}
