"use client";

import { useEffect, useState } from "react";
import { API_URL } from "@/lib/config";
import {
    BarChart3, PieChart, TrendingUp, Activity,
    Calendar, Download, RefreshCw, Zap
} from "lucide-react";
import { motion } from "framer-motion";

export default function AnalyticsPanel() {
    const [data, setData] = useState<any>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetch(`${API_URL}/admin/stats`, { credentials: "include" })
            .then(res => res.json())
            .then(data => {
                setData(data);
                setLoading(false);
            })
            .catch(() => setLoading(false));
    }, []);

    const handleExport = async () => {
        try {
            const res = await fetch(`${API_URL}/admin/stats/export`, { credentials: "include" });
            const blob = await res.blob();
            const url = window.URL.createObjectURL(blob);
            const a = document.createElement("a");
            a.href = url;
            a.download = "stats_usage.csv";
            document.body.appendChild(a);
            a.click();
            a.remove();
            window.URL.revokeObjectURL(url);
        } catch (error) {
            alert("Failed to export stats");
        }
    };

    if (loading) return <div className="animate-pulse space-y-8">
        <div className="h-40 bg-white rounded-2xl w-full" />
        <div className="grid grid-cols-2 gap-6">
            <div className="h-64 bg-white rounded-2xl" />
            <div className="h-64 bg-white rounded-2xl" />
        </div>
    </div>;

    return (
        <div className="space-y-8">
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-2xl font-bold text-slate-900">System Analytics</h1>
                    <p className="text-slate-500 text-sm mt-1">Deep dive into tool usage and conversion performance.</p>
                </div>
                <div className="flex gap-2">
                    <button className="flex items-center gap-2 px-4 py-2 bg-white border border-slate-200 rounded-xl text-sm font-medium text-slate-600 hover:bg-slate-50">
                        <Calendar size={16} /> Last 30 Days
                    </button>
                    <button onClick={handleExport} className="flex items-center gap-2 px-4 py-2 bg-emerald-600 text-white rounded-xl text-sm font-medium hover:bg-emerald-700 shadow-lg shadow-emerald-900/20">
                        <Download size={16} /> Export CSV
                    </button>
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm">
                    <div className="flex items-center gap-3 mb-4">
                        <div className="p-2 bg-emerald-50 text-emerald-600 rounded-lg"><Zap size={20} /></div>
                        <h3 className="font-bold text-slate-800">Conversion Rate</h3>
                    </div>
                    <p className="text-3xl font-bold text-slate-900">97.8%</p>
                    <div className="mt-4 h-1.5 bg-slate-100 rounded-full overflow-hidden">
                        <div className="h-full bg-emerald-500 w-[97.8%]" />
                    </div>
                    <p className="text-xs text-slate-400 mt-2">+0.5% from last week</p>
                </div>

                <div className="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm">
                    <div className="flex items-center gap-3 mb-4">
                        <div className="p-2 bg-blue-50 text-blue-600 rounded-lg"><Activity size={20} /></div>
                        <h3 className="font-bold text-slate-800">Avg. File Size</h3>
                    </div>
                    <p className="text-3xl font-bold text-slate-900">4.2 MB</p>
                    <div className="mt-4 flex gap-1">
                        {[40, 60, 45, 90, 65, 80, 50].map((v, i) => (
                            <div key={i} className="flex-1 bg-blue-100 h-8 rounded-sm self-end" style={{ height: `${v}%` }} />
                        ))}
                    </div>
                    <p className="text-xs text-slate-400 mt-2">Peak: 24.5 MB (Organizer tool)</p>
                </div>

                <div className="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm">
                    <div className="flex items-center gap-3 mb-4">
                        <div className="p-2 bg-amber-50 text-amber-600 rounded-lg"><RefreshCw size={20} /></div>
                        <h3 className="font-bold text-slate-800">Retention Rate</h3>
                    </div>
                    <p className="text-3xl font-bold text-slate-900">32.4%</p>
                    <div className="mt-4 h-1.5 bg-slate-100 rounded-full overflow-hidden">
                        <div className="h-full bg-amber-500 w-[32.4%]" />
                    </div>
                    <p className="text-xs text-slate-400 mt-2">Active users returning</p>
                </div>
            </div>

            <div className="bg-white p-8 rounded-2xl border border-slate-100 shadow-sm">
                <h3 className="font-bold text-slate-900 mb-6 flex items-center gap-2">
                    <TrendingUp className="text-emerald-500" size={20} />
                    Tool Performance Breakdown
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
                    <div className="space-y-6">
                        <p className="text-sm font-bold text-slate-500 uppercase tracking-widest">Usage by Tool</p>
                        {data?.popular_tools?.map((tool: any) => (
                            <div key={tool.tool_name} className="flex items-center gap-4">
                                <span className="text-xs font-bold text-slate-400 w-24 capitalize">{tool.tool_name.replace(/_/g, ' ')}</span>
                                <div className="flex-1 h-3 bg-slate-50 rounded-full overflow-hidden">
                                    <motion.div
                                        initial={{ width: 0 }}
                                        animate={{ width: `${(tool.count / data.popular_tools[0].count) * 100}%` }}
                                        className="h-full bg-gradient-to-r from-emerald-400 to-emerald-600"
                                    />
                                </div>
                                <span className="text-xs font-bold text-slate-700">{tool.count}</span>
                            </div>
                        ))}
                    </div>

                    <div className="bg-slate-50 rounded-2xl p-6 flex flex-col justify-center text-center">
                        <div className="w-16 h-16 bg-white rounded-full flex items-center justify-center mx-auto mb-4 shadow-sm">
                            <BarChart3 className="text-emerald-600" size={32} />
                        </div>
                        <h4 className="font-bold text-slate-900">Insight of the Week</h4>
                        <p className="text-sm text-slate-500 mt-2 px-4">
                            PDF to Word conversion has seen a <span className="text-emerald-600 font-bold">15% increase</span> in traffic.
                            Users are mostly processing documents between 10 AM and 2 PM.
                        </p>
                    </div>
                </div>
            </div>
        </div>
    );
}
