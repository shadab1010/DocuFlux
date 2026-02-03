"use client";

import Navbar from "../components/Navbar";
import Footer from "../components/Footer";

export default function PrivacyPage() {
  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      <main className="flex-1 pt-24 pb-16 bg-gray-50">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <h1 className="text-4xl font-bold text-gray-900 mb-8">Privacy Policy</h1>
          
          <div className="bg-white rounded-lg shadow p-8 space-y-6">
            <section>
              <h2 className="text-2xl font-bold mb-4">1. Information We Collect</h2>
              <p className="text-gray-700">
                We collect information you provide directly to us, including when you create an account,
                use our services, or contact us for support.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-bold mb-4">2. How We Use Your Information</h2>
              <p className="text-gray-700">
                We use the information we collect to provide, maintain, and improve our services,
                process your transactions, and send you technical notices and support messages.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-bold mb-4">3. File Security</h2>
              <p className="text-gray-700">
                All uploaded files are encrypted during transmission and storage. Files are automatically
                deleted from our servers within 24 hours of processing.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-bold mb-4">4. Data Sharing</h2>
              <p className="text-gray-700">
                We do not sell, trade, or otherwise transfer your personally identifiable information
                to third parties. This does not include trusted third parties who assist us in operating
                our website.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-bold mb-4">5. Your Rights</h2>
              <p className="text-gray-700">
                You have the right to access, update, or delete your personal information at any time.
                You may also opt out of receiving promotional communications from us.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-bold mb-4">6. Contact Us</h2>
              <p className="text-gray-700">
                If you have any questions about this Privacy Policy, please contact us at
                privacy@docuflux.com
              </p>
            </section>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
}
