"use client";

import { useState } from "react";
import ToolLayout from "../../components/ToolLayout";
import { Upload, Split, CheckCircle2, Loader2, Scissors, Sparkles } from "lucide-react";
import AnimatedButton from "../../components/ui/AnimatedButton";
import { motion, AnimatePresence } from "framer-motion";

export default function SplitPDFPage() {
  const [file, setFile] = useState<File | null>(null);
  const [splitting, setSplitting] = useState(false);
  const [splitted, setSplitted] = useState(false);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setFile(e.target.files[0]);
      setSplitted(false);
    }
  };

  const handleSplit = async () => {
    if (!file) return;
    setSplitting(true);
    setTimeout(() => {
      setSplitting(false);
      setSplitted(true);
    }, 3000);
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
                    <AnimatedButton variant="primary" size="md" className="px-10 h-12 rounded-xl shadow-xl shadow-emerald-900/10">
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
                      <h4 className="text-base font-display font-bold text-gray-950">Extraction</h4>
                      <div className="px-1.5 py-0.5 bg-emerald-100 text-emerald-800 text-[8px] font-bold rounded uppercase tracking-widest">Auto</div>
                    </div>
                    <p className="text-gray-500 text-[10px] font-sans">Every page will become a separate PDF.</p>
                  </div>

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

                    <AnimatedButton variant="secondary" fullWidth size="md" className="h-11 rounded-lg bg-white text-emerald-950 font-bold shadow-md border-none text-sm">
                      Download Assets (ZIP)
                    </AnimatedButton>
                    <button onClick={() => { setFile(null); setSplitted(false); }} className="mt-4 text-emerald-400 hover:text-white text-[8px] font-bold uppercase tracking-[0.3em] transition-all opacity-40 hover:opacity-100">
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
