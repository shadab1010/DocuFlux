import Link from "next/link";
import { Home, Info, Mail, DollarSign, BookOpen, Zap, Lock, FileText, MapPin } from "lucide-react";

export default function Sitemap() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 py-16 px-4">
      <div className="max-w-4xl mx-auto">
        <div className="text-center mb-16">
          <h1 className="text-4xl md:text-5xl font-bold text-gray-900 mb-4">Sitemap</h1>
          <p className="text-gray-600 text-lg">Navigate through all pages and tools on DocuFlux</p>
        </div>

        <div className="bg-white rounded-2xl shadow-lg p-8 space-y-8">
          {/* Main Pages */}
          <section>
            <h2 className="text-2xl font-bold text-gray-900 mb-4 flex items-center gap-2">
              <Home className="w-6 h-6 text-emerald-600" />
              Main Pages
            </h2>
            <ul className="grid md:grid-cols-2 gap-3">
              <li><Link href="/" className="text-emerald-600 hover:underline">Home</Link></li>
              <li><Link href="/about" className="text-emerald-600 hover:underline">About</Link></li>
              <li><Link href="/contact" className="text-emerald-600 hover:underline">Contact</Link></li>
              <li><Link href="/pricing" className="text-emerald-600 hover:underline">Pricing</Link></li>
              <li><Link href="/how-it-works" className="text-emerald-600 hover:underline">How It Works</Link></li>
              <li><Link href="/free-tier" className="text-emerald-600 hover:underline">Free Tier</Link></li>
            </ul>
          </section>

          {/* Solutions */}
          <section>
            <h2 className="text-2xl font-bold text-gray-900 mb-4 flex items-center gap-2">
              <Zap className="w-6 h-6 text-blue-600" />
              Solutions
            </h2>
            <ul className="grid md:grid-cols-2 gap-3">
              <li><Link href="/solutions" className="text-blue-600 hover:underline">All Solutions</Link></li>
              <li><Link href="/solutions/api" className="text-blue-600 hover:underline">API Solution</Link></li>
              <li><Link href="/solutions/business" className="text-blue-600 hover:underline">Business Solution</Link></li>
              <li><Link href="/solutions/education" className="text-blue-600 hover:underline">Education Solution</Link></li>
            </ul>
          </section>

          {/* PDF Tools */}
          <section>
            <h2 className="text-2xl font-bold text-gray-900 mb-4 flex items-center gap-2">
              <FileText className="w-6 h-6 text-purple-600" />
              PDF Tools
            </h2>
            <ul className="grid md:grid-cols-2 gap-3">
              <li><Link href="/tools" className="text-purple-600 hover:underline">All Tools</Link></li>
              <li><Link href="/tools/compress" className="text-purple-600 hover:underline">Compress PDF</Link></li>
              <li><Link href="/tools/merge" className="text-purple-600 hover:underline">Merge PDF</Link></li>
              <li><Link href="/tools/split" className="text-purple-600 hover:underline">Split PDF</Link></li>
              <li><Link href="/tools/rotate" className="text-purple-600 hover:underline">Rotate PDF</Link></li>
              <li><Link href="/tools/page-numbers" className="text-purple-600 hover:underline">Page Numbers</Link></li>
              <li><Link href="/tools/watermark" className="text-purple-600 hover:underline">Watermark</Link></li>
              <li><Link href="/tools/protect" className="text-purple-600 hover:underline">Protect PDF</Link></li>
              <li><Link href="/tools/unlock" className="text-purple-600 hover:underline">Unlock PDF</Link></li>
              <li><Link href="/tools/sign" className="text-purple-600 hover:underline">Sign PDF</Link></li>
            </ul>
          </section>

          {/* Conversion Tools */}
          <section>
            <h2 className="text-2xl font-bold text-gray-900 mb-4 flex items-center gap-2">
              <MapPin className="w-6 h-6 text-orange-600" />
              Conversion Tools
            </h2>
            <ul className="grid md:grid-cols-2 gap-3">
              <li><Link href="/tools/pdf-to-word" className="text-orange-600 hover:underline">PDF to Word</Link></li>
              <li><Link href="/tools/word-to-pdf" className="text-orange-600 hover:underline">Word to PDF</Link></li>
              <li><Link href="/tools/pdf-to-excel" className="text-orange-600 hover:underline">PDF to Excel</Link></li>
              <li><Link href="/tools/excel-to-pdf" className="text-orange-600 hover:underline">Excel to PDF</Link></li>
              <li><Link href="/tools/pdf-to-powerpoint" className="text-orange-600 hover:underline">PDF to PowerPoint</Link></li>
              <li><Link href="/tools/powerpoint-to-pdf" className="text-orange-600 hover:underline">PowerPoint to PDF</Link></li>
              <li><Link href="/tools/pdf-to-jpg" className="text-orange-600 hover:underline">PDF to JPG</Link></li>
              <li><Link href="/tools/jpg-to-pdf" className="text-orange-600 hover:underline">JPG to PDF</Link></li>
              <li><Link href="/tools/pdf-to-png" className="text-orange-600 hover:underline">PDF to PNG</Link></li>
            </ul>
          </section>

          {/* Legal Pages */}
          <section>
            <h2 className="text-2xl font-bold text-gray-900 mb-4 flex items-center gap-2">
              <Lock className="w-6 h-6 text-red-600" />
              Legal
            </h2>
            <ul className="grid md:grid-cols-2 gap-3">
              <li><Link href="/privacy" className="text-red-600 hover:underline">Privacy Policy</Link></li>
              <li><Link href="/terms" className="text-red-600 hover:underline">Terms of Service</Link></li>
            </ul>
          </section>
        </div>

        <div className="mt-12 text-center text-gray-600">
          <p>For search engines, see our <Link href="/sitemap.xml" className="text-emerald-600 hover:underline">XML Sitemap</Link></p>
        </div>
      </div>
    </div>
  );
}
