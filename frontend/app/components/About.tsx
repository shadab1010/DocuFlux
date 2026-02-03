"use client";

export default function About() {
  return (
    <section className="py-16 bg-blue-600 text-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-12">
          <h2 className="text-4xl font-bold mb-6">About DocuFlux</h2>
          <p className="text-xl max-w-3xl mx-auto">
            We're on a mission to make document management simple, secure, and accessible to everyone.
            With cutting-edge technology and user-friendly design, we help millions of users
            worldwide process their documents efficiently.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mt-12">
          <div className="text-center">
            <div className="text-5xl font-bold mb-2">10M+</div>
            <div className="text-xl">Documents Processed</div>
          </div>
          <div className="text-center">
            <div className="text-5xl font-bold mb-2">500K+</div>
            <div className="text-xl">Happy Users</div>
          </div>
          <div className="text-center">
            <div className="text-5xl font-bold mb-2">99.9%</div>
            <div className="text-xl">Uptime</div>
          </div>
        </div>
      </div>
    </section>
  );
}
