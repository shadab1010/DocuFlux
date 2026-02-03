"use client";

import { useState } from "react";
import { User, Shield, AlertTriangle, LogOut, Loader2, CheckCircle2, ChevronRight, Sparkles } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { useAuth } from "../context/AuthContext";
import { API_URL } from "@/lib/config";

interface ProfileSettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
  onLogout: () => void;
  mode?: "modal" | "popover";
}

type Tab = "general" | "security" | "danger";

export default function ProfileSettingsModal({
  isOpen,
  onClose,
  onLogout,
  mode = "modal",
}: ProfileSettingsModalProps) {
  const { user, login } = useAuth();
  const [activeTab, setActiveTab] = useState<Tab>("general");
  const [isLoading, setIsLoading] = useState(false);
  const [message, setMessage] = useState<{ type: "success" | "error"; text: string } | null>(null);

  // Form States
  const [name, setName] = useState(user?.name || "");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [deletePassword, setDeletePassword] = useState("");

  if (!isOpen) return null;

  const handleUpdateProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setMessage(null);

    try {
      if (activeTab === "security" && password !== confirmPassword) {
        throw new Error("Passwords do not match");
      }

      const payload = {
        name: activeTab === "general" ? name : user?.name,
        password: activeTab === "security" ? password : null,
      };

      const res = await fetch(`${API_URL}/update-profile`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify(payload),
      });

      const data = await res.json();

      if (res.ok) {
        setMessage({ type: "success", text: "Saved!" });
        if (user) login({ ...user, name: activeTab === "general" ? name : user.name });
        setPassword("");
        setConfirmPassword("");
      } else {
        throw new Error(data.error || "Failed");
      }
    } catch (error) {
      setMessage({ type: "error", text: error instanceof Error ? error.message : "Error" });
    } finally {
      setIsLoading(false);
    }
  };

  const handleDeleteAccount = async () => {
    if (!deletePassword) return;
    setIsLoading(true);
    setMessage(null);

    try {
      const res = await fetch(`${API_URL}/delete-account`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ password: deletePassword }),
      });

      const data = await res.json();

      if (res.ok) {
        onLogout();
      } else {
        throw new Error(data.error || "Failed");
      }
    } catch (error) {
      setMessage({ type: "error", text: error instanceof Error ? error.message : "Error" });
    } finally {
      setIsLoading(false);
    }
  };

  const tabs = [
    { id: "general", label: "Profile", icon: User },
    { id: "security", label: "Security", icon: Shield },
    { id: "danger", label: "Danger", icon: AlertTriangle },
  ];

  // Dynamic Styles - Refined for "smaller" and "more right"
  const containerClasses = mode === "modal"
    ? "fixed inset-0 z-[100] flex items-center justify-center p-4 bg-emerald-950/20 backdrop-blur-md"
    : "absolute top-full -right-4 mt-2 z-50 w-[320px]"; // Adjusted right position and width

  const cardClasses = mode === "modal"
    ? "bg-white/80 backdrop-blur-3xl w-full max-w-[320px] rounded-[2rem] shadow-[0_20px_50px_-12px_rgba(0,0,0,0.15)] border border-white/60 overflow-hidden"
    : "bg-white/85 backdrop-blur-2xl w-full rounded-[2rem] shadow-[0_30px_60px_-15px_rgba(6,78,59,0.25)] border border-white/60 overflow-hidden ring-1 ring-emerald-500/10";

  return (
    <div className={containerClasses}>
      {/* Backdrop for click outside (Invisible in popover mode, but captures clicks) */}
      <div className="fixed inset-0 -z-10 cursor-default" onClick={onClose} />

      <motion.div
        initial={{ opacity: 0, scale: 0.9, y: 10, filter: "blur(8px)" }}
        animate={{ opacity: 1, scale: 1, y: 0, filter: "blur(0px)" }}
        exit={{ opacity: 0, scale: 0.9, y: 10, filter: "blur(8px)" }}
        transition={{ type: "spring", stiffness: 400, damping: 20 }}
        className={cardClasses}
      >
        {/* Decorative elements */}
        <div className="absolute top-0 right-0 w-48 h-48 bg-emerald-400/15 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2 pointer-events-none" />

        {/* Header */}
        <div className="relative px-6 pt-6 pb-4">
          <div className="flex items-start justify-between mb-2">
            <div>
              <div className="flex items-center gap-1.5 mb-1">
                <span className="inline-flex items-center justify-center w-4 h-4 rounded-full bg-emerald-100 text-emerald-600">
                  <Sparkles size={8} fill="currentColor" />
                </span>
                <span className="text-[9px] font-black tracking-widest text-emerald-600 uppercase">Account Settings</span>
              </div>
              <h3 className="text-lg font-display font-bold text-slate-900 tracking-tight">
                Hello, <span className="text-emerald-700 italic font-serif">{user?.name}</span>
              </h3>
            </div>
          </div>

          <div className="flex gap-1.5">
            {tabs.map((tab) => (
              <button
                key={tab.id}
                onClick={() => { setActiveTab(tab.id as Tab); setMessage(null); }}
                className={`relative px-3 py-1.5 rounded-full text-[10px] font-bold transition-all duration-300 ${activeTab === tab.id
                  ? "text-emerald-950 shadow-sm"
                  : "text-slate-400 hover:text-slate-600 hover:bg-white/40"
                  }`}
              >
                {activeTab === tab.id && (
                  <motion.div
                    layoutId="activeTab"
                    className="absolute inset-0 bg-white rounded-full"
                    transition={{ type: "spring", bounce: 0.2, duration: 0.6 }}
                  />
                )}
                <span className="relative z-10 flex items-center gap-1">
                  <tab.icon size={10} strokeWidth={2.5} />
                  {tab.label}
                </span>
              </button>
            ))}
          </div>
        </div>

        {/* Divider */}
        <div className="h-px w-full bg-gradient-to-r from-transparent via-emerald-900/5 to-transparent" />

        {/* Content */}
        <div className="p-6 min-h-[280px] relative bg-white/30">
          <AnimatePresence mode="wait">
            <motion.div
              key={activeTab}
              initial={{ opacity: 0, x: 15 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -15 }}
              transition={{ duration: 0.2, ease: "easeOut" }}
            >
              {activeTab === "general" && (
                <form onSubmit={handleUpdateProfile} className="space-y-4">
                  <div className="space-y-1.5">
                    <label className="text-[9px] font-black text-slate-400 uppercase tracking-widest ml-1">Display Name</label>
                    <div className="group relative">
                      <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-300 group-focus-within:text-emerald-500 transition-colors">
                        <User size={14} />
                      </div>
                      <input
                        type="text"
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                        className="w-full pl-9 pr-3 py-2.5 bg-white/60 border border-slate-200/60 rounded-xl text-slate-800 placeholder-slate-400 focus:outline-none focus:bg-white focus:ring-4 focus:ring-emerald-500/10 focus:border-emerald-500/30 transition-all font-bold text-xs shadow-sm"
                      />
                    </div>
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-[9px] font-black text-slate-400 uppercase tracking-widest ml-1">Email Identifier</label>
                    <div className="relative opacity-80">
                      <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
                        <User size={14} />
                      </div>
                      <input
                        type="text"
                        value={user?.email || ""}
                        disabled
                        className="w-full pl-9 pr-3 py-2.5 bg-slate-50/50 border border-slate-200/50 rounded-xl text-slate-600 font-semibold text-xs cursor-default"
                      />
                    </div>
                    <p className="text-[9px] text-slate-400 px-1 italic">Email cannot be changed.</p>
                  </div>
                  <div className="pt-2">
                    <button
                      type="submit"
                      disabled={isLoading}
                      className="w-full bg-slate-900 hover:bg-slate-800 text-white font-bold py-3 rounded-xl text-xs shadow-lg shadow-slate-900/10 hover:shadow-xl hover:shadow-slate-900/20 hover:-translate-y-0.5 transition-all duration-300 flex items-center justify-center gap-2 group"
                    >
                      {isLoading ? <Loader2 className="animate-spin" size={14} /> : (
                        <>
                          <span>Save Changes</span>
                          <ChevronRight size={12} className="opacity-50 group-hover:translate-x-1 transition-transform" />
                        </>
                      )}
                    </button>
                  </div>
                </form>
              )}

              {activeTab === "security" && (
                <form onSubmit={handleUpdateProfile} className="space-y-4">
                  <div className="space-y-1.5">
                    <label className="text-[9px] font-black text-slate-400 uppercase tracking-widest ml-1">New Password</label>
                    <input
                      type="password"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      placeholder="••••••••••••"
                      className="w-full px-4 py-2.5 bg-white/60 border border-slate-200/60 rounded-xl text-slate-800 placeholder-slate-300 focus:outline-none focus:bg-white focus:ring-4 focus:ring-emerald-500/10 focus:border-emerald-500/30 transition-all font-bold text-xs shadow-sm tracking-widest"
                    />
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-[9px] font-black text-slate-400 uppercase tracking-widest ml-1">Confirm Password</label>
                    <input
                      type="password"
                      value={confirmPassword}
                      onChange={(e) => setConfirmPassword(e.target.value)}
                      placeholder="••••••••••••"
                      className="w-full px-4 py-2.5 bg-white/60 border border-slate-200/60 rounded-xl text-slate-800 placeholder-slate-300 focus:outline-none focus:bg-white focus:ring-4 focus:ring-emerald-500/10 focus:border-emerald-500/30 transition-all font-bold text-xs shadow-sm tracking-widest"
                    />
                  </div>
                  <div className="pt-2">
                    <button
                      type="submit"
                      disabled={isLoading || !password}
                      className="w-full bg-emerald-600 hover:bg-emerald-500 text-white font-bold py-3 rounded-xl text-xs shadow-lg shadow-emerald-600/10 hover:shadow-xl hover:shadow-emerald-600/20 hover:-translate-y-0.5 transition-all duration-300 flex items-center justify-center gap-2 group"
                    >
                      {isLoading ? <Loader2 className="animate-spin" size={14} /> : (
                        <>
                          <span>Update Security</span>
                          <Shield size={12} className="opacity-50" />
                        </>
                      )}
                    </button>
                  </div>
                </form>
              )}

              {activeTab === "danger" && (
                <div className="space-y-5">
                  <div className="p-3 bg-rose-50/80 border border-rose-100 rounded-xl flex gap-2.5 shadow-inner">
                    <div className="w-6 h-6 rounded-full bg-rose-100 flex items-center justify-center shrink-0">
                      <AlertTriangle className="text-rose-500" size={12} strokeWidth={2.5} />
                    </div>
                    <div>
                      <h4 className="text-xs font-bold text-rose-800 mb-0.5">Permanent Effect</h4>
                      <p className="text-[10px] text-rose-600/80 leading-relaxed font-medium">
                        Deleting your account is irreversible. All data will be lost.
                      </p>
                    </div>
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-[9px] font-black text-rose-300 uppercase tracking-widest ml-1">Confirm Identity</label>
                    <input
                      type="password"
                      value={deletePassword}
                      onChange={(e) => setDeletePassword(e.target.value)}
                      placeholder="Enter password to confirm"
                      className="w-full px-4 py-2.5 bg-white/60 border border-rose-100 rounded-xl text-rose-900 placeholder-rose-200 focus:outline-none focus:bg-white focus:ring-4 focus:ring-rose-500/10 focus:border-rose-300 transition-all font-bold text-xs shadow-sm"
                    />
                  </div>

                  <button
                    onClick={handleDeleteAccount}
                    disabled={isLoading || !deletePassword}
                    className="w-full mt-1 bg-white border-2 border-rose-50 hover:border-rose-100 text-rose-500 hover:text-rose-600 font-bold py-3 rounded-xl hover:bg-rose-50/50 text-xs flex items-center justify-center gap-2 transition-all duration-300"
                  >
                    {isLoading ? <Loader2 className="animate-spin" size={14} /> : "Delete Account Permanently"}
                  </button>
                </div>
              )}
            </motion.div>
          </AnimatePresence>

          {/* Messages */}
          <AnimatePresence>
            {message && (
              <motion.div
                initial={{ opacity: 0, y: 10, scale: 0.9 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, y: 10, scale: 0.9 }}
                className={`absolute bottom-3 left-4 right-4 p-2.5 rounded-xl text-[10px] font-bold flex items-center justify-center gap-2 shadow-sm backdrop-blur-md ${message.type === 'success' ? 'text-emerald-700 bg-emerald-50/90 border border-emerald-100' : 'text-rose-700 bg-rose-50/90 border border-rose-100'}`}
              >
                {message.type === 'success' ? <CheckCircle2 size={12} /> : <AlertTriangle size={12} />}
                {message.text}
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* Footer */}
        <div className="bg-slate-50/50 p-2 flex justify-center border-t border-slate-100/50">
          <button
            onClick={onLogout}
            className="text-[9px] font-black text-slate-400 hover:text-rose-500 uppercase tracking-widest py-1.5 px-4 rounded-lg hover:bg-rose-50 transition-colors flex items-center gap-1.5"
          >
            <LogOut size={10} />
            Sign Out
          </button>
        </div>

      </motion.div>
    </div>
  );
}
