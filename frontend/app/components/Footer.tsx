"use client";

import Link from "next/link";
import Image from "next/image";

export default function Footer() {
  return (
    <footer className="bg-white pt-16 pb-8 border-t border-gray-100">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-12 lg:gap-8 mb-16">
          {/* Brand Column */}
          <div className="space-y-6">
            <Link href="/" className="inline-block">
              <div className="flex items-center gap-0">
                <div className="relative w-[48px] h-[48px] rounded-lg overflow-hidden">
                  <Image
                    src="/logo_new.svg"
                    alt="DocuFlux Logo"
                    fill
                    className="object-contain"
                  />
                </div>
                <span className="text-xl font-bold text-gray-900">DocuFlux</span>
              </div>
            </Link>
            <p className="text-gray-500 leading-relaxed text-sm">
              Professional PDF tools made simple. Convert, edit, and secure your documents with enterprise-grade precision.
            </p>
            <div className="flex items-center gap-4">
              <SocialLink href="https://www.facebook.com/shabab.alam.16121" icon={<FacebookIcon />} />
              <SocialLink href="https://www.instagram.com/shadab_iraqe/" icon={<InstagramIcon />} />
              <SocialLink href="https://www.linkedin.com/in/itsshadab/" icon={<LinkedinIcon />} />
            </div>
          </div>

          {/* Quick Links */}
          <div>
            <h3 className="text-gray-900 font-bold mb-6">Quick Links</h3>
            <ul className="space-y-4">
              <FooterLink href="/#hero">Home</FooterLink>
              <FooterLink href="/#services">All Tools</FooterLink>
              <FooterLink href="/solutions">Solutions</FooterLink>
              <FooterLink href="/#about">About Us</FooterLink>
              <FooterLink href="/#contact">Contact</FooterLink>
            </ul>
          </div>

          <div>
            <Link href="/solutions">
              <h3 className="text-gray-900 font-bold mb-6 hover:text-emerald-600 transition-colors cursor-pointer">Solutions</h3>
            </Link>
            <ul className="space-y-4">
              <FooterLink href="/solutions#business">Business</FooterLink>
              <FooterLink href="/solutions#education">Education</FooterLink>
              <FooterLink href="/#how-it-works">How it Works</FooterLink>
              <FooterLink href="/solutions#pricing">Pricing</FooterLink>
            </ul>
          </div>

          {/* Newsletter */}
          <div>
            <h3 className="text-gray-900 font-bold mb-6">Stay Updated</h3>
            <p className="text-gray-500 text-sm mb-4">
              Subscribe to our newsletter for the latest updates.
            </p>
            <form className="flex gap-2">
              <input
                type="email"
                placeholder="Email address"
                className="flex-1 bg-gray-50 border border-gray-200 rounded-lg px-4 py-2.5 text-sm text-gray-900 placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 transition-all"
              />
              <button
                type="submit"
                className="bg-emerald-900 hover:bg-emerald-800 text-white px-5 py-2.5 rounded-lg text-sm font-medium transition-colors"
              >
                Join
              </button>
            </form>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="pt-8 border-t border-gray-100 flex flex-col md:flex-row justify-between items-center gap-4">
          <p className="text-gray-400 text-sm">
            &copy; {new Date().getFullYear()} DocuFlux. All rights reserved.
          </p>
          <div className="flex flex-wrap justify-center gap-8">
            <Link href="/privacy" className="text-gray-400 hover:text-emerald-600 text-sm transition-colors">
              Privacy Policy
            </Link>
            <Link href="/terms" className="text-gray-400 hover:text-emerald-600 text-sm transition-colors">
              Terms of Service
            </Link>
            <Link href="/cookies" className="text-gray-400 hover:text-emerald-600 text-sm transition-colors">
              Cookies
            </Link>
          </div>
          <p className="text-gray-400 text-sm flex items-center gap-1">
            Made with <span className="text-red-500">♥</span> by DocuFlux Team
          </p>
        </div>
      </div>
    </footer>
  );
}

function FooterLink({ href, children }: { href: string; children: React.ReactNode }) {
  return (
    <li>
      <Link href={href} className="text-gray-500 hover:text-emerald-600 text-sm transition-colors block">
        {children}
      </Link>
    </li>
  );
}

function SocialLink({ href, icon }: { href: string; icon: React.ReactNode }) {
  return (
    <a
      href={href}
      target="_blank"
      rel="noopener noreferrer"
      className="w-8 h-8 flex items-center justify-center rounded-full bg-gray-50 text-gray-400 hover:bg-emerald-50 hover:text-emerald-600 transition-all"
    >
      {icon}
    </a>
  );
}

function FacebookIcon() {
  return (
    <svg
      width="18"
      height="18"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M18 2h-3a5 5 0 0 0-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 0 1 1-1h3z" />
    </svg>
  );
}

function TwitterIcon() {
  return (
    <svg
      width="18"
      height="18"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M22 4s-.7 2.1-2 3.4c1.6 10-9.4 17.3-18 11.6 2.2.1 4.4-.6 6-2C3 15.5.5 9.6 3 5c2.2 2.6 5.6 4.1 9 4-.9-4.2 4-6.6 7-3.8 1.1 0 3-1.2 3-1.2z" />
    </svg>
  );
}

function InstagramIcon() {
  return (
    <svg
      width="18"
      height="18"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <rect x="2" y="2" width="20" height="20" rx="5" ry="5" />
      <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z" />
      <line x1="17.5" y1="6.5" x2="17.51" y2="6.5" />
    </svg>
  );
}

function LinkedinIcon() {
  return (
    <svg
      width="18"
      height="18"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M16 8a6 6 0 0 1 6 6v7h-4v-7a2 2 0 0 0-2-2 2 2 0 0 0-2 2v7h-4v-7a6 6 0 0 1 6-6z" />
      <rect x="2" y="9" width="4" height="12" />
      <circle cx="4" cy="4" r="2" />
    </svg>
  );
}
