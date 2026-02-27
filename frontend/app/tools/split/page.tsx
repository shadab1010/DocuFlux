"use client";

import { useState } from "react";
import ToolLayout from "../../components/ToolLayout";
import { Upload, Split, CheckCircle2, Loader2, Scissors, Sparkles } from "lucide-react";
import AnimatedButton from "../../components/ui/AnimatedButton";
import { motion, AnimatePresence } from "framer-motion";
import { API_URL } from "@/lib/config";

export default function SplitPDFPage() {
  const [file, setFile] = useState<File | null>(null);
  const [splitting, setSplitting] = useState(false);
  const [splitted, setSplitted] = useState(false);
  const [pageRanges, setPageRanges] = useState("");
  const [error, setError] = useState<string | null>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setFile(e.target.files[0]);
      setSplitted(false);
      setError(null);
    }
  };

  const handleSplit = async () => {
    if (!file) return;
    setSplitting(true);
    setError(null);
    console.log("Starting split process...");
    console.log("Target API_URL:", API_URL);
    console.log("File:", file.name, "Size:", file.size);
    console.log("Ranges:", pageRanges || "ALL");

    try {
      const formData = new FormData();
      formData.append("pdf", file);
      formData.append("pageRanges", pageRanges);

      const response = await fetch(`${API_URL}/split-pdf`, {
        method: "POST",
        body: formData,
      });

      console.log("Response status:", response.status, response.statusText);

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || "Failed to split PDF");
      }

      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = blob.type === "application/zip" ? "split_files.zip" : "split.pdf";
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      setSplitted(true);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setSplitting(false);
    }
  };

  return (
    <ToolLayout
      title="Split PDF File"
      description="Clinical precision for your documents. Decouple pages with absolute accuracy and rebuild your document flow."
      icon={Split}
    >
      <div className="space-y-8">
        <AnimatePresence mode="wait">
          <motion.div
            key={file ? "selected" : "empty"}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className={`group relative border-2 border-dashed rounded-[2rem] p-8 text-center transition-all duration-700 overflow-hidden ${file ? "border-emerald-500/50 bg-emerald-50/20" : "border-gray-200 hover:border-emerald-400 hover:bg-emerald-50/10"
              }`}
          >
            <div className="absolute inset-0 bg-emerald-400/5 opacity-0 group-hover:opacity-100 transition-opacity duration-700 pointer-events-none" />
            <div className="flex flex-col items-center relative z-10">
              <motion.div
                whileHover={{ scale: 1.1, rotate: 10 }}
                className={`p-4 rounded-2xl mb-4 shadow-lg transition-all duration-500 ${file ? "bg-emerald-600 text-white shadow-emerald-500/20" : "bg-white text-gray-400 border border-gray-100 shadow-gray-200/50"
                  }`}
              >
                <Scissors className="w-8 h-8" />
              </motion.div>

              {file ? (
                <div className="space-y-3">
                  <div className="space-y-1">
                    <p className="text-gray-950 font-display font-bold text-xl mb-1 truncate max-w-xs mx-auto">{file.name}</p>
                    <p className="text-emerald-700 font-sans font-medium bg-emerald-100/50 px-2 py-0.5 rounded-full inline-block text-[9px] uppercase tracking-widest">
                      {(file.size / 1024 / 1024).toFixed(2)} MB • Ready
                    </p>
                  </div>
                  {!splitted && (
                    <button onClick={() => setFile(null)} className="text-gray-400 hover:text-red-500 text-[9px] font-bold uppercase tracking-widest transition-colors mb-2">
                      Change Document
                    </button>
                  )}
                </div>
              ) : (
                <>
                  <h3 className="text-xl font-display font-extrabold text-gray-950 mb-2 tracking-tight">Divide and Conquer</h3>
                  <p className="text-gray-500 mb-6 max-w-[280px] mx-auto font-sans text-xs leading-relaxed">
                    Extract pages with single-click precision.
                  </p>
                  <label className="cursor-pointer">
                    <AnimatedButton as="div" variant="primary" size="md" className="px-10 h-12 rounded-xl shadow-xl shadow-emerald-900/10">
                      Select Files <Upload className="w-3 h-3 ml-2 opacity-50" />
                    </AnimatedButton>
                    <input type="file" accept=".pdf" onChange={handleFileChange} className="hidden" />
                  </label>
                </>
              )}
            </div>
          </motion.div>
        </AnimatePresence>

        {file && (
          <div className="max-w-md mx-auto w-full">
            <AnimatePresence mode="wait">
              {!splitted ? (
                <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="space-y-4">
                  <div className="bg-gray-50/50 p-6 rounded-[1.5rem] border border-gray-100 relative overflow-hidden">
                    <div className="flex justify-between items-center mb-1">
                      <h4 className="text-base font-display font-bold text-gray-950">Extraction Mode</h4>
                      <div className="px-1.5 py-0.5 bg-emerald-100 text-emerald-800 text-[8px] font-bold rounded uppercase tracking-widest">
                        {pageRanges.trim() === "" ? "Split All Pages" : "Custom Ranges"}
                      </div>
                    </div>
                    <p className="text-gray-500 text-[10px] font-sans mb-4">
                      {pageRanges.trim() === ""
                        ? "Every page will be extracted as an individual PDF and bundled into a ZIP file."
                        : "Only specified pages will be extracted."}
                    </p>

                    <input
                      type="text"
                      placeholder="e.g. 1-3, 5, 8-10 (Leave empty for all)"
                      value={pageRanges}
                      onChange={(e) => setPageRanges(e.target.value)}
                      className="w-full px-4 py-2 text-sm border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500/20 bg-white"
                    />
                  </div>

                  {error && (
                    <p className="text-red-500 text-xs text-center font-medium bg-red-50 py-2 rounded-lg">{error}</p>
                  )}

                  <AnimatedButton
                    onClick={handleSplit}
                    disabled={splitting}
                    fullWidth
                    size="lg"
                    className="h-14 rounded-xl text-base premium-glow shadow-xl shadow-emerald-900/15 font-bold"
                  >
                    {splitting ? (
                      <div className="flex items-center gap-3">
                        <Loader2 className="w-5 h-5 animate-spin" />
                        <span>Splitting...</span>
                      </div>
                    ) : (
                      "Split PDF"
                    )}
                  </AnimatedButton>
                </motion.div>
              ) : (
                <motion.div
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  className="bg-emerald-950 text-white rounded-[2rem] p-8 text-center relative overflow-hidden shadow-xl shadow-emerald-900/30"
                >
                  <div className="relative z-10 flex flex-col items-center">
                    <div className="w-12 h-12 bg-emerald-500 rounded-xl flex items-center justify-center mb-4 shadow-lg shadow-emerald-500/30">
                      <CheckCircle2 className="w-6 h-6 text-white" />
                    </div>
                    <h4 className="text-2xl font-display font-extrabold mb-2 tracking-tight">Split Done!</h4>
                    <p className="text-emerald-100/60 font-sans text-[10px] max-w-[200px] mb-6 italic">
                      "Individual pages extracted perfectly."
                    </p>

                    <p className="text-emerald-50 text-[11px] mb-6">Your document has been split and downloaded.</p>

                    <button onClick={() => { setFile(null); setSplitted(false); setPageRanges(""); }} className="mt-4 text-emerald-400 hover:text-white text-[8px] font-bold uppercase tracking-[0.3em] transition-all opacity-40 hover:opacity-100">
                      New Split
                    </button>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        )}
      </div>
    </ToolLayout>
  );
}
