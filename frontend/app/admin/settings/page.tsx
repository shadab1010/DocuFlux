"use client";

import { useState, useEffect } from "react";
import { API_URL } from "@/lib/config";
import {
    Settings, Save, Globe, Lock, Shield,
    Trash2, Mail, Link as LinkIcon, Database,
    Cpu, HardDrive, BellRing
} from "lucide-react";
import { motion } from "framer-motion";

export default function SystemSettings() {
    const [activeTab, setActiveTab] = useState("general");
    const [saving, setSaving] = useState(false);
    const [settings, setSettings] = useState<Record<string, string>>({
        app_name: "DocuFlux",
        support_email: "support@docuflux.in",
        announcements: "",
        maintenance_mode: "0",
        max_upload_size: "50",
        file_auto_delete: "15",
        max_login_attempts: "5",
        session_expiry: "24"
    });

    useEffect(() => {
        fetch(`${API_URL}/admin/settings`, { credentials: "include" })
            .then(res => res.json())
            .then(data => {
                if (data.settings) {
                    setSettings(prev => ({ ...prev, ...data.settings }));
                }
            })
            .catch(err => console.error("Failed to fetch settings", err));
    }, []);

    const handleSave = async () => {
        setSaving(true);
        try {
            const res = await fetch(`${API_URL}/admin/settings`, {
                method: 'PATCH',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(settings),
                credentials: "include"
            });
            if (res.ok) alert("Settings saved successfully.");
        } catch (e) {
            alert("Failed to save settings.");
        } finally {
            setSaving(false);
        }
    };

    const tabs = [
        { id: "general", label: "General", icon: Globe },
        { id: "processing", label: "Processing", icon: Cpu },
        { id: "security", label: "Security", icon: Shield },
        { id: "smtp", label: "SMTP / Email", icon: Mail },
    ];

    return (
        <div className="space-y-8">
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-2xl font-bold text-slate-900">System Settings</h1>
                    <p className="text-slate-500 text-sm mt-1">Configure global application parameters and infrastructure.</p>
                </div>
                <button
                    onClick={handleSave}
                    className="flex items-center gap-2 px-6 py-2.5 bg-emerald-600 text-white rounded-xl text-sm font-bold hover:bg-emerald-700 shadow-lg shadow-emerald-900/10 transition-all active:scale-95 disabled:opacity-70"
                    disabled={saving}
                >
                    {saving ? <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" /> : <Save size={18} />}
                    {saving ? "Saving..." : "Save Changes"}
                </button>
            </div>

            <div className="flex gap-8">
                {/* Sidebar Tabs */}
                <div className="w-64 flex flex-col gap-1">
                    {tabs.map(tab => (
                        <button
                            key={tab.id}
                            onClick={() => setActiveTab(tab.id)}
                            className={`flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-bold transition-all ${activeTab === tab.id
                                ? "bg-white text-emerald-600 shadow-sm border border-slate-100"
                                : "text-slate-400 hover:text-slate-600 hover:bg-slate-50"
                                }`}
                        >
                            <tab.icon size={18} />
                            {tab.label}
                        </button>
                    ))}
                </div>

                {/* Tab Content */}
                <div className="flex-1 bg-white p-8 rounded-3xl border border-slate-100 shadow-sm space-y-8">
                    {activeTab === "general" && (
                        <div className="space-y-8">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                                <div className="space-y-2">
                                    <label className="text-sm font-bold text-slate-700">Application Name</label>
                                    <input
                                        type="text"
                                        className="w-full px-4 py-2 bg-slate-50 border border-slate-200 rounded-xl outline-none focus:ring-2 focus:ring-emerald-500/20 text-slate-600"
                                        value={settings.app_name}
                                        onChange={(e) => setSettings({ ...settings, app_name: e.target.value })}
                                    />
                                </div>
                                <div className="space-y-2">
                                    <label className="text-sm font-bold text-slate-700">Support Email</label>
                                    <input
                                        type="email"
                                        className="w-full px-4 py-2 bg-slate-50 border border-slate-200 rounded-xl outline-none focus:ring-2 focus:ring-emerald-500/20 text-slate-600"
                                        value={settings.support_email}
                                        onChange={(e) => setSettings({ ...settings, support_email: e.target.value })}
                                    />
                                </div>
                            </div>

                            <div className="space-y-4">
                                <h4 className="text-sm font-bold text-slate-900 flex items-center gap-2">
                                    <BellRing size={16} className="text-amber-500" />
                                    Site Announcements
                                </h4>
                                <textarea
                                    className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-2xl outline-none focus:ring-2 focus:ring-emerald-500/20 text-slate-600"
                                    rows={3}
                                    placeholder="Banner text to display on homepage..."
                                    value={settings.announcements}
                                    onChange={(e) => setSettings({ ...settings, announcements: e.target.value })}
                                />
                            </div>

                            <div className="pt-6 border-t border-slate-50 flex items-center justify-between">
                                <div>
                                    <p className="text-sm font-bold text-slate-800">Maintenance Mode</p>
                                    <p className="text-xs text-slate-500">Redirect users to a temporary maintenance page.</p>
                                </div>
                                <div
                                    className={`w-12 h-6 rounded-full relative cursor-pointer transition-colors ${settings.maintenance_mode === "1" ? "bg-emerald-500" : "bg-slate-200"}`}
                                    onClick={() => setSettings({ ...settings, maintenance_mode: settings.maintenance_mode === "1" ? "0" : "1" })}
                                >
                                    <div className={`absolute left-1 top-1 w-4 h-4 bg-white rounded-full shadow-sm transition-transform ${settings.maintenance_mode === "1" ? "translate-x-6" : ""}`} />
                                </div>
                            </div>
                        </div>
                    )}

                    {activeTab === "processing" && (
                        <div className="space-y-8">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                                <div className="space-y-2">
                                    <label className="text-sm font-bold text-slate-700">Max Upload Size (MB)</label>
                                    <input
                                        type="number"
                                        className="w-full px-4 py-2 bg-slate-50 border border-slate-200 rounded-xl"
                                        value={settings.max_upload_size}
                                        onChange={(e) => setSettings({ ...settings, max_upload_size: e.target.value })}
                                    />
                                </div>
                                <div className="space-y-2">
                                    <label className="text-sm font-bold text-slate-700">File Auto-Delete (Minutes)</label>
                                    <input
                                        type="number"
                                        className="w-full px-4 py-2 bg-slate-50 border border-slate-200 rounded-xl"
                                        value={settings.file_auto_delete}
                                        onChange={(e) => setSettings({ ...settings, file_auto_delete: e.target.value })}
                                    />
                                </div>
                            </div>

                            <div className="space-y-4">
                                <h4 className="text-sm font-bold text-slate-900">Allowed Tool Categories</h4>
                                <div className="flex flex-wrap gap-4">
                                    {['PDF Editor', 'Converters', 'Organizers', 'Security'].map(tool => (
                                        <div key={tool} className="flex items-center gap-2 px-3 py-1.5 bg-emerald-50 text-emerald-700 rounded-lg text-xs font-bold border border-emerald-100">
                                            <Shield size={12} /> {tool}
                                        </div>
                                    ))}
                                </div>
                            </div>
                        </div>
                    )}

                    {activeTab === "security" && (
                        <div className="space-y-8">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                                <div className="space-y-2">
                                    <label className="text-sm font-bold text-slate-700">Max Login Attempts</label>
                                    <input
                                        type="number"
                                        className="w-full px-4 py-2 bg-slate-50 border border-slate-200 rounded-xl"
                                        value={settings.max_login_attempts}
                                        onChange={(e) => setSettings({ ...settings, max_login_attempts: e.target.value })}
                                    />
                                </div>
                                <div className="space-y-2">
                                    <label className="text-sm font-bold text-slate-700">Session Expiry (Hours)</label>
                                    <input
                                        type="number"
                                        className="w-full px-4 py-2 bg-slate-50 border border-slate-200 rounded-xl"
                                        value={settings.session_expiry}
                                        onChange={(e) => setSettings({ ...settings, session_expiry: e.target.value })}
                                    />
                                </div>
                            </div>

                            <div className="p-4 bg-red-50 rounded-2xl border border-red-100">
                                <h5 className="text-xs font-bold text-red-600 uppercase tracking-widest mb-1">Danger Zone</h5>
                                <p className="text-xs text-red-500 mb-4">Actions here are irreversible and affect all users.</p>
                                <button className="px-4 py-2 bg-red-500 text-white rounded-lg text-xs font-bold hover:bg-red-600 transition-colors">
                                    Flush All Sessions
                                </button>
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}
