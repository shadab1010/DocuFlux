"use client";

import { useEffect, useState } from "react";
import { API_URL } from "@/lib/config";
import {
    Users, FileText, Send, AlertCircle,
    TrendingUp, ArrowUpRight, ArrowDownRight,
    Clock, CheckCircle2, MoreHorizontal, ShieldAlert
} from "lucide-react";
import { motion } from "framer-motion";

interface Stats {
    total_users: number;
    total_files: number;
    files_today: number;
    failed_jobs: number;
    popular_tools: Array<{ tool_name: string; count: number }>;
}

export default function AdminDashboard() {
    const [stats, setStats] = useState<Stats | null>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetch(`${API_URL}/admin/stats`, { credentials: "include" })
            .then(res => res.json())
            .then(data => {
                if (!data.error) setStats(data);
                setLoading(false);
            })
            .catch(() => setLoading(false));
    }, []);

    if (loading) {
        return (
            <div className="flex items-center justify-center min-h-[400px]">
                <div className="w-8 h-8 border-3 border-emerald-500 border-t-transparent rounded-full animate-spin" />
            </div>
        );
    }

    const statCards = [
        { label: "Total Users", value: stats?.total_users || 0, icon: Users, color: "blue", trend: "+12%" },
        { label: "Files Processed", value: stats?.total_files || 0, icon: FileText, color: "emerald", trend: "+25%" },
        { label: "Today's Jobs", value: stats?.files_today || 0, icon: Clock, color: "amber", trend: "+5%" },
        { label: "Failed Jobs", value: stats?.failed_jobs || 0, icon: AlertCircle, color: "red", trend: "-2%" },
    ];

    const getColorClasses = (color: string) => {
        switch (color) {
            case "blue": return "bg-blue-50 text-blue-600";
            case "emerald": return "bg-emerald-50 text-emerald-600";
            case "amber": return "bg-amber-50 text-amber-600";
            case "red": return "bg-red-50 text-red-600";
            default: return "bg-slate-50 text-slate-600";
        }
    };

    return (
        <div className="space-y-8">
            <div>
                <h1 className="text-2xl font-bold text-slate-900">Dashboard Overview</h1>
                <p className="text-slate-500 text-sm mt-1">Monitor your system performance and user activity.</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                {statCards.map((card, idx) => (
                    <motion.div
                        key={card.label}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: idx * 0.1 }}
                        className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100 flex flex-col gap-4"
                    >
                        <div className="flex items-center justify-between">
                            <div className={`p-3 rounded-xl ${getColorClasses(card.color)}`}>
                                <card.icon size={24} />
                            </div>
                            <div className={`flex items-center gap-1 text-xs font-bold ${card.trend.startsWith('+') ? "text-emerald-600" : "text-red-500"}`}>
                                {card.trend.startsWith('+') ? <ArrowUpRight size={14} /> : <ArrowDownRight size={14} />}
                                {card.trend}
                            </div>
                        </div>
                        <div>
                            <p className="text-slate-500 text-xs font-bold uppercase tracking-wider">{card.label}</p>
                            <h3 className="text-3xl font-bold text-slate-900 mt-1">{card.value.toLocaleString()}</h3>
                        </div>
                    </motion.div>
                ))}
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                <div className="lg:col-span-2 bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden">
                    <div className="p-6 border-b border-slate-100 flex items-center justify-between">
                        <h3 className="font-bold text-slate-900">Most Used Tools</h3>
                        <button className="text-slate-400 hover:text-emerald-600 transition-colors">
                            <MoreHorizontal size={20} />
                        </button>
                    </div>
                    <div className="p-6">
                        <div className="space-y-6">
                            {stats?.popular_tools?.map((tool: any, idx: number) => (
                                <div key={tool.tool_name} className="space-y-2">
                                    <div className="flex items-center justify-between text-sm">
                                        <span className="font-bold text-slate-700 capitalize">{tool.tool_name.replace(/_/g, ' ')}</span>
                                        <span className="text-slate-500">{tool.count} usages</span>
                                    </div>
                                    <div className="h-2 bg-slate-100 rounded-full overflow-hidden">
                                        <motion.div
                                            initial={{ width: 0 }}
                                            animate={{ width: stats.popular_tools[0].count > 0 ? `${(tool.count / stats.popular_tools[0].count) * 100}%` : "0%" }}
                                            className="h-full bg-emerald-500 rounded-full"
                                        />
                                    </div>
                                </div>
                            ))}
                            {!stats?.popular_tools?.length && (
                                <div className="text-center py-8 text-slate-400 italic">No data available yet</div>
                            )}
                        </div>
                    </div>
                </div>

                <div className="bg-[#022c22] rounded-2xl shadow-xl p-6 text-white flex flex-col justify-between">
                    <div>
                        <div className="flex items-center justify-between mb-8">
                            <h3 className="font-bold text-emerald-100">Quick Actions</h3>
                            <CheckCircle2 className="text-emerald-400" size={20} />
                        </div>
                        <div className="space-y-3">
                            <button className="w-full py-3 px-4 bg-emerald-800/50 hover:bg-emerald-700 rounded-xl text-left text-sm font-medium transition-colors border border-emerald-700/50">
                                Put System in Maintenance
                            </button>
                            <button className="w-full py-3 px-4 bg-emerald-800/50 hover:bg-emerald-700 rounded-xl text-left text-sm font-medium transition-colors border border-emerald-700/50">
                                Purge Temporary Files
                            </button>
                            <button className="w-full py-3 px-4 bg-emerald-800/50 hover:bg-emerald-700 rounded-xl text-left text-sm font-medium transition-colors border border-emerald-700/50 text-red-300">
                                Restrict New Signups
                            </button>
                        </div>
                    </div>
                    <div className="mt-8 pt-8 border-t border-emerald-800/50">
                        <div className="flex items-center gap-3">
                            <div className="w-10 h-10 rounded-full bg-emerald-800 flex items-center justify-center">
                                <ShieldAlert className="text-emerald-200" size={20} />
                            </div>
                            <div>
                                <p className="text-xs text-emerald-400 font-bold uppercase tracking-wider">Storage Status</p>
                                <p className="text-sm font-bold">1.2 GB / 10 GB (12%)</p>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
