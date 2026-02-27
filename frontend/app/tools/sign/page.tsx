"use client";

import { useState, useRef, useEffect } from "react";
import { API_URL } from "@/lib/config";
import ToolLayout from "../../components/ToolLayout";
import { Upload, CheckCircle2, Loader2, X, Plus, Download, Sparkles, PenTool, Type, Stamp } from "lucide-react";
import AnimatedButton from "../../components/ui/AnimatedButton";
import { motion, AnimatePresence } from "framer-motion";
import { Document, Page, pdfjs } from 'react-pdf';
import 'react-pdf/dist/esm/Page/AnnotationLayer.css';
import 'react-pdf/dist/esm/Page/TextLayer.css';

pdfjs.GlobalWorkerOptions.workerSrc = `//unpkg.com/pdfjs-dist@${pdfjs.version}/build/pdf.worker.min.mjs`;

interface Signature {
  type: 'draw' | 'text' | 'image';
  data: string; // Base64 for image/drawing, text for text
  x: number;
  y: number;
  width: number;
  height: number;
  page: number;
}

export default function SignPDFPage() {
  const [file, setFile] = useState<File | null>(null);
  const [fileUrl, setFileUrl] = useState<string | null>(null);
  const [processing, setProcessing] = useState(false);
  const [complete, setComplete] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // PDF viewer state
  const [numPages, setNumPages] = useState<number | null>(null);
  const [pageNumber, setPageNumber] = useState(1);
  const [scale, setScale] = useState(1.5);

  // Signature state
  const [showSignatureModal, setShowSignatureModal] = useState(false);
  const [fullName, setFullName] = useState("");
  const [initials, setInitials] = useState("");
  const [signatureTab, setSignatureTab] = useState<'signature' | 'initials' | 'stamp' | 'upload'>('signature');
  const [selectedSignatureStyle, setSelectedSignatureStyle] = useState(0);
  const [signatureColor, setSignatureColor] = useState("#000000");
  const [signatures, setSignatures] = useState<Signature[]>([]);
  const [isDrawing, setIsDrawing] = useState(false);
  const [drawnSignature, setDrawnSignature] = useState<string | null>(null);
  const [isAddingMode, setIsAddingMode] = useState(false);
  const [previewSignature, setPreviewSignature] = useState<string | null>(null);
  const [uploadedSignature, setUploadedSignature] = useState<string | null>(null);
  const [pdfPageWidth, setPdfPageWidth] = useState(612);  // Standard US Letter width in PDF points
  const [pdfPageHeight, setPdfPageHeight] = useState(792); // Standard US Letter height in PDF points

  const fileInputRef = useRef<HTMLInputElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const pageRef = useRef<HTMLDivElement>(null);
  const signatureUploadRef = useRef<HTMLInputElement>(null);

  const signatureStyles = [
    { name: "Style 1", font: "Brush Script MT, cursive" },
    { name: "Style 2", font: "Lucida Handwriting, cursive" },
    { name: "Style 3", font: "Dancing Script, cursive" },
    { name: "Style 4", font: "Pacifico, cursive" }
  ];

  const colors = [
    { name: "Black", value: "#000000" },
    { name: "Blue", value: "#0066FF" },
    { name: "Red", value: "#FF0000" },
    { name: "Green", value: "#00AA00" }
  ];

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

  const handleAddSignature = () => {
    setShowSignatureModal(true);
  };

  const handleApplySignature = () => {
    if (!fullName && signatureTab === 'signature') {
      setError("Please enter your full name");
      return;
    }

    const canvas = canvasRef.current;
    if (canvas) {
      // Create signature image from text or drawing
      const ctx = canvas.getContext('2d');
      if (ctx) {
        canvas.width = 400;
        canvas.height = 150;
        ctx.clearRect(0, 0, canvas.width, canvas.height);

        if (signatureTab === 'signature' && fullName) {
          ctx.font = `48px ${signatureStyles[selectedSignatureStyle].font}`;
          ctx.fillStyle = signatureColor;
          ctx.textAlign = 'center';
          ctx.textBaseline = 'middle';
          ctx.fillText(fullName, canvas.width / 2, canvas.height / 2);
        } else if (signatureTab === 'initials' && initials) {
          ctx.font = `64px ${signatureStyles[selectedSignatureStyle].font}`;
          ctx.fillStyle = signatureColor;
          ctx.textAlign = 'center';
          ctx.textBaseline = 'middle';
          ctx.fillText(initials, canvas.width / 2, canvas.height / 2);
        }

        const signatureData = canvas.toDataURL('image/png');
        setPreviewSignature(signatureData);
        setIsAddingMode(true);
        setShowSignatureModal(false);
      }
    }
  };

  const handleUploadSignature = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      if (file.type.startsWith('image/')) {
        const reader = new FileReader();
        reader.onload = (event) => {
          const imageData = event.target?.result as string;
          setUploadedSignature(imageData);
          setPreviewSignature(imageData);
          setIsAddingMode(true);
          setShowSignatureModal(false);
        };
        reader.readAsDataURL(file);
      } else {
        setError("Please select a valid image file");
      }
    }
  };

  const handleSavePDF = async () => {
    if (!file || signatures.length === 0) {
      setError("Please add at least one signature");
      return;
    }

    setProcessing(true);
    setError(null);

    try {
      const formData = new FormData();
      formData.append('pdf', file);
      
      // Add detailed logging for debugging
      const signaturesData = signatures.map((sig, idx) => {
        console.log(`Signature ${idx}: Page ${sig.page}, Pos: (${sig.x.toFixed(2)}, ${sig.y.toFixed(2)}), Size: ${sig.width.toFixed(2)}x${sig.height.toFixed(2)}`, 
                    `Display: (${(sig.x * scale).toFixed(0)}, ${(sig.y * scale).toFixed(0)}), ${(sig.width * scale).toFixed(0)}x${(sig.height * scale).toFixed(0)}`);
        return sig;
      });
      
      formData.append('signatures', JSON.stringify(signaturesData));

      console.log('=== SAVING PDF ===');
      console.log('Total signatures:', signaturesData.length);
      console.log('PDF file:', file.name);

      const response = await fetch(`${API_URL}/sign-pdf`, {
        method: 'POST',
        body: formData
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to sign PDF');
      }

      const blob = await response.blob();
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `signed_${file.name}`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);

      setComplete(true);
      setSignatures([]);
    } catch (err) {
      const errorMsg = err instanceof Error ? err.message : 'Failed to sign PDF';
      setError(errorMsg);
      console.error('Error:', errorMsg);
    } finally {
      setProcessing(false);
    }
  };

  const onDocumentLoadSuccess = ({ numPages }: { numPages: number }) => {
    setNumPages(numPages);
  };

  const handlePDFClick = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!isAddingMode || !previewSignature) return;

    const rect = (e.currentTarget as HTMLDivElement).getBoundingClientRect();
    // Get coordinates relative to the PDF container
    const displayX = e.clientX - rect.left;
    const displayY = e.clientY - rect.top;

    // Convert from display coordinates (scaled) to PDF coordinates
    const pdfX = displayX / scale;
    const pdfY = displayY / scale;

    // Set signature dimensions to be visible (in PDF points)
    const signatureWidth = 150;   // PDF points width
    const signatureHeight = 60;   // PDF points height

    const newSignature: Signature = {
      type: 'text',
      data: previewSignature,
      x: Math.max(0, pdfX - signatureWidth / 2),
      y: Math.max(0, pdfY - signatureHeight / 2),
      width: signatureWidth,
      height: signatureHeight,
      page: pageNumber
    };

    console.log('Signature placed:', {
      displayClick: { x: displayX, y: displayY },
      pdfCoords: { x: newSignature.x, y: newSignature.y },
      size: { w: newSignature.width, h: newSignature.height },
      page: pageNumber,
      scale
    });
    
    console.log('Display size (for preview):', {
      x: newSignature.x * scale,
      y: newSignature.y * scale,
      w: newSignature.width * scale,
      h: newSignature.height * scale
    });

    setSignatures([...signatures, newSignature]);
    setPreviewSignature(null);
    setIsAddingMode(false);
    setError(null);
  };

  return (
    <ToolLayout
      title="Sign PDF"
      description="Add your signature, initials, or company stamp to PDF documents with professional quality."
      icon={PenTool}
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
                  <PenTool className="w-8 h-8" />
                </motion.div>

                <h3 className="text-xl font-display font-extrabold text-gray-950 mb-2 tracking-tight">Upload PDF to Sign</h3>
                <p className="text-gray-500 mb-6 max-w-[280px] mx-auto font-sans text-xs leading-relaxed">
                  Add your signature or initials to any PDF document
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
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-6">
            {/* Toolbar */}
            <div className="flex flex-wrap items-center justify-between gap-4 bg-white px-6 py-4 rounded-2xl shadow-lg border border-gray-100">
              <div className="flex items-center gap-4">
                {!isAddingMode ? (
                  <button
                    onClick={handleAddSignature}
                    className="px-4 py-2 rounded-full bg-emerald-600 text-white hover:bg-emerald-700 transition-colors shadow-lg shadow-emerald-600/20 flex items-center gap-2 text-sm font-bold"
                  >
                    <PenTool className="w-4 h-4" />
                    Add Signature
                  </button>
                ) : (
                  <div className="flex items-center gap-3 px-4 py-2 rounded-full bg-blue-50 border-2 border-blue-500 text-blue-700">
                    <Sparkles className="w-4 h-4 animate-pulse" />
                    <span className="text-sm font-bold">Click on PDF to place signature</span>
                    <button
                      onClick={() => {
                        setIsAddingMode(false);
                        setPreviewSignature(null);
                      }}
                      className="ml-2 text-blue-500 hover:text-blue-700"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  </div>
                )}

                {numPages && numPages > 1 && (
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => setPageNumber(p => Math.max(1, p - 1))}
                      disabled={pageNumber <= 1}
                      className="px-3 py-1 rounded-lg bg-gray-100 hover:bg-gray-200 disabled:opacity-50 text-sm"
                    >
                      ←
                    </button>
                    <span className="text-sm text-gray-600">
                      Page {pageNumber} / {numPages}
                    </span>
                    <button
                      onClick={() => setPageNumber(p => Math.min(numPages, p + 1))}
                      disabled={pageNumber >= numPages}
                      className="px-3 py-1 rounded-lg bg-gray-100 hover:bg-gray-200 disabled:opacity-50 text-sm"
                    >
                      →
                    </button>
                  </div>
                )}
              </div>

              <div className="flex items-center gap-3">
                <button
                  onClick={() => {
                    setFile(null);
                    setFileUrl(null);
                    setSignatures([]);
                    setIsAddingMode(false);
                    setPreviewSignature(null);
                  }}
                  className="text-gray-500 hover:text-red-600 text-sm font-medium"
                >
                  Change PDF
                </button>

                {signatures.length > 0 && (
                  <div className="px-3 py-1 bg-emerald-50 text-emerald-700 rounded-lg text-sm font-semibold border border-emerald-200">
                    {signatures.length} signature{signatures.length !== 1 ? 's' : ''} added
                  </div>
                )}

                <button
                  onClick={handleSavePDF}
                  disabled={processing || signatures.length === 0}
                  className="px-6 py-2 rounded-full bg-emerald-600 text-white hover:bg-emerald-700 transition-colors shadow-lg shadow-emerald-600/20 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2 text-sm font-bold"
                >
                  {processing ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" />
                      Saving & Downloading...
                    </>
                  ) : (
                    <>
                      <Download className="w-4 h-4" />
                      Save Signatures & Download
                    </>
                  )}
                </button>
              </div>
            </div>

            {/* PDF Viewer */}
            <div className="bg-gray-50 rounded-2xl p-8 border border-gray-200">
              <div className="flex justify-center relative" ref={pageRef}>
                {fileUrl && (
                  <div
                    className={`relative ${isAddingMode ? 'cursor-crosshair ring-2 ring-blue-500 rounded-lg' : 'cursor-default'}`}
                    onClick={handlePDFClick}
                  >
                    <Document file={fileUrl} onLoadSuccess={onDocumentLoadSuccess}>
                      <Page pageNumber={pageNumber} scale={scale} renderTextLayer={false} renderAnnotationLayer={false} />
                    </Document>

                    {/* Render signatures */}
                    {signatures.filter(sig => sig.page === pageNumber).map((sig, idx) => (
                      <motion.div
                        key={idx}
                        drag
                        dragMomentum={false}
                        initial={{ opacity: 0, scale: 0.8 }}
                        animate={{ opacity: 1, scale: 1 }}
                        className="absolute cursor-grab active:cursor-grabbing border-2 border-emerald-400 rounded-lg group hover:shadow-2xl hover:border-emerald-600 transition-all duration-200"
                        style={{
                          left: sig.x * scale,
                          top: sig.y * scale,
                          width: sig.width * scale,
                          height: sig.height * scale,
                          boxShadow: '0 4px 15px rgba(16, 185, 129, 0.2)'
                        }}
                        onDragEnd={(_, info) => {
                          const updated = [...signatures];
                          updated[idx] = {
                            ...sig,
                            x: sig.x + info.offset.x / scale,
                            y: sig.y + info.offset.y / scale
                          };
                          console.log('Signature moved to:', {
                            displayOffset: info.offset,
                            pdfCoords: { x: updated[idx].x, y: updated[idx].y }
                          });
                          setSignatures(updated);
                        }}
                      >
                        <img src={sig.data} alt="Signature" className="w-full h-full object-contain" />
                        <div className="absolute -top-6 left-0 right-0 opacity-0 group-hover:opacity-100 transition-opacity text-center">
                          <span className="text-xs bg-emerald-600 text-white px-2 py-1 rounded-full font-semibold">Drag to move</span>
                        </div>
                        <button
                          onClick={() => setSignatures(signatures.filter((_, i) => i !== idx))}
                          className="absolute -top-3 -right-3 bg-red-500 text-white rounded-full p-1.5 opacity-0 group-hover:opacity-100 transition-opacity shadow-lg hover:bg-red-600"
                        >
                          <X className="w-4 h-4" />
                        </button>
                      </motion.div>
                    ))}
                  </div>
                )}
              </div>
            </div>

            {/* Hidden canvas for signature generation */}
            <canvas ref={canvasRef} className="hidden" />

            {error && (
              <div className="bg-red-50 border border-red-200 rounded-xl p-4 text-red-600 text-sm flex items-center justify-between">
                <span>{error}</span>
                <button onClick={() => setError(null)} className="text-red-500 hover:text-red-700">
                  <X className="w-4 h-4" />
                </button>
              </div>
            )}

            {signatures.length > 0 && (
              <div className="bg-green-50 border border-green-200 rounded-xl p-4 text-green-700 text-sm flex items-center gap-2">
                <CheckCircle2 className="w-5 h-5" />
                <span><strong>{signatures.length}</strong> signature{signatures.length !== 1 ? 's' : ''} added to page {pageNumber}. You can drag to adjust position. Click "Save Signatures & Download" when ready.</span>
              </div>
            )}

            {complete && (
              <div className="bg-emerald-50 border border-emerald-200 rounded-xl p-4 text-emerald-600 text-sm flex items-center gap-2">
                <CheckCircle2 className="w-5 h-5" />
                PDF signed successfully!
              </div>
            )}
          </motion.div>
        )}

        {/* Signature Modal */}
        <AnimatePresence>
          {showSignatureModal && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4"
              onClick={() => setShowSignatureModal(false)}
            >
              <motion.div
                initial={{ scale: 0.9, y: 20 }}
                animate={{ scale: 1, y: 0 }}
                exit={{ scale: 0.9, y: 20 }}
                className="bg-white rounded-2xl shadow-2xl max-w-3xl w-full max-h-[90vh] overflow-y-auto"
                onClick={(e) => e.stopPropagation()}
              >
                {/* Modal Header */}
                <div className="border-b border-gray-200 p-6 flex items-center justify-between">
                  <h2 className="text-2xl font-bold text-gray-900">Set your signature details</h2>
                  <button
                    onClick={() => setShowSignatureModal(false)}
                    className="text-gray-400 hover:text-gray-600"
                  >
                    <X className="w-6 h-6" />
                  </button>
                </div>

                {/* Modal Content */}
                <div className="p-6 space-y-6">
                  {/* Name Inputs */}
                  <div className="grid md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-semibold text-gray-700 mb-2">Full name:</label>
                      <input
                        type="text"
                        value={fullName}
                        onChange={(e) => setFullName(e.target.value)}
                        placeholder="Your name"
                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-transparent outline-none"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-semibold text-gray-700 mb-2">Initials:</label>
                      <input
                        type="text"
                        value={initials}
                        onChange={(e) => setInitials(e.target.value.substring(0, 3))}
                        placeholder="S"
                        maxLength={3}
                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-transparent outline-none"
                      />
                    </div>
                  </div>

                  {/* Tabs */}
                  <div className="flex gap-4 border-b border-gray-200">
                    <button
                      onClick={() => setSignatureTab('signature')}
                      className={`pb-3 px-4 font-semibold text-sm flex items-center gap-2 transition-colors border-b-2 ${
                        signatureTab === 'signature'
                          ? 'border-emerald-600 text-emerald-600'
                          : 'border-transparent text-gray-500 hover:text-gray-700'
                      }`}
                    >
                      <PenTool className="w-4 h-4" />
                      Signature
                    </button>
                    <button
                      onClick={() => setSignatureTab('initials')}
                      className={`pb-3 px-4 font-semibold text-sm flex items-center gap-2 transition-colors border-b-2 ${
                        signatureTab === 'initials'
                          ? 'border-blue-600 text-blue-600'
                          : 'border-transparent text-gray-500 hover:text-gray-700'
                      }`}
                    >
                      <Type className="w-4 h-4" />
                      Initials
                    </button>
                    <button
                      onClick={() => setSignatureTab('stamp')}
                      className={`pb-3 px-4 font-semibold text-sm flex items-center gap-2 transition-colors border-b-2 ${
                        signatureTab === 'stamp'
                          ? 'border-purple-600 text-purple-600'
                          : 'border-transparent text-gray-500 hover:text-gray-700'
                      }`}
                    >
                      <Stamp className="w-4 h-4" />
                      Company Stamp
                    </button>
                    <button
                      onClick={() => setSignatureTab('upload')}
                      className={`pb-3 px-4 font-semibold text-sm flex items-center gap-2 transition-colors border-b-2 ${
                        signatureTab === 'upload'
                          ? 'border-orange-600 text-orange-600'
                          : 'border-transparent text-gray-500 hover:text-gray-700'
                      }`}
                    >
                      <Upload className="w-4 h-4" />
                      Upload
                    </button>
                  </div>

                  {/* Signature Styles */}
                  {signatureTab !== 'upload' && (
                    <div className="space-y-4">
                      <h3 className="font-semibold text-gray-700">Choose style:</h3>
                      <div className="space-y-3">
                        {signatureStyles.map((style, idx) => (
                          <label
                            key={idx}
                            className="flex items-center gap-4 p-4 border-2 border-gray-200 rounded-lg cursor-pointer hover:border-emerald-300 transition-colors"
                          >
                            <input
                              type="radio"
                              name="signatureStyle"
                              checked={selectedSignatureStyle === idx}
                              onChange={() => setSelectedSignatureStyle(idx)}
                              className="w-5 h-5 text-emerald-600"
                            />
                            <div
                              style={{ fontFamily: style.font, color: signatureColor }}
                              className="text-3xl"
                            >
                              {signatureTab === 'signature' ? (fullName || 'Shadab') : (initials || 'S')}
                            </div>
                          </label>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Color Selection */}
                  {signatureTab !== 'upload' && (
                    <div className="space-y-3">
                      <h3 className="font-semibold text-gray-700">Color:</h3>
                      <div className="flex gap-3">
                        {colors.map((color) => (
                          <button
                            key={color.value}
                            onClick={() => setSignatureColor(color.value)}
                            className={`w-10 h-10 rounded-full border-4 transition-all ${
                              signatureColor === color.value
                                ? 'border-gray-400 scale-110'
                                : 'border-transparent hover:scale-105'
                            }`}
                            style={{ backgroundColor: color.value }}
                            title={color.name}
                          />
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Upload Signature */}
                  {signatureTab === 'upload' && (
                    <div className="space-y-4">
                      <div className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center">
                        <Upload className="w-12 h-12 text-gray-400 mx-auto mb-3" />
                        <p className="text-gray-600 mb-4 font-semibold">Upload your signature image from your computer</p>
                        <label className="inline-block">
                          <span className="px-6 py-3 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 transition-colors cursor-pointer font-semibold">
                            Choose Image
                          </span>
                          <input
                            ref={signatureUploadRef}
                            type="file"
                            accept="image/*"
                            onChange={handleUploadSignature}
                            className="hidden"
                          />
                        </label>
                        <p className="text-xs text-gray-500 mt-3">Supported: PNG, JPG, GIF, WebP</p>
                      </div>
                      {uploadedSignature && (
                        <div className="space-y-2">
                          <p className="text-sm font-semibold text-gray-700">Preview:</p>
                          <img src={uploadedSignature} alt="Signature preview" className="h-24 border border-gray-200 rounded-lg" />
                        </div>
                      )}
                    </div>
                  )}
                </div>

                {/* Modal Footer */}
                <div className="border-t border-gray-200 p-6 flex justify-end gap-3">
                  <button
                    onClick={() => setShowSignatureModal(false)}
                    className="px-6 py-3 rounded-lg border border-gray-300 text-gray-700 hover:bg-gray-50 font-semibold"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={signatureTab === 'upload' ? undefined : handleApplySignature}
                    disabled={signatureTab === 'upload' && !uploadedSignature}
                    className="px-8 py-3 rounded-lg bg-red-600 text-white hover:bg-red-700 font-semibold shadow-lg disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {signatureTab === 'upload' ? 'Signature uploaded' : 'Apply'}
                  </button>
                </div>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </ToolLayout>
  );
}
