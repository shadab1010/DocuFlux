"use client";

import { useState, useEffect } from "react";
import { Mail, Phone, MapPin, Send, Facebook, Instagram, Linkedin } from "lucide-react";
import AnimatedButton from "./ui/AnimatedButton";
import emailjs from "@emailjs/browser";

export default function Contact() {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    subject: "",
    message: "",
  });

  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    if (success) {
      const timer = setTimeout(() => {
        setSuccess(false);
      }, 5000);
      return () => clearTimeout(timer);
    }
  }, [success]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    setSuccess(false);

    try {
      const serviceId = process.env.NEXT_PUBLIC_EMAILJS_SERVICE_ID || "";
      const templateId = process.env.NEXT_PUBLIC_EMAILJS_TEMPLATE_ID || "";
      const publicKey = process.env.NEXT_PUBLIC_EMAILJS_PUBLIC_KEY || "";

      if (!serviceId || !templateId || !publicKey || templateId === "YOUR_TEMPLATE_ID_HERE" || publicKey === "YOUR_PUBLIC_KEY_HERE") {
        setError("Email service is not fully configured. Please provide Template ID and Public Key.");
        setLoading(false);
        return;
      }

      const templateParams = {
        name: formData.name,
        email: formData.email,
        subject: formData.subject,
        message: formData.message,
        to_name: "DocuFlux Team",
        reply_to: formData.email,
      };

      const result = await emailjs.send(
        serviceId,
        templateId,
        templateParams,
        publicKey
      );

      if (result.status === 200) {
        setSuccess(true);
        setFormData({ name: "", email: "", subject: "", message: "" });
      } else {
        setError("Failed to send message. Please try again.");
      }
    } catch (err: any) {
      console.error("EmailJS Error:", err);
      setError(err?.text || "Connection error. Please try again later.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <section id="contact" className="py-16 bg-[#FFFCF5]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-12">
          <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4 font-display font-serif">
            Get In Touch
          </h2>
          <p className="text-gray-600 text-lg max-w-2xl mx-auto">
            We'll create high-quality linkable content and build at least 40 high-authority links to each asset, paving the way for you to grow.
          </p>
        </div>

        <div className="max-w-6xl mx-auto bg-white rounded-[2rem] shadow-xl overflow-hidden flex flex-col lg:flex-row min-h-[500px]">
          {/* Left Panel: Contact Information - NOW PREMIUM DARK EMERALD */}
          <div className="lg:w-[40%] bg-[#022c22] relative p-10 text-white flex flex-col justify-between overflow-hidden">
            {/* Background Decoration */}
            <div className="absolute bottom-0 right-0 w-64 h-64 bg-white/10 rounded-full translate-x-1/3 translate-y-1/3 blur-3xl pointer-events-none" />
            <div className="absolute top-10 right-10 w-20 h-20 bg-white/5 rounded-full blur-2xl pointer-events-none" />

            <div className="relative z-10">
              <h3 className="text-2xl font-bold mb-4 font-display">Contact Information</h3>
              <p className="text-emerald-100 mb-8 leading-relaxed opacity-90">
                Fill up the form and our Team will get back to you within 24 hours.
              </p>

              <div className="space-y-6">
                <div className="flex items-start gap-4">
                  <Phone className="w-6 h-6 mt-1 text-emerald-200" />
                  <div>
                    <p className="text-sm opacity-70 mb-1 uppercase tracking-wider text-emerald-100">Call Us</p>
                    <a href="tel:+15550000000" className="text-lg font-medium hover:text-white transition">+91 1234567890</a>
                  </div>
                </div>

                <div className="flex items-start gap-4">
                  <Mail className="w-6 h-6 mt-1 text-emerald-200" />
                  <div>
                    <p className="text-sm opacity-70 mb-1 uppercase tracking-wider text-emerald-100">Email Us</p>
                    <a href="mailto:hello@docuflux.com" className="text-lg font-medium hover:text-white transition">hello@docuflux.com</a>
                  </div>
                </div>

                <div className="flex items-start gap-4">
                  <MapPin className="w-6 h-6 mt-1 text-emerald-200" />
                  <div>
                    <p className="text-sm opacity-70 mb-1 uppercase tracking-wider text-emerald-100">Visit Us</p>
                    <p className="text-lg font-medium leading-snug">Chandigarh University,<br />North Campus,NCH Hostel</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Social Icons */}
            <div className="relative z-10 mt-12 flex gap-4">
              <a href="https://www.facebook.com/shabab.alam.16121" target="_blank" rel="noopener noreferrer" className="w-10 h-10 rounded-full border border-emerald-500/50 hover:bg-emerald-800 transition cursor-pointer flex items-center justify-center text-emerald-200">
                <Facebook className="w-5 h-5" />
              </a>
              <a href="https://www.instagram.com/shadab_iraqe/" target="_blank" rel="noopener noreferrer" className="w-10 h-10 rounded-full border border-emerald-500/50 hover:bg-emerald-800 transition cursor-pointer flex items-center justify-center text-emerald-200">
                <Instagram className="w-5 h-5" />
              </a>
              <a href="https://www.linkedin.com/in/itsshadab/" target="_blank" rel="noopener noreferrer" className="w-10 h-10 rounded-full border border-emerald-500/50 hover:bg-emerald-800 transition cursor-pointer flex items-center justify-center text-emerald-200">
                <Linkedin className="w-5 h-5" />
              </a>
            </div>
          </div>

          {/* Right Panel: Form */}
          <div className="lg:w-[60%] p-10 lg:p-12 bg-white">
            <form onSubmit={handleSubmit} className="h-full flex flex-col justify-center">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-8">
                <div className="group">
                  <label htmlFor="name" className="block text-sm font-medium text-gray-500 mb-2 group-focus-within:text-emerald-700 transition-colors">Your Name</label>
                  <input
                    type="text"
                    id="name"
                    placeholder="John Doe"
                    className="w-full py-3 bg-transparent border-b border-gray-200 focus:border-emerald-700 outline-none transition-all placeholder:text-gray-300 text-gray-900 font-medium"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  />
                </div>
                <div className="group">
                  <label htmlFor="email" className="block text-sm font-medium text-gray-500 mb-2 group-focus-within:text-emerald-700 transition-colors">Your Email</label>
                  <input
                    type="email"
                    id="email"
                    placeholder="john@example.com"
                    className="w-full py-3 bg-transparent border-b border-gray-200 focus:border-emerald-700 outline-none transition-all placeholder:text-gray-300 text-gray-900 font-medium"
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  />
                </div>
              </div>

              <div className="mb-8 group">
                <label htmlFor="subject" className="block text-sm font-medium text-gray-500 mb-2 group-focus-within:text-emerald-700 transition-colors">Your Subject</label>
                <input
                  type="text"
                  id="subject"
                  placeholder="I want to hire you quickly"
                  className="w-full py-3 bg-transparent border-b border-gray-200 focus:border-emerald-700 outline-none transition-all placeholder:text-gray-300 text-gray-900 font-medium"
                  value={formData.subject}
                  onChange={(e) => setFormData({ ...formData, subject: e.target.value })}
                />
              </div>

              <div className="mb-8 group">
                <label htmlFor="message" className="block text-sm font-medium text-gray-600 mb-4 group-focus-within:text-emerald-700 transition-colors">Message</label>
                <textarea
                  id="message"
                  rows={2}
                  placeholder="Write here your message"
                  className="w-full py-3 bg-transparent border-b border-gray-200 focus:border-emerald-700 outline-none transition-all resize-none placeholder:text-gray-300 text-gray-900 font-medium"
                  value={formData.message}
                  onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                />
              </div>

              {success && (
                <div className="mb-8 p-4 bg-emerald-50 text-emerald-700 rounded-2xl border border-emerald-100 font-bold text-sm">
                  Message sent successfully! We'll get back to you soon.
                </div>
              )}
              {error && (
                <div className="mb-8 p-4 bg-red-50 text-red-700 rounded-2xl border border-red-100 font-bold text-sm">
                  {error}
                </div>
              )}

              <div>
                <AnimatedButton
                  type="submit"
                  variant="primary"
                  size="md"
                  className="w-full md:w-auto shadow-lg shadow-emerald-900/20 disabled:opacity-70"
                  disabled={loading}
                >
                  {loading ? "Sending..." : "Send Message"} <Send className="w-4 h-4 ml-2" />
                </AnimatedButton>
              </div>
            </form>
          </div>
        </div>
      </div>
    </section>
  );
}
