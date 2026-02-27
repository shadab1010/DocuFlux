"use client";

import { useState, useRef, useEffect } from "react";
import ToolLayout from "../../components/ToolLayout";
import { Upload, Edit, Loader2, Type, ImageIcon, Scissors, Sparkles, Download, X, Settings2, Trash2, MousePointer2, Eraser, Square, Circle, Minus, Undo, Redo, ZoomIn, ZoomOut, ChevronLeft, ChevronRight, Pen } from "lucide-react";
import AnimatedButton from "../../components/ui/AnimatedButton";
import { motion, AnimatePresence } from "framer-motion";
import { Document, Page, pdfjs } from 'react-pdf';
import { API_URL } from '../../../lib/config';
import 'react-pdf/dist/esm/Page/AnnotationLayer.css';
import 'react-pdf/dist/esm/Page/TextLayer.css';

// Set up the pdf worker
pdfjs.GlobalWorkerOptions.workerSrc = `//unpkg.com/pdfjs-dist@${pdfjs.version}/build/pdf.worker.min.mjs`;

interface PdfElement {
  type: 'text' | 'whiteboard' | 'whiteout' | 'image' | 'shape' | 'draw';
  id: string;
  text?: string;
  x: number;
  y: number;
  width?: number;
  height?: number;
  fontSize?: number;
  color?: string;
  fontFamily?: string;
  backgroundColor?: string;
  imageUrl?: string;
  shapeType?: 'rectangle' | 'circle' | 'line';
  drawPoints?: { x: number; y: number }[];
  strokeWidth?: number;
}

export default function EditPDFPage() {
  const [file, setFile] = useState<File | null>(null);
  const [fileUrl, setFileUrl] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [editorMode, setEditorMode] = useState(false);

  // PDF State
  const [numPages, setNumPages] = useState<number | null>(null);
  const [pageNumber, setPageNumber] = useState(1);
  const [pageWidth, setPageWidth] = useState(0);
  const [scale, setScale] = useState(1.5);

  // Editor State
  const [activeTool, setActiveTool] = useState<'select' | 'text' | 'whiteboard' | 'whiteout' | 'edittext' | 'image' | 'shape' | 'draw'>('edittext');
  const [elements, setElements] = useState<PdfElement[]>([]);
  const [selectedElementId, setSelectedElementId] = useState<string | null>(null);
  const [isTextLayerEnabled, setIsTextLayerEnabled] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [history, setHistory] = useState<PdfElement[][]>([[]]);
  const [historyIndex, setHistoryIndex] = useState(0);
  const [selectedShape, setSelectedShape] = useState<'rectangle' | 'circle' | 'line'>('rectangle');
  const [isDrawing, setIsDrawing] = useState(false);
  const [currentDrawPoints, setCurrentDrawPoints] = useState<{ x: number; y: number }[]>([]);
  const [editingTextId, setEditingTextId] = useState<string | null>(null);
  const [whiteboardTextColor, setWhiteboardTextColor] = useState('#111111');

  // Direct PDF.js text layer editing - edits stored with complete style info
  const [editedTexts, setEditedTexts] = useState<{
    [textId: string]: {
      text: string;
      originalText: string;
      x: number;
      y: number;
      width: number;
      height: number;
      fontSize: number;
      fontFamily: string;
      color: string;
      fontWeight: string;
      letterSpacing: string;
      page: number;
    }
  }>({});

  const containerRef = useRef<HTMLDivElement>(null);
  const pageRef = useRef<HTMLDivElement>(null);
  const imageInputRef = useRef<HTMLInputElement>(null);
  const textInputRef = useRef<HTMLInputElement>(null);
  const textIdCounter = useRef(0);

  useEffect(() => {
    if (file) {
      const url = URL.createObjectURL(file);
      setFileUrl(url);
      return () => URL.revokeObjectURL(url);
    }
  }, [file]);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setFile(e.target.files[0]);
    }
  };

  const onDocumentLoadSuccess = ({ numPages }: { numPages: number }) => {
    setNumPages(numPages);
  };

  const onPageLoadSuccess = (page: any) => {
    setPageWidth(page.width);
  };

  const handleOpenEditor = () => {
    if (!file) return;
    setLoading(true);
    setTimeout(() => {
      setLoading(false);
      setEditorMode(true);
    }, 1000);
  };

  // Handle clicking on PDF text to make it editable
  // Store editing state
  const [editingState, setEditingState] = useState<{
    textSpan: HTMLElement | null;
    text: string;
    x: number;
    y: number;
    width: number;
    height: number;
    fontSize: number;
    color: string;
    fontFamily: string;
    fontWeight: string;
    letterSpacing: string;
  } | null>(null);

  // Track selected PDF text for moving/dragging
  const [selectedPdfText, setSelectedPdfText] = useState<{
    textSpan: HTMLElement | null;
    text: string;
    x: number;
    y: number;
    width: number;
    height: number;
    fontSize: number;
    color: string;
    fontFamily: string;
    fontWeight: string;
    letterSpacing: string;
  } | null>(null);

