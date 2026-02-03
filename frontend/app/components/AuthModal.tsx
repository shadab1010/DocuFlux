"use client";

import { useState, useEffect } from "react";
import { X, LogIn, Eye, EyeOff, Loader2, Mail, Lock, User, Sparkles, ShieldCheck } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { useAuth } from "../context/AuthContext";
import AnimatedButton from "./ui/AnimatedButton";

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
  onLogin: () => void;
  initialView?: "login" | "signup";
}

export default function AuthModal({ isOpen, onClose, onLogin, initialView = "login" }: AuthModalProps) {
  const { login: setAuthLogin } = useAuth();
  const [isSignUp, setIsSignUp] = useState(initialView === "signup");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Local state for auto-clearing
  const [formData, setFormData] = useState({
    email: "",
    password: "",
    username: "",
  });

  // Sync state with prop, and CLEAR FORM on open
  useEffect(() => {
    if (isOpen) {
      setIsSignUp(initialView === "signup");
      setError(null);
      // Logic to clear form when reopened (as requested by user)
      setFormData({
        email: "",
        password: "",
        username: "",
      });
    }
  }, [isOpen, initialView]);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    const endpoint = isSignUp ? "/signup" : "/login";
    const payload = isSignUp
      ? { email: formData.email, password: formData.password, name: formData.username }
      : { email: formData.email, password: formData.password };

    try {
      const res = await fetch(`http://localhost:5000${endpoint}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      const data = await res.json();

      if (res.ok) {
        if (data.user) {
          setAuthLogin(data.user);
        } else if (isSignUp) {
          setIsSignUp(false);
          setError("Account created! Please log in.");
          setLoading(false);
          return;
        }
        onLogin();
      } else {
        setError(data.error || "Something went wrong");
      }
    } catch (err) {
      setError("Failed to connect to server");
    } finally {
      setLoading(false);
    }
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-[100] flex items-center justify-center p-4 backdrop-blur-md bg-emerald-950/20"
        >
          {/* Backdrop */}
          <div
            className="absolute inset-0 cursor-pointer"
            onClick={onClose}
          />

          {/* Modal Content - Reduced dimensions as requested */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 20 }}
            transition={{ duration: 0.4, type: "spring", bounce: 0.3 }}
            className="relative w-full max-w-[360px] bg-white/60 backdrop-blur-2xl rounded-[1.5rem] shadow-2xl border border-white/50 p-6 overflow-hidden"
          >
            <button
              onClick={onClose}
              className="absolute top-4 right-4 p-1.5 text-slate-400 hover:text-red-500 transition-colors z-20 rounded-full hover:bg-white/50"
            >
              <X size={18} />
            </button>

            {/* Header Logo - Smaller */}
            <div className="flex justify-center mb-5">
              <motion.div
                initial={{ scale: 0.8 }}
                animate={{ scale: 1 }}
                className="relative w-12 h-12 bg-emerald-950 rounded-xl flex items-center justify-center shadow-lg shadow-emerald-900/20"
              >
                <div className="w-7 h-7 text-emerald-400">
                  <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" className="w-full h-full">
                    <path d="M12 2L15.09 8.26L22 9.27L17 14.14L18.18 21.02L12 17.77L5.82 21.02L7 14.14L2 9.27L8.91 8.26L12 2Z" fill="currentColor" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                    <path d="M12 2V17.77" stroke="white" strokeWidth="2" strokeLinecap="round" />
                  </svg>
                </div>
              </motion.div>
            </div>

            {/* Title & Tagline - Smaller Text */}
            <div className="text-center mb-5">
              <h2 className="text-2xl font-display font-black text-slate-900 mb-1 tracking-tight">
                {isSignUp ? "Join " : "Welcome "}
                <span className="text-emerald-700">Flux</span>
              </h2>
              <p className="text-slate-500 font-medium text-[11px] max-w-[200px] mx-auto leading-tight">
                {isSignUp
                  ? "Create your account to get started."
                  : "Sign in to continue your journey."}
              </p>
            </div>

            {error && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: "auto" }}
                className="mb-4 p-2 rounded-lg bg-red-50 border border-red-100 text-red-600 text-[10px] font-bold text-center"
              >
                {error}
              </motion.div>
            )}

            <form onSubmit={handleSubmit} className="space-y-3">
              <AnimatePresence mode="popLayout">
                {isSignUp && (
                  <motion.div
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: "auto" }}
                    exit={{ opacity: 0, height: 0 }}
                    className="overflow-hidden"
                  >
                    <div className="relative group">
                      <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400 group-focus-within:text-emerald-600 transition-colors">
                        <User size={16} />
                      </div>
                      <input
                        type="text"
                        placeholder="Full Name"
                        className="w-full pl-9 pr-3 py-2.5 bg-white/70 border border-slate-200/60 rounded-lg text-slate-900 placeholder-slate-400 focus:outline-none focus:bg-white focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500/30 transition-all text-xs font-bold"
                        value={formData.username}
                        onChange={(e) => setFormData({ ...formData, username: e.target.value })}
                        required={isSignUp}
                      />
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>

              <div className="relative group">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400 group-focus-within:text-emerald-600 transition-colors">
                  <Mail size={16} />
                </div>
                <input
                  type="email"
                  placeholder="Email Address"
                  className="w-full pl-9 pr-3 py-2.5 bg-white/70 border border-slate-200/60 rounded-lg text-slate-900 placeholder-slate-400 focus:outline-none focus:bg-white focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500/30 transition-all text-xs font-bold"
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  required
                />
              </div>

              <div className="relative group">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400 group-focus-within:text-emerald-600 transition-colors">
                  <Lock size={16} />
                </div>
                <input
                  type={showPassword ? "text" : "password"}
                  placeholder="Password"
                  className="w-full pl-9 pr-9 py-2.5 bg-white/70 border border-slate-200/60 rounded-lg text-slate-900 placeholder-slate-400 focus:outline-none focus:bg-white focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500/30 transition-all text-xs font-bold"
                  value={formData.password}
                  onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute inset-y-0 right-0 pr-3 flex items-center text-slate-400 hover:text-emerald-700 transition-colors"
                >
                  {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>

              {!isSignUp && (
                <div className="flex justify-end pt-0.5">
                  <button type="button" className="text-[10px] font-bold text-slate-400 hover:text-emerald-700 transition-colors">
                    Forgot Password?
                  </button>
                </div>
              )}

              <div className="pt-1">
                <AnimatedButton
                  type="submit"
                  disabled={loading}
                  variant="primary"
                  fullWidth
                  size="md"
                  className="h-10 rounded-lg text-xs font-black shadow-lg shadow-emerald-600/20"
                >
                  {loading ? (
                    <div className="flex items-center justify-center gap-2">
                      <Loader2 className="w-3.5 h-3.5 animate-spin" />
                      <span>Processing...</span>
                    </div>
                  ) : (
                    <span>{isSignUp ? "Create Account" : "Sign In"}</span>
                  )}
                </AnimatedButton>
              </div>
            </form>

            {/* Divider */}
            <div className="relative my-5">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-slate-200/60"></div>
              </div>
              <div className="relative flex justify-center">
                <span className="px-2 bg-transparent backdrop-blur-3xl text-[9px] uppercase font-bold text-slate-400">
                  Or continue with
                </span>
              </div>
            </div>

            {/* Social Login - Smaller */}
            <div className="grid grid-cols-3 gap-2 mb-4">
              <button className="flex items-center justify-center h-9 bg-white border border-slate-200 rounded-lg hover:bg-slate-50 transition-colors">
                <img src="https://www.svgrepo.com/show/475656/google-color.svg" alt="Google" className="w-4 h-4" />
              </button>
              <button className="flex items-center justify-center h-9 bg-white border border-slate-200 rounded-lg hover:bg-slate-50 transition-colors">
                <img src="https://www.svgrepo.com/show/475647/facebook-color.svg" alt="Facebook" className="w-4 h-4" />
              </button>
              <button className="flex items-center justify-center h-9 bg-white border border-slate-200 rounded-lg hover:bg-slate-50 transition-colors">
                <img src="https://www.svgrepo.com/show/475641/apple-color.svg" alt="Apple" className="w-4 h-4" />
              </button>
            </div>

            {/* Footer */}
            <div className="text-center pt-2 border-t border-slate-200/40">
              <p className="text-[10px] text-slate-500 font-medium">
                {isSignUp ? "Already have an account? " : "Don't have an account? "}
                <button
                  onClick={() => setIsSignUp(!isSignUp)}
                  className="text-emerald-700 hover:text-emerald-900 font-bold transition-colors"
                >
                  {isSignUp ? "Sign In" : "Sign Up"}
                </button>
              </p>
            </div>

          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
