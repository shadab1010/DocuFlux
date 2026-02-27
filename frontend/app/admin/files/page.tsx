"use client";

import { useEffect, useState } from "react";
import { API_URL } from "@/lib/config";
import {
    File, FileCheck, FileWarning, Clock,
    Search, Filter, Download, ExternalLink,
    ChevronLeft, ChevronRight, HardDrive,
    Cpu, MousePointer2, FileText, Trash2
} from "lucide-react";
import { motion } from "framer-motion";

interface ProcessedFile {
    id: number;
    user_email: string;
    tool_name: string;
    status: string;
    file_size: number;
    duration: number;
    created_at: string;
}

export default function FileManagement() {
    const [files, setFiles] = useState<ProcessedFile[]>([]);
    const [loading, setLoading] = useState(true);
    const [page, setPage] = useState(0);
    const [filter, setFilter] = useState("all");

    const fetchFiles = () => {
        setLoading(true);
        fetch(`${API_URL}/admin/files?offset=${page * 50}`, { credentials: "include" })
            .then(res => res.json())
            .then(data => {
                if (!data.error) setFiles(data.files);
                setLoading(false);
            })
            .catch(() => setLoading(false));
    };

    useEffect(() => {
        fetchFiles();
    }, [page]);

    const handleExport = async () => {
        try {
            const res = await fetch(`${API_URL}/admin/files/export`, { credentials: "include" });
            const blob = await res.blob();
            const url = window.URL.createObjectURL(blob);
            const a = document.createElement("a");
            a.href = url;
            a.download = "files_history.csv";
            document.body.appendChild(a);
            a.click();
            a.remove();
            window.URL.revokeObjectURL(url);
        } catch (error) {
            alert("Failed to export files history");
        }
    };

    const handleDelete = async (id: number) => {
        if (!confirm("Are you sure you want to delete this processing log?")) return;

        try {
            const res = await fetch(`${API_URL}/admin/files/${id}`, {
                method: 'DELETE',
                credentials: 'include'
            });
            const data = await res.json();
            if (data.success) {
                setFiles(files.filter(f => f.id !== id));
            } else {
                alert(data.error || "Failed to delete log");
            }
        } catch (error) {
            alert("Error deleting log");
        }
    };

    const filteredFiles = files.filter(f =>
        filter === "all" || f.status === filter
    );

    const formatSize = (bytes: number) => {
        if (bytes === 0) return "0 B";
        const k = 1024;
        const sizes = ["B", "KB", "MB", "GB"];
        const i = Math.floor(Math.log(bytes) / Math.log(k));
        return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + " " + sizes[i];
    };

    return (
        <div className="space-y-6">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <h1 className="text-2xl font-bold text-slate-900">File Processing History</h1>
                    <p className="text-slate-500 text-sm mt-1">Monitor job status, processing times, and storage usage.</p>
                </div>

                <div className="flex items-center gap-3">
                    <select
                        className="px-4 py-2 bg-white border border-slate-200 rounded-xl text-sm font-medium outline-none focus:ring-2 focus:ring-emerald-500/20 shadow-sm"
                        value={filter}
                        onChange={(e) => setFilter(e.target.value)}
                    >
                        <option value="all">All Jobs</option>
                        <option value="success">Successful</option>
                        <option value="failed">Failed</option>
                    </select>
                    <button onClick={handleExport} className="p-2.5 bg-emerald-600 text-white rounded-xl shadow-lg shadow-emerald-900/10 hover:bg-emerald-700 transition-colors">
                        <Download size={18} />
                    </button>
                </div>
            </div>

            {/* Overview Mini Stats */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
                <div className="bg-white p-4 rounded-2xl border border-slate-100 flex items-center gap-4">
                    <div className="p-3 rounded-xl bg-blue-50 text-blue-600"><MousePointer2 size={20} /></div>
                    <div>
                        <p className="text-xs text-slate-400 font-bold uppercase tracking-wider">Avg Latency</p>
                        <p className="font-bold text-slate-900">1.4s</p>
                    </div>
                </div>
                <div className="bg-white p-4 rounded-2xl border border-slate-100 flex items-center gap-4">
                    <div className="p-3 rounded-xl bg-emerald-50 text-emerald-600"><FileCheck size={20} /></div>
                    <div>
                        <p className="text-xs text-slate-400 font-bold uppercase tracking-wider">Success Rate</p>
                        <p className="font-bold text-slate-900">98.2%</p>
                    </div>
                </div>
                <div className="bg-white p-4 rounded-2xl border border-slate-100 flex items-center gap-4">
                    <div className="p-3 rounded-xl bg-amber-50 text-amber-600"><HardDrive size={20} /></div>
                    <div>
                        <p className="text-xs text-slate-400 font-bold uppercase tracking-wider">Total Bandwidth</p>
                        <p className="font-bold text-slate-900">14.2 GB</p>
                    </div>
                </div>
            </div>

            <div className="bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="w-full text-left border-collapse">
                        <thead>
                            <tr className="bg-slate-50/50 border-b border-slate-100">
                                <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider">Job / ID</th>
                                <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider">User</th>
                                <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider">Tool</th>
                                <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider">Size</th>
                                <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider">Status</th>
                                <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider">Timestamp</th>
                                <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider text-right">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100 text-sm">
                            {filteredFiles.map((file, idx) => (
                                <motion.tr
                                    key={file.id}
                                    initial={{ opacity: 0 }}
                                    animate={{ opacity: 1 }}
                                    transition={{ delay: idx * 0.03 }}
                                    className="hover:bg-slate-50/50 transition-colors group"
                                >
                                    <td className="px-6 py-4">
                                        <div className="flex items-center gap-3">
                                            <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${file.status === 'success' ? "bg-emerald-100 text-emerald-600" : "bg-red-100 text-red-600"
                                                }`}>
                                                {file.status === 'success' ? <FileCheck size={16} /> : <FileWarning size={16} />}
                                            </div>
                                            <span className="font-medium text-slate-700 font-mono text-xs">#DF-{file.id.toString().padStart(6, '0')}</span>
                                        </div>
                                    </td>
                                    <td className="px-6 py-4 text-slate-600">
                                        {file.user_email || <span className="text-slate-300 italic">Guest</span>}
                                    </td>
                                    <td className="px-6 py-4">
                                        <span className="px-2 py-1 bg-slate-100 rounded text-xs font-bold text-slate-600 uppercase">
                                            {file.tool_name.replace(/_/g, ' ')}
                                        </span>
                                    </td>
                                    <td className="px-6 py-4 text-slate-500 font-medium">
                                        {formatSize(file.file_size)}
                                    </td>
                                    <td className="px-6 py-4">
                                        <span className={`px-2 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider ${file.status === 'success' ? "bg-emerald-50 text-emerald-600" : "bg-red-50 text-red-600"
                                            }`}>
                                            {file.status}
                                        </span>
                                    </td>
                                    <td className="px-6 py-4">
                                        <div className="flex items-center gap-2 text-slate-400">
                                            <Clock size={14} />
                                            <span className="text-xs">{new Date(file.created_at).toLocaleString()}</span>
                                        </div>
                                    </td>
                                    <td className="px-6 py-4 text-right">
                                        <button
                                            onClick={() => handleDelete(file.id)}
                                            className="p-1.5 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                                            title="Delete Log"
                                        >
                                            <Trash2 size={16} />
                                        </button>
                                    </td>
                                </motion.tr>
                            ))}
                        </tbody>
                    </table>
                    {loading && (
                        <div className="py-12 flex justify-center">
                            <div className="w-8 h-8 border-3 border-emerald-500 border-t-transparent rounded-full animate-spin" />
                        </div>
                    )}
                    {!loading && filteredFiles.length === 0 && (
                        <div className="py-20 text-center">
                            <div className="inline-block p-4 bg-slate-50 rounded-full mb-4">
                                <FileText size={32} className="text-slate-300" />
                            </div>
                            <p className="text-slate-400 italic">No processing jobs found in historical logs</p>
                        </div>
                    )}
                </div>

                {/* Pagination */}
                <div className="px-6 py-4 border-t border-slate-100 bg-slate-50/30 flex items-center justify-between">
                    <p className="text-xs text-slate-500 font-medium">Historical audit trail</p>
                    <div className="flex items-center gap-2">
                        <button
                            disabled={page === 0}
                            onClick={() => setPage(p => p - 1)}
                            className="p-1.5 bg-white border border-slate-200 rounded-lg text-slate-600 disabled:opacity-50 hover:bg-slate-50 transition-colors shadow-sm"
                        >
                            <ChevronLeft size={16} />
                        </button>
                        <span className="text-xs font-bold text-slate-700 w-8 text-center">{page + 1}</span>
                        <button
                            disabled={files.length < 50}
                            onClick={() => setPage(p => p + 1)}
                            className="p-1.5 bg-white border border-slate-200 rounded-lg text-slate-600 disabled:opacity-50 hover:bg-slate-50 transition-colors shadow-sm"
                        >
                            <ChevronRight size={16} />
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
}
