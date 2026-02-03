"use client";

import { motion } from "framer-motion";
import { Check, ArrowRight, BarChart3, PieChart, TrendingUp, Briefcase, GraduationCap, DollarSign } from "lucide-react";
import Navbar from "../components/Navbar";
import Footer from "../components/Footer";
import SubPageHero from "../components/ui/SubPageHero";
import AnimatedButton from "../components/ui/AnimatedButton";
import PricingSection from "../components/PricingSection";

export default function SolutionsPage() {
  const sections = [
    { id: "business", label: "Business", icon: <Briefcase className="w-5 h-5" /> },
    { id: "education", label: "Education", icon: <GraduationCap className="w-5 h-5" /> },
    { id: "pricing", label: "Pricing", icon: <DollarSign className="w-5 h-5" /> },
  ];

  const scrollToSection = (id: string) => {
    const element = document.getElementById(id);
    if (element) {
      const offset = 100; // Account for navbar
      const bodyRect = document.body.getBoundingClientRect().top;
      const elementRect = element.getBoundingClientRect().top;
      const elementPosition = elementRect - bodyRect;
      const offsetPosition = elementPosition - offset;

      window.scrollTo({
        top: offsetPosition,
        behavior: "smooth"
      });
    }
  };

  return (
    <div className="min-h-screen bg-[#FFFCF5]">
      <Navbar />

      <main className="">
        <SubPageHero
          badge="DocuFlux Solutions"
          title="Tailored for Your"
          subtitle="Specific Needs"
          description="Explore our specialized document management solutions for businesses and educational institutions, with transparent pricing that scales with you."
        />

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 flex flex-col lg:flex-row gap-12">
          {/* Sticky Sidebar Navigation */}
          <aside className="lg:w-1/4 lg:sticky lg:top-32 self-start">
            <div className="bg-white rounded-3xl border border-emerald-100 p-8 shadow-sm">
              <h3 className="text-xl font-bold text-emerald-950 mb-6 font-display">Solutions</h3>
              <nav className="flex flex-col gap-2">
                {sections.map((section) => (
                  <button
                    key={section.id}
                    onClick={() => scrollToSection(section.id)}
                    className="flex items-center gap-3 px-4 py-3 rounded-xl hover:bg-emerald-50 text-gray-600 hover:text-emerald-800 transition-all font-medium text-left"
                  >
                    <div className="text-emerald-600">{section.icon}</div>
                    {section.label}
                  </button>
                ))}
              </nav>
            </div>

            {/* Quick Stats Card */}
            <div className="mt-8 bg-emerald-900 rounded-3xl p-8 text-white relative overflow-hidden hidden lg:block">
              <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full blur-2xl -translate-y-1/2 translate-x-1/2" />
              <h4 className="text-lg font-bold mb-4 font-display">Global Impact</h4>
              <div className="space-y-4">
                <div>
                  <div className="text-3xl font-bold font-display">99.9%</div>
                  <div className="text-emerald-200 text-xs">Uptime Guarantee</div>
                </div>
                <div>
                  <div className="text-3xl font-bold font-display">12M+</div>
                  <div className="text-emerald-200 text-xs">Files Processed Yearly</div>
                </div>
              </div>
            </div>
          </aside>

          {/* Main Content Area */}
          <div className="lg:w-3/4 space-y-24">

            {/* Business Section */}
            <section id="business" className="scroll-mt-32">
              <div className="bg-white rounded-[3rem] p-8 lg:p-12 border border-gray-100 shadow-sm overflow-hidden relative">
                <div className="absolute top-6 right-8 text-emerald-100 opacity-20">
                  <Briefcase className="w-32 h-32" />
                </div>

                <div className="relative z-10">
                  <div className="inline-flex items-center gap-2 mb-6 px-3 py-1 rounded-md bg-emerald-50 text-emerald-800 font-bold text-[10px] tracking-widest uppercase">
                    For Enterprises
                  </div>
                  <h2 className="text-3xl md:text-4xl font-bold text-emerald-950 mb-6 font-display">
                    Business <span className="text-emerald-800 italic font-serif">Solutions</span>
                  </h2>

                  <div className="grid lg:grid-cols-2 gap-12 items-center mb-12">
                    <div>
                      <p className="text-gray-600 leading-relaxed mb-8">
                        Streamline your corporate document workflow with our powerful bulk processing and automation tools. DocuFlux Business provides the reliability, security, and performance required by modern enterprises.
                      </p>
                      <ul className="space-y-4">
                        {[
                          "Batch file conversion & compression",
                          "Centralized user management",
                          "Dedicated technical support",
                          "Custom API integrations"
                        ].map((feature, i) => (
                          <li key={i} className="flex items-center gap-3 text-gray-700">
                            <div className="w-5 h-5 rounded-full bg-emerald-100 flex items-center justify-center flex-shrink-0">
                              <Check className="w-3 h-3 text-emerald-700" />
                            </div>
                            {feature}
                          </li>
                        ))}
                      </ul>
                    </div>
                    <div className="relative">
                      <div className="rounded-2xl overflow-hidden shadow-2xl border border-emerald-100 rotate-2">
                        <img
                          src="/business_solution_premium_1770129382687.png"
                          alt="Business Solution"
                          className="w-full h-auto"
                        />
                      </div>
                      {/* SVG Chart Example for Business */}
                      <div className="absolute -bottom-6 -left-6 bg-white p-6 rounded-2xl shadow-xl border border-gray-100 w-64 animate-float">
                        <h5 className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-4">Efficiency Growth</h5>
                        <div className="flex items-end gap-2 h-24">
                          {[30, 45, 60, 85, 95].map((h, i) => (
                            <div key={i} className="flex-1 bg-emerald-500 rounded-t-sm" style={{ height: `${h}%` }} />
                          ))}
                        </div>
                        <div className="mt-2 text-emerald-700 font-bold flex items-center gap-1">
                          <TrendingUp className="w-4 h-4" />
                          +65% Quarterly
                        </div>
                      </div>
                    </div>
                  </div>

                  <AnimatedButton href="/solutions/business" variant="primary" size="md">
                    Get Started for Business <ArrowRight className="w-4 h-4 ml-2" />
                  </AnimatedButton>
                </div>
              </div>
            </section>

            {/* Education Section */}
            <section id="education" className="scroll-mt-32">
              <div className="bg-white rounded-[3rem] p-8 lg:p-12 border border-gray-100 shadow-sm overflow-hidden relative">
                <div className="absolute top-6 right-8 text-emerald-100 opacity-20">
                  <GraduationCap className="w-32 h-32" />
                </div>

                <div className="relative z-10">
                  <div className="inline-flex items-center gap-2 mb-6 px-3 py-1 rounded-md bg-emerald-50 text-emerald-800 font-bold text-[10px] tracking-widest uppercase">
                    For Academic Success
                  </div>
                  <h2 className="text-3xl md:text-4xl font-bold text-emerald-950 mb-6 font-display">
                    Education <span className="text-emerald-800 italic font-serif">Solutions</span>
                  </h2>

                  <div className="grid lg:grid-cols-2 gap-12 items-center mb-12">
                    <div className="order-2 lg:order-1 relative">
                      <div className="rounded-2xl overflow-hidden shadow-2xl border border-emerald-100 -rotate-2">
                        <img
                          src="/education_solution_premium_v2_1770129409881.png"
                          alt="Education Solution"
                          className="w-full h-auto"
                        />
                      </div>
                      {/* SVG Data Visual for Education */}
                      <div className="absolute -top-6 -right-6 bg-white p-6 rounded-2xl shadow-xl border border-gray-100 w-56 animate-float-delayed">
                        <h5 className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-4">Doc Usage by Type</h5>
                        <div className="relative w-24 h-24 mx-auto mb-4">
                          <svg viewBox="0 0 36 36" className="w-full h-full transform transition-transform group-hover:scale-110">
                            <path
                              className="text-emerald-100"
                              strokeDasharray="100, 100"
                              stroke="currentColor"
                              strokeWidth="3"
                              fill="none"
                              d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                            />
                            <path
                              className="text-emerald-600"
                              strokeDasharray="75, 100"
                              stroke="currentColor"
                              strokeWidth="3"
                              strokeLinecap="round"
                              fill="none"
                              d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                            />
                          </svg>
                          <div className="absolute inset-0 flex items-center justify-center font-bold text-sm text-emerald-950">75%</div>
                        </div>
                        <div className="text-[10px] text-gray-500 text-center">Academic PDFs hold the largest share of processing volume.</div>
                      </div>
                    </div>
                    <div className="order-1 lg:order-2">
                      <p className="text-gray-600 leading-relaxed mb-8">
                        DocuFlux provides students, teachers, and administrators with free access to high-quality PDF tools. We focus on ease of use and student data privacy above all else.
                      </p>
                      <ul className="space-y-4">
                        {[
                          "No cost for individual students",
                          "Easy sharing of academic resources",
                          "Strict data privacy standards",
                          "Mobile-friendly interface"
                        ].map((feature, i) => (
                          <li key={i} className="flex items-center gap-3 text-gray-700">
                            <div className="w-5 h-5 rounded-full bg-emerald-100 flex items-center justify-center flex-shrink-0">
                              <Check className="w-3 h-3 text-emerald-700" />
                            </div>
                            {feature}
                          </li>
                        ))}
                      </ul>
                    </div>
                  </div>

                  <AnimatedButton href="/solutions/education" variant="primary" size="md">
                    Explore Student Tools <ArrowRight className="w-4 h-4 ml-2" />
                  </AnimatedButton>
                </div>
              </div>
            </section>

            {/* Pricing Section */}
            <section id="pricing" className="scroll-mt-32">
              <PricingSection />
            </section>

          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}
