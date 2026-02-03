"use client";

import { useState, useRef } from "react";
import { API_URL } from "@/lib/config";
import ToolLayout from "./ToolLayout";
import { Upload, CheckCircle2, Loader2, X, Plus, FileText, Download, RotateCcw, Sparkles } from "lucide-react";
import AnimatedButton from "./ui/AnimatedButton";
import { motion, AnimatePresence } from "framer-motion";
import { LucideIcon } from "lucide-react";

interface BaseToolProps {
    title: string;
    description: string;
    icon: LucideIcon;
    endpoint: string;
    allowedExtensions?: string[];
    multiple?: boolean;
    fileInputName?: string;
    additionalParams?: Record<string, string>;
    downloadName?: string;
}

export default function BaseTool({
    title,
    description,
    icon: Icon,
    endpoint,
    allowedExtensions = [".pdf"],
    multiple = false,
    fileInputName = "pdf",
    additionalParams = {},
    downloadName = "processed.pdf"
}: BaseToolProps) {
    const [files, setFiles] = useState<File[]>([]);
    const [processing, setProcessing] = useState(false);
    const [complete, setComplete] = useState(false);
    const [downloadUrl, setDownloadUrl] = useState<string | null>(null);
    const [error, setError] = useState<string | null>(null);
    const fileInputRef = useRef<HTMLInputElement>(null);

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files) {
            const newFiles = Array.from(e.target.files);
            if (multiple) {
                setFiles((prev) => [...prev, ...newFiles]);
            } else {
                setFiles(newFiles);
            }
            setComplete(false);
            setError(null);
        }
    };

    const removeFile = (index: number) => {
        setFiles((prev) => prev.filter((_, i) => i !== index));
        if (files.length <= 1) setComplete(false);
    };

    const triggerFileInput = () => {
        fileInputRef.current?.click();
    };

    const handleProcess = async () => {
        if (files.length === 0) return;
        setProcessing(true);
        setError(null);

        const formData = new FormData();
        if (multiple) {
            files.forEach((file) => formData.append(fileInputName, file));
        } else {
            formData.append(fileInputName, files[0]);
        }

        Object.entries(additionalParams).forEach(([key, value]) => {
            formData.append(key, value);
        });

        try {
            const res = await fetch(`${API_URL}${endpoint}`, {
                method: "POST",
                body: formData,
            });

            if (res.ok) {
                const blob = await res.blob();
                const url = window.URL.createObjectURL(blob);
                setDownloadUrl(url);
                setComplete(true);
            } else {
                const data = await res.json();
                setError(data.error || "Processing failed");
            }
        } catch (err) {
            setError("Failed to connect to server");
        } finally {
            setProcessing(false);
        }
    };

    const handleDownload = () => {
        if (downloadUrl) {
            const link = document.createElement("a");
            link.href = downloadUrl;
            link.setAttribute("download", downloadName);
            document.body.appendChild(link);
            link.click();
            link.parentNode?.removeChild(link);
        }
    };

    const reset = () => {
        setFiles([]);
        setComplete(false);
        setDownloadUrl(null);
        setError(null);
    };

    return (
        <ToolLayout title={title} description={description} icon={Icon}>
            <div className="space-y-8 pb-8">
                {/* Upload Section - Neon Glassmorphism */}
                <div
                    className={`group relative border-2 border-dashed rounded-[2rem] p-6 md:p-8 transition-all duration-1000 overflow-hidden ${files.length > 0
                        ? "border-emerald-500/30 bg-emerald-50/20 backdrop-blur-xl"
                        : "border-slate-200 hover:border-emerald-400 bg-white/40 hover:bg-emerald-50/30 backdrop-blur-xl shadow-xl shadow-emerald-950/5"
                        }`}
                >
                    {/* Background Animated Gradient */}
                    <div className="absolute inset-0 bg-gradient-to-br from-emerald-400/5 via-transparent to-teal-400/5 opacity-0 group-hover:opacity-100 transition-opacity duration-1000 pointer-events-none" />

                    {files.length > 0 ? (
                        <div className="space-y-6 relative z-10">
                            <div className="flex items-center justify-between px-1">
                                <div className="flex items-center gap-3">
                                    <div className="relative">
                                        <div className="absolute inset-0 bg-emerald-500 blur-lg opacity-20 animate-pulse" />
                                        <span className="relative bg-emerald-950 text-white w-8 h-8 rounded-xl flex items-center justify-center text-xs font-black shadow-lg border border-emerald-500/30">
                                            {files.length}
                                        </span>
                                    </div>
                                    <h3 className="text-lg font-display font-black text-slate-900 tracking-tight">Documents Prepared</h3>
                                </div>
                                {!complete && (
                                    <motion.button
                                        whileHover={{ scale: 1.05, y: -2 }}
                                        whileTap={{ scale: 0.95 }}
                                        onClick={triggerFileInput}
                                        className="flex items-center gap-2 px-4 py-2 bg-white/80 backdrop-blur-md text-emerald-900 rounded-xl text-[10px] font-black uppercase tracking-widest border border-emerald-100 shadow-md shadow-emerald-900/5 hover:bg-emerald-900 hover:text-white transition-all duration-500"
                                    >
                                        <Plus className="w-3.5 h-3.5" />
                                        {multiple ? "Add More" : "Replace"}
                                    </motion.button>
                                )}
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-2 gap-3 max-h-[350px] overflow-y-auto pr-2 custom-scrollbar">
                                <AnimatePresence mode="popLayout">
                                    {files.map((file, index) => (
                                        <motion.div
                                            key={`${file.name}-${index}`}
                                            layout
                                            initial={{ opacity: 0, scale: 0.8, x: -30 }}
                                            animate={{ opacity: 1, scale: 1, x: 0 }}
                                            exit={{ opacity: 0, scale: 0.8, filter: "blur(10px)" }}
                                            transition={{
                                                type: "spring",
                                                stiffness: 260,
                                                damping: 20,
                                                delay: index * 0.05
                                            }}
                                            className="group/item flex items-center justify-between p-3 bg-white/90 backdrop-blur-md border border-slate-100 rounded-[1.25rem] shadow-sm hover:border-emerald-300 hover:shadow-lg hover:shadow-emerald-900/5 transition-all duration-500"
                                        >
                                            <div className="flex items-center gap-3 overflow-hidden">
                                                <div className="w-10 h-10 bg-emerald-50 rounded-xl flex items-center justify-center text-emerald-700 transition-all duration-500 group-hover/item:bg-emerald-950 group-hover/item:text-white group-hover/item:rotate-12">
                                                    <FileText className="w-5 h-5" />
                                                </div>
                                                <div className="text-left overflow-hidden">
                                                    <p className="text-slate-950 font-display font-bold text-xs truncate max-w-[150px]">{file.name}</p>
                                                    <div className="flex items-center gap-2 mt-0.5">
                                                        <span className="text-[9px] font-black text-slate-400 uppercase tracking-widest">READY</span>
                                                        <div className="w-1 h-1 bg-slate-200 rounded-full" />
                                                        <p className="text-slate-400 font-sans text-[9px] font-bold">{(file.size / 1024 / 1024).toFixed(2)} MB</p>
                                                    </div>
                                                </div>
                                            </div>
                                            {!complete && (
                                                <button
                                                    onClick={() => removeFile(index)}
                                                    className="p-2 hover:bg-rose-50 text-slate-300 hover:text-rose-500 transition-all rounded-xl bg-slate-50 border border-transparent hover:border-rose-100"
                                                >
                                                    <X className="w-3.5 h-3.5" />
                                                </button>
                                            )}
                                        </motion.div>
                                    ))}
                                </AnimatePresence>
                            </div>
                        </div>
                    ) : (
                        <div className="flex flex-col items-center relative z-10 py-6">
                            <motion.div
                                animate={{
                                    y: [0, -10, 0],
                                    rotate: [0, 3, -3, 0]
                                }}
                                transition={{
                                    duration: 6,
                                    repeat: Infinity,
                                    ease: "easeInOut"
                                }}
                                className="relative mb-6"
                            >
                                <div className="absolute inset-0 bg-emerald-500 blur-3xl opacity-20 scale-125 animate-pulse" />
                                <div className="relative p-6 bg-white border border-emerald-50 rounded-[2rem] shadow-xl shadow-emerald-950/10">
                                    <Icon className="w-12 h-12 text-emerald-900" strokeWidth={1.5} />
                                    <div className="absolute -top-2 -right-2 w-8 h-8 bg-emerald-950 rounded-xl flex items-center justify-center text-white shadow-lg">
                                        <Plus className="w-4 h-4" />
                                    </div>
                                </div>
                            </motion.div>

                            <h3 className="text-2xl font-display font-black text-slate-950 mb-2 tracking-tighter">
                                Start the <span className="text-emerald-700 italic font-serif">transformation</span>
                            </h3>
                            <p className="text-slate-500 mb-6 max-w-sm mx-auto font-sans text-xs font-medium leading-relaxed opacity-70 px-4">
                                Drop your professional assets here to unlock industry-leading {title.toLowerCase()} results.
                            </p>

                            <AnimatedButton
                                onClick={triggerFileInput}
                                variant="primary"
                                size="md"
                                className="px-10 h-12 rounded-[1rem] shadow-[0_15px_30px_-5px_rgba(6,78,59,0.15)] text-sm border-none"
                            >
                                Select Files <Plus className="w-4 h-4 ml-3 opacity-40 bg-white/20 p-0.5 rounded-md" />
                            </AnimatedButton>
                        </div>
                    )}
                    <input
                        type="file"
                        ref={fileInputRef}
                        accept={allowedExtensions.join(",")}
                        multiple={multiple}
                        onChange={handleFileChange}
                        className="hidden"
                    />
                </div>

                {error && (
                    <motion.div
                        initial={{ opacity: 0, y: -10 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="bg-rose-50 border border-rose-100 text-rose-600 p-5 rounded-2xl text-center text-sm font-bold flex items-center justify-center gap-3 shadow-sm mx-auto max-w-lg"
                    >
                        <X className="w-5 h-5 bg-rose-600 text-white rounded-full p-1" />
                        {error}
                    </motion.div>
                )}

                <AnimatePresence mode="wait">
                    {files.length >= 1 && (
                        <div className="max-w-2xl mx-auto w-full relative">
                            {!complete ? (
                                <motion.div
                                    initial={{ opacity: 0, y: 30 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    exit={{ opacity: 0, scale: 0.9, filter: "blur(20px)" }}
                                    className="relative"
                                >
                                    {processing && (
                                        <div className="absolute inset-0 z-50 rounded-[2.5rem] overflow-hidden">
                                            {/* Magic Progress Bar */}
                                            <div className="absolute top-0 left-0 w-full h-1.5 bg-emerald-50">
                                                <motion.div
                                                    initial={{ x: "-100%" }}
                                                    animate={{ x: "100%" }}
                                                    transition={{ duration: 1.5, repeat: Infinity, ease: "linear" }}
                                                    className="w-full h-full bg-gradient-to-r from-transparent via-emerald-500 to-transparent shadow-[0_0_15px_rgba(16,185,129,0.8)]"
                                                />
                                            </div>
                                        </div>
                                    )}

                                    <div className={`p-4 transition-all duration-700 ${processing ? "grayscale opacity-50" : ""}`}>
                                        <AnimatedButton
                                            onClick={handleProcess}
                                            disabled={processing}
                                            fullWidth
                                            size="lg"
                                            className="h-20 rounded-[1.75rem] text-xl font-black premium-glow shadow-2xl shadow-emerald-950/20 tracking-tight"
                                        >
                                            {processing ? (
                                                <div className="flex items-center gap-4">
                                                    <Loader2 className="w-6 h-6 animate-spin ease-linear text-emerald-400" />
                                                    <span className="italic font-serif">Developing...</span>
                                                </div>
                                            ) : (
                                                <div className="flex items-center justify-center gap-4">
                                                    <span>{title} now</span>
                                                    <Sparkles className="w-6 h-6 opacity-40" />
                                                </div>
                                            )}
                                        </AnimatedButton>
                                    </div>
                                </motion.div>
                            ) : (
                                <motion.div
                                    initial={{ opacity: 0, scale: 0.95, y: 40 }}
                                    animate={{ opacity: 1, scale: 1, y: 0 }}
                                    className="bg-slate-950 text-white rounded-[3rem] p-12 text-center relative overflow-hidden shadow-[0_50px_100px_-20px_rgba(2,6,23,0.4)] border border-white/5"
                                >
                                    {/* Success Background Art */}
                                    <div className="absolute top-0 left-0 w-full h-full bg-[radial-gradient(circle_at_top_right,rgba(16,185,129,0.15),transparent_70%)]" />
                                    <div className="absolute -bottom-20 -left-20 w-64 h-64 bg-emerald-600/10 rounded-full blur-3xl pointer-events-none" />

                                    <div className="relative z-10 flex flex-col items-center">
                                        <motion.div
                                            initial={{ rotate: -20, scale: 0.5 }}
                                            animate={{ rotate: 0, scale: 1 }}
                                            transition={{ type: "spring", damping: 12 }}
                                            className="w-20 h-20 bg-emerald-500 rounded-3xl flex items-center justify-center mb-8 shadow-2xl shadow-emerald-500/40 border-4 border-white/10"
                                        >
                                            <CheckCircle2 className="w-10 h-10 text-white" strokeWidth={3} />
                                        </motion.div>

                                        <h4 className="text-5xl font-display font-black mb-4 tracking-tighter">Success!</h4>
                                        <p className="text-emerald-100/40 font-sans text-sm font-bold max-w-xs mb-10 leading-relaxed uppercase tracking-[0.3em]">
                                            Optimized with professional precision.
                                        </p>

                                        <div className="grid grid-cols-1 gap-4 w-full max-w-md">
                                            <motion.button
                                                whileHover={{ scale: 1.02, y: -2 }}
                                                whileTap={{ scale: 0.98 }}
                                                onClick={handleDownload}
                                                className="h-16 rounded-2xl bg-white text-slate-950 shadow-2xl shadow-white/10 border-none text-lg font-black flex items-center justify-center gap-3 transition-all group"
                                            >
                                                <Download className="w-6 h-6 group-hover:animate-bounce" /> Get Your Result
                                            </motion.button>

                                            <button
                                                onClick={reset}
                                                className="flex items-center justify-center gap-3 text-emerald-400 hover:text-white text-[11px] font-black uppercase tracking-[0.4em] transition-all p-4 mt-2 group"
                                            >
                                                <RotateCcw className="w-4 h-4 group-hover:rotate-[-45deg] transition-transform" /> Start New Task
                                            </button>
                                        </div>
                                    </div>
                                </motion.div>
                            )}
                        </div>
                    )}
                </AnimatePresence>
            </div>
        </ToolLayout>
    );
}
