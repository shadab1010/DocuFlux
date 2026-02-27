"use client";

import { useState, useRef, useEffect } from "react";
import { API_URL } from "@/lib/config";
import ToolLayout from "../../components/ToolLayout";
import { ArrowRight, Loader2, RefreshCw, X, Hammer, Download, AlertCircle, CheckCircle2 } from "lucide-react";
import AnimatedButton from "../../components/ui/AnimatedButton";
import { motion, AnimatePresence } from "framer-motion";
import { Document, Page, pdfjs } from 'react-pdf';
import 'react-pdf/dist/esm/Page/AnnotationLayer.css';
import 'react-pdf/dist/esm/Page/TextLayer.css';

pdfjs.GlobalWorkerOptions.workerSrc = `//unpkg.com/pdfjs-dist@${pdfjs.version}/build/pdf.worker.min.mjs`;

export default function RepairPage() {
    const [file, setFile] = useState<File | null>(null);
    const [fileUrl, setFileUrl] = useState<string | null>(null);

    const [processing, setProcessing] = useState(false);
    const [complete, setComplete] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const [downloadUrl, setDownloadUrl] = useState<string | null>(null);

    const fileInputRef = useRef<HTMLInputElement>(null);

    const [previewError, setPreviewError] = useState(false);

    useEffect(() => {
        if (file) {
            const url = URL.createObjectURL(file);
            setFileUrl(url);
            setPreviewError(false);
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
                setDownloadUrl(null);
                setPreviewError(false);
            } else {
                setError("Please select a valid PDF file.");
            }
        }
    };

    const handleRepair = async () => {
        if (!file) {
            setError("Please upload a PDF first.");
            return;
        }

        setProcessing(true);
        setError(null);

        try {
            const formData = new FormData();
            formData.append('pdf', file);

            const response = await fetch(`${API_URL}/repair-pdf`, {
                method: 'POST',
                body: formData
            });

            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.error || 'Failed to repair PDF');
            }

            const blob = await response.blob();
            const url = URL.createObjectURL(blob);
            setDownloadUrl(url);

            // Auto-trigger download
            const link = document.createElement('a');
            link.href = url;
            link.download = `repaired_${file.name}`;
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);

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
            title="Repair PDF"
            description="Recover data from damaged, corrupted or unreadable PDF files. We will try to reconstruct your document structure."
            icon={Hammer}
        >
            <div className="space-y-8 pb-8">
                {/* UPLOAD STATE */}
                {!file ? (
                    <AnimatePresence mode="wait">
                        <motion.div
                            initial={{ opacity: 0, scale: 0.98 }}
                            animate={{ opacity: 1, scale: 1 }}
                            className="group relative border-2 border-dashed rounded-[2rem] p-8 text-center transition-all duration-700 overflow-hidden border-gray-200 hover:border-orange-500 hover:bg-orange-50/10"
                        >
                            <div className="absolute inset-0 bg-orange-500/5 opacity-0 group-hover:opacity-100 transition-opacity duration-700 pointer-events-none" />
                            <div className="flex flex-col items-center relative z-10">
                                <motion.div
                                    whileHover={{ scale: 1.1, rotate: -2 }}
                                    className="p-4 rounded-2xl mb-4 shadow-lg transition-all duration-500 bg-white text-gray-400 border border-gray-100 shadow-gray-200/50"
                                >
                                    <Hammer className="w-8 h-8 text-orange-500" />
                                </motion.div>

                                <h3 className="text-xl font-display font-extrabold text-gray-950 mb-2 tracking-tight">Recover corrupted PDF</h3>
                                <p className="text-gray-500 mb-6 max-w-[280px] mx-auto font-sans text-xs leading-relaxed">
                                    Upload your damaged PDF file and we will attempt to fix the internal structure and streams.
                                </p>
                                <label className="cursor-pointer">
                                    <AnimatedButton as="div" variant="primary" size="md" className="px-10 h-14 rounded-xl shadow-xl shadow-orange-900/20 text-lg bg-[#f59e0b] hover:bg-[#d97706] border-none font-bold">
                                        Select PDF file <ArrowRight className="w-5 h-5 ml-2 opacity-50" />
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
                    // PREVIEW AND OPTIONS STATE
                    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="flex flex-col lg:flex-row min-h-[500px] border border-gray-200 rounded-lg overflow-hidden shadow-sm bg-[#f8f9fa]">

                        {/* LEFT PREVIEW PANE */}
                        <div className="lg:w-1/2 relative bg-[#f1f3f5] flex items-center justify-center p-8 overflow-hidden">
                            {/* Document Preview (May fail if extremely corrupted, which is fine, we show a placeholder) */}
                            <div className="relative z-10 flex flex-col items-center">
                                <div className="bg-white p-2 rounded-lg shadow-xl border border-gray-200 relative group transition-transform duration-300 hover:scale-[1.02]">

                                    <div className="absolute -top-3 -right-3 z-20">
                                        <div className={`text-white text-[10px] font-bold px-2 py-1 rounded-full shadow-md flex items-center gap-1 border-2 border-white ${complete ? 'bg-green-500' : 'bg-orange-500'}`}>
                                            {complete ? <CheckCircle2 className="w-3 h-3" /> : <AlertCircle className="w-3 h-3" />}
                                            {complete ? 'REPAIRED' : 'DAMAGED?'}
                                        </div>
                                    </div>

                                    <div className="border border-gray-100 bg-gray-50 w-[240px] h-[320px] overflow-hidden rounded relative">
                                        {/* Hover Overlay */}
                                        <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity z-10 flex items-center justify-center">
                                            <button
                                                onClick={() => {
                                                    setFile(null);
                                                    setFileUrl(null);
                                                    setComplete(false);
                                                }}
                                                className="w-12 h-12 bg-white rounded-full flex items-center justify-center text-red-500 hover:bg-red-50 transition-colors shadow-2xl"
                                                title="Remove file"
                                            >
                                                <X className="w-6 h-6" />
                                            </button>
                                        </div>

                                        {/* PDF Thumbnail */}
                                        {fileUrl && !previewError ? (
                                            <div className="transform origin-top-left scale-[0.6]">
                                                <Document
                                                    file={fileUrl}
                                                    onLoadError={(err) => {
                                                        console.log("Can't preview corrupted file", err);
                                                        setPreviewError(true);
                                                    }}
                                                    loading={
                                                        <div className="w-[400px] h-[533px] flex items-center justify-center text-gray-400">
                                                            <Loader2 className="w-8 h-8 animate-spin" />
                                                        </div>
                                                    }
                                                    error={null} // Handled by our state
                                                >
                                                    <Page
                                                        pageNumber={1}
                                                        width={400}
                                                        renderTextLayer={false}
                                                        renderAnnotationLayer={false}
                                                    />
                                                </Document>
                                            </div>
                                        ) : fileUrl && (
                                            <div className="w-full h-full flex flex-col items-center justify-center text-gray-400 bg-gray-50 p-10 text-center">
                                                <AlertCircle className="w-12 h-12 mb-4 opacity-20" />
                                                <p className="text-sm font-medium">Corrupted File Preview Unavailable</p>
                                                <p className="text-xs pt-2">We will try to repair it anyway.</p>
                                            </div>
                                        )}
                                    </div>
                                </div>

                                <p className="mt-6 text-sm font-semibold text-gray-700 bg-white/80 backdrop-blur-sm px-4 py-2 rounded-full shadow-sm border border-gray-200 max-w-[280px] truncate text-center">
                                    {file.name}
                                </p>
                            </div>
                        </div>

                        {/* RIGHT OPTIONS PANE */}
                        <div className="lg:w-1/2 bg-white flex flex-col h-full border-l border-gray-200">
                            {/* Header */}
                            <div className="py-5 px-6 border-b border-gray-100 text-center">
                                <h2 className="text-xl font-bold text-gray-800">Repair Tool</h2>
                            </div>

                            {/* Content */}
                            {!complete ? (
                                <div className="p-8 flex-1 flex flex-col items-center justify-center text-center">
                                    <Hammer className="w-16 h-16 text-orange-500 mb-6 opacity-20" />
                                    <h3 className="text-lg font-bold text-gray-800 mb-2">Internal Reconstruction</h3>
                                    <p className="text-sm text-gray-500 mb-8 max-w-sm">
                                        Our system uses high-level reconstruction engines to rebuild broken PDF headers, cross-reference tables, and object streams.
                                    </p>

                                    {error && (
                                        <div className="mb-6 p-4 bg-red-50 border border-red-100 rounded-lg flex items-start gap-3 text-left w-full max-w-sm">
                                            <AlertCircle className="w-5 h-5 text-red-500 flex-shrink-0 mt-0.5" />
                                            <p className="text-xs text-red-600 font-medium leading-relaxed">{error}</p>
                                        </div>
                                    )}
                                </div>
                            ) : (
                                <div className="p-8 flex-1 flex flex-col items-center justify-center text-center">
                                    <div className="w-20 h-20 bg-green-50 rounded-full flex items-center justify-center mb-6 border border-green-100">
                                        <CheckCircle2 className="w-10 h-10 text-green-500" />
                                    </div>
                                    <h4 className="text-xl font-bold text-gray-900 mb-3 tracking-tight">Repair Complete!</h4>
                                    <p className="text-sm text-gray-500 mb-8 max-w-[250px] mx-auto">
                                        The recovered document has been downloaded. Some extremely corrupted data might still be missing, but the structure is now valid.
                                    </p>

                                    <div className="flex flex-col gap-3 w-full max-w-[250px]">
                                        {downloadUrl && (
                                            <a
                                                href={downloadUrl}
                                                download={`repaired_${file.name}`}
                                                className="w-full py-3 px-6 bg-gray-900 hover:bg-gray-800 text-white text-sm font-bold rounded-lg flex items-center justify-center gap-2 transition-all shadow-md"
                                            >
                                                <Download className="w-4 h-4" /> Download Repaired PDF
                                            </a>
                                        )}
                                        <button
                                            onClick={() => {
                                                setFile(null);
                                                setFileUrl(null);
                                                setComplete(false);
                                                setDownloadUrl(null);
                                            }}
                                            className="w-full py-3 px-6 bg-white border border-gray-200 hover:bg-gray-50 text-gray-700 text-sm font-bold rounded-lg transition-all"
                                        >
                                            Repair Another
                                        </button>
                                    </div>
                                </div>
                            )}

                            {/* Bottom Fixed Area */}
                            {!complete && (
                                <div className="p-6 bg-white border-t border-gray-100 mt-auto">
                                    <button
                                        onClick={handleRepair}
                                        disabled={processing}
                                        className="w-full py-4 px-6 bg-[#f59e0b] hover:bg-[#d97706] text-white font-bold text-lg rounded-xl flex items-center justify-center gap-2 transition-all disabled:opacity-50 shadow-lg shadow-orange-900/20"
                                    >
                                        {processing ? (
                                            <>
                                                <Loader2 className="w-5 h-5 animate-spin" /> Repairing...
                                            </>
                                        ) : (
                                            <>
                                                Repair PDF <ArrowRight className="w-5 h-5" />
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
