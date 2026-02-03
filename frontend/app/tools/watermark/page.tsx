"use client";

import BaseTool from "../../components/BaseTool";
import { Stamp } from "lucide-react";
import { useState } from "react";

export default function WatermarkPage() {
    const [text, setText] = useState("DocuFlux");

    return (
        <div className="space-y-4">
            <div className="max-w-md mx-auto mb-8 bg-white p-6 rounded-2xl shadow-sm border border-emerald-50">
                <label className="block text-sm font-bold text-gray-700 mb-2 uppercase tracking-widest">Watermark Text</label>
                <input
                    type="text"
                    value={text}
                    onChange={(e) => setText(e.target.value)}
                    className="w-full px-4 py-3 bg-gray-50 border border-gray-100 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500/20 transition-all font-medium"
                    placeholder="Enter watermark text..."
                />
            </div>
            <BaseTool
                title="Watermark PDF"
                description="Brand protection. Overlay custom text or logos onto your document for security and branding."
                icon={Stamp}
                endpoint="/watermark-pdf"
                fileInputName="pdf"
                additionalParams={{ text }}
                downloadName="watermarked.pdf"
            />
        </div>
    );
}
