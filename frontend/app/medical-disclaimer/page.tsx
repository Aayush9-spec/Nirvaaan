"use client";

import Link from "next/link";
import { ArrowLeft, AlertTriangle } from "lucide-react";

export default function MedicalDisclaimer() {
  return (
    <div className="min-h-screen bg-white dark:bg-[#050505] text-gray-900 dark:text-white">
      <div className="max-w-4xl mx-auto px-6 py-12">
        <Link
          href="/"
          className="inline-flex items-center gap-2 text-sm text-gray-500 hover:text-gray-900 dark:hover:text-white mb-8"
        >
          <ArrowLeft size={16} /> Back to Home
        </Link>

        <div className="flex items-center gap-3 mb-4">
          <AlertTriangle className="text-red-500" size={32} />
          <h1 className="text-4xl font-bold">Medical Disclaimer</h1>
        </div>
        <p className="text-gray-500 mb-8">Last Updated: March 13, 2026</p>

        <div className="bg-red-50 dark:bg-red-900/10 border-2 border-red-500 rounded-lg p-8 mb-8">
          <h2 className="text-2xl font-bold text-red-800 dark:text-red-400 mb-4">
            CRITICAL: READ BEFORE USING NIRVAAAN
          </h2>
          <p className="text-red-700 dark:text-red-300 text-lg leading-relaxed">
            NIRVAAAN's AI-powered diagnostic tool is NOT a substitute for professional medical advice,
            diagnosis, or treatment. Always seek the advice of your physician or other qualified health
            provider with any questions you may have regarding a medical condition.
          </p>
        </div>

        <div className="prose prose-gray dark:prose-invert max-w-none space-y-8">
          <section>
            <h2 className="text-2xl font-semibold mb-4">1. No Doctor-Patient Relationship</h2>
            <p className="text-gray-600 dark:text-gray-400 leading-relaxed">
              Use of NIRVAAAN's AI diagnostic tool does NOT create a doctor-patient relationship. The AI
              provides general health information based on symptoms you describe, but it cannot replace
              a licensed healthcare professional's examination and judgment.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold mb-4">2. AI Limitations</h2>
            <ul className="list-disc list-inside space-y-2 text-gray-600 dark:text-gray-400">
              <li>AI cannot perform physical examinations</li>
              <li>AI cannot order or interpret diagnostic tests</li>
              <li>AI may not have access to your complete medical history</li>
              <li>AI suggestions are based on patterns, not individual assessment</li>
              <li>AI can make errors or provide incomplete information</li>
            </ul>
          </section>

          <section>
            <h2 className="text-2xl font-semibold mb-4">3. Emergency Situations</h2>
            <div className="bg-yellow-50 dark:bg-yellow-900/10 border border-yellow-500 rounded-lg p-6">
              <p className="text-yellow-800 dark:text-yellow-400 font-semibold mb-3">
                DO NOT USE NIRVAAAN FOR EMERGENCIES
              </p>
              <p className="text-gray-700 dark:text-gray-300 mb-3">
                If you are experiencing a medical emergency, call your local emergency number immediately:
              </p>
              <ul className="list-disc list-inside space-y-1 text-gray-700 dark:text-gray-300">
                <li>USA: 911</li>
                <li>UK: 999</li>
                <li>EU: 112</li>
                <li>India: 102 or 108</li>
              </ul>
            </div>
          </section>

          <section>
            <h2 className="text-2xl font-semibold mb-4">4. Consult Healthcare Professionals</h2>
            <p className="text-gray-600 dark:text-gray-400 leading-relaxed">
              Always consult with a qualified healthcare provider before:
            </p>
            <ul className="list-disc list-inside space-y-2 text-gray-600 dark:text-gray-400 mt-3">
              <li>Starting any new treatment or medication</li>
              <li>Stopping any current medication</li>
              <li>Making decisions about your health</li>
              <li>Ignoring or delaying professional medical advice</li>
            </ul>
          </section>

          <section>
            <h2 className="text-2xl font-semibold mb-4">5. No Guarantee of Accuracy</h2>
            <p className="text-gray-600 dark:text-gray-400 leading-relaxed">
              While NIRVAAAN uses advanced AI technology (GPT-4o), we make no warranties about the accuracy,
              completeness, or reliability of any health information provided. Medical knowledge evolves
              constantly, and AI models may not reflect the latest research.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold mb-4">6. Individual Variation</h2>
            <p className="text-gray-600 dark:text-gray-400 leading-relaxed">
              Every person is unique. Symptoms, conditions, and appropriate treatments vary significantly
              between individuals. What works for one person may not work for another. Only a healthcare
              professional who knows your complete medical history can provide personalized advice.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold mb-4">7. Third-Party Healthcare Providers</h2>
            <p className="text-gray-600 dark:text-gray-400 leading-relaxed">
              NIRVAAAN connects you with independent healthcare providers. We do not employ these providers
              and are not responsible for their professional conduct, diagnoses, or treatment decisions.
              Any medical advice you receive from providers through our platform is their professional
              opinion, not ours.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold mb-4">8. Liability Disclaimer</h2>
            <p className="text-gray-600 dark:text-gray-400 leading-relaxed">
              NIRVAAAN and its affiliates shall not be liable for any damages arising from your use of the
              AI diagnostic tool or any health decisions made based on information provided by the platform.
              You use NIRVAAAN at your own risk.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold mb-4">9. Acknowledgment</h2>
            <p className="text-gray-600 dark:text-gray-400 leading-relaxed">
              By using Med
AI, you acknowledge that you have read, understood, and agree to this Medical
              Disclaimer. You understand that NIRVAAAN is a tool to assist in health awareness and provider
              connection, not a replacement for professional medical care.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold mb-4">10. Contact Information</h2>
            <p className="text-gray-600 dark:text-gray-400 leading-relaxed">
              For questions about this disclaimer:
              <br />
              Email: medical@nirvaaan.app
            </p>
          </section>
        </div>
      </div>
    </div>
  );
}
