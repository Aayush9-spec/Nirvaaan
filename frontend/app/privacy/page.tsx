"use client";

import Link from "next/link";
import { ArrowLeft } from "lucide-react";

export default function PrivacyPolicy() {
  return (
    <div className="min-h-screen bg-white dark:bg-[#050505] text-gray-900 dark:text-white">
      <div className="max-w-4xl mx-auto px-6 py-12">
        <Link
          href="/"
          className="inline-flex items-center gap-2 text-sm text-gray-500 hover:text-gray-900 dark:hover:text-white mb-8"
        >
          <ArrowLeft size={16} /> Back to Home
        </Link>

        <h1 className="text-4xl font-bold mb-4">Privacy Policy</h1>
        <p className="text-gray-500 mb-8">Last Updated: March 13, 2026</p>

        <div className="prose prose-gray dark:prose-invert max-w-none space-y-8">
          <section>
            <h2 className="text-2xl font-semibold mb-4">1. Introduction</h2>
            <p className="text-gray-600 dark:text-gray-400 leading-relaxed">
              NIRVAAAN ("we," "our," or "us") is committed to protecting your privacy. This Privacy Policy
              explains how we collect, use, disclose, and safeguard your information when you use our
              healthcare platform.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold mb-4">2. Information We Collect</h2>
            
            <h3 className="text-xl font-semibold mb-3 mt-6">2.1 Personal Information</h3>
            <ul className="list-disc list-inside space-y-2 text-gray-600 dark:text-gray-400">
              <li>Name, email address, phone number</li>
              <li>Date of birth, gender</li>
              <li>Profile photo (optional)</li>
              <li>Wallet address (for Web3 features)</li>
            </ul>

            <h3 className="text-xl font-semibold mb-3 mt-6">2.2 Medical Information</h3>
            <ul className="list-disc list-inside space-y-2 text-gray-600 dark:text-gray-400">
              <li>Symptoms and health concerns you report</li>
              <li>Medical history and records you upload</li>
              <li>Prescriptions and diagnoses from healthcare providers</li>
              <li>Vital signs (heart rate, blood pressure, etc.)</li>
              <li>AI-generated health analysis and recommendations</li>
            </ul>

            <h3 className="text-xl font-semibold mb-3 mt-6">2.3 Usage Information</h3>
            <ul className="list-disc list-inside space-y-2 text-gray-600 dark:text-gray-400">
              <li>Device information (IP address, browser type, operating system)</li>
              <li>Log data (access times, pages viewed, actions taken)</li>
              <li>Voice recordings (when using voice input feature)</li>
              <li>Transaction history (appointments, payments)</li>
            </ul>
          </section>

          <section>
            <h2 className="text-2xl font-semibold mb-4">3. How We Use Your Information</h2>
            <ul className="list-disc list-inside space-y-2 text-gray-600 dark:text-gray-400">
              <li>Provide AI-powered symptom analysis and health recommendations</li>
              <li>Connect you with healthcare providers</li>
              <li>Process appointments and payments</li>
              <li>Maintain your medical records securely</li>
              <li>Send notifications about appointments and prescriptions</li>
              <li>Improve our AI models and platform features</li>
              <li>Comply with legal obligations</li>
              <li>Prevent fraud and ensure platform security</li>
            </ul>
          </section>

          <section>
            <h2 className="text-2xl font-semibold mb-4">4. HIPAA Compliance</h2>
            <div className="bg-blue-50 dark:bg-blue-900/10 border border-blue-200 dark:border-blue-900/30 rounded-lg p-6">
              <p className="text-gray-700 dark:text-gray-300 leading-relaxed mb-4">
                NIRVAAAN is committed to compliance with the Health Insurance Portability and Accountability
                Act (HIPAA) for protecting your Protected Health Information (PHI).
              </p>
              <ul className="list-disc list-inside space-y-2 text-gray-700 dark:text-gray-300">
                <li>All PHI is encrypted in transit and at rest</li>
                <li>Access to PHI is restricted to authorized personnel only</li>
                <li>We maintain audit logs of all PHI access</li>
                <li>Business Associate Agreements (BAAs) are in place with third-party services</li>
                <li>Regular security assessments and updates are performed</li>
              </ul>
            </div>
          </section>

          <section>
            <h2 className="text-2xl font-semibold mb-4">5. Data Sharing and Disclosure</h2>
            
            <h3 className="text-xl font-semibold mb-3 mt-6">We share your information with:</h3>
            <ul className="list-disc list-inside space-y-2 text-gray-600 dark:text-gray-400">
              <li><strong>Healthcare Providers:</strong> Doctors you consult with on the platform</li>
              <li><strong>Service Providers:</strong> Supabase (database), OpenAI (AI analysis), payment processors</li>
              <li><strong>Legal Requirements:</strong> When required by law or to protect rights and safety</li>
            </ul>

            <h3 className="text-xl font-semibold mb-3 mt-6">We do NOT:</h3>
            <ul className="list-disc list-inside space-y-2 text-gray-600 dark:text-gray-400">
              <li>Sell your personal or medical information to third parties</li>
              <li>Share your data for marketing purposes without consent</li>
              <li>Use your medical data to train AI models without anonymization</li>
            </ul>
          </section>

          <section>
            <h2 className="text-2xl font-semibold mb-4">6. Data Security</h2>
            <p className="text-gray-600 dark:text-gray-400 leading-relaxed mb-4">
              We implement industry-standard security measures:
            </p>
            <ul className="list-disc list-inside space-y-2 text-gray-600 dark:text-gray-400">
              <li>End-to-end encryption for data transmission</li>
              <li>AES-256 encryption for data at rest</li>
              <li>Multi-factor authentication (MFA) support</li>
              <li>Regular security audits and penetration testing</li>
              <li>Row-level security (RLS) in our database</li>
              <li>Zero-knowledge proofs for blockchain transactions</li>
            </ul>
          </section>

          <section>
            <h2 className="text-2xl font-semibold mb-4">7. Your Rights</h2>
            <p className="text-gray-600 dark:text-gray-400 leading-relaxed mb-4">
              You have the right to:
            </p>
            <ul className="list-disc list-inside space-y-2 text-gray-600 dark:text-gray-400">
              <li><strong>Access:</strong> Request a copy of your personal and medical data</li>
              <li><strong>Correction:</strong> Update or correct inaccurate information</li>
              <li><strong>Deletion:</strong> Request deletion of your data (subject to legal requirements)</li>
              <li><strong>Portability:</strong> Export your data in a machine-readable format</li>
              <li><strong>Opt-out:</strong> Disable notifications and data sharing preferences</li>
              <li><strong>Revoke Consent:</strong> Withdraw consent for data processing at any time</li>
            </ul>
          </section>

          <section>
            <h2 className="text-2xl font-semibold mb-4">8. Cookies and Tracking</h2>
            <p className="text-gray-600 dark:text-gray-400 leading-relaxed">
              We use cookies and similar technologies to enhance your experience, analyze usage patterns,
              and maintain session security. You can control cookie preferences through your browser settings.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold mb-4">9. Third-Party Services</h2>
            <p className="text-gray-600 dark:text-gray-400 leading-relaxed mb-4">
              Our platform integrates with:
            </p>
            <ul className="list-disc list-inside space-y-2 text-gray-600 dark:text-gray-400">
              <li><strong>Supabase:</strong> Database and authentication (HIPAA-compliant configuration)</li>
              <li><strong>OpenAI:</strong> AI-powered symptom analysis (data anonymized)</li>
              <li><strong>Vercel:</strong> Hosting and deployment</li>
              <li><strong>Web3 Wallets:</strong> MetaMask, WalletConnect (decentralized, user-controlled)</li>
            </ul>
          </section>

          <section>
            <h2 className="text-2xl font-semibold mb-4">10. Data Retention</h2>
            <p className="text-gray-600 dark:text-gray-400 leading-relaxed">
              We retain your data for as long as your account is active or as needed to provide services.
              Medical records are retained for 7 years as required by law. You may request earlier deletion
              subject to legal and regulatory requirements.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold mb-4">11. Children's Privacy</h2>
            <p className="text-gray-600 dark:text-gray-400 leading-relaxed">
              NIRVAAAN is not intended for users under 18 years of age. We do not knowingly collect personal
              information from children. If you believe we have collected data from a minor, please contact us.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold mb-4">12. International Users</h2>
            <p className="text-gray-600 dark:text-gray-400 leading-relaxed">
              If you access NIRVAAAN from outside the United States, your information may be transferred to
              and processed in the U.S. By using the platform, you consent to this transfer.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold mb-4">13. Changes to This Policy</h2>
            <p className="text-gray-600 dark:text-gray-400 leading-relaxed">
              We may update this Privacy Policy periodically. We will notify you of significant changes
              via email or platform notification. Your continued use after changes constitutes acceptance.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold mb-4">14. Contact Us</h2>
            <p className="text-gray-600 dark:text-gray-400 leading-relaxed">
              For privacy-related questions or to exercise your rights:
              <br />
              <br />
              <strong>Email:</strong> privacy@nirvaaan.app
              <br />
              <strong>Data Protection Officer:</strong> dpo@nirvaaan.app
              <br />
              <strong>Address:</strong> [Your Company Address]
            </p>
          </section>
        </div>
      </div>
    </div>
  );
}
