"use client";

import BaseTool from "../../components/BaseTool";
import { RefreshCw } from "lucide-react";
import { useState } from "react";

export default function RotatePage() {
    const [angle, setAngle] = useState("90");

    return (
        <div className="space-y-4">
            <div className="max-w-md mx-auto mb-8 bg-white p-6 rounded-2xl shadow-sm border border-emerald-50">
                <label className="block text-sm font-bold text-gray-700 mb-2 uppercase tracking-widest">Rotation Angle</label>
                <select
                    value={angle}
                    onChange={(e) => setAngle(e.target.value)}
                    className="w-full px-4 py-3 bg-gray-50 border border-gray-100 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500/20 transition-all font-medium"
                >
                    <option value="90">90° Right</option>
                    <option value="180">180° Flip</option>
                    <option value="270">90° Left (270°)</option>
                </select>
            </div>
            <BaseTool
                title="Rotate PDF"
                description="Perfect orientation. Fix upside-down or sideways pages with a single click."
                icon={RefreshCw}
                endpoint="/rotate-pdf"
                fileInputName="pdf"
                additionalParams={{ angle }}
                downloadName="rotated.pdf"
            />
        </div>
    );
}
