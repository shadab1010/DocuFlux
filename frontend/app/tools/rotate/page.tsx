"use client";

import { useState, useRef, useEffect } from "react";
import { API_URL } from "@/lib/config";
import ToolLayout from "../../components/ToolLayout";
import { Upload, CheckCircle2, Loader2, X, RefreshCw, RefreshCcw, Info, ArrowRightCircle } from "lucide-react";
import AnimatedButton from "../../components/ui/AnimatedButton";
import { motion, AnimatePresence } from "framer-motion";
import { Document, Page, pdfjs } from 'react-pdf';
import 'react-pdf/dist/esm/Page/AnnotationLayer.css';
import 'react-pdf/dist/esm/Page/TextLayer.css';

pdfjs.GlobalWorkerOptions.workerSrc = `//unpkg.com/pdfjs-dist@${pdfjs.version}/build/pdf.worker.min.mjs`;

export default function RotatePage() {
    const [file, setFile] = useState<File | null>(null);
    const [fileUrl, setFileUrl] = useState<string | null>(null);
    const [processing, setProcessing] = useState(false);
    const [complete, setComplete] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [angle, setAngle] = useState(0);

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
                setAngle(0);
            } else {
                setError("Please select a PDF file");
            }
        }
    };

    const handleRotateRight = () => {
        setAngle((prev) => (prev + 90) % 360);
    };

    const handleRotateLeft = () => {
        setAngle((prev) => (prev - 90) % 360);
    };

    const handleReset = () => {
        setAngle(0);
    };

    const handleRemoveFile = () => {
        setFile(null);
        setFileUrl(null);
        setAngle(0);
        setComplete(false);
    };

    const handleRotateSubmit = async () => {
        if (!file) {
            setError("No file selected");
            return;
        }

        setProcessing(true);
        setError(null);

        try {
            const formData = new FormData();
            formData.append('pdf', file);

            // Fix negative angles (-90 = 270)
            let finalAngle = angle;
            if (finalAngle < 0) finalAngle += 360;

            formData.append('angle', finalAngle.toString());

            const response = await fetch(`${API_URL}/rotate-pdf`, {
                method: 'POST',
                body: formData
            });

            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.error || 'Failed to rotate PDF');
            }

            const blob = await response.blob();
            const url = URL.createObjectURL(blob);
            const link = document.createElement('a');
            link.href = url;
            link.download = `rotated_${file.name}`;
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);
            URL.revokeObjectURL(url);

            setComplete(true);
        } catch (err) {
            const errorMsg = err instanceof Error ? err.message : 'Failed to rotate PDF';
            setError(errorMsg);
        } finally {
            setProcessing(false);
        }
    };

    return (
        <ToolLayout
            title="Rotate PDF"
            description="Perfect orientation. Fix upside-down or sideways pages with a single click."
            icon={RefreshCw}
        >
            <div className="space-y-8">
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
                                    <RefreshCw className="w-8 h-8 text-emerald-600" />
                                </motion.div>

                                <h3 className="text-xl font-display font-extrabold text-gray-950 mb-2 tracking-tight">Upload PDF to Rotate</h3>
                                <p className="text-gray-500 mb-6 max-w-[280px] mx-auto font-sans text-xs leading-relaxed">
                                    Easily rotate single or multi-page PDF documents.
                                </p>
                                <label className="cursor-pointer">
                                    <AnimatedButton as="div" variant="primary" size="md" className="px-10 h-12 rounded-xl shadow-xl shadow-emerald-900/10">
                                        Select PDF <Upload className="w-3 h-3 ml-2 opacity-50" />
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
                    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="flex flex-col lg:flex-row gap-8">
                        {/* Main Editor Canvas / Left side */}
                        <div className="flex-1 bg-gray-50/50 rounded-2xl p-8 border border-gray-200 relative min-h-[500px] flex items-center justify-center">

                            {/* File Preview Container */}
                            <div className="relative inline-block group">
                                {/* Thumbnail Background / shadow layer */}
                                <div className="absolute inset-0 bg-black/5 blur-xl -z-10 rounded-xl transition-transform" style={{ transform: `rotate(${angle}deg)` }} />

                                <div
                                    className="relative bg-white shadow-lg overflow-hidden transition-all duration-500 ease-out border border-gray-200"
                                    style={{ transform: `rotate(${angle}deg)`, transformOrigin: 'center center' }}
                                >
                                    <Document file={fileUrl}>
                                        <Page
                                            pageNumber={1}
                                            width={250}
                                            renderTextLayer={false}
                                            renderAnnotationLayer={false}
                                            className="pointer-events-none"
                                        />
                                    </Document>
                                </div>

                                <div className="absolute inset-0 opacity-0 group-hover:opacity-100 flex items-center justify-center transition-opacity duration-300">
                                    <div className="bg-red-500 p-[3px] rounded-full absolute -top-3 -right-3 backdrop-blur-sm z-20 cursor-pointer hover:bg-red-600 transition-colors shadow-lg shadow-black/30 border border-white flex items-center justify-center w-7 h-7"
                                        onClick={handleRemoveFile}>
                                        <X className="text-white w-4 h-4" />
                                    </div>
                                    <div className="bg-black/40 backdrop-blur-sm absolute inset-0 transition-opacity rounded" />
                                    <div className="z-10 bg-white shadow-xl rounded-full p-4 cursor-pointer hover:scale-110 transition-transform flex gap-2 w-14 h-14 items-center justify-center"
                                        onClick={handleRotateRight}>
                                        <RefreshCw className="w-8 h-8 text-gray-800" />
                                    </div>
                                </div>
                            </div>

                            {/* File Name Label */}
                            <div className="absolute bottom-6 left-0 right-0 text-center pointer-events-none">
                                <span className="text-sm font-medium text-gray-500 bg-white/80 backdrop-blur-sm px-4 py-1.5 rounded-full border border-gray-200 shadow-sm">
                                    {file.name}
                                </span>
                            </div>
                        </div>

                        {/* Right Sidebar */}
                        <div className="w-full lg:w-80 space-y-6">

                            {/* Error / Success states */}
                            {error && (
                                <div className="bg-red-50 border border-red-200 rounded-xl p-4 text-red-600 text-sm flex items-center justify-between">
                                    <span>{error}</span>
                                    <button onClick={() => setError(null)} className="text-red-500 hover:text-red-700">
                                        <X className="w-4 h-4" />
                                    </button>
                                </div>
                            )}

                            {complete && (
                                <div className="bg-emerald-50 border border-emerald-200 rounded-xl p-4 text-emerald-600 text-sm flex items-center gap-2">
                                    <CheckCircle2 className="w-5 h-5" />
                                    PDF rotated successfully!
                                </div>
                            )}

                            {/* Sidebar Header */}
                            <div>
                                <h3 className="text-2xl font-bold text-gray-900 mb-6 text-center">Rotate PDF</h3>

                                <div className="bg-[#eaf4fe] border border-blue-100 rounded-xl p-4 text-[13px] text-gray-700 flex items-start gap-3 shadow-sm font-medium leading-relaxed">
                                    <Info className="w-5 h-5 text-blue-500 shrink-0 mt-0.5" />
                                    <p>Mouse over PDF file below and a ↻ icon will appear, click on the arrows to rotate PDFs.</p>
                                </div>
                            </div>

                            {/* Controls */}
                            <div className="space-y-4 pt-4 border-t border-gray-100">
                                <div className="flex justify-between items-center mb-4">
                                    <h4 className="text-sm font-bold text-gray-800">Rotation</h4>
                                    <button
                                        onClick={handleReset}
                                        className="text-sm text-red-500 hover:text-red-600 font-semibold underline decoration-red-200 underline-offset-4"
                                    >
                                        Reset all
                                    </button>
                                </div>

                                <div className="flex flex-col gap-3">
                                    <button
                                        onClick={handleRotateRight}
                                        className="w-full bg-[#f8f9fa] border border-gray-200 hover:border-[#dc3545] hover:shadow-md transition-all rounded-lg overflow-hidden flex items-center group h-12"
                                    >
                                        <div className="bg-[#dc3545] h-full w-14 shrink-0 flex items-center justify-center transition-colors">
                                            <RefreshCw className="w-5 h-5 text-white" />
                                        </div>
                                        <div className="flex-1 text-left px-4 font-semibold text-gray-600 text-sm">
                                            RIGHT
                                        </div>
                                    </button>

                                    <button
                                        onClick={handleRotateLeft}
                                        className="w-full bg-[#f8f9fa] border border-gray-200 hover:border-[#dc3545] hover:shadow-md transition-all rounded-lg overflow-hidden flex items-center group h-12"
                                    >
                                        <div className="bg-[#dc3545] h-full w-14 shrink-0 flex items-center justify-center transition-colors">
                                            <RefreshCcw className="w-5 h-5 text-white" style={{ transform: 'scaleX(-1)' }} />
                                        </div>
                                        <div className="flex-1 text-left px-4 font-semibold text-gray-600 text-sm">
                                            LEFT
                                        </div>
                                    </button>
                                </div>
                            </div>

                            {/* Submit Button */}
                            <button
                                onClick={handleRotateSubmit}
                                disabled={processing}
                                className="w-full mt-8 py-4 rounded-2xl bg-[#dc3545] text-white hover:bg-[#c82333] transition-colors shadow-lg shadow-red-600/20 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 font-bold text-lg"
                            >
                                {processing ? (
                                    <>
                                        <Loader2 className="w-5 h-5 animate-spin" />
                                        Rotating...
                                    </>
                                ) : (
                                    <>
                                        Rotate PDF <ArrowRightCircle className="w-5 h-5" />
                                    </>
                                )}
                            </button>
                        </div>
                    </motion.div>
                )}
            </div>
        </ToolLayout>
    );
}

