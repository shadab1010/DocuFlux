"use client";

import { useState, useRef, useEffect } from "react";
import { API_URL } from "@/lib/config";
import ToolLayout from "../../components/ToolLayout";
import { Upload, Unlock, Eye, EyeOff, Loader2, X, Plus, ArrowRight, CheckCircle2, Lock } from "lucide-react";
import AnimatedButton from "../../components/ui/AnimatedButton";
import { motion, AnimatePresence } from "framer-motion";
import { Document, Page, pdfjs } from 'react-pdf';
import 'react-pdf/dist/esm/Page/AnnotationLayer.css';
import 'react-pdf/dist/esm/Page/TextLayer.css';

pdfjs.GlobalWorkerOptions.workerSrc = `//unpkg.com/pdfjs-dist@${pdfjs.version}/build/pdf.worker.min.mjs`;

export default function UnlockPage() {
    const [file, setFile] = useState<File | null>(null);
    const [fileUrl, setFileUrl] = useState<string | null>(null);

    const [processing, setProcessing] = useState(false);
    const [complete, setComplete] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const fileInputRef = useRef<HTMLInputElement>(null);

    useEffect(() => {
        if (file) {
            const url = URL.createObjectURL(file);
            setFileUrl(url);
            return () => URL.revokeObjectURL(url);
        }
    }, [file]);

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files && e.target.files[0]) {
            const selectedFile = e.target.files[0];
            if (selectedFile.type === "application/pdf") {
                setFile(selectedFile);
                setComplete(false);
                setError(null);
            } else {
                setError("Please select a valid PDF file.");
            }
        }
    };

    const handleUnlock = async () => {
        if (!file) {
            setError("Please upload a PDF first.");
            return;
        }

        setProcessing(true);
        setError(null);

        try {
            const formData = new FormData();
            formData.append('pdf', file);

            const response = await fetch(`${API_URL}/unlock-pdf`, {
                method: 'POST',
                body: formData
            });

            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.error || 'Failed to unlock PDF. Incorrect password?');
            }

            const blob = await response.blob();
            const url = URL.createObjectURL(blob);
            const link = document.createElement('a');
            link.href = url;
            link.download = `unlocked_${file.name}`;
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);
            URL.revokeObjectURL(url);

            setComplete(true);
        } catch (err) {
            const errorMsg = err instanceof Error ? err.message : 'An unexpected error occurred';
            setError(errorMsg);
        } finally {
            setProcessing(false);
        }
    };

    return (
        <ToolLayout
            title="Unlock PDF"
            description="Access granted. Remove restrictions and passwords from your PDF files instantly."
            icon={Unlock}
        >
            <div className="space-y-8 pb-8">
                {!file ? (
                    <AnimatePresence mode="wait">
                        <motion.div
                            initial={{ opacity: 0, scale: 0.98 }}
                            animate={{ opacity: 1, scale: 1 }}
                            className="group relative border-2 border-dashed rounded-[2rem] p-8 text-center transition-all duration-700 overflow-hidden border-gray-200 hover:border-emerald-400 hover:bg-emerald-50/10"
                        >
                            <div className="absolute inset-0 bg-emerald-400/5 opacity-0 group-hover:opacity-100 transition-opacity duration-700 pointer-events-none" />
                            <div className="flex flex-col items-center relative z-10">
                                <motion.div
                                    whileHover={{ scale: 1.1, rotate: -2 }}
                                    className="p-4 rounded-2xl mb-4 shadow-lg transition-all duration-500 bg-white text-gray-400 border border-gray-100 shadow-gray-200/50"
                                >
                                    <Unlock className="w-8 h-8" />
                                </motion.div>

                                <h3 className="text-xl font-display font-extrabold text-gray-950 mb-2 tracking-tight">Upload locked PDF</h3>
                                <p className="text-gray-500 mb-6 max-w-[280px] mx-auto font-sans text-xs leading-relaxed">
                                    Remove passwords and unlock your document.
                                </p>
                                <label className="cursor-pointer">
                                    <AnimatedButton as="div" variant="primary" size="md" className="px-10 h-12 rounded-xl bg-emerald-500 hover:bg-emerald-600 shadow-xl shadow-emerald-900/10 border-none">
                                        Select PDF file <Upload className="w-3 h-3 ml-2 opacity-50" />
                                    </AnimatedButton>
                                    <input
                                        ref={fileInputRef}
                                        type="file"
                                        accept=".pdf"
                                        onChange={handleFileChange}
                                        className="hidden"
                                    />
                                </label>
                            </div>
                        </motion.div>
                    </AnimatePresence>
                ) : (
                    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="flex flex-col lg:flex-row min-h-[600px] border border-gray-200 rounded-lg overflow-hidden shadow-sm">

                        {/* LEFT PREVIEW PANE */}
                        <div className="lg:w-2/3 bg-[#f3f4f6] relative flex items-center justify-center p-8 overflow-auto min-h-[400px]">
                            {/* Floating Add Button matches user screenshot */}
                            <div className="absolute top-6 right-6">
                                <button
                                    onClick={() => fileInputRef.current?.click()}
                                    className="relative flex items-center justify-center w-10 h-10 rounded-full bg-emerald-500 hover:bg-emerald-600 text-white shadow-md transition-colors"
                                    title="Change File"
                                >
                                    <Plus className="w-5 h-5" />
                                    <span className="absolute -top-1 -left-1 flex items-center justify-center w-4 h-4 rounded-full bg-slate-900 text-white text-[10px] font-bold border-2 border-[#f3f4f6]">
                                        1
                                    </span>
                                </button>
                            </div>

                            <input
                                ref={fileInputRef}
                                type="file"
                                accept=".pdf"
                                onChange={handleFileChange}
                                className="hidden"
                            />

                            {/* Thumbnail Box */}
                            <div className="bg-white p-2 rounded-lg shadow-[0_2px_10px_rgb(0,0,0,0.05)] flex flex-col items-center">
                                <div className="border border-gray-100 mb-2 w-[180px] min-h-[250px] flex items-center justify-center bg-gray-50 overflow-hidden relative group">
                                    {fileUrl ? (
                                        <Document
                                            file={fileUrl}
                                            loading={<Loader2 className="w-6 h-6 animate-spin text-gray-300" />}
                                            onPassword={(callback: any) => {
                                                // We intentionally don't provide the password here so it shows the default react-pdf password prompt or fails gracefully.
                                                // Actually, react-pdf natively prompts for password if we don't handle it. Let's just catch it.
                                                callback("");
                                            }}
                                            error={
                                                <div className="text-center p-4">
                                                    <Lock className="w-8 h-8 text-gray-300 mx-auto mb-2" />
                                                    <span className="text-xs text-gray-500">Document is Locked</span>
                                                </div>
                                            }
                                        >
                                            <Page
                                                pageNumber={1}
                                                width={180}
                                                renderTextLayer={false}
                                                renderAnnotationLayer={false}
                                                className="shadow-sm"
                                            />
                                        </Document>
                                    ) : (
                                        <Loader2 className="w-6 h-6 animate-spin text-gray-300" />
                                    )}

                                    {/* Hover overlay to discard */}
                                    <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                                        <button
                                            onClick={() => {
                                                setFile(null);
                                                setFileUrl(null);
                                            }}
                                            className="w-10 h-10 bg-white rounded-full flex items-center justify-center text-red-500 hover:bg-red-50 transition-colors shadow-lg"
                                        >
                                            <X className="w-5 h-5" />
                                        </button>
                                    </div>
                                </div>
                                <p className="text-xs font-medium text-gray-700 w-[180px] truncate text-center" title={file.name}>
                                    {file.name}
                                </p>
                            </div>
                        </div>

                        {/* RIGHT OPTIONS PANE */}
                        <div className="lg:w-1/3 bg-white flex flex-col h-full border-l border-gray-200">
                            {/* Header */}
                            <div className="py-5 px-6 border-b border-gray-100 text-center">
                                <h2 className="text-xl font-bold text-gray-800">Unlock PDF</h2>
                            </div>

                            {/* Content */}
                            {!complete ? (
                                <div className="p-6 flex-1 flex flex-col">
                                    <p className="text-sm font-semibold text-gray-700 mb-6 font-sans">
                                        Remove security restrictions from your PDF file.
                                    </p>
                                    <p className="text-xs text-gray-500 mb-6 font-sans">
                                        Our intelligent engine will automatically bypass and crack standard permissions passwords so you can seamlessly edit, print, and copy your document.
                                    </p>

                                    {error && (
                                        <p className="text-red-500 text-xs font-semibold mb-4 text-center p-3 bg-red-50 rounded-lg">{error}</p>
                                    )}

                                    {/* Spacer to push button to bottom */}
                                    <div className="flex-1"></div>

                                </div>
                            ) : (
                                <div className="p-8 flex-1 flex flex-col items-center justify-center text-center">
                                    <div className="w-16 h-16 bg-emerald-50 rounded-full flex items-center justify-center mb-4">
                                        <CheckCircle2 className="w-8 h-8 text-emerald-500" />
                                    </div>
                                    <h4 className="text-lg font-bold text-gray-900 mb-2">Unlocked Successfully</h4>
                                    <p className="text-sm text-gray-500 mb-6">Your document is now restriction-free.</p>

                                    <button
                                        onClick={() => {
                                            setFile(null);
                                            setFileUrl(null);
                                            setComplete(false);
                                        }}
                                        className="text-sm font-semibold text-emerald-500 hover:text-emerald-600 uppercase tracking-widest"
                                    >
                                        Unlock Another
                                    </button>
                                </div>
                            )}

                            {/* Bottom Fixed Button */}
                            {!complete && (
                                <div className="p-4 bg-white border-t border-gray-100">
                                    <button
                                        onClick={handleUnlock}
                                        disabled={processing}
                                        className="w-full py-4 px-6 bg-[#10b981] hover:bg-[#059669] text-white font-bold text-lg rounded-lg flex items-center justify-center gap-2 transition-all disabled:opacity-50 shadow-lg shadow-emerald-900/10"
                                    >
                                        {processing ? (
                                            <>
                                                <Loader2 className="w-5 h-5 animate-spin" /> Unlocking...
                                            </>
                                        ) : (
                                            <>
                                                Unlock PDF <ArrowRight className="w-5 h-5" />
                                            </>
                                        )}
                                    </button>
                                </div>
                            )}
                        </div>
                    </motion.div>
                )}
            </div>
        </ToolLayout>
    );
}
