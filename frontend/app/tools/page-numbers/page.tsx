"use client";

import { useState, useRef, useEffect } from "react";
import { API_URL } from "@/lib/config";
import ToolLayout from "../../components/ToolLayout";
import { Upload, ArrowRight, Loader2, RefreshCw, X, Hash, Plus, ChevronRight } from "lucide-react";
import AnimatedButton from "../../components/ui/AnimatedButton";
import { motion, AnimatePresence } from "framer-motion";
import { Document, Page, pdfjs } from 'react-pdf';
import 'react-pdf/dist/esm/Page/AnnotationLayer.css';
import 'react-pdf/dist/esm/Page/TextLayer.css';

pdfjs.GlobalWorkerOptions.workerSrc = `//unpkg.com/pdfjs-dist@${pdfjs.version}/build/pdf.worker.min.mjs`;

export default function PageNumbersPage() {
    const [file, setFile] = useState<File | null>(null);
    const [fileUrl, setFileUrl] = useState<string | null>(null);
    const [numPages, setNumPages] = useState<number | null>(null);

    // Options State
    const [pageMode, setPageMode] = useState<"single" | "facing">("single");
    const [position, setPosition] = useState("bottom-right");
    const [margin, setMargin] = useState("Recommended");
    const [firstNumber, setFirstNumber] = useState(1);
    const [fromPage, setFromPage] = useState(1);
    const [toPage, setToPage] = useState(1);
    const [fontSize, setFontSize] = useState(12);
    const [fontColor, setFontColor] = useState("#000000");
    const [format, setFormat] = useState("{n}");

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
                setNumPages(null);
            } else {
                setError("Please select a valid PDF file.");
            }
        }
    };

    const onDocumentLoadSuccess = ({ numPages }: { numPages: number }) => {
        setNumPages(numPages);
        setFromPage(1);
        setToPage(numPages);
    };

    const handleAddPageNumbers = async () => {
        if (!file) {
            setError("Please upload a PDF first.");
            return;
        }

        setProcessing(true);
        setError(null);

        try {
            const formData = new FormData();
            formData.append('pdf', file);
            formData.append('firstNumber', firstNumber.toString());
            formData.append('fromPage', fromPage.toString());
            formData.append('toPage', toPage.toString());
            formData.append('position', position);
            formData.append('margin', margin);
            formData.append('pageMode', pageMode);
            formData.append('fontSize', fontSize.toString());
            formData.append('fontColor', fontColor);
            formData.append('format', format);

            const response = await fetch(`${API_URL}/page-numbers`, {
                method: 'POST',
                body: formData
            });

            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.error || 'Failed to add page numbers');
            }

            const blob = await response.blob();
            const url = URL.createObjectURL(blob);
            const link = document.createElement('a');
            link.href = url;
            link.download = `numbered_${file.name}`;
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

    const positions = [
        "top-left", "top-center", "top-right",
        "middle-left", "middle-center", "middle-right",
        "bottom-left", "bottom-center", "bottom-right"
    ];

    return (
        <ToolLayout
            title="Page Numbers"
            description="Document order. Automatically insert professional page numbering into your PDF files."
            icon={Hash}
        >
            <div className="space-y-8 pb-8">
                {!file ? (
                    <AnimatePresence mode="wait">
                        <motion.div
                            initial={{ opacity: 0, scale: 0.98 }}
                            animate={{ opacity: 1, scale: 1 }}
                            className="group relative border-2 border-dashed rounded-[2rem] p-8 text-center transition-all duration-700 overflow-hidden border-gray-200 hover:border-red-500 hover:bg-red-50/10"
                        >
                            <div className="absolute inset-0 bg-red-500/5 opacity-0 group-hover:opacity-100 transition-opacity duration-700 pointer-events-none" />
                            <div className="flex flex-col items-center relative z-10">
                                <motion.div
                                    whileHover={{ scale: 1.1, rotate: -2 }}
                                    className="p-4 rounded-2xl mb-4 shadow-lg transition-all duration-500 bg-white text-gray-400 border border-gray-100 shadow-gray-200/50"
                                >
                                    <Hash className="w-8 h-8" />
                                </motion.div>

                                <h3 className="text-xl font-display font-extrabold text-gray-950 mb-2 tracking-tight">Add page numbers to PDF</h3>
                                <p className="text-gray-500 mb-6 max-w-[280px] mx-auto font-sans text-xs leading-relaxed">
                                    Choose position, dimensions, typography and even format of your page number.
                                </p>
                                <label className="cursor-pointer">
                                    <AnimatedButton as="div" variant="primary" size="md" className="px-10 h-14 rounded-xl shadow-xl shadow-red-900/20 text-lg bg-[#e53e3e] hover:bg-[#c53030] border-none font-bold">
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
                    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="flex flex-col lg:flex-row min-h-[600px] border border-gray-200 rounded-lg overflow-hidden shadow-sm bg-[#f8f9fa]">

                        {/* LEFT PREVIEW AREA */}
                        <div className="lg:w-3/4 relative flex flex-col p-6 overflow-auto">
                            {fileUrl && (
                                <div className="hidden">
                                    <Document file={fileUrl} onLoadSuccess={onDocumentLoadSuccess} />
                                </div>
                            )}

                            {numPages === null ? (
                                <div className="flex-1 flex flex-col items-center justify-center">
                                    <Loader2 className="w-10 h-10 animate-spin text-red-500 mb-4" />
                                    <p className="text-gray-500 font-medium">Loading document...</p>
                                </div>
                            ) : (
                                <div className="relative">
                                    {/* Action buttons */}
                                    <div className="absolute -right-2 top-0 flex flex-col gap-2 z-10">
                                        <button
                                            onClick={() => fileInputRef.current?.click()}
                                            className="w-10 h-10 rounded-full bg-red-500 text-white flex items-center justify-center shadow-md hover:bg-red-600 transition"
                                            title="Add more files"
                                        >
                                            <Plus className="w-5 h-5" />
                                            <span className="absolute -top-1 -left-1 w-4 h-4 bg-gray-900 rounded-full text-[10px] font-bold text-white border-2 border-[#f8f9fa] flex items-center justify-center">1</span>
                                            <input
                                                type="file"
                                                accept=".pdf"
                                                onChange={handleFileChange}
                                                className="hidden"
                                            />
                                        </button>
                                    </div>

                                    {/* Page Preview Grid */}
                                    <div className="flex flex-wrap gap-6 pr-14 pt-4 justify-center lg:justify-start">
                                        {Array.from(new Array(Math.min(numPages, 6)), (_, index) => (
                                            <div key={index} className="relative bg-white p-2 rounded border border-gray-200 shadow-sm" style={{ width: '180px' }}>
                                                <div className="border border-gray-100 bg-gray-50 w-full min-h-[220px] flex items-center justify-center overflow-hidden mb-2 relative">
                                                    {fileUrl && (
                                                        <Document file={fileUrl}>
                                                            <Page
                                                                pageNumber={index + 1}
                                                                width={160}
                                                                renderTextLayer={false}
                                                                renderAnnotationLayer={false}
                                                            />
                                                        </Document>
                                                    )}

                                                    {/* Visual Indicator of Page Number Position (Red Dot) */}
                                                    <div className={`absolute w-3 h-3 bg-red-500 rounded-full shadow-sm transition-all duration-300 ${position === 'top-left' ? 'top-2 left-2' :
                                                        position === 'top-center' ? 'top-2 left-1/2 -translate-x-1/2' :
                                                            position === 'top-right' ? 'top-2 right-2' :
                                                                position === 'middle-left' ? 'top-1/2 left-2 -translate-y-1/2' :
                                                                    position === 'middle-center' ? 'top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2' :
                                                                        position === 'middle-right' ? 'top-1/2 right-2 -translate-y-1/2' :
                                                                            position === 'bottom-left' ? 'bottom-2 left-2' :
                                                                                position === 'bottom-center' ? 'bottom-2 left-1/2 -translate-x-1/2' :
                                                                                    position === 'bottom-right' ? 'bottom-2 right-2' : ''
                                                        }`} />
                                                </div>
                                                <div className="text-center text-xs text-gray-500 font-medium">Page {index + 1}</div>
                                            </div>
                                        ))}
                                        {numPages > 6 && (
                                            <div className="w-[180px] h-[260px] flex items-center justify-center text-gray-400 text-sm font-medium border-2 border-dashed border-gray-200 rounded">
                                                +{numPages - 6} more pages
                                            </div>
                                        )}
                                    </div>
                                </div>
                            )}
                        </div>

                        {/* RIGHT OPTIONS PANE */}
                        <div className="lg:w-1/4 bg-white flex flex-col h-full border-l border-gray-200">
                            <div className="py-5 px-6 border-b border-gray-100">
                                <h2 className="text-xl font-bold text-gray-800">Page Number options</h2>
                            </div>

                            {!complete ? (
                                <div className="p-6 flex-1 flex flex-col gap-6 overflow-y-auto">
                                    {/* Page Mode */}
                                    <div className="space-y-3">
                                        <label className="text-sm font-semibold text-gray-700">Page mode</label>
                                        <div className="flex gap-4">
                                            <div className="flex items-center gap-2 cursor-pointer" onClick={() => setPageMode("single")}>
                                                <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center ${pageMode === 'single' ? 'border-green-500' : 'border-gray-300'}`}>
                                                    {pageMode === 'single' && <div className="w-2.5 h-2.5 bg-green-500 rounded-full" />}
                                                </div>
                                                <span className="text-sm font-medium text-gray-600">Single page</span>
                                            </div>
                                            <div className="flex items-center gap-2 cursor-pointer" onClick={() => setPageMode("facing")}>
                                                <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center ${pageMode === 'facing' ? 'border-green-500' : 'border-gray-300'}`}>
                                                    {pageMode === 'facing' && <div className="w-2.5 h-2.5 bg-green-500 rounded-full" />}
                                                </div>
                                                <span className="text-sm font-medium text-gray-600">Facing pages</span>
                                            </div>
                                        </div>
                                    </div>

                                    {/* Position & Margin - Stacked for better visibility */}
                                    <div className="space-y-6">
                                        <div className="space-y-3">
                                            <div className="flex items-center justify-between">
                                                <label className="text-sm font-bold text-gray-700">Position</label>
                                                <span className="text-[10px] text-gray-400 font-black uppercase tracking-widest bg-gray-50 px-2 py-0.5 rounded border border-gray-100">Location</span>
                                            </div>
                                            <div className="flex justify-center bg-gray-50/50 p-4 rounded-2xl border border-gray-100">
                                                <div className="grid grid-cols-3 w-32 h-32 border border-gray-200 rounded-xl overflow-hidden p-2 gap-2 bg-white shadow-inner">
                                                    {positions.map((pos) => (
                                                        <div
                                                            key={pos}
                                                            onClick={() => setPosition(pos)}
                                                            className={`w-full h-full rounded-lg cursor-pointer transition-all duration-300 relative group/pos ${position === pos ? 'bg-red-500 shadow-md shadow-red-500/20' : 'hover:bg-gray-100'}`}
                                                        >
                                                            <div className={`absolute inset-0 m-auto w-2 h-2 rounded-full transition-all duration-300 ${position === pos ? 'bg-white scale-125' : 'bg-gray-300 group-hover/pos:bg-gray-400'}`} />
                                                        </div>
                                                    ))}
                                                </div>
                                            </div>
                                        </div>

                                        <div className="grid grid-cols-2 gap-4">
                                            <div className="space-y-3">
                                                <label className="text-sm font-bold text-gray-700">Font Color</label>
                                                <div className="flex items-center h-12 border border-gray-200 rounded-xl overflow-hidden bg-white p-2">
                                                    <input
                                                        type="color"
                                                        value={fontColor}
                                                        onChange={(e) => setFontColor(e.target.value)}
                                                        className="w-full h-full cursor-pointer rounded border-none bg-transparent"
                                                    />
                                                </div>
                                            </div>
                                            <div className="space-y-3">
                                                <label className="text-sm font-bold text-gray-700">Font Size</label>
                                                <input
                                                    type="number"
                                                    value={fontSize}
                                                    onChange={(e) => setFontSize(parseInt(e.target.value) || 12)}
                                                    className="w-full h-12 px-4 border border-gray-200 rounded-xl text-sm font-bold bg-white focus:ring-2 focus:ring-red-500/20 outline-none"
                                                    min={6}
                                                    max={72}
                                                />
                                            </div>
                                        </div>

                                        <div className="space-y-3">
                                            <label className="text-sm font-bold text-gray-700">Margin Size</label>
                                            <div className="relative group">
                                                <select
                                                    value={margin}
                                                    onChange={(e) => setMargin(e.target.value)}
                                                    className="w-full h-12 pl-4 pr-10 border border-gray-200 rounded-xl text-sm bg-white focus:outline-none focus:ring-2 focus:ring-red-500/20 focus:border-red-500 transition-all appearance-none font-medium text-gray-700 shadow-sm"
                                                >
                                                    <option>Small</option>
                                                    <option>Recommended</option>
                                                    <option>Big</option>
                                                </select>
                                                <div className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none text-gray-400">
                                                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M19 9l-7 7-7-7" /></svg>
                                                </div>
                                            </div>
                                        </div>
                                    </div>

                                    {/* Text Format */}
                                    <div className="space-y-3">
                                        <label className="text-sm font-bold text-gray-700">Text Format</label>
                                        <div className="relative group">
                                            <select
                                                value={format}
                                                onChange={(e) => setFormat(e.target.value)}
                                                className="w-full h-12 pl-4 pr-10 border border-gray-200 rounded-xl text-sm bg-white focus:ring-2 focus:ring-red-500/20 appearance-none font-medium text-gray-700 shadow-sm"
                                            >
                                                <option value="{n}">1, 2, 3...</option>
                                                <option value="Page {n}">Page 1, Page 2...</option>
                                                <option value="Page {n} of {total}">Page 1 of 10...</option>
                                                <option value="({n})">(1), (2)...</option>
                                                <option value="- {n} -">- 1 -, - 2 -...</option>
                                            </select>
                                            <div className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none text-gray-400">
                                                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M19 9l-7 7-7-7" /></svg>
                                            </div>
                                        </div>
                                    </div>

                                    <div className="space-y-3">
                                        <label className="text-sm font-bold text-gray-700">Starting Number</label>
                                        <div className="relative flex items-center h-12 border border-gray-200 rounded-xl overflow-hidden bg-white focus-within:ring-2 focus-within:ring-red-500/20 transition-all shadow-sm">
                                            <div className="h-full px-4 bg-gray-50 flex items-center border-r border-gray-200">
                                                <Hash className="w-4 h-4 text-gray-400" />
                                            </div>
                                            <input
                                                type="number"
                                                value={firstNumber}
                                                onChange={(e) => setFirstNumber(parseInt(e.target.value) || 1)}
                                                className="flex-1 h-full px-4 text-sm font-bold text-gray-900 focus:outline-none bg-transparent"
                                                placeholder="1"
                                            />
                                        </div>
                                    </div>

                                    {/* Range */}
                                    <div className="space-y-3">
                                        <div className="flex items-center justify-between">
                                            <label className="text-sm font-bold text-gray-700">Page Range</label>
                                            <span className="text-[9px] text-gray-400 font-black uppercase tracking-[0.2em]">All available</span>
                                        </div>
                                        <div className="grid grid-cols-2 gap-3">
                                            <div className="relative group">
                                                <div className="absolute left-4 top-1/2 -translate-y-1/2 text-[9px] font-black text-gray-400 uppercase tracking-widest pointer-events-none group-focus-within:text-red-500 transition-colors">From</div>
                                                <input
                                                    type="number"
                                                    value={fromPage}
                                                    onChange={(e) => setFromPage(parseInt(e.target.value) || 1)}
                                                    className="w-full h-12 pl-14 pr-4 border border-gray-200 rounded-xl text-sm font-bold text-gray-900 focus:outline-none focus:ring-2 focus:ring-red-500/20 focus:border-red-500 transition-all bg-white shadow-sm"
                                                    min={1}
                                                    max={numPages || 1}
                                                />
                                            </div>
                                            <div className="relative group">
                                                <div className="absolute left-4 top-1/2 -translate-y-1/2 text-[9px] font-black text-gray-400 uppercase tracking-widest pointer-events-none group-focus-within:text-red-500 transition-colors">To</div>
                                                <input
                                                    type="number"
                                                    value={toPage}
                                                    onChange={(e) => setToPage(parseInt(e.target.value) || 1)}
                                                    className="w-full h-12 pl-10 pr-4 border border-gray-200 rounded-xl text-sm font-bold text-gray-900 focus:outline-none focus:ring-2 focus:ring-red-500/20 focus:border-red-500 transition-all bg-white shadow-sm"
                                                    min={fromPage}
                                                    max={numPages || 1}
                                                />
                                            </div>
                                        </div>
                                    </div>

                                    {error && (
                                        <p className="text-red-500 text-xs font-semibold p-3 bg-red-50 rounded-lg border border-red-100">{error}</p>
                                    )}

                                    <div className="mt-4 p-4 bg-gray-50 rounded-lg border border-gray-100">
                                        <div className="flex items-center gap-2 text-gray-700 text-sm mb-1">
                                            <Hash className="w-4 h-4 text-red-500" />
                                            <span className="font-bold">{file.name}</span>
                                        </div>
                                        <p className="text-[10px] text-gray-500 italic">Formatting will be applied to {Math.max(0, toPage - fromPage + 1)} pages.</p>
                                    </div>

                                    <div className="flex-1 min-h-[50px]"></div>
                                </div>
                            ) : (
                                <div className="p-8 flex-1 flex flex-col items-center justify-center text-center">
                                    <div className="w-16 h-16 bg-red-50 rounded-full flex items-center justify-center mb-4">
                                        <Hash className="w-8 h-8 text-red-500" />
                                    </div>
                                    <h4 className="text-lg font-bold text-gray-900 mb-2">Numbers Added!</h4>
                                    <p className="text-sm text-gray-500 mb-6 font-medium">Your numbered PDF is ready.</p>

                                    <button
                                        onClick={() => {
                                            setFile(null);
                                            setFileUrl(null);
                                            setNumPages(null);
                                            setComplete(false);
                                        }}
                                        className="text-sm font-bold text-red-500 hover:text-red-600 uppercase tracking-widest flex items-center gap-2"
                                    >
                                        <RefreshCw className="w-4 h-4" /> Start Over
                                    </button>
                                </div>
                            )}

                            {/* BOTTOM ACTION BUTTON */}
                            {!complete && (
                                <div className="p-6 bg-white border-t border-gray-100">
                                    <button
                                        onClick={handleAddPageNumbers}
                                        disabled={processing}
                                        className="w-full py-4 px-6 bg-[#e53e3e] hover:bg-[#c53030] text-white font-bold text-lg rounded-lg flex items-center justify-center gap-2 transition-all disabled:opacity-50 shadow-lg shadow-red-900/10 group"
                                    >
                                        {processing ? (
                                            <>
                                                <Loader2 className="w-5 h-5 animate-spin" /> Working...
                                            </>
                                        ) : (
                                            <>
                                                Add page numbers <ChevronRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
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
