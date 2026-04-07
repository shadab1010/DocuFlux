"use client";

import Navbar from "../components/Navbar";
import Footer from "../components/Footer";
import { Upload, Zap, Download, CheckCircle, Shield, Lock, Trash2, EyeOff } from "lucide-react";

export default function HowItWorksPage() {
  const steps = [
    {
      icon: Upload,
      title: "Upload Your File",
      description: "Select and upload your document from your computer or simply drag and drop it into the secure upload area.",
      color: "from-blue-500 to-cyan-400",
      bg: "bg-blue-50",
      text: "text-blue-600"
    },
    {
      icon: Zap,
      title: "We Process It",
      description: "Our servers instantly process your file with enterprise-grade algorithms and advanced conversion technology.",
      color: "from-amber-500 to-orange-400",
      bg: "bg-amber-50",
      text: "text-amber-600"
    },
    {
      icon: CheckCircle,
      title: "Review Results",
      description: "Preview the beautifully converted file to ensure it perfectly meets your quality standards before downloading.",
      color: "from-emerald-500 to-teal-400",
      bg: "bg-emerald-50",
      text: "text-emerald-600"
    },
    {
      icon: Download,
      title: "Download",
      description: "Get your converted file instantly. All files are automatically permanently deleted after 24 hours.",
      color: "from-purple-500 to-pink-400",
      bg: "bg-purple-50",
      text: "text-purple-600"
    },
  ];

  return (
    <div className="min-h-screen flex flex-col bg-[#FFFCF5]">
      <Navbar />

      {/* Hero Section */}
      <main className="flex-1 pt-32 pb-24 relative overflow-hidden">
        {/* Background Decorative Elements */}
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[1000px] h-[500px] opacity-30 pointer-events-none">
          <div className="absolute inset-0 bg-gradient-to-b from-emerald-200/50 to-transparent rounded-full blur-3xl"></div>
        </div>

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">

          <div className="text-center mb-20">
            <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-emerald-100 text-emerald-700 text-sm font-semibold mb-6 border border-emerald-200 shadow-sm">
              <Zap className="w-4 h-4" />
              <span>Simplified Workflow</span>
            </div>
            <h1 className="text-5xl md:text-6xl font-extrabold text-gray-900 mb-6 tracking-tight">
              Converting documents <br className="hidden md:block" />
              is as simple as <span className="text-transparent bg-clip-text bg-gradient-to-r from-emerald-600 to-teal-500">1-2-3-4</span>
            </h1>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto leading-relaxed">
              Experience lightning-fast conversions with zero quality loss.
              Follow these easy steps to completely transform your files in seconds.
            </p>
          </div>

          {/* Steps Section */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 mb-24 relative">
            {/* Connecting line for desktop */}
            <div className="hidden lg:block absolute top-[5.5rem] left-[10%] right-[10%] h-0.5 bg-gradient-to-r from-gray-200 via-emerald-200 to-gray-200 blur-[1px]"></div>

            {steps.map((step, index) => {
              const Icon = step.icon;
              return (
                <div key={index} className="relative group perspective-1000">
                  <div className="h-full bg-white rounded-3xl shadow-sm hover:shadow-2xl hover:shadow-emerald-900/5 transition-all duration-500 p-8 border border-gray-100/50 relative z-10 overflow-hidden transform group-hover:-translate-y-2">

                    {/* Number Watermark */}
                    <div className="absolute -right-4 -top-8 text-[120px] font-black text-gray-50/80 -z-10 select-none group-hover:text-emerald-50/50 transition-colors duration-500">
                      {index + 1}
                    </div>

                    <div className={`w-20 h-20 rounded-2xl ${step.bg} text-white flex items-center justify-center mb-8 relative shadow-inner group-hover:scale-110 transition-transform duration-500`}>
                      <Icon className={`w-10 h-10 ${step.text} relative z-10`} />
                      <div className={`absolute inset-0 bg-gradient-to-br ${step.color} opacity-0 group-hover:opacity-10 transition-opacity duration-500 rounded-2xl`}></div>
                    </div>

                    <h3 className="text-2xl font-bold text-gray-900 mb-4 group-hover:text-emerald-700 transition-colors duration-300">
                      {step.title}
                    </h3>
                    <p className="text-gray-600 leading-relaxed">
                      {step.description}
                    </p>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Security & Privacy Banner */}
          <div className="relative rounded-[2.5rem] overflow-hidden bg-gradient-to-br from-emerald-950 via-emerald-900 to-teal-900 text-white p-12 md:p-16 shadow-2xl border border-emerald-800">
            {/* Background Pattern */}
            <div className="absolute inset-0 opacity-10 bg-[radial-gradient(circle_at_center,_var(--tw-gradient-stops))] from-white via-transparent to-transparent bg-[length:20px_20px]"></div>
            <div className="absolute -top-24 -right-24 w-96 h-96 bg-emerald-500/20 rounded-full blur-3xl pointer-events-none"></div>
            <div className="absolute -bottom-24 -left-24 w-96 h-96 bg-teal-500/20 rounded-full blur-3xl pointer-events-none"></div>

            <div className="relative z-10">
              <div className="text-center max-w-3xl mx-auto mb-16">
                <Shield className="w-16 h-16 text-emerald-400 mx-auto mb-6 drop-shadow-lg" />
                <h2 className="text-4xl md:text-5xl font-bold mb-6 tracking-tight text-transparent bg-clip-text bg-gradient-to-r from-white to-emerald-200">
                  Bank-Grade Security & Privacy
                </h2>
                <p className="text-xl text-emerald-50/80 leading-relaxed">
                  Your files are encrypted during upload and processing. We automatically permanently delete
                  all files from our servers within 24 hours. We never share your data with third parties.
                </p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-8 md:gap-12 text-center divide-y md:divide-y-0 md:divide-x divide-emerald-800/50">
                <div className="pt-8 md:pt-0 pb-8 md:pb-0 group">
                  <div className="flex justify-center mb-4">
                    <div className="p-3 bg-emerald-800/50 rounded-xl group-hover:scale-110 transition-transform">
                      <Lock className="w-8 h-8 text-emerald-400" />
                    </div>
                  </div>
                  <div className="text-5xl font-extrabold mb-3 text-white">256-bit</div>
                  <div className="text-emerald-200/80 font-medium tracking-wide uppercase text-sm">SSL Encryption</div>
                </div>

                <div className="pt-8 md:pt-0 pb-8 md:pb-0 group">
                  <div className="flex justify-center mb-4">
                    <div className="p-3 bg-emerald-800/50 rounded-xl group-hover:scale-110 transition-transform">
                      <Trash2 className="w-8 h-8 text-emerald-400" />
                    </div>
                  </div>
                  <div className="text-5xl font-extrabold mb-3 text-white">24<span className="text-3xl">hr</span></div>
                  <div className="text-emerald-200/80 font-medium tracking-wide uppercase text-sm">Auto File Deletion</div>
                </div>

                <div className="pt-8 md:pt-0 group">
                  <div className="flex justify-center mb-4">
                    <div className="p-3 bg-emerald-800/50 rounded-xl group-hover:scale-110 transition-transform">
                      <EyeOff className="w-8 h-8 text-emerald-400" />
                    </div>
                  </div>
                  <div className="text-5xl font-extrabold mb-3 text-white">0%</div>
                  <div className="text-emerald-200/80 font-medium tracking-wide uppercase text-sm">Data Sharing</div>
                </div>
              </div>
            </div>
          </div>

        </div>
      </main>
      <Footer />
    </div>
  );
}
