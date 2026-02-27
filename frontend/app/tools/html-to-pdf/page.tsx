"use client";

import { useState, useEffect } from "react";
import { API_URL } from "@/lib/config";
import ToolLayout from "../../components/ToolLayout";
import { FileCode, Loader2, Download, AlertCircle, CheckCircle2, RotateCcw, Link } from "lucide-react";

export default function HtmlToPdfPage() {
    const [url, setUrl] = useState("");
    const [previewUrl, setPreviewUrl] = useState("");
    const [screenSize, setScreenSize] = useState("Your screen (1536px)");
    const [pageSize, setPageSize] = useState("A4 (297x210 mm)");
    const [oneLongPage, setOneLongPage] = useState(false);
    const [orientation, setOrientation] = useState("Portrait");
    const [margins, setMargins] = useState("No margin");
    const [blockAds, setBlockAds] = useState(false);
    const [removePopups, setRemovePopups] = useState(false);

    const [processing, setProcessing] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [success, setSuccess] = useState(false);

    // Debounce preview URL update
    useEffect(() => {
        const timer = setTimeout(() => {
            if (url && (url.startsWith('http://') || url.startsWith('https://'))) {
                setPreviewUrl(url);
            } else if (url && !url.includes('://')) {
                setPreviewUrl('https://' + url);
            } else {
                setPreviewUrl("");
            }
        }, 1000);
        return () => clearTimeout(timer);
    }, [url]);

    const handleConvert = async () => {
        if (!url) {
            setError("Please enter a valid website URL");
            return;
        }

        let finalUrl = url;
        if (!finalUrl.startsWith('http://') && !finalUrl.startsWith('https://')) {
            finalUrl = 'https://' + finalUrl;
            setUrl(finalUrl);
        }

        setProcessing(true);
        setError(null);
        setSuccess(false);

        try {
            const response = await fetch(`${API_URL}/convert-html-to-pdf`, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({
                    url: finalUrl,
                    screenSize,
                    pageSize,
                    oneLongPage,
                    orientation: orientation.toLowerCase(),
                    margins,
                    blockAds,
                    removePopups
                }),
            });

            if (!response.ok) {
                const data = await response.json();
                throw new Error(data.error || "Failed to convert webpage");
            }

            const blob = await response.blob();
            const downloadUrl = URL.createObjectURL(blob);
            const link = document.createElement("a");
            link.href = downloadUrl;
            link.download = `webpage_${new Date().getTime()}.pdf`;
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);
            URL.revokeObjectURL(downloadUrl);

            setSuccess(true);
        } catch (err) {
            setError(err instanceof Error ? err.message : "An unexpected error occurred");
        } finally {
            setProcessing(false);
        }
    };

    const isValidUrl = previewUrl !== "";

    return (
        <ToolLayout
            title="HTML to PDF"
            description="Convert webpages to PDF documents with custom formatting options."
            icon={FileCode}
        >
            {!isValidUrl ? (
                // Initial State: Just the URL input centered
                <div className="max-w-3xl mx-auto flex flex-col items-center justify-center py-12 px-4 min-h-[50vh]">
                    <div className="w-full flex flex-col items-center space-y-8 bg-white p-10 rounded-3xl border border-gray-100 shadow-[0_8px_30px_rgb(0,0,0,0.04)]">
                        <div className="w-20 h-20 bg-red-50 rounded-2xl flex items-center justify-center mb-2">
                            <FileCode className="w-10 h-10 text-red-500" />
                        </div>
                        <div className="text-center space-y-2">
                            <h2 className="text-3xl font-bold text-gray-900">Enter your HTML link</h2>
                            <p className="text-gray-500 font-medium max-w-md mx-auto">Paste any website URL below to see a live preview and convert it to a high-quality PDF document.</p>
                        </div>

                        <div className="w-full max-w-xl relative flex items-center">
                            <div className="absolute left-4 sm:left-6 flex items-center justify-center p-2.5 bg-[#f0f4f8] rounded-xl">
                                <Link className="w-5 h-5 text-[#3b82f6]" strokeWidth={2.5} />
                            </div>
                            <input
                                type="url"
                                value={url}
                                onChange={(e) => setUrl(e.target.value)}
                                placeholder="Enter HTML link"
                                className="w-full pl-16 sm:pl-[4.5rem] pr-6 py-4 bg-white border border-gray-200 rounded-2xl text-gray-700 text-base font-medium placeholder-gray-400 focus:outline-none focus:border-red-500 focus:ring-4 focus:ring-red-500/10 transition-all shadow-[0_2px_10px_rgb(0,0,0,0.02)]"
                            />
                        </div>
                        <button
                            onClick={() => setPreviewUrl(url.includes('://') ? url : 'https://' + url)}
                            disabled={!url}
                            className={`px-8 py-3.5 rounded-xl font-bold text-white transition-all shadow-md ${url ? 'bg-red-600 hover:bg-red-700 hover:-translate-y-0.5' : 'bg-red-300 cursor-not-allowed'}`}
                        >
                            Preview Webpage
                        </button>
                    </div>
                </div>
            ) : (
                // Active State: Preview and Options
                <div className="flex flex-col lg:flex-row gap-8">
                    {/* Left Side - Preview Pane */}
                    <div className="lg:w-2/3 flex flex-col gap-5">
                        <div className="bg-white rounded-2xl border border-gray-200 shadow-sm p-3 flex items-center gap-3">
                            <div className="flex-1 bg-gray-50 hover:bg-gray-100 rounded-xl flex items-center px-4 py-3 border border-gray-200 focus-within:border-red-500 focus-within:ring-2 focus-within:ring-red-500/20 focus-within:bg-white transition-all">
                                <span className="text-gray-400 mr-3 text-lg">🌐</span>
                                <input
                                    type="url"
                                    value={url}
                                    onChange={(e) => setUrl(e.target.value)}
                                    placeholder="https://"
                                    className="bg-transparent border-none outline-none w-full text-gray-700 font-medium placeholder-gray-400"
                                />
                            </div>
                            <button
                                onClick={() => setPreviewUrl(url.includes('://') ? url : 'https://' + url)}
                                className="p-3.5 bg-red-50 text-red-600 hover:bg-red-600 hover:text-white rounded-xl transition-colors shadow-sm border border-red-100"
                                title="Refresh Preview"
                            >
                                <RotateCcw className="w-5 h-5" />
                            </button>
                        </div>

                        <div className="bg-white rounded-2xl border border-gray-200 shadow-[0_8px_30px_rgb(0,0,0,0.04)] flex-1 min-h-[600px] flex flex-col overflow-hidden">
                            <div className="bg-gray-50 border-b border-gray-200 px-5 py-3 flex items-center gap-2">
                                <div className="flex gap-2">
                                    <div className="w-3.5 h-3.5 rounded-full bg-red-400/90 shadow-sm"></div>
                                    <div className="w-3.5 h-3.5 rounded-full bg-amber-400/90 shadow-sm"></div>
                                    <div className="w-3.5 h-3.5 rounded-full bg-emerald-400/90 shadow-sm"></div>
                                </div>
                                <div className="ml-4 text-xs text-gray-500 font-bold uppercase tracking-wider flex-1 text-center pr-10">
                                    Live Document Preview
                                </div>
                            </div>
                            <iframe
                                src={previewUrl}
                                className="w-full h-full flex-1 border-none bg-white"
                                sandbox="allow-same-origin allow-scripts"
                            />
                        </div>
                    </div>

                    {/* Right Side - Options Sidebar */}
                    <div className="lg:w-1/3 bg-white rounded-2xl border border-gray-200 shadow-[0_8px_30px_rgb(0,0,0,0.04)] flex flex-col h-fit">
                        <div className="p-6 border-b border-gray-100 flex items-center gap-3">
                            <div className="w-10 h-10 rounded-lg bg-red-50 flex items-center justify-center text-red-600">
                                <FileCode className="w-5 h-5" />
                            </div>
                            <div>
                                <h2 className="text-lg font-bold text-gray-800 leading-tight">Export Settings</h2>
                                <p className="text-xs text-gray-500 font-medium">Customize your PDF layout</p>
                            </div>
                        </div>

                        <div className="p-6 space-y-7">
                            {/* Screen Size */}
                            <div className="space-y-2.5">
                                <label className="block text-sm font-bold text-gray-700">Screen size</label>
                                <select
                                    value={screenSize}
                                    onChange={(e) => setScreenSize(e.target.value)}
                                    className="w-full p-3 bg-gray-50 border border-gray-200 rounded-xl text-gray-700 font-medium focus:outline-none focus:ring-2 focus:ring-red-500/20 focus:border-red-500 focus:bg-white transition-all shadow-sm cursor-pointer"
                                >
                                    <option>Your screen (1536px)</option>
                                    <option>Desktop HD (1920px)</option>
                                    <option>Desktop (1440px)</option>
                                    <option>Tablet (768px)</option>
                                    <option>Mobile (320px)</option>
                                </select>
                            </div>

                            {/* Page Size & Long Page */}
                            <div className="space-y-3">
                                <label className="block text-sm font-bold text-gray-700">Page format</label>
                                <select
                                    value={pageSize}
                                    onChange={(e) => setPageSize(e.target.value)}
                                    disabled={oneLongPage}
                                    className={`w-full p-3 border rounded-xl font-medium transition-all shadow-sm ${oneLongPage ? 'bg-gray-100 border-gray-200 text-gray-400 cursor-not-allowed' : 'bg-gray-50 border-gray-200 text-gray-700 focus:bg-white focus:outline-none focus:ring-2 focus:ring-red-500/20 focus:border-red-500 cursor-pointer'}`}
                                >
                                    <option>A4 (297x210 mm)</option>
                                    <option>A3 (297x420 mm)</option>
                                    <option>A5 (148x210 mm)</option>
                                    <option>US Letter (216x279 mm)</option>
                                </select>

                                <label className="flex items-center gap-2 cursor-pointer group w-fit bg-gray-50 hover:bg-gray-100 py-2 px-3 rounded-lg border border-gray-200 transition-colors">
                                    <input
                                        type="checkbox"
                                        checked={oneLongPage}
                                        onChange={(e) => setOneLongPage(e.target.checked)}
                                        className="w-4 h-4 rounded border-gray-300 text-red-600 focus:ring-red-500/20 transition-all cursor-pointer"
                                    />
                                    <span className="text-sm font-semibold text-gray-700">One long continuous page</span>
                                </label>
                            </div>

                            {/* Orientation */}
                            <div className="space-y-2.5">
                                <label className="block text-sm font-bold text-gray-700">Orientation</label>
                                <div className="grid grid-cols-2 gap-3">
                                    <button
                                        onClick={() => setOrientation("Portrait")}
                                        disabled={oneLongPage}
                                        className={`py-5 flex flex-col items-center justify-center gap-3 rounded-xl border-2 transition-all ${oneLongPage ? 'opacity-50 cursor-not-allowed border-gray-100 bg-gray-50' : orientation === 'Portrait' ? 'border-red-500 bg-red-50/50 text-red-700 shadow-sm' : 'border-gray-200 bg-white text-gray-500 hover:border-gray-300 hover:bg-gray-50'}`}
                                    >
                                        <div className={`w-6 h-8 border-2 rounded ${orientation === 'Portrait' && !oneLongPage ? 'border-red-500' : 'border-gray-400'}`}></div>
                                        <span className="text-sm font-bold">Portrait</span>
                                    </button>
                                    <button
                                        onClick={() => setOrientation("Landscape")}
                                        disabled={oneLongPage}
                                        className={`py-5 flex flex-col items-center justify-center gap-3 rounded-xl border-2 transition-all ${oneLongPage ? 'opacity-50 cursor-not-allowed border-gray-100 bg-gray-50' : orientation === 'Landscape' ? 'border-red-500 bg-red-50/50 text-red-700 shadow-sm' : 'border-gray-200 bg-white text-gray-500 hover:border-gray-300 hover:bg-gray-50'}`}
                                    >
                                        <div className={`w-8 h-6 border-2 rounded ${orientation === 'Landscape' && !oneLongPage ? 'border-red-500' : 'border-gray-400'}`}></div>
                                        <span className="text-sm font-bold">Landscape</span>
                                    </button>
                                </div>
                            </div>

                            {/* Margin */}
                            <div className="space-y-2.5">
                                <label className="block text-sm font-bold text-gray-700">Page margin</label>
                                <div className="grid grid-cols-3 gap-2">
                                    {['No margin', 'Small', 'Big'].map((margin) => (
                                        <button
                                            key={margin}
                                            onClick={() => setMargins(margin)}
                                            className={`py-3 flex flex-col items-center justify-center gap-2.5 rounded-xl border-2 transition-all ${margins === margin ? 'border-red-500 bg-red-50/50 text-red-700' : 'border-gray-200 bg-white text-gray-500 hover:border-gray-300 hover:bg-gray-50'}`}
                                        >
                                            <div className={`w-7 h-7 rounded flex items-center justify-center border-2 border-dashed ${margins === margin ? 'border-red-400 bg-red-50' : 'border-gray-300 bg-gray-50'}`}>
                                                <div className={`w-3 h-3 bg-gray-200 rounded-sm ${margin === 'No margin' ? 'w-full h-full' : margin === 'Small' ? 'w-5 h-5' : 'w-3 h-3'} ${margins === margin ? 'bg-red-200' : ''}`}></div>
                                            </div>
                                            <span className="text-xs font-bold leading-tight px-1">{margin}</span>
                                        </button>
                                    ))}
                                </div>
                            </div>

                            {/* HTML Settings */}
                            <div className="space-y-3 pt-2 border-t border-gray-100">
                                <label className="block text-sm font-bold text-gray-700">Advanced Settings</label>
                                <div className="space-y-2">
                                    <label className="flex items-center gap-3 cursor-pointer group p-2 hover:bg-gray-50 rounded-lg transition-colors border border-transparent hover:border-gray-100">
                                        <input
                                            type="checkbox"
                                            checked={blockAds}
                                            onChange={(e) => setBlockAds(e.target.checked)}
                                            className="w-5 h-5 rounded border-gray-300 text-red-600 focus:ring-red-500/20 transition-all cursor-pointer"
                                        />
                                        <span className="text-sm font-semibold text-gray-700 group-hover:text-gray-900">Block visual ads</span>
                                    </label>
                                    <label className="flex items-center gap-3 cursor-pointer group p-2 hover:bg-gray-50 rounded-lg transition-colors border border-transparent hover:border-gray-100">
                                        <input
                                            type="checkbox"
                                            checked={removePopups}
                                            onChange={(e) => setRemovePopups(e.target.checked)}
                                            className="w-5 h-5 rounded border-gray-300 text-red-600 focus:ring-red-500/20 transition-all cursor-pointer"
                                        />
                                        <div className="flex flex-col">
                                            <span className="text-sm font-semibold text-gray-700 group-hover:text-gray-900 flex items-center gap-1.5">
                                                Remove cookie popups
                                                <AlertCircle className="w-3.5 h-3.5 text-amber-500" />
                                            </span>
                                            <span className="text-xs text-gray-400">Hides sticky overlays on the page</span>
                                        </div>
                                    </label>
                                </div>
                            </div>
                        </div>

                        {/* Submit Section */}
                        <div className="p-6 border-t border-gray-100 bg-gray-50/80 rounded-b-2xl mt-auto">
                            {error && (
                                <div className="mb-4 bg-red-50 border border-red-100 rounded-xl p-4 text-red-600 text-sm font-medium flex items-start gap-2 shadow-sm">
                                    <AlertCircle className="w-5 h-5 shrink-0 mt-0.5" />
                                    {error}
                                </div>
                            )}
                            {success && !error && (
                                <div className="mb-4 bg-emerald-50 border border-emerald-100 rounded-xl p-4 text-emerald-700 text-sm font-bold flex items-center justify-center gap-2 shadow-sm">
                                    <CheckCircle2 className="w-5 h-5 text-emerald-500" /> Download Complete
                                </div>
                            )}
                            <button
                                onClick={handleConvert}
                                disabled={processing || !url}
                                className={`w-full py-4 rounded-xl text-white transition-all flex items-center justify-center gap-2 font-bold text-lg shadow-lg ${processing || !url ? 'bg-red-400/80 cursor-not-allowed shadow-none' : 'bg-red-600 hover:bg-red-700 hover:shadow-red-600/25 hover:-translate-y-0.5 active:translate-y-0'}`}
                            >
                                {processing ? (
                                    <>
                                        <Loader2 className="w-5 h-5 animate-spin" />
                                        Generating PDF...
                                    </>
                                ) : (
                                    <>
                                        Convert to PDF <Download className="w-5 h-5 ml-1" />
                                    </>
                                )}
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </ToolLayout>
    );
}
