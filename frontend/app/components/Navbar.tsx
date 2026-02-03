"use client";

import Link from "next/link";
import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Menu, X, User } from "lucide-react";
import AuthModal from "./AuthModal";
import ProfileSettingsModal from "./ProfileSettingsModal";
import AnimatedButton from "./ui/AnimatedButton";
import { useAuth } from "../context/AuthContext";

export default function Navbar() {
  const { isLoggedIn, user, logout: authLogout } = useAuth();
  const [isOpen, setIsOpen] = useState(false);
  const [showAuthModal, setShowAuthModal] = useState(false);
  const [authView, setAuthView] = useState<"login" | "signup">("login");

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
    { name: "Tools", href: "/tools" },
    { name: "Pricing", href: "/pricing" },
    { name: "About", href: "/about" },
    { name: "Contact", href: "/contact" },
  ];

  const handleLogout = async () => {
    try {
      await fetch("http://localhost:5000/logout", { method: "POST", credentials: "include" });
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
            <div className="flex items-center gap-2">
              <Link href="/" className="flex items-center gap-2 group">
                <div className="w-8 h-8 text-emerald-800">
                  <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" className="w-full h-full">
                    <path d="M12 2L15.09 8.26L22 9.27L17 14.14L18.18 21.02L12 17.77L5.82 21.02L7 14.14L2 9.27L8.91 8.26L12 2Z" fill="currentColor" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-emerald-600" />
                    <path d="M12 2V17.77" stroke="white" strokeWidth="2" strokeLinecap="round" />
                  </svg>
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
          <div className="lg:hidden absolute top-full left-0 w-full glass border-t border-gray-100 shadow-xl">
            <div className="px-6 py-6 space-y-4">
              {navLinks.map((link) => (
                <Link
                  key={link.name}
                  href={link.href}
                  className="block text-lg font-medium text-gray-600 hover:text-emerald-700"
                  onClick={() => setIsOpen(false)}
                >
                  {link.name}
                </Link>
              ))}
              <hr className="border-gray-100 my-4" />
              <div className="flex flex-col gap-3">
                {isLoggedIn ? (
                  <button
                    onClick={() => {
                      setShowMobileProfile(true);
                      setIsOpen(false);
                    }}
                    className="w-full py-3 rounded-xl border border-emerald-600 text-emerald-700 font-bold text-center"
                  >
                    My Account
                  </button>
                ) : (
                  <>
                    <button
                      onClick={() => {
                        setAuthView("login");
                        setShowAuthModal(true);
                        setIsOpen(false);
                      }}
                      className="w-full py-3 rounded-xl border border-emerald-600 text-emerald-700 font-bold text-center"
                    >
                      Login
                    </button>
                    <button
                      onClick={() => {
                        setAuthView("signup");
                        setShowAuthModal(true);
                        setIsOpen(false);
                      }}
                      className="w-full py-3 rounded-xl bg-emerald-900 text-white font-bold text-center"
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
        onClose={() => setShowAuthModal(false)}
        onLogin={() => {
          setShowAuthModal(false);
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
