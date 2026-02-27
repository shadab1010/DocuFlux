"use client";

import { useEffect, useState } from "react";
import { API_URL } from "@/lib/config";
import {
    ShieldAlert, ShieldCheck, UserPlus, Trash2,
    Mail, Key, User, ArrowRight, Loader2,
    AlertCircle, CheckCircle2
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

interface Admin {
    id: number;
    email: string;
    name: string;
    role: string;
    status: string;
    created_at: string;
}

export default function AdminManagement() {
    const [admins, setAdmins] = useState<Admin[]>([]);
    const [loading, setLoading] = useState(true);
    const [showAddForm, setShowAddForm] = useState(false);

    // New Admin Form
    const [formData, setFormData] = useState({
        name: "",
        email: "",
        password: "",
        role: "admin"
    });
    const [formLoading, setFormLoading] = useState(false);
    const [error, setError] = useState("");
    const [success, setSuccess] = useState("");

    const fetchAdmins = () => {
        setLoading(true);
        fetch(`${API_URL}/admin/admins?t=${Date.now()}`, {
            credentials: "include",
            cache: "no-store",
            headers: {
                "Pragma": "no-cache",
                "Cache-Control": "no-cache"
            }
        })
            .then(res => res.json())
            .then(data => {
                if (!data.error) setAdmins(data.admins);
                setLoading(false);
            })
            .catch(() => setLoading(false));
    };

    useEffect(() => {
        fetchAdmins();
    }, []);

    const handleAddAdmin = async (e: React.FormEvent) => {
        e.preventDefault();
        setFormLoading(true);
        setError("");
        setSuccess("");

        try {
            const res = await fetch(`${API_URL}/admin/admins`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(formData),
                credentials: "include"
            });
            const data = await res.json();

            if (data.success) {
                setSuccess(data.message);
                setFormData({ name: "", email: "", password: "", role: "admin" });
                fetchAdmins();
                setTimeout(() => {
                    setShowAddForm(false);
                    setSuccess("");
                }, 2000);
            } else {
                setError(data.error);
            }
        } catch (err) {
            setError("Failed to create admin account");
        } finally {
            setFormLoading(false);
        }
    };

    const handleDeleteAdmin = async (id: number) => {
        if (!confirm("Are you sure you want to delete this admin account? This cannot be undone.")) return;

        try {
            const res = await fetch(`${API_URL}/admin/admins?id=${id}`, {
                method: "DELETE",
                credentials: "include"
            });
            const data = await res.json();
            if (data.success) {
                fetchAdmins();
            } else {
                alert(data.error);
            }
        } catch (err) {
            alert("Failed to delete admin");
        }
    };

    const containerVariants = {
        hidden: { opacity: 0 },
        visible: { opacity: 1, transition: { staggerChildren: 0.1 } }
    };

    const itemVariants = {
        hidden: { opacity: 0, y: 20 },
        visible: { opacity: 1, y: 0 }
    };

    return (
        <div className="space-y-8 max-w-6xl mx-auto">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
                <div>
                    <h1 className="text-3xl font-black text-slate-900 tracking-tight flex items-center gap-3">
                        <ShieldAlert className="text-emerald-600" size={32} />
                        Manage Administrative Staff
                    </h1>
                    <p className="text-slate-500 text-sm mt-1 font-medium italic">Authorized Super Admin access only: Create, delete, and audit staff accounts.</p>
                </div>

                <button
                    onClick={() => setShowAddForm(!showAddForm)}
                    className="flex items-center gap-2 px-6 py-3 bg-[#022c22] text-white rounded-2xl text-sm font-black uppercase tracking-widest shadow-xl shadow-emerald-900/10 hover:bg-emerald-800 transition-all active:scale-95"
                >
                    {showAddForm ? "View Staff Directory" : <><UserPlus size={18} /> Onboard New Admin</>}
                </button>
            </div>

            <AnimatePresence mode="wait">
                {showAddForm ? (
                    <motion.div
                        key="form"
                        initial={{ opacity: 0, scale: 0.95 }}
                        animate={{ opacity: 1, scale: 1 }}
                        exit={{ opacity: 0, scale: 0.95 }}
                        className="bg-white p-10 rounded-[2.5rem] border border-slate-100 shadow-2xl shadow-emerald-900/5 max-w-2xl mx-auto border-t-4 border-t-emerald-600"
                    >
                        <div className="text-center mb-8">
                            <h2 className="text-2xl font-bold text-slate-900">Admin Onboarding</h2>
                            <p className="text-slate-400 text-sm">Configure credentials for new administrative staff.</p>
                        </div>

                        <form onSubmit={handleAddAdmin} className="space-y-6">
                            {error && (
                                <div className="p-4 bg-red-50 text-red-600 text-sm font-bold rounded-2xl border border-red-100 flex items-center gap-2 animate-shake">
                                    <AlertCircle size={18} /> {error}
                                </div>
                            )}
                            {success && (
                                <div className="p-4 bg-emerald-50 text-emerald-600 text-sm font-bold rounded-2xl border border-emerald-100 flex items-center gap-2">
                                    <CheckCircle2 size={18} /> {success}
                                </div>
                            )}

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <div className="space-y-2">
                                    <label className="text-xs font-black text-slate-400 uppercase tracking-widest ml-1">Full Name</label>
                                    <div className="relative">
                                        <User className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-300" size={18} />
                                        <input
                                            type="text"
                                            required
                                            className="w-full pl-12 pr-4 py-3 bg-slate-50 border border-slate-100 rounded-2xl outline-none focus:ring-2 focus:ring-emerald-500/20 text-slate-900 font-medium transition-all"
                                            placeholder="John Staff"
                                            value={formData.name}
                                            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                                        />
                                    </div>
                                </div>
                                <div className="space-y-2">
                                    <label className="text-xs font-black text-slate-400 uppercase tracking-widest ml-1">Email Address</label>
                                    <div className="relative">
                                        <Mail className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-300" size={18} />
                                        <input
                                            type="email"
                                            required
                                            className="w-full pl-12 pr-4 py-3 bg-slate-50 border border-slate-100 rounded-2xl outline-none focus:ring-2 focus:ring-emerald-500/20 text-slate-900 font-medium transition-all"
                                            placeholder="staff@docuflux.in"
                                            value={formData.email}
                                            onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                                        />
                                    </div>
                                </div>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <div className="space-y-2">
                                    <label className="text-xs font-black text-slate-400 uppercase tracking-widest ml-1">Secret Key</label>
                                    <div className="relative">
                                        <Key className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-300" size={18} />
                                        <input
                                            type="password"
                                            required
                                            className="w-full pl-12 pr-4 py-3 bg-slate-50 border border-slate-100 rounded-2xl outline-none focus:ring-2 focus:ring-emerald-500/20 text-slate-900 font-medium transition-all"
                                            placeholder="••••••••"
                                            value={formData.password}
                                            onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                                        />
                                    </div>
                                </div>
                                <div className="space-y-2">
                                    <label className="text-xs font-black text-slate-400 uppercase tracking-widest ml-1">Access Level</label>
                                    <select
                                        className="w-full px-4 py-3 bg-slate-50 border border-slate-100 rounded-2xl outline-none focus:ring-2 focus:ring-emerald-500/20 text-slate-900 font-medium appearance-none cursor-pointer"
                                        value={formData.role}
                                        onChange={(e) => setFormData({ ...formData, role: e.target.value })}
                                    >
                                        <option value="admin">Standard Admin</option>
                                        <option value="super_admin">Super Admin</option>
                                    </select>
                                </div>
                            </div>

                            <button
                                type="submit"
                                disabled={formLoading}
                                className="w-full py-4 bg-emerald-600 text-white rounded-2xl font-black text-sm uppercase tracking-widest hover:bg-emerald-700 shadow-xl shadow-emerald-900/20 transition-all flex items-center justify-center gap-2 group disabled:opacity-70"
                            >
                                {formLoading ? <Loader2 className="animate-spin" size={20} /> : <><ShieldCheck size={18} /> Provision Access</>}
                            </button>
                        </form>
                    </motion.div>
                ) : (
                    <motion.div
                        key="list"
                        variants={containerVariants}
                        initial="hidden"
                        animate="visible"
                        className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
                    >
                        {admins.map(admin => (
                            <motion.div
                                key={admin.id}
                                variants={itemVariants}
                                className={`bg-white p-6 rounded-[2rem] border border-slate-100 shadow-sm relative overflow-hidden group ${admin.role === 'super_admin' ? "border-l-4 border-l-emerald-600 shadow-emerald-900/5 shadow-2xl" : ""
                                    }`}
                            >
                                {admin.role === 'super_admin' && (
                                    <div className="absolute top-0 right-0 p-2 bg-emerald-600 text-white rounded-bl-2xl">
                                        <ShieldCheck size={16} />
                                    </div>
                                )}

                                <div className="flex items-center gap-4 mb-4">
                                    <div className={`w-12 h-12 rounded-2xl flex items-center justify-center font-bold text-xl ${admin.role === 'super_admin' ? "bg-emerald-100 text-emerald-600" : "bg-blue-100 text-blue-600"
                                        }`}>
                                        {admin.name[0]}
                                    </div>
                                    <div>
                                        <h3 className="font-bold text-slate-900 truncate max-w-[150px]">{admin.name}</h3>
                                        <p className="text-[10px] font-black uppercase tracking-widest text-slate-400">{admin.role.replace('_', ' ')}</p>
                                    </div>
                                </div>

                                <div className="space-y-2 mb-6">
                                    <div className="flex items-center gap-2 text-xs text-slate-500 font-medium">
                                        <Mail size={14} className="text-slate-300" />
                                        {admin.email}
                                    </div>
                                    <div className="flex items-center gap-2 text-[10px] text-slate-400 font-bold uppercase tracking-wider">
                                        <CheckCircle2 size={12} className="text-emerald-500" />
                                        Status: {admin.status}
                                    </div>
                                </div>

                                <div className="flex items-center justify-between pt-4 border-t border-slate-50">
                                    <span className="text-[10px] text-slate-300 font-medium">Joined {new Date(admin.created_at).toLocaleDateString()}</span>
                                    <button
                                        onClick={() => handleDeleteAdmin(admin.id)}
                                        className="p-2 text-slate-300 hover:text-red-500 hover:bg-red-50 rounded-lg transition-all"
                                        title="Revoke Access"
                                    >
                                        <Trash2 size={18} />
                                    </button>
                                </div>
                            </motion.div>
                        ))}
                    </motion.div>
                )}
            </AnimatePresence>

            {loading && !showAddForm && (
                <div className="flex justify-center py-20">
                    <Loader2 className="animate-spin text-emerald-600" size={48} />
                </div>
            )}
        </div>
    );
}