// Direct PDF.js text layer editing - preserving original styling
  // Setup direct PDF.js text layer editing
  useEffect(() => {
    if (activeTool !== 'edittext' || !pageRef.current) return;

    const textLayer = pageRef.current.querySelector('.react-pdf__Page__textContent');
    if (!textLayer) return;

    // Handle click on any text span
    const handleTextSpanClick = (e: Event) => {
      const target = e.target as HTMLElement;
      
      // Check if it's a text span
      if (!target.matches('.react-pdf__Page__textContent span')) {
        return;
      }

      e.preventDefault();
      e.stopPropagation();

      const span = target as HTMLElement;

      // Assign unique ID if needed
      if (!span.dataset.textId) {
        span.dataset.textId = `text-${textIdCounter.current++}`;
      }

      const textId = span.dataset.textId;

      // Store original text and styles once
      if (!span.dataset.originalText) {
        const computedStyle = window.getComputedStyle(span);
        span.dataset.originalText = span.textContent || '';
        span.dataset.fontSize = computedStyle.fontSize;
        span.dataset.fontFamily = computedStyle.fontFamily;
        span.dataset.fontWeight = computedStyle.fontWeight;
        span.dataset.color = computedStyle.color;
        span.dataset.letterSpacing = computedStyle.letterSpacing;
      }

      // Set contentEditable only on this span
      span.contentEditable = 'true';
      span.spellcheck = false;

      // Apply stored styles
      span.style.fontSize = span.dataset.fontSize || '';
      span.style.fontFamily = span.dataset.fontFamily || '';
      span.style.fontWeight = span.dataset.fontWeight || '';
      span.style.color = span.dataset.color || '';
      span.style.letterSpacing = span.dataset.letterSpacing || '';
      span.style.outline = 'none';

      // Show edited text if it exists
      if (editedTexts[textId]) {
        span.textContent = editedTexts[textId].text;
      }

      // Focus and select all
      span.focus();
      const range = document.createRange();
      range.selectNodeContents(span);
      const selection = window.getSelection();
      selection?.removeAllRanges();
      selection?.addRange(range);

      // Handle input changes
      const handleInput = () => {
        const newText = span.textContent || '';
        const originalText = span.dataset.originalText || '';

        if (newText.trim() && newText !== originalText) {
          const rect = span.getBoundingClientRect();
          const pageRect = pageRef.current?.getBoundingClientRect();

          if (pageRect) {
            setEditedTexts(prev => ({
              ...prev,
              [textId]: {
                text: newText,
                originalText,
                x: rect.left - pageRect.left,
                y: rect.top - pageRect.top,
                width: rect.width,
                height: rect.height,
                fontSize: parseFloat(span.dataset.fontSize || '12'),
                fontFamily: span.dataset.fontFamily?.split(',')[0].replace(/['"]/g, '').trim() || 'Arial',
                color: span.dataset.color || '#000000',
                fontWeight: span.dataset.fontWeight || 'normal',
                letterSpacing: span.dataset.letterSpacing || 'normal',
                page: pageNumber
              }
            }));
          }
        }
      };

      // Handle save and blur
      const handleBlur = () => {
        const newText = span.textContent || '';
        const originalText = span.dataset.originalText || '';

        // If text was changed, keep the edited version visible
        if (newText.trim() && newText !== originalText) {
          span.textContent = newText; // Keep the edited text
        } else {
          // If not changed or empty, show original
          span.textContent = originalText;
        }

        span.contentEditable = 'false';
        span.removeEventListener('input', handleInput);
        span.removeEventListener('blur', handleBlur);
        span.removeEventListener('keydown', handleKeyDown);
      };

      // Handle keyboard
      const handleKeyDown = (e: Event) => {
        const keyEvent = e as KeyboardEvent;
        if (keyEvent.key === 'Enter') {
          keyEvent.preventDefault();
          span.blur();
        } else if (keyEvent.key === 'Escape') {
          keyEvent.preventDefault();
          span.textContent = span.dataset.originalText || '';
          span.blur();
        }
      };

      span.addEventListener('input', handleInput);
      span.addEventListener('blur', handleBlur);
      span.addEventListener('keydown', handleKeyDown as EventListener);
    };

    // Use event delegation on the text layer
    textLayer.addEventListener('click', handleTextSpanClick as EventListener);

    return () => {
      textLayer.removeEventListener('click', handleTextSpanClick as EventListener);
    };
  }, [activeTool, pageNumber, editedTexts]);

  const handleCanvasClick = (e: React.MouseEvent<HTMLDivElement>) => {
    if (activeTool !== 'text' && activeTool !== 'whiteboard' && activeTool !== 'whiteout' && activeTool !== 'shape') return;

    // Check if we clicked on an existing element, if so, ignore
    if ((e.target as HTMLElement).closest('.text-element')) return;

    const rect = pageRef.current?.getBoundingClientRect();
    if (!rect) return;
    
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;

    if (activeTool === 'text') {
      const newElement: PdfElement = {
        type: 'text',
        id: Date.now().toString(),
        text: "Double-click to edit",
        x: x - 50,
        y: y - 20,
        fontSize: 16,
        color: "#000000",
        fontFamily: "Arial"
      };
      const newElements = [...elements, newElement];
      setElements(newElements);
      addToHistory(newElements);
      setSelectedElementId(newElement.id);
    } else if (activeTool === 'whiteboard') {
      const newElement: PdfElement = {
        type: 'whiteboard',
        id: Date.now().toString(),
        text: "",
        x: x - 80,
        y: y - 20,
        width: 200,
        height: 44,
        fontSize: 16,
        color: whiteboardTextColor,
        fontFamily: "Arial",
        backgroundColor: "#ffffff"
      };
      const newElements = [...elements, newElement];
      setElements(newElements);
      addToHistory(newElements);
      setSelectedElementId(newElement.id);
    } else if (activeTool === 'whiteout') {
      const newElement: PdfElement = {
        type: 'whiteout',
        id: Date.now().toString(),
        x: x - 50,
        y: y - 20,
        width: 100,
        height: 40
      };
      const newElements = [...elements, newElement];
      setElements(newElements);
      addToHistory(newElements);
      setSelectedElementId(newElement.id);
    } else if (activeTool === 'shape') {
      const newElement: PdfElement = {
        type: 'shape',
        id: Date.now().toString(),
        x: x - 50,
        y: y - 25,
        width: 100,
        height: 50,
        shapeType: selectedShape,
        color: "#000000",
        strokeWidth: 2
      };
      const newElements = [...elements, newElement];
      setElements(newElements);
      addToHistory(newElements);
      setSelectedElementId(newElement.id);
    }

    setActiveTool('select'); // switch back to selection mode after placing
  };

  const updateElement = (id: string, updates: Partial<PdfElement>) => {
    const newElements = elements.map(el => el.id === id ? { ...el, ...updates } : el);
    setElements(newElements);
    addToHistory(newElements);
  };

  const deleteElement = (id: string) => {
    const newElements = elements.filter(el => el.id !== id);
    setElements(newElements);
    addToHistory(newElements);
    if (selectedElementId === id) setSelectedElementId(null);
  };

  const addToHistory = (newElements: PdfElement[]) => {
    const newHistory = history.slice(0, historyIndex + 1);
    newHistory.push(newElements);
    setHistory(newHistory);
    setHistoryIndex(newHistory.length - 1);
  };

  const undo = () => {
    if (historyIndex > 0) {
      setHistoryIndex(historyIndex - 1);
      setElements(history[historyIndex - 1]);
    }
  };

  const redo = () => {
    if (historyIndex < history.length - 1) {
      setHistoryIndex(historyIndex + 1);
      setElements(history[historyIndex + 1]);
    }
  };

  const handleZoomIn = () => {
    setScale(prev => Math.min(prev + 0.25, 3));
  };

  const handleZoomOut = () => {
    setScale(prev => Math.max(prev - 0.25, 0.5));
  };

  const handleWhiteboardColorChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newColor = e.target.value;
    setWhiteboardTextColor(newColor);

    if (selectedElement && selectedElement.type === 'whiteboard') {
      updateElement(selectedElement.id, { color: newColor });
    }
  };

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (event) => {
        const imageUrl = event.target?.result as string;
        const newElement: PdfElement = {
          type: 'image',
          id: Date.now().toString(),
          x: 100,
          y: 100,
          width: 200,
          height: 200,
          imageUrl
        };
        const newElements = [...elements, newElement];
        setElements(newElements);
        addToHistory(newElements);
        setSelectedElementId(newElement.id);
        setActiveTool('select');
      };
      reader.readAsDataURL(file);
    }
  };

  const selectedElement = elements.find(el => el.id === selectedElementId);

  const handleSavePDF = async () => {
    if (!file) return;

    // Check if there are any edits
    const hasEdits = Object.keys(editedTexts).length > 0 || elements.length > 0;
    if (!hasEdits) {
      alert('No edits to save!');
      return;
    }

    setIsSaving(true);
    setSelectedElementId(null);

    try {
      // Prepare edits array for backend with complete styling info
      const editsArray = Object.entries(editedTexts).map(([id, edit]) => ({
        id,
        page: edit.page,
        text: edit.text,
        originalText: edit.originalText,
        x: edit.x,
        y: edit.y,
        width: edit.width,
        height: edit.height,
        fontSize: edit.fontSize,
        fontFamily: edit.fontFamily,
        color: edit.color,
        fontWeight: edit.fontWeight,
        letterSpacing: edit.letterSpacing
      }));

      // Expand whiteboard elements into whiteout + text for backend
      const elementsForSave: PdfElement[] = elements.flatMap((el) => {
        if (el.type !== 'whiteboard') return [el];

        const padding = 4;
        const width = el.width || 200;
        const height = el.height || 44;

        return [
          {
            type: 'whiteout',
            id: `${el.id}_bg`,
            x: el.x,
            y: el.y,
            width,
            height
          },
          {
            type: 'text',
            id: `${el.id}_text`,
            text: el.text || '',
            x: el.x + padding,
            y: el.y + padding,
            fontSize: el.fontSize || 16,
            color: el.color || '#111111',
            fontFamily: el.fontFamily || 'Arial'
          }
        ];
      });

      // Send to backend for PDF reconstruction
      const formData = new FormData();
      formData.append('file', file);
      formData.append('edits', JSON.stringify(editsArray));
      formData.append('elements', JSON.stringify(elementsForSave));

      const response = await fetch(`${API_URL}/api/edit-pdf`, {
        method: 'POST',
        body: formData
      });

      if (!response.ok) {
        const contentType = response.headers.get('content-type') || '';
        let serverMessage = '';

        try {
          if (contentType.includes('application/json')) {
            const data = await response.json();
            serverMessage = data?.error || '';
          } else {
            serverMessage = await response.text();
          }
        } catch {
          serverMessage = '';
        }

        throw new Error(serverMessage || 'Failed to process PDF');
      }

      // Download the edited PDF
      const blob = await response.blob();
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `edited_${file.name}`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);

      // Clear edits after successful save
      setEditedTexts({});
      setElements([]);
      alert('PDF saved successfully!');
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Failed to save PDF. Please try again.';
      console.error('Error saving PDF:', error);
      alert(message || 'Failed to save PDF. Please try again.');
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <ToolLayout
      title="Edit PDF File"
      description="Master your documentation. Our high-precision interface grants you absolute control to refine text."
      icon={Edit}
    >
      <div className="space-y-8">
        {!editorMode ? (
          <>
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
                        <AnimatedButton as="div" variant="primary" size="md" className="px-10 h-12 rounded-xl shadow-xl shadow-emerald-900/10">
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
          </>
        ) : (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="flex flex-col gap-6 items-center w-full"
          >
            {/* Top Toolbar */}
            <div className="flex flex-wrap items-center justify-center gap-2 bg-white px-4 py-3 rounded-full shadow-xl shadow-emerald-900/5 border border-gray-100 w-full max-w-5xl z-20 sticky top-24">
              {/* Selection & Navigation */}
              <button
                onClick={() => setActiveTool('select')}
                className={`px-3 py-2 rounded-full flex items-center gap-2 transition-all ${activeTool === 'select' ? 'bg-emerald-50 text-emerald-600 shadow-inner' : 'hover:bg-gray-50 text-gray-500'}`}
              >
                <MousePointer2 className="w-4 h-4" />
                <span className="text-xs font-bold hidden md:inline">Select</span>
              </button>

              <div className="w-px h-6 bg-gray-200 mx-1" />

              {/* Text Tools */}
              <button
                onClick={() => {
                  setActiveTool('edittext');
                  setSelectedElementId(null);
                }}
                className={`px-3 py-2 rounded-full flex items-center gap-2 transition-all ${activeTool === 'edittext' ? 'bg-emerald-50 text-emerald-600 shadow-inner' : 'hover:bg-gray-50 text-gray-500'}`}
                title="Click any text on the PDF to edit it"
              >
                <Edit className="w-4 h-4" />
                <span className="text-xs font-bold hidden md:inline">Edit</span>
              </button>

              <button
                onClick={() => {
                  setActiveTool('text');
                  setSelectedElementId(null);
                }}
                className={`px-3 py-2 rounded-full flex items-center gap-2 transition-all ${activeTool === 'text' ? 'bg-emerald-50 text-emerald-600 shadow-inner' : 'hover:bg-gray-50 text-gray-500'}`}
              >
                <Type className="w-4 h-4" />
                <span className="text-xs font-bold hidden md:inline">Text</span>
              </button>

              <button
                onClick={() => {
                  setActiveTool('whiteboard');
                  setSelectedElementId(null);
                }}
                className={`px-3 py-2 rounded-full flex items-center gap-2 transition-all ${activeTool === 'whiteboard' ? 'bg-emerald-50 text-emerald-600 shadow-inner' : 'hover:bg-gray-50 text-gray-500'}`}
                title="Add a whiteboard text box"
              >
                <Pen className="w-4 h-4" />
                <span className="text-xs font-bold hidden md:inline">Whiteboard</span>
              </button>

              <div className="w-px h-6 bg-gray-200 mx-1" />

              {(activeTool === 'whiteboard' || selectedElement?.type === 'whiteboard') && (
                <div className="flex items-center gap-2 px-2 py-1 rounded-full bg-gray-50 border border-gray-200">
                  <span className="text-[10px] font-bold text-gray-500 uppercase tracking-wider">Text Color</span>
                  <input
                    type="color"
                    value={selectedElement?.type === 'whiteboard' ? (selectedElement.color || whiteboardTextColor) : whiteboardTextColor}
                    onChange={handleWhiteboardColorChange}
                    className="w-6 h-6 p-0 border-0 bg-transparent cursor-pointer"
                    aria-label="Whiteboard text color"
                  />
                </div>
              )}

              {/* Image Tool */}
              <button
                onClick={() => imageInputRef.current?.click()}
                className="px-3 py-2 rounded-full flex items-center gap-2 hover:bg-gray-50 text-gray-500 transition-all"
              >
                <ImageIcon className="w-4 h-4" />
                <span className="text-xs font-bold hidden md:inline">Image</span>
              </button>
              <input
                ref={imageInputRef}
                type="file"
                accept="image/*"
                onChange={handleImageUpload}
                className="hidden"
              />

              {/* Shapes */}
              <button
                onClick={() => {
                  setActiveTool('shape');
                  setSelectedShape('rectangle');
                  setSelectedElementId(null);
                }}
                className={`px-3 py-2 rounded-full flex items-center gap-2 transition-all ${activeTool === 'shape' && selectedShape === 'rectangle' ? 'bg-emerald-50 text-emerald-600 shadow-inner' : 'hover:bg-gray-50 text-gray-500'}`}
              >
                <Square className="w-4 h-4" />
              </button>

              <button
                onClick={() => {
                  setActiveTool('shape');
                  setSelectedShape('circle');
                  setSelectedElementId(null);
                }}
                className={`px-3 py-2 rounded-full flex items-center gap-2 transition-all ${activeTool === 'shape' && selectedShape === 'circle' ? 'bg-emerald-50 text-emerald-600 shadow-inner' : 'hover:bg-gray-50 text-gray-500'}`}
              >
                <Circle className="w-4 h-4" />
              </button>

              <button
                onClick={() => {
                  setActiveTool('shape');
                  setSelectedShape('line');
                  setSelectedElementId(null);
                }}
                className={`px-3 py-2 rounded-full flex items-center gap-2 transition-all ${activeTool === 'shape' && selectedShape === 'line' ? 'bg-emerald-50 text-emerald-600 shadow-inner' : 'hover:bg-gray-50 text-gray-500'}`}
              >
                <Minus className="w-4 h-4" />
              </button>

              <button
                onClick={() => {
                  setActiveTool('whiteout');
                  setSelectedElementId(null);
                }}
                className={`px-3 py-2 rounded-full flex items-center gap-2 transition-all ${activeTool === 'whiteout' ? 'bg-emerald-50 text-emerald-600 shadow-inner' : 'hover:bg-gray-50 text-gray-500'}`}
              >
                <Eraser className="w-4 h-4" />
              </button>

              <div className="w-px h-6 bg-gray-200 mx-1" />

              {/* Undo/Redo */}
              <button
                onClick={undo}
                disabled={historyIndex <= 0}
                className="px-3 py-2 rounded-full hover:bg-gray-50 text-gray-500 transition-all disabled:opacity-30 disabled:cursor-not-allowed"
              >
                <Undo className="w-4 h-4" />
              </button>

              <button
                onClick={redo}
                disabled={historyIndex >= history.length - 1}
                className="px-3 py-2 rounded-full hover:bg-gray-50 text-gray-500 transition-all disabled:opacity-30 disabled:cursor-not-allowed"
              >
                <Redo className="w-4 h-4" />
              </button>

              <div className="w-px h-6 bg-gray-200 mx-1" />

              {/* Zoom Controls */}
              <button
                onClick={handleZoomOut}
                className="px-3 py-2 rounded-full hover:bg-gray-50 text-gray-500 transition-all"
              >
                <ZoomOut className="w-4 h-4" />
              </button>

              <span className="text-xs text-gray-500 font-bold min-w-[50px] text-center">{Math.round(scale * 100)}%</span>

              <button
                onClick={handleZoomIn}
                className="px-3 py-2 rounded-full hover:bg-gray-50 text-gray-500 transition-all"
              >
                <ZoomIn className="w-4 h-4" />
              </button>

              {numPages && numPages > 1 && (
                <>
                  <div className="w-px h-6 bg-gray-200 mx-1" />

                  <button
                    onClick={() => setPageNumber(prev => Math.max(1, prev - 1))}
                    disabled={pageNumber <= 1}
                    className="px-2 py-2 rounded-full hover:bg-gray-50 text-gray-500 transition-all disabled:opacity-30"
                  >
                    <ChevronLeft className="w-4 h-4" />
                  </button>

                  <span className="text-xs text-gray-500 font-bold">{pageNumber} / {numPages}</span>

                  <button
                    onClick={() => setPageNumber(prev => Math.min(numPages, prev + 1))}
                    disabled={pageNumber >= numPages}
                    className="px-2 py-2 rounded-full hover:bg-gray-50 text-gray-500 transition-all disabled:opacity-30"
                  >
                    <ChevronRight className="w-4 h-4" />
                  </button>
                </>
              )}

              <div className="w-px h-6 bg-gray-200 mx-1" />

              {/* Save Button */}
              <button
                onClick={handleSavePDF}
                disabled={isSaving}
                className="px-4 py-2 rounded-full flex items-center gap-2 bg-emerald-600 text-white hover:bg-emerald-700 transition-colors shadow-lg shadow-emerald-600/20 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isSaving ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    <span className="text-xs font-bold">Saving...</span>
                  </>
                ) : (
                  <>
                    <Download className="w-4 h-4" />
                    <span className="text-xs font-bold">Download</span>
                  </>
                )}
              </button>
            </div>

            {/* Editor Canvas Container */}
            <div className="w-full flex justify-center relative px-4">
              <div className="w-full max-w-4xl bg-gray-50 rounded-[2rem] p-4 md:p-8 border border-gray-200 shadow-inner overflow-hidden relative min-h-[600px] flex justify-center">
                {/* Edit Mode Indicator */}
                {activeTool === 'edittext' && (
                  <div className="absolute top-4 left-1/2 transform -translate-x-1/2 bg-emerald-600 text-white px-4 py-2 rounded-full text-xs font-bold shadow-lg z-20 flex items-center gap-2">
                    <Edit className="w-3 h-3" />
                    Click any text to edit directly
                  </div>
                )}
                
                {fileUrl && (
                  <div
                    className={`relative shadow-2xl transition-all duration-300 ${activeTool === 'text' || activeTool === 'whiteboard' || activeTool === 'whiteout' ? 'cursor-crosshair' : activeTool === 'edittext' ? 'cursor-text' : 'cursor-default'}`}
                    ref={pageRef}
                    onClick={handleCanvasClick}
                    style={{
                      userSelect: activeTool === 'edittext' ? 'text' : 'none'
                    }}
                  >
                    <Document
                      file={fileUrl}
                      onLoadSuccess={onDocumentLoadSuccess}
                      loading={
                        <div className="w-full h-full flex justify-center items-center py-20 text-emerald-600">
                          <Loader2 className="w-8 h-8 animate-spin" />
                        </div>
                      }
                    >
                      <Page
                        pageNumber={pageNumber}
                        className="max-w-full pdf-page"
                        width={600}
                        scale={scale}
                        onLoadSuccess={onPageLoadSuccess}
                        renderTextLayer={activeTool === 'edittext'}
                        renderAnnotationLayer={false}
                      />
                    </Document>

                    {/* Absolute layer for text elements */}
                    {elements.map((el) => {
                      const isSelected = selectedElementId === el.id;
                      const isWhiteboard = el.type === 'whiteboard';
                      return (
                        <motion.div
                          key={el.id}
                          className="text-element absolute group"
                          style={{
                            left: el.x,
                            top: el.y,
                            cursor: activeTool !== 'edittext' ? 'grab' : 'default',
                            zIndex: isSelected ? 50 : 40,
                          }}
                          drag={activeTool !== 'edittext'}
                          dragMomentum={false}
                          onDragEnd={(_, info) => {
                            updateElement(el.id, {
                              x: el.x + info.offset.x,
                              y: el.y + info.offset.y
                            });
                          }}
                          onClick={(e) => {
                            e.stopPropagation();
                            setSelectedElementId(el.id);
                          }}
                          whileDrag={activeTool !== 'edittext' ? { cursor: 'grabbing', scale: 1.02, zIndex: 10 } : undefined}
                          onMouseDown={(e) => {
                            if (activeTool !== 'edittext') {
                              e.stopPropagation(); // prevent drawing new box on top of old
                            }
                          }}
                        >
                          {el.type === 'text' || el.type === 'whiteboard' ? (
                            <div
                              className="relative"
                              style={{
                                width: el.width || 'auto',
                                height: el.height || 'auto',
                                minWidth: '20px'
                              }}
                            >
                              {selectedElementId === el.id ? (
                                <input
                                  type="text"
                                  value={el.text || ''}
                                  onChange={(e) => updateElement(el.id, { text: e.target.value })}
                                  onBlur={() => setSelectedElementId(null)}
                                  autoFocus
                                  className={`w-full border-2 border-emerald-500 outline-none px-1 ${isWhiteboard ? '' : 'bg-white'}`}
                                  style={{
                                    fontSize: `${el.fontSize}px`,
                                    color: el.color,
                                    fontFamily: el.fontFamily || 'Arial',
                                    height: `${el.height || 'auto'}px`,
                                    lineHeight: `${el.height || 20}px`,
                                    padding: '0 4px',
                                    backgroundColor: isWhiteboard ? (el.backgroundColor || '#ffffff') : '#ffffff',
                                  }}
                                  onKeyDown={(e) => {
                                    if (e.key === 'Enter' || e.key === 'Escape') {
                                      setSelectedElementId(null);
                                    }
                                  }}
                                />
                              ) : (
                                <div
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    setSelectedElementId(el.id);
                                    if (activeTool !== 'select') setActiveTool('select');
                                  }}
                                  className={`cursor-text transition-colors whitespace-nowrap ${isWhiteboard ? 'border border-gray-200 bg-white' : 'border border-transparent hover:border-emerald-300 hover:bg-emerald-50/20'}`}
                                  style={{
                                    fontSize: `${el.fontSize}px`,
                                    color: el.color,
                                    fontFamily: el.fontFamily || 'Arial',
                                    lineHeight: `${el.height || 20}px`,
                                    height: `${el.height || 'auto'}px`,
                                    display: 'flex',
                                    alignItems: 'center',
                                    padding: '0 6px',
                                    backgroundColor: isWhiteboard ? (el.backgroundColor || '#ffffff') : 'transparent',
                                  }}
                                >
                                  {el.text || (isWhiteboard ? 'Type here' : 'Click to edit')}
                                </div>
                              )}
                            </div>
                          ) : el.type === 'image' ? (
                            <img
                              src={el.imageUrl}
                              alt="Uploaded"
                              className={`${isSelected ? 'border-2 border-emerald-500 shadow-sm' : 'border border-gray-200 hover:border-gray-400'}`}
                              style={{
                                width: el.width || 200,
                                height: el.height || 200,
                                resize: activeTool !== 'edittext' ? 'both' : 'none',
                                objectFit: 'contain',
                                pointerEvents: activeTool !== 'edittext' ? 'auto' : 'none'
                              }}
                              onMouseUp={(e) => {
                                const target = e.target as HTMLImageElement;
                                updateElement(el.id, { width: target.offsetWidth, height: target.offsetHeight });
                              }}
                            />
                          ) : el.type === 'shape' ? (
                            <svg
                              width={el.width || 100}
                              height={el.height || 50}
                              className={`${isSelected ? 'border-2 border-emerald-500' : 'border border-transparent'}`}
                              style={{
                                resize: activeTool !== 'edittext' ? 'both' : 'none',
                                overflow: 'visible'
                              }}
                            >
                              {el.shapeType === 'rectangle' && (
                                <rect
                                  x="2"
                                  y="2"
                                  width={(el.width || 100) - 4}
                                  height={(el.height || 50) - 4}
                                  fill="none"
                                  stroke={el.color || '#000000'}
                                  strokeWidth={el.strokeWidth || 2}
                                />
                              )}
                              {el.shapeType === 'circle' && (
                                <ellipse
                                  cx={(el.width || 100) / 2}
                                  cy={(el.height || 50) / 2}
                                  rx={(el.width || 100) / 2 - 2}
                                  ry={(el.height || 50) / 2 - 2}
                                  fill="none"
                                  stroke={el.color || '#000000'}
                                  strokeWidth={el.strokeWidth || 2}
                                />
                              )}
                              {el.shapeType === 'line' && (
                                <line
                                  x1="0"
                                  y1={(el.height || 50) / 2}
                                  x2={el.width || 100}
                                  y2={(el.height || 50) / 2}
                                  stroke={el.color || '#000000'}
                                  strokeWidth={el.strokeWidth || 2}
                                />
                              )}
                            </svg>
                          ) : (
                            <div
                              className={`bg-white transition-colors ${isSelected ? 'border-2 border-emerald-500 shadow-sm' : 'border border-gray-200 hover:border-gray-400'
                                }`}
                              style={{
                                width: el.width || 100,
                                height: el.height || 40,
                                resize: activeTool !== 'edittext' ? 'both' : 'none',
                                overflow: 'hidden',
                                pointerEvents: activeTool !== 'edittext' ? 'auto' : 'none'
                              }}
                              onMouseUp={(e) => {
                                const target = e.target as HTMLDivElement;
                                updateElement(el.id, { width: target.offsetWidth, height: target.offsetHeight });
                              }}
                              onPointerDownCapture={(e) => {
                                if (isSelected) {
                                  e.stopPropagation();
                                }
                              }}
                            />
                          )}
                          {isSelected && (
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                deleteElement(el.id);
                              }}
                              className="absolute -top-3 -right-3 bg-red-500 text-white rounded-full p-1 opacity-0 group-hover:opacity-100 transition-opacity shadow-lg"
                            >
                              <X className="w-3 h-3" />
                            </button>
                          )}
                        </motion.div>
                      );
                    })}

                  </div>
                )}
              </div>

              {/* Settings Panel */}
              <AnimatePresence>
                {selectedElement && (
                  <motion.div
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: 20 }}
                    className="fixed right-4 top-32 w-72 bg-white p-5 rounded-2xl shadow-2xl shadow-emerald-900/10 border border-gray-100 z-30 max-h-[calc(100vh-160px)] overflow-y-auto hidden md:block"
                  >
                    <div className="flex items-center justify-between mb-6">
                      <div className="flex items-center gap-2">
                        <Settings2 className="w-5 h-5 text-gray-400" />
                        <h3 className="font-display font-bold text-gray-900">Properties</h3>
                      </div>
                      <button
                        onClick={() => setSelectedElementId(null)}
                        className="text-gray-400 hover:text-gray-600 transition-colors"
                      >
                        <X className="w-5 h-5" />
                      </button>
                    </div>

                    <div className="space-y-5">
                      {selectedElement.type === 'text' && (
                        <>
                          <div className="space-y-2">
                            <label className="text-[10px] font-bold text-gray-500 uppercase tracking-widest">Font Size ({selectedElement.fontSize}px)</label>
                            <input
                              type="range"
                              min="8"
                              max="72"
                              value={selectedElement.fontSize}
                              onChange={(e) => updateElement(selectedElement.id, { fontSize: Number(e.target.value) })}
                              className="w-full h-1 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-emerald-600"
                            />
                          </div>

                          <div className="space-y-2">
                            <label className="text-[10px] font-bold text-gray-500 uppercase tracking-widest">Color</label>
                            <div className="flex gap-2">
                              <input
                                type="color"
                                value={selectedElement.color || '#000000'}
                                onChange={(e) => updateElement(selectedElement.id, { color: e.target.value })}
                                className="w-10 h-10 rounded-lg cursor-pointer border-0 p-0"
                              />
                              <div className="flex-1 border border-gray-200 rounded-lg flex items-center px-3 text-xs font-mono text-gray-500 bg-gray-50">
                                {selectedElement.color}
                              </div>
                            </div>
                          </div>
                        </>
                      )}

                      <div className="pt-4 border-t border-gray-100">
                        <button
                          onClick={() => deleteElement(selectedElement.id)}
                          className="w-full flex items-center justify-center gap-2 py-2 text-sm text-red-500 hover:bg-red-50 rounded-lg transition-colors"
                        >
                          <Trash2 className="w-4 h-4" />
                          Delete Item
                        </button>
                      </div>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>

              {/* Mobile Properties Panel */}
              <AnimatePresence>
                {selectedElement && (
                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: 20 }}
                    className="fixed bottom-0 left-0 right-0 bg-white p-5 rounded-t-3xl shadow-2xl border-t border-gray-100 z-30 md:hidden max-h-[60vh] overflow-y-auto"
                  >
                    <div className="flex items-center justify-between mb-6">
                      <div className="flex items-center gap-2">
                        <Settings2 className="w-5 h-5 text-gray-400" />
                        <h3 className="font-display font-bold text-gray-900">Properties</h3>
                      </div>
                      <button
                        onClick={() => setSelectedElementId(null)}
                        className="text-gray-400 hover:text-gray-600 transition-colors"
                      >
                        <X className="w-5 h-5" />
                      </button>
                    </div>

                    <div className="space-y-5">
                      {selectedElement.type === 'text' && (
                        <>
                          <div className="space-y-2">
                            <label className="text-[10px] font-bold text-gray-500 uppercase tracking-widest">Font Size ({selectedElement.fontSize}px)</label>
                            <input
                              type="range"
                              min="8"
                              max="72"
                              value={selectedElement.fontSize}
                              onChange={(e) => updateElement(selectedElement.id, { fontSize: Number(e.target.value) })}
                              className="w-full h-1 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-emerald-600"
                            />
                          </div>

                          <div className="space-y-2">
                            <label className="text-[10px] font-bold text-gray-500 uppercase tracking-widest">Color</label>
                            <div className="flex gap-2">
                              <input
                                type="color"
                                value={selectedElement.color || '#000000'}
                                onChange={(e) => updateElement(selectedElement.id, { color: e.target.value })}
                                className="w-10 h-10 rounded-lg cursor-pointer border-0 p-0"
                              />
                              <div className="flex-1 border border-gray-200 rounded-lg flex items-center px-3 text-xs font-mono text-gray-500 bg-gray-50">
                                {selectedElement.color}
                              </div>
                            </div>
                          </div>
                        </>
                      )}

                      <div className="pt-4 border-t border-gray-100">
                        <button
                          onClick={() => deleteElement(selectedElement.id)}
                          className="w-full flex items-center justify-center gap-2 py-2 text-sm text-red-500 hover:bg-red-50 rounded-lg transition-colors"
                        >
                          <Trash2 className="w-4 h-4" />
                          Delete Item
                        </button>
                      </div>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </motion.div>
        )}
      </div>
    </ToolLayout>
  );
}
