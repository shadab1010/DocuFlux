"use client";

import BaseTool from "../../components/BaseTool";
import { Lock } from "lucide-react";
import { useState } from "react";

export default function ProtectPage() {
    const [password, setPassword] = useState("");

    return (
        <div className="space-y-4">
            <div className="max-w-md mx-auto mb-8 bg-white p-6 rounded-2xl shadow-sm border border-emerald-50">
                <label className="block text-sm font-bold text-gray-700 mb-2 uppercase tracking-widest">Set Password</label>
                <input
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="w-full px-4 py-3 bg-gray-50 border border-gray-100 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500/20 transition-all font-medium"
                    placeholder="Enter secure password..."
                />
            </div>
            <BaseTool
                title="Protect PDF"
                description="Fortified security. Encrypt your sensitive documents with military-grade password protection."
                icon={Lock}
                endpoint="/protect-pdf"
                fileInputName="pdf"
                additionalParams={{ password }}
                downloadName="protected.pdf"
            />
        </div>
    );
}
