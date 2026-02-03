"use client";

import BaseTool from "../../components/BaseTool";
import { Unlock } from "lucide-react";
import { useState } from "react";

export default function UnlockPage() {
    const [password, setPassword] = useState("");

    return (
        <div className="space-y-4">
            <div className="max-w-md mx-auto mb-8 bg-white p-6 rounded-2xl shadow-sm border border-emerald-50">
                <label className="block text-sm font-bold text-gray-700 mb-2 uppercase tracking-widest">Current Password (if known)</label>
                <input
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="w-full px-4 py-3 bg-gray-50 border border-gray-100 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500/20 transition-all font-medium"
                    placeholder="Enter password to unlock..."
                />
            </div>
            <BaseTool
                title="Unlock PDF"
                description="Access granted. Remove restrictions and passwords from your PDF files instantly."
                icon={Unlock}
                endpoint="/unlock-pdf"
                fileInputName="pdf"
                additionalParams={{ password }}
                downloadName="unlocked.pdf"
            />
        </div>
    );
}
