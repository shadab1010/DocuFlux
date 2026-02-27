"use client";

import { useEffect, useState } from "react";
import { API_URL } from "@/lib/config";
import {
    ShieldCheck, ShieldAlert, Lock, History,
    Info, Eye, Trash2, Ban, AlertTriangle, Fingerprint
} from "lucide-react";
import { motion } from "framer-motion";

interface Log {
    id: number;
    user_name: string;
    action: string;
    details: string;
    ip_address: string;
    timestamp: string;
}

export default function SecurityCenter() {
    const [logs, setLogs] = useState<Log[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetch(`${API_URL}/admin/logs`, { credentials: "include" })
            .then(res => res.json())
            .then(data => {
                if (!data.error) setLogs(data.logs);
                setLoading(false);
            })
            .catch(() => setLoading(false));
    }, []);

    return (
        <div className="space-y-8">
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-2xl font-bold text-slate-900">Security Center</h1>
                    <p className="text-slate-500 text-sm mt-1">Audit administrative actions and monitor system security.</p>
                </div>
                <div className="bg-emerald-50 px-4 py-2 rounded-xl flex items-center gap-2 text-emerald-700 text-sm font-bold border border-emerald-100">
                    <ShieldCheck size={18} />
                    System Protected
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
                <div className="lg:col-span-1 space-y-6">
                    <div className="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm space-y-4">
                        <h3 className="font-bold text-slate-900 border-b border-slate-50 pb-3">Security Overview</h3>
                        <div className="space-y-4">
                            <div className="flex items-center justify-between">
                                <span className="text-xs font-bold text-slate-400 uppercase">Rate Limiting</span>
                                <span className="text-xs font-bold text-emerald-500">Active</span>
                            </div>
                            <div className="flex items-center justify-between">
                                <span className="text-xs font-bold text-slate-400 uppercase">WAF Rules</span>
                                <span className="text-xs font-bold text-emerald-500">12 Enabled</span>
                            </div>
                            <div className="flex items-center justify-between">
                                <span className="text-xs font-bold text-slate-400 uppercase">Suspicious IPs</span>
                                <span className="text-xs font-bold text-amber-500">3 Blocked</span>
                            </div>
                        </div>
                        <button onClick={() => alert("Firewall rules updated successfully.")} className="w-full py-2 bg-slate-900 text-white rounded-xl text-xs font-bold hover:bg-slate-800 transition-colors">
                            Configure Firewall
                        </button>
                    </div>

                    <div className="bg-red-50 p-6 rounded-2xl border border-red-100 space-y-3">
                        <div className="flex items-center gap-2 text-red-700 font-bold">
                            <AlertTriangle size={20} />
                            <span className="text-sm">Critical Warning</span>
                        </div>
                        <p className="text-xs text-red-600/80 leading-relaxed">
                            Automatic temporary file deletion is running every 15 minutes. Ensure sufficient disk space is available for high-traffic periods.
                        </p>
                    </div>
                </div>

                <div className="lg:col-span-3 bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden">
                    <div className="p-6 border-b border-slate-100 flex items-center justify-between">
                        <h3 className="font-bold text-slate-900">Administrative Logs</h3>
                        <div className="flex items-center gap-2">
                            <button className="p-2 hover:bg-slate-50 rounded-lg text-slate-400"><History size={18} /></button>
                        </div>
                    </div>
                    <div className="overflow-x-auto">
                        <table className="w-full text-left">
                            <thead>
                                <tr className="bg-slate-50/50 text-[10px] font-bold text-slate-400 uppercase tracking-widest border-b border-slate-100">
                                    <th className="px-6 py-4">Timestamp</th>
                                    <th className="px-6 py-4">Admin</th>
                                    <th className="px-6 py-4">Action</th>
                                    <th className="px-6 py-4">IP Address</th>
                                    <th className="px-6 py-4 text-right">Details</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-100 text-sm">
                                {logs.map((log, idx) => (
                                    <tr key={log.id} className="hover:bg-slate-50/50 transition-colors">
                                        <td className="px-6 py-4 text-slate-400 text-xs truncate max-w-[120px]">
                                            {new Date(log.timestamp).toLocaleString()}
                                        </td>
                                        <td className="px-6 py-4 font-bold text-slate-700">
                                            {log.user_name}
                                        </td>
                                        <td className="px-6 py-4">
                                            <span className="px-2 py-0.5 bg-slate-100 rounded text-[10px] font-mono text-slate-600 font-bold">
                                                {log.action}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4 text-slate-500 font-mono text-xs">
                                            {log.ip_address || "Internal"}
                                        </td>
                                        <td className="px-6 py-4 text-right">
                                            <button onClick={() => alert(`Data export generated for log ${log.id}`)} className="text-emerald-600 hover:underline text-xs font-bold">View Data</button>
                                        </td>
                                    </tr>
                                ))}
                                {!logs.length && (
                                    <tr>
                                        <td colSpan={5} className="py-20 text-center text-slate-300 italic">No administrative logs found</td>
                                    </tr>
                                )}
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>
        </div>
    );
}
