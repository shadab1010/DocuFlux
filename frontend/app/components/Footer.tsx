"use client";

import Link from "next/link";

export default function Footer() {
  return (
    <footer className="bg-gray-900 text-white py-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          <div>
            <h3 className="text-2xl font-bold mb-4">DocuFlux</h3>
            <p className="text-gray-400">
              Professional PDF tools made simple and accessible for everyone.
            </p>
          </div>

          <div>
            <h4 className="font-semibold mb-4">Tools</h4>
            <ul className="space-y-2 text-gray-400">
              <li><Link href="/tools/pdf-to-word" className="hover:text-white">PDF to Word</Link></li>
              <li><Link href="/tools/merge" className="hover:text-white">Merge PDF</Link></li>
              <li><Link href="/tools/split" className="hover:text-white">Split PDF</Link></li>
              <li><Link href="/tools/compress" className="hover:text-white">Compress PDF</Link></li>
            </ul>
          </div>

          <div>
            <h4 className="font-semibold mb-4">Company</h4>
            <ul className="space-y-2 text-gray-400">
              <li><Link href="/solutions" className="hover:text-white">Solutions</Link></li>
              <li><Link href="/pricing" className="hover:text-white">Pricing</Link></li>
              <li><Link href="/how-it-works" className="hover:text-white">How It Works</Link></li>
            </ul>
          </div>

          <div>
            <h4 className="font-semibold mb-4">Legal</h4>
            <ul className="space-y-2 text-gray-400">
              <li><Link href="/privacy" className="hover:text-white">Privacy Policy</Link></li>
              <li><Link href="/terms" className="hover:text-white">Terms of Service</Link></li>
            </ul>
          </div>
        </div>

        <div className="border-t border-gray-800 mt-8 pt-8 text-center text-gray-400">
          <p>&copy; 2026 DocuFlux. All rights reserved.</p>
        </div>
      </div>
    </footer>
  );
}
