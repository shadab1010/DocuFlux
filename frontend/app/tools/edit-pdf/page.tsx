"use client";

import { useState } from "react";
import ToolLayout from "../../components/ToolLayout";
import { Upload, Edit, CheckCircle2, Loader2, Scissors, Type, Image as ImageIcon, Sparkles } from "lucide-react";
import AnimatedButton from "../../components/ui/AnimatedButton";
import { motion, AnimatePresence } from "framer-motion";

export default function EditPDFPage() {
  const [file, setFile] = useState<File | null>(null);
  const [loading, setLoading] = useState(false);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setFile(e.target.files[0]);
    }
  };

  const handleOpenEditor = () => {
    if (!file) return;
    setLoading(true);
    setTimeout(() => setLoading(false), 2000);
  };

  return (
    <ToolLayout
      title="Edit PDF File"
      description="Master your documentation. Our high-precision interface grants you absolute control to refine text and images with aesthetic perfection."
      icon={Edit}
    >
      <div className="space-y-8">
        <AnimatePresence mode="wait">
          <motion.div
            key={file ? "selected" : "empty"}
            initial={{ opacity: 0, scale: 0.98 }}
            animate={{ opacity: 1, scale: 1 }}
            className={`group relative border-2 border-dashed rounded-[2rem] p-8 text-center transition-all duration-700 overflow-hidden ${file ? "border-emerald-500/50 bg-emerald-50/20" : "border-gray-200 hover:border-emerald-400 hover:bg-emerald-50/10"
              }`}
          >
            <div className="absolute inset-0 bg-emerald-400/5 opacity-0 group-hover:opacity-100 transition-opacity duration-700 pointer-events-none" />
            <div className="flex flex-col items-center relative z-10">
              <motion.div
                whileHover={{ scale: 1.1, rotate: -2 }}
                className={`p-4 rounded-2xl mb-4 shadow-lg transition-all duration-500 ${file ? "bg-emerald-600 text-white shadow-emerald-500/20" : "bg-white text-gray-400 border border-gray-100 shadow-gray-200/50"
                  }`}
              >
                <Edit className="w-8 h-8" />
              </motion.div>

              {file ? (
                <div className="space-y-3">
                  <div className="space-y-1">
                    <p className="text-gray-950 font-display font-bold text-xl mb-1 truncate max-w-xs mx-auto">{file.name}</p>
                    <p className="text-emerald-700 font-sans font-medium bg-emerald-100/50 px-2 py-0.5 rounded-full inline-block text-[9px] uppercase tracking-widest">
                      Ready for editing • {(file.size / 1024 / 1024).toFixed(2)} MB
                    </p>
                  </div>
                  <button onClick={() => setFile(null)} className="text-gray-400 hover:text-red-500 text-[9px] font-bold uppercase tracking-widest transition-colors mb-2">
                    Change Document
                  </button>
                </div>
              ) : (
                <>
                  <h3 className="text-xl font-display font-extrabold text-gray-950 mb-2 tracking-tight">Refine your vision</h3>
                  <p className="text-gray-500 mb-6 max-w-[280px] mx-auto font-sans text-xs leading-relaxed">
                    Unlock the full potential of your document.
                  </p>
                  <label className="cursor-pointer">
                    <AnimatedButton variant="primary" size="md" className="px-10 h-12 rounded-xl shadow-xl shadow-emerald-900/10">
                      Open PDF <Upload className="w-3 h-3 ml-2 opacity-50" />
                    </AnimatedButton>
                    <input type="file" accept=".pdf" onChange={handleFileChange} className="hidden" />
                  </label>
                </>
              )}
            </div>
          </motion.div>
        </AnimatePresence>

        {file && (
          <motion.div
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            className="space-y-6"
          >
            <div className="grid grid-cols-3 gap-3">
              {[
                { icon: Type, label: "Text" },
                { icon: ImageIcon, label: "Visuals" },
                { icon: Scissors, label: "Pages" }
              ].map((item, i) => (
                <motion.div
                  key={i}
                  whileHover={{ y: -2 }}
                  className="p-3 bg-white rounded-2xl border border-gray-100 flex flex-col items-center gap-2 text-center shadow-md shadow-gray-200/10"
                >
                  <item.icon className="w-4 h-4 text-emerald-600" />
                  <span className="text-[8px] font-bold text-emerald-950 uppercase tracking-widest">{item.label}</span>
                </motion.div>
              ))}
            </div>

            <AnimatedButton
              onClick={handleOpenEditor}
              disabled={loading}
              fullWidth
              size="lg"
              className="h-14 rounded-xl text-base font-bold premium-glow shadow-xl shadow-emerald-900/15"
            >
              {loading ? (
                <div className="flex items-center gap-3 text-white">
                  <Loader2 className="w-5 h-5 animate-spin" />
                  <span className="animate-pulse">Launching Editor...</span>
                </div>
              ) : (
                <div className="flex items-center gap-2">
                  Start Editing <Sparkles className="w-4 h-4 opacity-50" />
                </div>
              )}
            </AnimatedButton>
          </motion.div>
        )}
      </div>
    </ToolLayout>
  );
}
