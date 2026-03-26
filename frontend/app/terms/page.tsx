"use client";

import Link from "next/link";
import { ArrowLeft } from "lucide-react";

export default function TermsOfService() {
  return (
    <div className="min-h-screen bg-white dark:bg-[#050505] text-gray-900 dark:text-white">
      <div className="max-w-4xl mx-auto px-6 py-12">
        <Link
          href="/"
          className="inline-flex items-center gap-2 text-sm text-gray-500 hover:text-gray-900 dark:hover:text-white mb-8"
        >
          <ArrowLeft size={16} /> Back to Home
        </Link>

        <h1 className="text-4xl font-bold mb-4">Terms of Service</h1>
        <p className="text-gray-500 mb-8">Last Updated: March 13, 2026</p>

        <div className="prose prose-gray dark:prose-invert max-w-none space-y-8">
          <section>
            <h2 className="text-2xl font-semibold mb-4">1. Acceptance of Terms</h2>
            <p className="text-gray-600 dark:text-gray-400 leading-relaxed">
              By accessing or using MedAI ("the Platform"), you agree to be bound by these Terms of Service.
              If you do not agree to these terms, please do not use the Platform.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold mb-4">2. Medical Disclaimer</h2>
            <div className="bg-red-50 dark:bg-red-900/10 border border-red-200 dark:border-red-900/30 rounded-lg p-6">
              <p className="text-red-800 dark:text-red-400 font-semibold mb-2">
                IMPORTANT: NOT A SUBSTITUTE FOR PROFESSIONAL MEDICAL ADVICE
              </p>
              <ul className="list-disc list-inside space-y-2 text-gray-700 dark:text-gray-300">
                <li>MedAI's AI-powered diagnostic tool is for informational purposes only</li>
                <li>It does NOT replace professional medical diagnosis, treatment, or advice</li>
                <li>Always consult a qualified healthcare provider for medical concerns</li>
                <li>In case of emergency, call your local emergency services immediately</li>
                <li>Do not disregard professional medical advice based on AI suggestions</li>
              </ul>
            </div>
          </section>

          <section>
            <h2 className="text-2xl font-semibold mb-4">3. User Responsibilities</h2>
            <p className="text-gray-600 dark:text-gray-400 leading-relaxed mb-4">
              You agree to:
            </p>
            <ul className="list-disc list-inside space-y-2 text-gray-600 dark:text-gray-400">
              <li>Provide accurate and complete information</li>
              <li>Maintain the confidentiality of your account credentials</li>
              <li>Use the Platform only for lawful purposes</li>
              <li>Not misuse or attempt to hack the Platform</li>
              <li>Respect the intellectual property rights of MedAI</li>
            </ul>
          </section>

          <section>
            <h2 className="text-2xl font-semibold mb-4">4. Healthcare Provider Services</h2>
            <p className="text-gray-600 dark:text-gray-400 leading-relaxed">
              MedAI connects patients with licensed healthcare providers. The Platform is not responsible
              for the quality of care provided by individual practitioners. All medical consultations are
              between you and the healthcare provider directly.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold mb-4">5. Payment Terms</h2>
            <p className="text-gray-600 dark:text-gray-400 leading-relaxed mb-4">
              Payment for services may be processed through:
            </p>
            <ul className="list-disc list-inside space-y-2 text-gray-600 dark:text-gray-400">
              <li>Cryptocurrency (ETH) via Web3 wallet integration</li>
              <li>Traditional payment methods (where available)</li>
              <li>All payments are non-refundable unless required by law</li>
              <li>Prices are subject to change with notice</li>
            </ul>
          </section>

          <section>
            <h2 className="text-2xl font-semibold mb-4">6. Privacy & Data Protection</h2>
            <p className="text-gray-600 dark:text-gray-400 leading-relaxed">
              Your privacy is important to us. Please review our{" "}
              <Link href="/privacy" className="text-purple-600 hover:underline">
                Privacy Policy
              </Link>{" "}
              to understand how we collect, use, and protect your personal and medical information.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold mb-4">7. Limitation of Liability</h2>
            <p className="text-gray-600 dark:text-gray-400 leading-relaxed">
              TO THE MAXIMUM EXTENT PERMITTED BY LAW, MEDAI SHALL NOT BE LIABLE FOR ANY INDIRECT,
              INCIDENTAL, SPECIAL, CONSEQUENTIAL, OR PUNITIVE DAMAGES, INCLUDING BUT NOT LIMITED TO
              LOSS OF PROFITS, DATA, OR HEALTH OUTCOMES ARISING FROM YOUR USE OF THE PLATFORM.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold mb-4">8. Intellectual Property</h2>
            <p className="text-gray-600 dark:text-gray-400 leading-relaxed">
              All content, features, and functionality on the Platform are owned by MedAI and are
              protected by international copyright, trademark, and other intellectual property laws.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold mb-4">9. Termination</h2>
            <p className="text-gray-600 dark:text-gray-400 leading-relaxed">
              We reserve the right to suspend or terminate your account at any time for violation of
              these Terms or for any other reason at our sole discretion.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold mb-4">10. Changes to Terms</h2>
            <p className="text-gray-600 dark:text-gray-400 leading-relaxed">
              We may update these Terms from time to time. Continued use of the Platform after changes
              constitutes acceptance of the updated Terms.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold mb-4">11. Governing Law</h2>
            <p className="text-gray-600 dark:text-gray-400 leading-relaxed">
              These Terms shall be governed by and construed in accordance with the laws of the
              jurisdiction in which MedAI operates, without regard to conflict of law principles.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold mb-4">12. Contact Information</h2>
            <p className="text-gray-600 dark:text-gray-400 leading-relaxed">
              For questions about these Terms, please contact us at:
              <br />
              Email: legal@medai.app
              <br />
              Address: [Your Company Address]
            </p>
          </section>
        </div>
      </div>
    </div>
  );
}
