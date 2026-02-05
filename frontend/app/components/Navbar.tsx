"use client";

import Link from "next/link";
import Image from "next/image";
import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Menu, X, User } from "lucide-react";
import AuthModal from "./AuthModal";
import ProfileSettingsModal from "./ProfileSettingsModal";
import AnimatedButton from "./ui/AnimatedButton";
import { useAuth } from "../context/AuthContext";
import { API_URL } from "@/lib/config";

export default function Navbar() {
  const { isLoggedIn, user, logout: authLogout, isLoading, hasSeenModal, markModalSeen } = useAuth();
  const [isOpen, setIsOpen] = useState(false);
  const [showAuthModal, setShowAuthModal] = useState(false);
  const [authView, setAuthView] = useState<"login" | "signup">("login");

  // Show signup modal on first visit/refresh if not logged in
  useEffect(() => {
    // Only show if:
    // 1. Loading is done
    // 2. User is NOT logged in
    // 3. User hasn't seen the modal yet (in this session/refresh)
    if (!isLoading && !isLoggedIn && !hasSeenModal) {
      setAuthView("signup");
      setShowAuthModal(true);
      markModalSeen();
    }
  }, [isLoading, isLoggedIn, hasSeenModal, markModalSeen]);

  // Separate states for Desktop Popover and Mobile Modal
  const [showDesktopProfile, setShowDesktopProfile] = useState(false);
  const [showMobileProfile, setShowMobileProfile] = useState(false);



  const [scrolled, setScrolled] = useState(false);

  // Handle scroll effect
  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 20);
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const navLinks = [
    { name: "Home", href: "/" },
    { name: "Tools", href: "/#services" },
    { name: "Pricing", href: "/pricing" },
    { name: "About", href: "/about" },
    { name: "Contact", href: "/contact" },
  ];

  const handleLogout = async () => {
    try {
      await fetch(`${API_URL}/logout`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include"
      });
      authLogout();
      setShowDesktopProfile(false);
      setShowMobileProfile(false);
    } catch (error) {
      console.error("Logout failed:", error);
    }
  };

  return (
    <>
      <nav
        className={`fixed w-full z-50 transition-all duration-300 ${scrolled ? "glass shadow-sm py-4" : "bg-transparent py-6"
          }`}
      >
        <div className="max-w-[1400px] mx-auto px-6 lg:px-12">
          <div className="flex justify-between items-center">
            {/* Logo */}
            <div className="flex items-center gap-0">
              <Link href="/" className="flex items-center gap-0 group">
                <div className="relative w-[48px] h-[48px]">
                  <Image
                    src="/logo_new.svg"
                    alt="DocuFlux Logo"
                    fill
                    className="object-contain"
                  />
                </div>
                <span className="text-2xl font-bold text-gray-900 font-display tracking-tight">
                  DocuFlux
                </span>
              </Link>
            </div>

            {/* Desktop Navigation */}
            <div className="hidden lg:flex items-center space-x-10">
              {navLinks.map((link, index) => (
                <motion.div
                  key={link.name}
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.5, delay: 0.1 * index, ease: "easeOut" }}
                >
                  <Link
                    href={link.href}
                    className="text-gray-600 hover:text-emerald-700 font-medium text-sm transition-all hover:scale-105 inline-block"
                  >
                    {link.name}
                  </Link>
                </motion.div>
              ))}
            </div>

            {/* Auth Buttons */}
            <div className="hidden lg:flex items-center gap-4 relative">
              {isLoggedIn ? (
                <>
                  <AnimatedButton
                    onClick={() => setShowDesktopProfile(!showDesktopProfile)}
                    variant="outline"
                    size="sm"
                    className="rounded-full"
                  >
                    <User size={16} className="mr-2" />
                    {user?.name || "My Account"}
                  </AnimatedButton>

                  {/* Desktop Popover */}
                  <ProfileSettingsModal
                    isOpen={showDesktopProfile}
                    onClose={() => setShowDesktopProfile(false)}
                    onLogout={handleLogout}
                    mode="popover"
                  />
                </>
              ) : (
                <>
                  <AnimatedButton
                    onClick={() => {
                      setAuthView("login");
                      setShowAuthModal(true);
                      markModalSeen();
                    }}
                    variant="outline"
                    size="sm"
                    className="rounded-full border-emerald-700 text-emerald-800 hover:bg-emerald-50"
                  >
                    <User size={16} className="mr-2" />
                    Login
                  </AnimatedButton>
                  <AnimatedButton
                    onClick={() => {
                      setAuthView("signup");
                      setShowAuthModal(true);
                      markModalSeen();
                    }}
                    variant="primary"
                    size="sm"
                    className="rounded-full shadow-lg shadow-emerald-900/10"
                  >
                    Sign Up
                  </AnimatedButton>
                </>
              )}
            </div>

            {/* Mobile Menu Button */}
            <div className="lg:hidden flex items-center">
              <button
                onClick={() => setIsOpen(!isOpen)}
                className="text-gray-600 hover:text-emerald-700 p-2"
              >
                {isOpen ? <X size={24} /> : <Menu size={24} />}
              </button>
            </div>
          </div>
        </div>

        {/* Mobile Menu */}
        {isOpen && (
          <div className="lg:hidden absolute top-full left-0 w-full bg-[#FFFCF5] border-t border-gray-200 shadow-xl animate-in slide-in-from-top-2 duration-200">
            <div className="px-6 py-6 space-y-4 max-h-[80vh] overflow-y-auto">
              <div className="flex flex-col space-y-2">
                {navLinks.map((link) => (
                  <Link
                    key={link.name}
                    href={link.href}
                    className="block text-lg font-medium text-slate-800 hover:text-emerald-700 hover:bg-emerald-50 rounded-lg px-4 py-3 transition-colors"
                    onClick={() => setIsOpen(false)}
                  >
                    {link.name}
                  </Link>
                ))}
              </div>
              <hr className="border-gray-200" />
              <div className="flex flex-col gap-3 pb-6">
                {isLoggedIn ? (
                  <button
                    onClick={() => {
                      setShowMobileProfile(true);
                      setIsOpen(false);
                    }}
                    className="w-full py-3 rounded-xl border border-emerald-600 text-emerald-700 font-bold text-center active:scale-95 transition-transform"
                  >
                    My Account
                  </button>
                ) : (
                  <>
                    <button
                      onClick={() => {
                        setAuthView("login");
                        setShowAuthModal(true);
                        markModalSeen();
                        setIsOpen(false);
                      }}
                      className="w-full py-3 rounded-xl border border-emerald-600 text-emerald-700 font-bold text-center active:scale-95 transition-transform"
                    >
                      Login
                    </button>
                    <button
                      onClick={() => {
                        setAuthView("signup");
                        setShowAuthModal(true);
                        markModalSeen();
                        setIsOpen(false);
                      }}
                      className="w-full py-3 rounded-xl bg-emerald-700 text-white font-bold text-center shadow-lg shadow-emerald-900/10 active:scale-95 transition-transform"
                    >
                      Sign Up
                    </button>
                  </>
                )}
              </div>
            </div>
          </div>
        )}
      </nav>

      <AuthModal
        isOpen={showAuthModal}
        onClose={() => {
          setShowAuthModal(false);
          markModalSeen();
        }}
        onLogin={() => {
          setShowAuthModal(false);
          markModalSeen();
        }}
        initialView={authView}
      />

      <ProfileSettingsModal
        isOpen={showMobileProfile}
        onClose={() => setShowMobileProfile(false)}
        onLogout={handleLogout}
        mode="modal"
      />
    </>
  );
}
