"use client";

import { useState, useEffect } from "react";
import Image from "next/image";
import { X, LogIn, Eye, EyeOff, Loader2, Mail, Lock, User, Sparkles, ShieldCheck } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { useAuth } from "../context/AuthContext";
import AnimatedButton from "./ui/AnimatedButton";
import { API_URL } from "@/lib/config";

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
      const res = await fetch(`${API_URL}${endpoint}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
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

  const handleSocialLogin = (provider: string) => {
    // Redirect to backend OAuth endpoint
    window.location.href = `${API_URL}/auth/${provider}`;
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
          <div
            className="absolute inset-0 cursor-pointer"
            onClick={onClose}
          />

          {/* Modal Content - Compact Premium UI */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 20 }}
            transition={{ duration: 0.4, type: "spring", bounce: 0.3 }}
            className="relative w-full max-w-[320px] bg-white/80 backdrop-blur-2xl rounded-[1.5rem] shadow-2xl border border-white/60 p-6 overflow-hidden"
          >
            {/* Ambient Background Gradient Glow */}
            <div className="absolute -top-20 -right-20 w-32 h-32 bg-emerald-400/20 rounded-full blur-3xl pointer-events-none" />
            <div className="absolute -bottom-20 -left-20 w-32 h-32 bg-emerald-600/10 rounded-full blur-3xl pointer-events-none" />

            <button
              onClick={onClose}
              className="absolute top-4 right-4 p-1.5 text-slate-400 hover:text-red-500 hover:bg-red-50 transition-all z-20 rounded-full"
            >
              <X size={18} />
            </button>

            {/* Header Logo - Compact Container */}
            <div className="flex justify-center mb-4">
              <motion.div
                initial={{ scale: 0.8, rotate: -5 }}
                animate={{ scale: 1, rotate: 0 }}
                transition={{ type: "spring", stiffness: 200, damping: 15 }}
                className="relative w-12 h-12 bg-gradient-to-br from-emerald-900 to-emerald-950 rounded-xl flex items-center justify-center shadow-xl shadow-emerald-900/20 border border-emerald-800/50"
              >
                <div className="relative w-7 h-7">
                  <Image
                    src="/logo_new.svg"
                    alt="Logo"
                    fill
                    className="object-contain"
                  />
                </div>
              </motion.div>
            </div>

            {/* Title & Tagline */}
            <div className="text-center mb-5">
              <h2 className="text-2xl font-display font-black text-slate-900 mb-1 tracking-tight">
                {isSignUp ? "Sign Up" : "Login"}
              </h2>
              <p className="text-slate-500 font-medium text-[11px] max-w-[200px] mx-auto leading-relaxed">
                {isSignUp
                  ? "Create your account today."
                  : "Login to access your tools."}
              </p>
            </div>

            {error && (
              <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                className="mb-4 p-2 rounded-lg bg-red-50/80 border border-red-100/50 text-red-600 text-[10px] font-bold text-center flex items-center justify-center gap-1.5 backdrop-blur-sm"
              >
                <div className="w-1 h-1 rounded-full bg-red-500 animate-pulse" />
                {error}
              </motion.div>
            )}

            <form onSubmit={handleSubmit} className="space-y-3">
              <AnimatePresence mode="popLayout">
                {isSignUp && (
                  <motion.div
                    initial={{ opacity: 0, height: 0, marginBottom: 0 }}
                    animate={{ opacity: 1, height: "auto", marginBottom: 12 }}
                    exit={{ opacity: 0, height: 0, marginBottom: 0 }}
                    className="overflow-hidden"
                  >
                    <div className="relative group">
                      <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400 group-focus-within:text-emerald-600 transition-colors">
                        <User size={16} />
                      </div>
                      <input
                        type="text"
                        placeholder="Full Name"
                        className="w-full pl-9 pr-3 py-2.5 bg-slate-50/50 border border-slate-200 rounded-lg text-slate-900 placeholder-slate-400 focus:outline-none focus:bg-white focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 transition-all text-xs font-semibold"
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
                  className="w-full pl-9 pr-3 py-2.5 bg-slate-50/50 border border-slate-200 rounded-lg text-slate-900 placeholder-slate-400 focus:outline-none focus:bg-white focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 transition-all text-xs font-semibold"
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
                  className="w-full pl-9 pr-9 py-2.5 bg-slate-50/50 border border-slate-200 rounded-lg text-slate-900 placeholder-slate-400 focus:outline-none focus:bg-white focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 transition-all text-xs font-semibold"
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
                <div className="flex justify-end">
                  <button type="button" className="text-[10px] font-bold text-slate-400 hover:text-emerald-600 transition-colors">
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
                  className="h-10 rounded-lg text-xs font-bold shadow-lg shadow-emerald-900/20 hover:shadow-emerald-900/30"
                >
                  {loading ? (
                    <div className="flex items-center justify-center gap-2">
                      <Loader2 className="w-3.5 h-3.5 animate-spin" />
                      <span>Processing...</span>
                    </div>
                  ) : (
                    <span>{isSignUp ? "Create Account" : "Login"}</span>
                  )}
                </AnimatedButton>
              </div>
            </form>

            {/* Divider */}
            <div className="relative my-5">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-slate-200"></div>
              </div>
              <div className="relative flex justify-center">
                <span className="px-3 bg-white/80 backdrop-blur-3xl text-[9px] uppercase font-bold text-slate-400 tracking-wider">
                  Or continue with
                </span>
              </div>
            </div>

            {/* Social Login - Compact */}
            <div className="mb-4">
              <button
                onClick={() => handleSocialLogin('google')}
                className="flex items-center justify-center w-full h-9 bg-white border border-slate-200 rounded-lg hover:bg-slate-50 hover:border-slate-300 transition-all shadow-sm"
                aria-label="Continue with Google"
              >
                <svg className="w-5 h-5" viewBox="0 0 24 24">
                  <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4" />
                  <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853" />
                  <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05" />
                  <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335" />
                </svg>
                <span className="ml-3 text-sm font-medium text-slate-600">Continue with Google</span>
              </button>
            </div>

            {/* Footer */}
            <div className="text-center">
              <p className="text-[10px] text-slate-500 font-medium">
                {isSignUp ? "Already have an account? " : "Don't have an account? "}
                <button
                  onClick={() => setIsSignUp(!isSignUp)}
                  className="text-emerald-700 hover:text-emerald-900 font-bold transition-colors ml-1"
                >
                  {isSignUp ? "Login" : "Sign Up"}
                </button>
              </p>
            </div>

          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
