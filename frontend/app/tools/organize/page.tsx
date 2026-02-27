"use client";

import { useState, useRef, useEffect } from "react";
import { API_URL } from "@/lib/config";
import ToolLayout from "../../components/ToolLayout";
import { Upload, ArrowRight, Loader2, RefreshCw, X, FileStack, Plus } from "lucide-react";
import AnimatedButton from "../../components/ui/AnimatedButton";
import { motion, AnimatePresence } from "framer-motion";
import { Document, Page, pdfjs } from 'react-pdf';
import 'react-pdf/dist/esm/Page/AnnotationLayer.css';
import 'react-pdf/dist/esm/Page/TextLayer.css';

pdfjs.GlobalWorkerOptions.workerSrc = `//unpkg.com/pdfjs-dist@${pdfjs.version}/build/pdf.worker.min.mjs`;

interface PageItem {
    id: string;
    originalIndex: number;
}

export default function OrganizePage() {
    const [file, setFile] = useState<File | null>(null);
    const [fileUrl, setFileUrl] = useState<string | null>(null);
    const [numPages, setNumPages] = useState<number | null>(null);
    const [pages, setPages] = useState<PageItem[]>([]);

    const [processing, setProcessing] = useState(false);
    const [complete, setComplete] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const fileInputRef = useRef<HTMLInputElement>(null);

    // Drag and Drop state
    const [draggedItemIndex, setDraggedItemIndex] = useState<number | null>(null);

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
                setPages([]);
            } else {
                setError("Please select a valid PDF file.");
            }
        }
    };

    const onDocumentLoadSuccess = ({ numPages }: { numPages: number }) => {
        setNumPages(numPages);
        // Initialize pages array [0, 1, 2, ..., numPages - 1]
        const initialPages = Array.from(new Array(numPages), (_, index) => ({
            id: `page-${index}-${Date.now()}`,
            originalIndex: index
        }));
        setPages(initialPages);
    };

    const handleDragStart = (e: React.DragEvent<HTMLDivElement>, index: number) => {
        setDraggedItemIndex(index);
        e.dataTransfer.effectAllowed = "move";
        // Make it slighty transparent while dragging
        setTimeout(() => {
            if (e.target instanceof HTMLElement) {
                e.target.style.opacity = '0.5';
            }
        }, 0);
    };

    const handleDrop = (e: React.DragEvent<HTMLDivElement>, targetIndex: number) => {
        e.preventDefault();
        setDraggedItemIndex(null);
        if (draggedItemIndex === null || draggedItemIndex === targetIndex) return;

        const updatedPages = [...pages];
        const draggedItem = updatedPages[draggedItemIndex];

        // Remove from old position
        updatedPages.splice(draggedItemIndex, 1);
        // Insert to new position
        updatedPages.splice(targetIndex, 0, draggedItem);

        setPages(updatedPages);

        if (e.currentTarget instanceof HTMLElement) {
            e.currentTarget.style.opacity = '1';
        }
    };

    const handleDragEnd = (e: React.DragEvent<HTMLDivElement>) => {
        setDraggedItemIndex(null);
        if (e.target instanceof HTMLElement) {
            e.target.style.opacity = '1';
        }
    };

    const handleDragOver = (e: React.DragEvent<HTMLDivElement>) => {
        e.preventDefault(); // Necessary to allow drop
    };

    const removePage = (indexToRemove: number) => {
        setPages(pages.filter((_, idx) => idx !== indexToRemove));
    };

    const resetOrder = () => {
        if (numPages) {
            const initialPages = Array.from(new Array(numPages), (_, index) => ({
                id: `page-${index}-${Date.now()}`,
                originalIndex: index
            }));
            setPages(initialPages);
        }
    };

    const handleOrganize = async () => {
        if (!file) {
            setError("Please upload a PDF first.");
            return;
        }

        if (pages.length === 0) {
            setError("You must have at least one page in the document.");
            return;
        }

        setProcessing(true);
        setError(null);

        try {
            const formData = new FormData();
            formData.append('pdf', file);

            // Send the new order of original page indices
            const pageOrder = pages.map(p => p.originalIndex).join(',');
            formData.append('pageOrder', pageOrder);

            const response = await fetch(`${API_URL}/organize-pdf`, {
                method: 'POST',
                body: formData
            });

            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.error || 'Failed to organize PDF');
            }

            const blob = await response.blob();
            const url = URL.createObjectURL(blob);
            const link = document.createElement('a');
            link.href = url;
            link.download = `organized_${file.name}`;
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
            title="Organize PDF"
            description="Perfect structure. Sort, delete, and reorder pages visually to build the perfect flow."
            icon={FileStack}
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
                                    <FileStack className="w-8 h-8" />
                                </motion.div>

                                <h3 className="text-xl font-display font-extrabold text-gray-950 mb-2 tracking-tight">Organize PDF pages</h3>
                                <p className="text-gray-500 mb-6 max-w-[280px] mx-auto font-sans text-xs leading-relaxed">
                                    Sort, add and delete PDF pages. Drag and drop the page thumbnails and sort them.
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

                        {/* LEFT PREVIEW GRID (Matches User Screenshot) */}
                        <div className="lg:w-3/4 relative flex flex-col p-6 overflow-auto">
                            {/* Hidden Document loader to render pages */}
                            {fileUrl && (
                                <div className="hidden">
                                    <Document file={fileUrl} onLoadSuccess={onDocumentLoadSuccess} />
                                </div>
                            )}

                            {/* Main Grid View */}
                            {numPages === null ? (
                                <div className="flex-1 flex flex-col items-center justify-center">
                                    <Loader2 className="w-10 h-10 animate-spin text-red-500 mb-4" />
                                    <p className="text-gray-500 font-medium">Loading document pages...</p>
                                </div>
                            ) : (
                                <div className="relative">
                                    {/* Sort Controls matching right-side absolute floating bubbles in layout */}
                                    <div className="absolute -right-2 top-0 flex flex-col gap-2 z-10">
                                        <button
                                            onClick={() => fileInputRef.current?.click()}
                                            className="w-10 h-10 rounded-full bg-red-500 text-white flex items-center justify-center shadow-md hover:bg-red-600 transition"
                                            title="Add more files"
                                        >
                                            <Plus className="w-5 h-5" />
                                            {/* Dummy document count badge from screenshot */}
                                            <span className="absolute -top-1 -left-1 w-4 h-4 bg-gray-900 rounded-full text-[10px] font-bold text-white border-2 border-[#f8f9fa] flex items-center justify-center">1</span>
                                        </button>
                                    </div>

                                    {/* Grid Container */}
                                    <div className="flex flex-wrap gap-6 pr-14 pt-4">
                                        <AnimatePresence>
                                            {pages.map((page, index) => (
                                                <motion.div
                                                    key={page.id}
                                                    layout
                                                    initial={{ opacity: 0, scale: 0.8 }}
                                                    animate={{ opacity: 1, scale: 1 }}
                                                    exit={{ opacity: 0, scale: 0.5 }}
                                                    transition={{ type: "spring", stiffness: 300, damping: 25 }}
                                                    draggable
                                                    onDragStart={(e: any) => handleDragStart(e, index)}
                                                    onDrop={(e: any) => handleDrop(e, index)}
                                                    onDragEnd={(e: any) => handleDragEnd(e)}
                                                    onDragOver={handleDragOver}
                                                    className={`relative bg-white p-2 rounded flex flex-col items-center cursor-move select-none group border-2 transition-colors ${draggedItemIndex === index ? 'border-red-400 shadow-xl z-20 scale-105' : 'border-red-200/50 hover:border-red-300 shadow-sm'
                                                        }`}
                                                    style={{ width: '180px' }}
                                                >
                                                    {/* Page Thumbnail */}
                                                    <div className="border border-gray-100 bg-gray-50 w-full min-h-[220px] flex items-center justify-center overflow-hidden mb-3 pointer-events-none">
                                                        {fileUrl && (
                                                            <Document file={fileUrl}>
                                                                <Page
                                                                    pageNumber={page.originalIndex + 1}
                                                                    width={160}
                                                                    renderTextLayer={false}
                                                                    renderAnnotationLayer={false}
                                                                />
                                                            </Document>
                                                        )}
                                                    </div>

                                                    {/* Page Number Label */}
                                                    <span className="text-gray-600 text-sm font-medium mb-1">{index + 1}</span>

                                                    {/* Hover Action Buttons */}
                                                    <div className="absolute top-2 right-2 flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                                                        <button
                                                            onClick={(e) => { e.stopPropagation(); removePage(index); }}
                                                            className="w-6 h-6 bg-white border border-gray-200 rounded-full flex items-center justify-center text-gray-500 hover:text-red-500 hover:border-red-200 shadow-sm"
                                                            title="Delete Page"
                                                        >
                                                            <X className="w-3 h-3" />
                                                        </button>
                                                    </div>
                                                </motion.div>
                                            ))}
                                        </AnimatePresence>
                                    </div>

                                    {pages.length === 0 && (
                                        <div className="text-center py-20 text-gray-500 bg-white rounded-xl border border-dashed border-gray-300 ml-4 mr-14 mt-4">
                                            All pages deleted. <button onClick={resetOrder} className="text-red-500 font-bold hover:underline">Reset</button> to original.
                                        </div>
                                    )}
                                </div>
                            )}
                        </div>

                        {/* RIGHT OPTIONS PANE */}
                        <div className="lg:w-1/4 bg-white flex flex-col h-full border-l border-gray-200">
                            {/* Header */}
                            <div className="py-5 px-6 border-b border-gray-100 text-center">
                                <h2 className="text-xl font-bold text-gray-800">Organize PDF</h2>
                            </div>

                            {/* Content */}
                            {!complete ? (
                                <div className="p-6 flex-1 flex flex-col">
                                    <div className="flex justify-between items-center mb-6">
                                        <span className="text-sm font-semibold text-gray-700">Files:</span>
                                        <button
                                            onClick={resetOrder}
                                            className="text-sm text-red-500 hover:text-red-600 font-semibold underline decoration-red-200 underline-offset-4"
                                        >
                                            Reset all
                                        </button>
                                    </div>

                                    {/* File List / Document representation */}
                                    <div className="bg-red-50 border border-red-100 rounded p-3 flex items-center justify-between">
                                        <div className="flex items-center gap-2 overflow-hidden">
                                            <span className="text-gray-400 text-xs">↕</span>
                                            <span className="text-gray-800 text-sm truncate font-medium max-w-[150px]">{file.name}</span>
                                        </div>
                                    </div>

                                    <p className="text-xs text-gray-500 mt-4">
                                        Current structure: {pages.length} pages. Use drag and drop on the left to reorder.
                                    </p>

                                    {error && (
                                        <p className="text-red-500 text-xs font-semibold mt-4 text-center p-3 bg-red-50 rounded-lg border border-red-100">{error}</p>
                                    )}

                                    {/* Spacer to push button to bottom */}
                                    <div className="flex-1"></div>
                                </div>
                            ) : (
                                <div className="p-8 flex-1 flex flex-col items-center justify-center text-center">
                                    <div className="w-16 h-16 bg-red-50 rounded-full flex items-center justify-center mb-4">
                                        <FileStack className="w-8 h-8 text-red-500" />
                                    </div>
                                    <h4 className="text-lg font-bold text-gray-900 mb-2">Organized!</h4>
                                    <p className="text-sm text-gray-500 mb-6">Your document has been reordered and saved.</p>

                                    <button
                                        onClick={() => {
                                            setFile(null);
                                            setFileUrl(null);
                                            setNumPages(null);
                                            setPages([]);
                                            setComplete(false);
                                        }}
                                        className="text-sm font-semibold text-red-500 hover:text-red-600 uppercase tracking-widest"
                                    >
                                        Start Over
                                    </button>
                                </div>
                            )}

                            {/* Bottom Fixed Button */}
                            {!complete && (
                                <div className="p-6 bg-white border-t border-gray-100">
                                    <button
                                        onClick={handleOrganize}
                                        disabled={processing || pages.length === 0}
                                        className="w-full py-4 px-6 bg-[#e53e3e] hover:bg-[#c53030] text-white font-bold text-xl rounded-lg flex items-center justify-center gap-2 transition-all disabled:opacity-50 shadow-lg shadow-red-900/10"
                                    >
                                        {processing ? (
                                            <>
                                                <Loader2 className="w-5 h-5 animate-spin" /> Processing...
                                            </>
                                        ) : (
                                            <>
                                                Organize <ArrowRight className="w-5 h-5" />
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
