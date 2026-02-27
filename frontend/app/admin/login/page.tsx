"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { API_URL } from "@/lib/config";
import { useAuth } from "@/app/context/AuthContext";
import { Shield, Lock, Mail, ArrowRight, Loader2, AlertCircle } from "lucide-react";
import { motion } from "framer-motion";

export default function AdminLogin() {
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [error, setError] = useState("");
    const [loading, setLoading] = useState(false);
    const { user, login, isLoggedIn, isLoading } = useAuth();
    const router = useRouter();

    useEffect(() => {
        if (!isLoading && isLoggedIn && (user?.role === "admin" || user?.role === "super_admin")) {
            router.push("/admin");
        }
    }, [isLoading, isLoggedIn, user, router]);

    const handleLogin = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setError("");

        try {
            const res = await fetch(`${API_URL}/login`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ email, password }),
                credentials: "include"
            });
            const data = await res.json();

            if (data.success) {
                // Double check if user is admin
                const meRes = await fetch(`${API_URL}/me`, { credentials: "include" });
                const meData = await meRes.json();

                if (meData.authenticated && (meData.user.role === "admin" || meData.user.role === "super_admin")) {
                    login(meData.user);
                    router.push("/admin");
                } else {
                    setError("Access denied. Admin privileges required.");
                }
            } else {
                setError(data.error || "Invalid credentials");
            }
        } catch (err) {
            setError("An unexpected error occurred");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-[#022c22] flex items-center justify-center p-6">
            <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                className="max-w-md w-full"
            >
                <div className="bg-white rounded-[2rem] shadow-2xl overflow-hidden p-10 space-y-8">
                    <div className="text-center space-y-2">
                        <div className="w-16 h-16 bg-emerald-100 text-emerald-600 rounded-2xl flex items-center justify-center mx-auto mb-6">
                            <Shield size={32} />
                        </div>
                        <h1 className="text-2xl font-black text-slate-900 tracking-tight">Admin Portal</h1>
                        <p className="text-slate-400 text-sm font-medium">DocuFlux Infrastructure Management</p>
                    </div>

                    <form onSubmit={handleLogin} className="space-y-4">
                        {error && (
                            <motion.div
                                initial={{ opacity: 0, y: -10 }}
                                animate={{ opacity: 1, y: 0 }}
                                className="p-4 bg-red-50 rounded-xl flex items-center gap-3 text-red-600 text-sm font-bold border border-red-100"
                            >
                                <AlertCircle size={18} />
                                {error}
                            </motion.div>
                        )}

                        <div className="space-y-2 text-left">
                            <label className="text-xs font-black text-slate-400 uppercase tracking-widest ml-1">Admin Email</label>
                            <div className="relative">
                                <Mail className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                                <input
                                    type="email"
                                    value={email}
                                    onChange={(e) => setEmail(e.target.value)}
                                    className="w-full pl-12 pr-4 py-4 bg-slate-50 border border-slate-100 rounded-2xl outline-none focus:ring-2 focus:ring-emerald-500/20 text-slate-900 font-medium transition-all"
                                    placeholder="admin@docuflux.in"
                                    required
                                />
                            </div>
                        </div>

                        <div className="space-y-2 text-left">
                            <label className="text-xs font-black text-slate-400 uppercase tracking-widest ml-1">Secret Key</label>
                            <div className="relative">
                                <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                                <input
                                    type="password"
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                    className="w-full pl-12 pr-4 py-4 bg-slate-50 border border-slate-100 rounded-2xl outline-none focus:ring-2 focus:ring-emerald-500/20 text-slate-900 font-medium transition-all"
                                    placeholder="••••••••"
                                    required
                                />
                            </div>
                        </div>

                        <button
                            type="submit"
                            disabled={loading}
                            className="w-full py-4 bg-emerald-600 text-white rounded-2xl font-black text-sm uppercase tracking-widest hover:bg-emerald-700 shadow-xl shadow-emerald-900/20 transition-all flex items-center justify-center gap-2 group active:scale-95 disabled:opacity-70"
                        >
                            {loading ? <Loader2 className="animate-spin" size={20} /> : (
                                <>
                                    Authenticate Access
                                    <ArrowRight size={18} className="transition-transform group-hover:translate-x-1" />
                                </>
                            )}
                        </button>
                    </form>

                    <p className="text-center text-slate-400 text-xs pt-4">
                        Forgot credentials? Contact senior infrastructure lead.
                    </p>
                </div>
            </motion.div>
        </div>
    );
}
