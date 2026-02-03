"use client";

import { useState } from "react";
import Link from "next/link";
import { Menu, X } from "lucide-react";
import AuthModal from "./AuthModal";
import ProfileSettingsModal from "./ProfileSettingsModal";

export default function Navbar() {
  const [isOpen, setIsOpen] = useState(false);
  const [showAuthModal, setShowAuthModal] = useState(false);
  const [showProfileModal, setShowProfileModal] = useState(false);
  const [isLoggedIn, setIsLoggedIn] = useState(false);

  return (
    <>
      <nav className="fixed w-full bg-white shadow-md z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16">
            <div className="flex items-center">
              <Link href="/" className="text-2xl font-bold text-blue-600">
                DocuFlux
              </Link>
            </div>

            <div className="hidden md:flex items-center space-x-8">
              <Link href="/" className="text-gray-700 hover:text-blue-600">
                Home
              </Link>
              <Link href="/solutions" className="text-gray-700 hover:text-blue-600">
                Solutions
              </Link>
              <Link href="/pricing" className="text-gray-700 hover:text-blue-600">
                Pricing
              </Link>
              <Link href="/how-it-works" className="text-gray-700 hover:text-blue-600">
                How It Works
              </Link>
              {isLoggedIn ? (
                <button
                  onClick={() => setShowProfileModal(true)}
                  className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700"
                >
                  Profile
                </button>
              ) : (
                <button
                  onClick={() => setShowAuthModal(true)}
                  className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700"
                >
                  Sign In
                </button>
              )}
            </div>

            <div className="md:hidden flex items-center">
              <button onClick={() => setIsOpen(!isOpen)}>
                {isOpen ? <X size={24} /> : <Menu size={24} />}
              </button>
            </div>
          </div>
        </div>

        {isOpen && (
          <div className="md:hidden">
            <div className="px-2 pt-2 pb-3 space-y-1 sm:px-3">
              <Link href="/" className="block px-3 py-2 text-gray-700 hover:bg-gray-100">
                Home
              </Link>
              <Link href="/solutions" className="block px-3 py-2 text-gray-700 hover:bg-gray-100">
                Solutions
              </Link>
              <Link href="/pricing" className="block px-3 py-2 text-gray-700 hover:bg-gray-100">
                Pricing
              </Link>
              <Link href="/how-it-works" className="block px-3 py-2 text-gray-700 hover:bg-gray-100">
                How It Works
              </Link>
              {isLoggedIn ? (
                <button
                  onClick={() => setShowProfileModal(true)}
                  className="w-full text-left px-3 py-2 text-gray-700 hover:bg-gray-100"
                >
                  Profile
                </button>
              ) : (
                <button
                  onClick={() => setShowAuthModal(true)}
                  className="w-full text-left px-3 py-2 text-gray-700 hover:bg-gray-100"
                >
                  Sign In
                </button>
              )}
            </div>
          </div>
        )}
      </nav>

      <AuthModal
        isOpen={showAuthModal}
        onClose={() => setShowAuthModal(false)}
        onLogin={() => {
          setIsLoggedIn(true);
          setShowAuthModal(false);
        }}
      />

      <ProfileSettingsModal
        isOpen={showProfileModal}
        onClose={() => setShowProfileModal(false)}
        onLogout={() => {
          setIsLoggedIn(false);
          setShowProfileModal(false);
        }}
      />
    </>
  );
}
