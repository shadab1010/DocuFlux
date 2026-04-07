"use client";

import Navbar from "../components/Navbar";
import Footer from "../components/Footer";

export default function CookiesPage() {
  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      <main className="flex-1 pt-24 pb-16 bg-gray-50">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <h1 className="text-4xl font-bold text-gray-900 mb-8">Cookie Policy</h1>

          <div className="bg-white rounded-lg shadow p-8 space-y-8">
            <p className="text-gray-500 text-sm">Last Updated: March 26, 2026</p>

            <section>
              <h2 className="text-2xl font-bold mb-4">1. Introduction</h2>
              <div className="text-gray-700 space-y-4">
                <p>
                  This document informs Users about the technologies that help DocuFlux achieve the purposes described below. Such technologies allow us to access and store information (for example, by using a Cookie) or use resources (for example, by running a script) on your device as you interact with our service.
                </p>
                <p>
                  For simplicity, all such technologies are defined as &quot;Trackers&quot; within this document—unless there is a reason to differentiate.
                  Some of the purposes for which Trackers are used may also require your consent. Whenever consent is given, it can be freely withdrawn at any time following the instructions provided in this document.
                </p>
                <p>
                  This Application uses Trackers managed directly by DocuFlux (first-party Trackers) and Trackers that enable services provided by a third-party (third-party Trackers). The validity and expiration periods of Cookies and other similar Trackers may vary depending on the lifetime set by DocuFlux or the relevant provider.
                </p>
              </div>
            </section>

            <section>
              <h2 className="text-2xl font-bold mb-4">2. How DocuFlux Uses Trackers</h2>
              <div className="text-gray-700 space-y-6">
                <div>
                  <h3 className="text-xl font-semibold mb-2">Necessary (Technical)</h3>
                  <p>
                    DocuFlux uses &quot;technical&quot; Cookies and similar Trackers to carry out activities that are strictly necessary for the operation or delivery of our PDF and document processing services.
                  </p>
                </div>
                <div>
                  <h3 className="text-xl font-semibold mb-2">Measurement & Analytics</h3>
                  <p>
                    We use Trackers to measure traffic and analyze user behavior to improve our Service. This includes third-party Trackers such as Google Analytics 4.
                  </p>
                </div>
                <div>
                  <h3 className="text-xl font-semibold mb-2">Marketing</h3>
                  <p>
                    This Application may use Trackers to deliver personalized marketing content and to measure their performance.
                  </p>
                </div>
              </div>
            </section>

            <section>
              <h2 className="text-2xl font-bold mb-4">3. How to Manage Preferences</h2>
              <div className="text-gray-700 space-y-4">
                <p>
                  Users can set or update their preferences via the relevant privacy choices panel available on this website, if applicable.
                </p>
                <p>
                  With regard to any third-party Trackers, Users can manage their preferences via the related opt-out link (where provided), by using the means indicated in the third party&apos;s privacy policy, or by contacting the third party directly.
                </p>
              </div>
            </section>

            <section>
              <h2 className="text-2xl font-bold mb-4">4. Controlling Cookies via Device Settings</h2>
              <div className="text-gray-700 space-y-4">
                <p>
                  Users may use their own browser settings to see what Cookies have been set, block Cookies, or clear Cookies entirely. However, browser settings do not allow granular control of consent by category.
                </p>
                <p>
                  You can find information about how to manage Cookies in the most commonly used browsers at their respective support pages (e.g., Google Chrome, Mozilla Firefox, Apple Safari, Microsoft Edge).
                </p>
                <p>
                  Users may also manage certain categories of Trackers used on mobile devices by opting out through relevant device settings, such as the device advertising settings for mobile devices.
                </p>
              </div>
            </section>

            <section>
              <h2 className="text-2xl font-bold mb-4">5. Ad Industry Opt-Outs</h2>
              <p className="text-gray-700">
                Users may also follow the instructions provided by initiatives like YourOnlineChoices (EU/UK), the Network Advertising Initiative (US), and the Digital Advertising Alliance (US). Such initiatives allow Users to select their tracking preferences for most advertising tools.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-bold mb-4">6. Consequences of Denying Trackers</h2>
              <p className="text-gray-700">
                You are free to decide whether or not to allow the use of Trackers. However, please note that Trackers help us provide a better experience and advanced functionalities. If you choose to block the use of Trackers, we may be unable to provide certain document processing or account-related features.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-bold mb-4">7. Owner and Data Controller</h2>
              <div className="text-gray-700 space-y-4">
                <p className="font-semibold">DocuFlux Team</p>
                <p>Contact Email: <a href="mailto:privacy@docuflux.com" className="text-emerald-600 hover:underline">privacy@docuflux.com</a></p>
                <p className="text-sm border-t pt-4 mt-4">
                  Given the objective complexity surrounding tracking technologies, Users are encouraged to contact us should they wish to receive any further information on the use of such technologies by our platform.
                </p>
              </div>
            </section>

            <section>
              <h2 className="text-2xl font-bold mb-4">8. Definitions and Legal References</h2>
              <div className="text-gray-700 space-y-4 text-sm">
                <div>
                  <strong className="block text-gray-900">Personal Data (or Data)</strong>
                  <p>Any information that directly, indirectly, or in connection with other information allows for the identification of a natural person.</p>
                </div>
                <div>
                  <strong className="block text-gray-900">Usage Data</strong>
                  <p>Information collected automatically through this Application, which can include IP addresses, browser features, time spent on pages, and parameters about the device operating system.</p>
                </div>
                <div>
                  <strong className="block text-gray-900">Tracker</strong>
                  <p>Any technology (e.g., Cookies, unique identifiers, web beacons, embedded scripts, e-tags) that enables the tracking of Users, for example by accessing or storing information on the User&apos;s device.</p>
                </div>
                <div>
                  <strong className="block text-gray-900">Data Controller (or Owner)</strong>
                  <p>The natural or legal person or body which determines the purposes and means of the processing of Personal Data. For this service, it is DocuFlux.</p>
                </div>
              </div>
            </section>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
}
