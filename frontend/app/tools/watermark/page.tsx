"use client";

import { useState, useRef, useEffect } from "react";
import { API_URL } from "@/lib/config";
import ToolLayout from "../../components/ToolLayout";
import { Upload, CheckCircle2, Loader2, X, Download, Stamp, Type, Image as ImageIcon } from "lucide-react";
import AnimatedButton from "../../components/ui/AnimatedButton";
import { motion, AnimatePresence } from "framer-motion";
import { Document, Page, pdfjs } from 'react-pdf';
import 'react-pdf/dist/esm/Page/AnnotationLayer.css';
import 'react-pdf/dist/esm/Page/TextLayer.css';

pdfjs.GlobalWorkerOptions.workerSrc = `//unpkg.com/pdfjs-dist@${pdfjs.version}/build/pdf.worker.min.mjs`;

export default function WatermarkPage() {
    const [file, setFile] = useState<File | null>(null);
    const [fileUrl, setFileUrl] = useState<string | null>(null);
    const [processing, setProcessing] = useState(false);
    const [complete, setComplete] = useState(false);
    const [error, setError] = useState<string | null>(null);

    // PDF viewer state
    const [numPages, setNumPages] = useState<number | null>(null);

    // Watermark State
    const [type, setType] = useState<'text' | 'image'>('text');
    const [text, setText] = useState("DocuFlux");
    const [imageFile, setImageFile] = useState<File | null>(null);
    const [imagePreview, setImagePreview] = useState<string | null>(null);
    const [position, setPosition] = useState('center');
    const [mosaic, setMosaic] = useState(false);
    const [transparency, setTransparency] = useState(50);
    const [rotation, setRotation] = useState(45);
    const [color, setColor] = useState('#000000');
    const [fontSize, setFontSize] = useState(48);

    const fileInputRef = useRef<HTMLInputElement>(null);
    const imageInputRef = useRef<HTMLInputElement>(null);

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
                setError("Please select a PDF file");
            }
        }
    };

    const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files && e.target.files[0]) {
            const img = e.target.files[0];
            if (img.type.startsWith("image/")) {
                setImageFile(img);
                const reader = new FileReader();
                reader.onload = (e) => setImagePreview(e.target?.result as string);
                reader.readAsDataURL(img);
            } else {
                setError("Please select a valid image file");
            }
        }
    };

    const handleSavePDF = async () => {
        if (!file) {
            setError("Please upload a PDF first");
            return;
        }

        if (type === 'image' && !imageFile) {
            setError("Please upload a watermark image");
            return;
        }

        if (type === 'text' && !text.trim()) {
            setError("Please enter watermark text");
            return;
        }

        setProcessing(true);
        setError(null);

        try {
            const formData = new FormData();
            formData.append('pdf', file);
            formData.append('type', type);
            formData.append('position', position);
            formData.append('mosaic', mosaic ? 'true' : 'false');
            formData.append('transparency', transparency.toString());
            formData.append('rotation', rotation.toString());

            if (type === 'text') {
                formData.append('text', text);
                formData.append('color', color);
                formData.append('fontSize', fontSize.toString());
            } else if (imageFile) {
                formData.append('image', imageFile);
            }

            const response = await fetch(`${API_URL}/watermark-pdf`, {
                method: 'POST',
                body: formData
            });

            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.error || 'Failed to apply watermark');
            }

            const blob = await response.blob();
            const url = URL.createObjectURL(blob);
            const link = document.createElement('a');
            link.href = url;
            link.download = `watermarked_${file.name}`;
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);
            URL.revokeObjectURL(url);

            setComplete(true);
        } catch (err) {
            const errorMsg = err instanceof Error ? err.message : 'Failed to apply watermark';
            setError(errorMsg);
        } finally {
            setProcessing(false);
        }
    };

    const onDocumentLoadSuccess = ({ numPages }: { numPages: number }) => {
        setNumPages(numPages);
    };

    // 3x3 grid positions
    const positions = [
        { id: 'top-left', label: 'Top Left' },
        { id: 'top-center', label: 'Top Center' },
        { id: 'top-right', label: 'Top Right' },
        { id: 'middle-left', label: 'Middle Left' },
        { id: 'center', label: 'Center' },
        { id: 'middle-right', label: 'Middle Right' },
        { id: 'bottom-left', label: 'Bottom Left' },
        { id: 'bottom-center', label: 'Bottom Center' },
        { id: 'bottom-right', label: 'Bottom Right' }
    ];

    return (
        <ToolLayout
            title="Watermark PDF"
            description="Brand protection. Overlay custom text or logos onto your document for security and branding."
            icon={Stamp}
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
                                    <Stamp className="w-8 h-8" />
                                </motion.div>

                                <h3 className="text-xl font-display font-extrabold text-gray-950 mb-2 tracking-tight">Upload PDF to Watermark</h3>
                                <p className="text-gray-500 mb-6 max-w-[280px] mx-auto font-sans text-xs leading-relaxed">
                                    Add your logo or custom text to protect your documents.
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
                        {/* PDF Viewer - Left Side */}
                        <div className="lg:w-2/3 bg-gray-50 rounded-2xl p-6 border border-gray-200 overflow-y-auto max-h-[800px]">
                            <div className="flex justify-between items-center mb-4">
                                <h3 className="font-semibold text-gray-800">Document Preview</h3>
                                <button
                                    onClick={() => {
                                        setFile(null);
                                        setFileUrl(null);
                                        setComplete(false);
                                    }}
                                    className="text-sm font-medium text-red-500 hover:text-red-700 flex items-center gap-1"
                                >
                                    <X className="w-4 h-4" /> Change File
                                </button>
                            </div>

                            {fileUrl && (
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 justify-items-center">
                                    <Document file={fileUrl} onLoadSuccess={onDocumentLoadSuccess}>
                                        {Array.from(new Array(Math.min(numPages || 0, 4)), (el, index) => (
                                            <div key={`page_${index + 1}`} className="mb-6 relative group shadow-lg border border-gray-200 bg-white inline-block">
                                                <div className="absolute top-2 left-2 bg-black/50 text-white text-xs px-2 py-1 rounded z-10">
                                                    Page {index + 1}
                                                </div>
                                                <Page pageNumber={index + 1} width={300} renderTextLayer={false} renderAnnotationLayer={false} />

                                                {/* Visual overlay representation of watermark */}
                                                <div className={`absolute inset-0 pointer-events-none flex ${position.includes('top') ? 'items-start' : position.includes('bottom') ? 'items-end' : 'items-center'} ${position.includes('left') ? 'justify-start' : position.includes('right') ? 'justify-end' : 'justify-center'} p-8 overflow-hidden`}>
                                                    {mosaic ? (
                                                        <div className="w-full h-full flex flex-wrap gap-8 items-center justify-center opacity-50">
                                                            {Array.from({ length: 6 }).map((_, i) => (
                                                                <div key={i} style={{ transform: `rotate(${rotation}deg)`, opacity: (100 - transparency) / 100 }} className="pointer-events-none">
                                                                    {type === 'text' ? (
                                                                        <span style={{ fontSize: `${fontSize / 2}px`, color: color, fontWeight: 'bold' }}>{text}</span>
                                                                    ) : (
                                                                        imagePreview && <img src={imagePreview} className="max-w-[100px] object-contain" alt="" />
                                                                    )}
                                                                </div>
                                                            ))}
                                                        </div>
                                                    ) : (
                                                        <div style={{ transform: `rotate(${rotation}deg)`, opacity: (100 - transparency) / 100 }} className="pointer-events-none transition-all duration-300">
                                                            {type === 'text' ? (
                                                                <span style={{ fontSize: `${fontSize / 2}px`, color: color, fontWeight: 'bold' }}>{text}</span>
                                                            ) : (
                                                                imagePreview && <img src={imagePreview} className="max-w-[150px] object-contain" alt="" />
                                                            )}
                                                        </div>
                                                    )}
                                                </div>
                                            </div>
                                        ))}
                                    </Document>
                                </div>
                            )}
                            {numPages && numPages > 4 && (
                                <p className="text-center text-gray-500 text-sm mt-4">+ {numPages - 4} more pages (Watermark will be applied to all)</p>
                            )}
                        </div>

                        {/* Options Sidebar - Right Side */}
                        <div className="lg:w-1/3 bg-white rounded-2xl border border-gray-200 shadow-sm flex flex-col h-auto lg:max-h-[800px]">
                            <div className="p-6 border-b border-gray-100">
                                <h2 className="text-xl font-bold text-gray-900">Watermark options</h2>
                            </div>

                            <div className="p-6 flex-1 overflow-y-auto space-y-8">
                                {/* Type Selection */}
                                <div className="grid grid-cols-2 gap-1 rounded-lg bg-gray-100 p-1">
                                    <button
                                        onClick={() => setType('text')}
                                        className={`flex items-center justify-center gap-1.5 py-2 px-2 text-xs sm:text-sm font-semibold rounded-md transition-all whitespace-nowrap overflow-hidden ${type === 'text' ? 'bg-white shadow-sm text-emerald-600' : 'text-gray-500 hover:text-gray-700'}`}
                                    >
                                        <Type className="w-4 h-4 shrink-0" /> <span className="truncate">Place text</span>
                                    </button>
                                    <button
                                        onClick={() => setType('image')}
                                        className={`flex items-center justify-center gap-1.5 py-2 px-2 text-xs sm:text-sm font-semibold rounded-md transition-all whitespace-nowrap overflow-hidden ${type === 'image' ? 'bg-white shadow-sm text-emerald-600' : 'text-gray-500 hover:text-gray-700'}`}
                                    >
                                        <ImageIcon className="w-4 h-4 shrink-0" /> <span className="truncate">Place image</span>
                                    </button>
                                </div>

                                {/* Content Input */}
                                {type === 'text' ? (
                                    <div className="space-y-4">
                                        <div>
                                            <label className="block text-sm font-semibold text-gray-700 mb-2">Text:</label>
                                            <input
                                                type="text"
                                                value={text}
                                                onChange={(e) => setText(e.target.value)}
                                                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 outline-none"
                                            />
                                        </div>
                                        <div className="flex gap-4">
                                            <div className="flex-1">
                                                <label className="block text-xs font-semibold text-gray-500 mb-1">Color</label>
                                                <input
                                                    type="color"
                                                    value={color}
                                                    onChange={(e) => setColor(e.target.value)}
                                                    className="w-full h-10 rounded cursor-pointer border-0 p-0"
                                                />
                                            </div>
                                            <div className="flex-1">
                                                <label className="block text-xs font-semibold text-gray-500 mb-1">Size</label>
                                                <input
                                                    type="number"
                                                    value={fontSize}
                                                    onChange={(e) => setFontSize(Number(e.target.value))}
                                                    className="w-full h-10 px-3 border border-gray-300 rounded-lg focus:ring-1 focus:ring-emerald-500 outline-none"
                                                />
                                            </div>
                                        </div>
                                    </div>
                                ) : (
                                    <div className="space-y-4">
                                        <label className="block text-sm font-semibold text-gray-700 mb-2">Image:</label>
                                        <div className="border-2 border-dashed border-gray-300 rounded-xl p-4 text-center">
                                            {imagePreview ? (
                                                <div className="space-y-3">
                                                    <img src={imagePreview} alt="Preview" className="max-h-24 mx-auto object-contain rounded" />
                                                    <button onClick={() => { setImageFile(null); setImagePreview(null); }} className="text-xs text-red-500 font-semibold hover:underline">Remove image</button>
                                                </div>
                                            ) : (
                                                <label className="cursor-pointer block">
                                                    <Upload className="w-8 h-8 text-gray-400 mx-auto mb-2" />
                                                    <span className="text-sm font-medium text-emerald-600 bg-emerald-50 px-3 py-1 rounded-full">Choose Image</span>
                                                    <input type="file" ref={imageInputRef} onChange={handleImageChange} accept="image/*" className="hidden" />
                                                </label>
                                            )}
                                        </div>
                                    </div>
                                )}

                                {/* Position & Mosaic */}
                                <div className="space-y-4">
                                    <div className="flex justify-between items-center">
                                        <label className="block text-sm font-semibold text-gray-700">Position:</label>
                                        <label className="flex items-center gap-2 cursor-pointer">
                                            <input
                                                type="checkbox"
                                                checked={mosaic}
                                                onChange={(e) => setMosaic(e.target.checked)}
                                                className="rounded text-emerald-600 focus:ring-emerald-500 w-4 h-4 cursor-pointer"
                                            />
                                            <span className="text-sm font-medium text-gray-700">Mosaic</span>
                                        </label>
                                    </div>

                                    {!mosaic && (
                                        <div className="w-32 h-32 mx-auto grid grid-cols-3 grid-rows-3 gap-1 border border-gray-300 p-1 rounded-lg bg-gray-50">
                                            {positions.map((pos) => (
                                                <button
                                                    key={pos.id}
                                                    onClick={() => setPosition(pos.id)}
                                                    className={`w-full h-full rounded transition-all ${position === pos.id ? 'bg-red-500 transform scale-90 shadow-inner' : 'bg-white border border-gray-200 hover:bg-red-100'}`}
                                                    title={pos.label}
                                                />
                                            ))}
                                        </div>
                                    )}
                                </div>

                                {/* Sliders */}
                                <div className="space-y-6 pt-2">
                                    <div>
                                        <div className="flex justify-between text-sm mb-2">
                                            <span className="font-semibold text-gray-500">Transparency</span>
                                            <span className="text-gray-900 font-bold">{transparency}%</span>
                                        </div>
                                        <input
                                            type="range"
                                            min="0" max="100"
                                            value={transparency}
                                            onChange={(e) => setTransparency(Number(e.target.value))}
                                            className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-emerald-600"
                                        />
                                    </div>
                                    <div>
                                        <div className="flex justify-between text-sm mb-2">
                                            <span className="font-semibold text-gray-500">Rotation</span>
                                            <span className="text-gray-900 font-bold">{rotation}°</span>
                                        </div>
                                        <input
                                            type="range"
                                            min="0" max="360"
                                            value={rotation}
                                            onChange={(e) => setRotation(Number(e.target.value))}
                                            className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-emerald-600"
                                        />
                                    </div>
                                </div>
                            </div>

                            {/* Submit Button */}
                            <div className="p-6 border-t border-gray-100 bg-gray-50 rounded-b-2xl">
                                {error && (
                                    <div className="mb-4 bg-red-50 border border-red-200 rounded-lg p-3 text-red-600 text-sm flex items-start gap-2">
                                        <X className="w-4 h-4 shrink-0 mt-0.5" />
                                        <span>{error}</span>
                                    </div>
                                )}

                                {complete && !error && (
                                    <div className="mb-4 bg-emerald-50 border border-emerald-200 rounded-lg p-3 text-emerald-600 text-sm flex items-center gap-2">
                                        <CheckCircle2 className="w-4 h-4" />
                                        Watermark applied successfully!
                                    </div>
                                )}

                                <button
                                    onClick={handleSavePDF}
                                    disabled={processing}
                                    className="w-full py-4 rounded-xl bg-red-600 text-white hover:bg-red-700 transition-colors shadow-lg shadow-red-600/20 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 font-bold text-lg"
                                >
                                    {processing ? (
                                        <>
                                            <Loader2 className="w-5 h-5 animate-spin" />
                                            Applying...
                                        </>
                                    ) : (
                                        <>
                                            Add watermark <Download className="w-5 h-5 ml-1" />
                                        </>
                                    )}
                                </button>
                            </div>
                        </div>
                    </motion.div>
                )}
            </div>
        </ToolLayout>
    );
}
