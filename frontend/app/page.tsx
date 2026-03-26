"use client";

import { motion, AnimatePresence } from "framer-motion";
import Link from "next/link";
import Image from "next/image";
import {
  Activity, ArrowRight, Shield, Zap, Cpu, Globe, Lock,
  Brain, Stethoscope, FileText, Wallet, Calendar, HeartPulse,
  ChevronDown, Check, Sparkles, Clock, Users, TrendingUp,
  MessageCircle, Star, FlaskConical, Scan, Phone, Mail,
  MapPin, Instagram, Linkedin, Facebook
} from "lucide-react";
import { useEffect, useState, useRef } from "react";
import CountUp from "react-countup";
import ThemeToggle from "@/components/ThemeToggle";

// ─── Data ────────────────────────────────────────────────────────────

const services = [
  {
    title: "AI Diagnostics",
    desc: "GPT-4o powered symptom analysis with real-time medical intelligence and voice input support.",
    icon: <Brain size={24} />,
    color: "from-purple-500/20 to-purple-600/5",
    border: "border-purple-500/20",
    iconColor: "text-purple-400",
    href: "/dashboard/diagnostics",
  },
  {
    title: "Doctor Consultations",
    desc: "Connect with verified specialists. Book online or in-person appointments instantly.",
    icon: <Stethoscope size={24} />,
    color: "from-blue-500/20 to-blue-600/5",
    border: "border-blue-500/20",
    iconColor: "text-blue-400",
    href: "/doctor",
  },
  {
    title: "Health Records",
    desc: "Upload, manage, and access your complete medical history securely.",
    icon: <FileText size={24} />,
    color: "from-emerald-500/20 to-emerald-600/5",
    border: "border-emerald-500/20",
    iconColor: "text-emerald-400",
    href: "/dashboard/records",
  },
  {
    title: "Web3 Health Wallet",
    desc: "ETH-powered payments, transaction history, and health NFTs on the blockchain.",
    icon: <Wallet size={24} />,
    color: "from-orange-500/20 to-orange-600/5",
    border: "border-orange-500/20",
    iconColor: "text-orange-400",
    href: "/dashboard/wallet",
  },
  {
    title: "Appointment Booking",
    desc: "Schedule, reschedule, or join video calls with your healthcare provider.",
    icon: <Calendar size={24} />,
    color: "from-cyan-500/20 to-cyan-600/5",
    border: "border-cyan-500/20",
    iconColor: "text-cyan-400",
    href: "/dashboard/appointments",
  },
  {
    title: "Real-Time Vitals",
    desc: "Monitor heart rate, blood pressure, SpO2, and temperature with live mini-charts.",
    icon: <HeartPulse size={24} />,
    color: "from-rose-500/20 to-rose-600/5",
    border: "border-rose-500/20",
    iconColor: "text-rose-400",
    href: "/dashboard/vitals",
  },
  {
    title: "Pathlab Services",
    desc: "Book lab tests from certified pathlabs. Home sample collection available.",
    icon: <FlaskConical size={24} />,
    color: "from-teal-500/20 to-teal-600/5",
    border: "border-teal-500/20",
    iconColor: "text-teal-400",
    href: "/dashboard/pathlab",
  },
  {
    title: "Radiology Centers",
    desc: "Schedule X-rays, MRIs, and CT scans at certified centers near you.",
    icon: <Scan size={24} />,
    color: "from-indigo-500/20 to-indigo-600/5",
    border: "border-indigo-500/20",
    iconColor: "text-indigo-400",
    href: "/dashboard/radiology",
  },
];

const steps = [
  {
    step: "01",
    title: "Describe Symptoms",
    desc: "Type or speak your symptoms using our AI-powered voice recognition interface.",
    icon: <MessageCircle size={28} />,
    color: "text-purple-400",
    bg: "bg-purple-500/10",
    href: "/dashboard/diagnostics",
  },
  {
    step: "02",
    title: "AI Analysis",
    desc: "GPT-4o analyzes your symptoms, cross-references medical databases, and suggests diagnoses.",
    icon: <Brain size={28} />,
    color: "text-blue-400",
    bg: "bg-blue-500/10",
    href: "/dashboard/diagnostics",
  },
  {
    step: "03",
    title: "Get Matched",
    desc: "Instantly connect with the right specialist, book appointments, or order prescriptions.",
    icon: <Stethoscope size={28} />,
    color: "text-emerald-400",
    bg: "bg-emerald-500/10",
    href: "/doctor",
  },
];

const whyChoose = [
  {
    title: "Decentralized & Private",
    desc: "Your medical data is secured on the blockchain. Zero-knowledge proofs ensure complete privacy.",
    icon: <Shield size={24} />,
    color: "text-purple-400",
  },
  {
    title: "AI-Powered Accuracy",
    desc: "Powered by GPT-4o with medical-grade system prompts. Not a chatbot — a diagnostic engine.",
    icon: <Sparkles size={24} />,
    color: "text-blue-400",
  },
  {
    title: "24/7 Always Online",
    desc: "Access your health assistant, records, and appointments anytime. 99.9% uptime guaranteed.",
    icon: <Clock size={24} />,
    color: "text-emerald-400",
  },
  {
    title: "Web3 Native",
    desc: "ETH payments, health NFTs, and blockchain-verified medical records. The future of healthcare.",
    icon: <Wallet size={24} />,
    color: "text-orange-400",
  },
];

const faqs = [
  {
    q: "How does the AI health assistant work?",
    a: "MedAI uses OpenAI's GPT-4o model with a specialized medical system prompt. You describe your symptoms via text or voice, and the AI provides analysis, potential diagnoses, urgency detection, and specialist recommendations. It always recommends consulting a professional for serious concerns.",
  },
  {
    q: "Is my medical data secure?",
    a: "Absolutely. Your data is encrypted using enterprise-grade security through Supabase. Our Web3 integration enables Zero-Knowledge Proof verification, meaning your medical records can be verified without exposing the underlying data.",
  },
  {
    q: "Can I consult doctors online?",
    a: "Yes! MedAI supports both online video consultations and in-person appointment booking. You can browse verified specialists, check availability, and join calls directly from your dashboard.",
  },
  {
    q: "What is the Web3 Health Wallet?",
    a: "The Health Wallet connects your Ethereum wallet (MetaMask, WalletConnect, Coinbase) to MedAI. You can make ETH payments for consultations, store health NFTs representing verified medical records, and view your transaction history.",
  },
  {
    q: "Can I book pathlab tests online?",
    a: "Yes! MedAI integrates with certified pathlabs across multiple cities. You can book diagnostic tests, schedule home sample collection, and receive your results digitally — all from your dashboard.",
  },
  {
    q: "How do I book an appointment?",
    a: "From your dashboard, navigate to Appointments. Browse available doctors by specialty, select a time slot, and confirm your booking. You'll see the appointment in your dashboard with options to reschedule, cancel, or join a video call.",
  },
  {
    q: "Is there a doctor portal?",
    a: "Yes! MedAI has a dedicated doctor portal where healthcare providers can manage patients, accept/reject appointment requests, write and send digital prescriptions, and track their practice metrics and revenue.",
  },
  {
    q: "What payment options are available?",
    a: "MedAI supports ETH cryptocurrency payments through our integrated Web3 wallet. Traditional payment methods can be added through the platform. All transactions are recorded on the blockchain for transparency.",
  },
];

const testimonials = [
  {
    name: "Dr. Sarah Chen",
    role: "General Physician",
    text: "MedAI's diagnostic engine is remarkably accurate. The AI suggests differentials I can work with, saving significant time during consultations.",
    rating: 5,
  },
  {
    name: "Michael P.",
    role: "Patient",
    text: "Being able to describe my symptoms by voice and get instant AI analysis before my doctor visit was game-changing. The Web3 wallet is a bonus!",
    rating: 5,
  },
  {
    name: "Dr. Emily Park",
    role: "Cardiologist",
    text: "The doctor portal makes managing appointments and prescriptions seamless. Finally a platform that thinks about the provider experience too.",
    rating: 5,
  },
];

const interfaceScreens = [
  {
    title: "Health Dashboard",
    desc: "Monitor vitals, appointments, and records in one place.",
    image: "/mockup-dashboard.png",
  },
  {
    title: "AI Diagnostics",
    desc: "GPT-4o powered symptom analysis with severity scoring.",
    image: "/mockup-diagnostics.png",
  },
  {
    title: "Doctor Network",
    desc: "Browse and book verified specialists instantly.",
    image: "/mockup-doctors.png",
  },
];

// ─── FAQ Accordion Component ─────────────────────────────────────────

function FAQItem({ q, a, isOpen, toggle }: { q: string; a: string; isOpen: boolean; toggle: () => void }) {
  return (
    <motion.div
      className={`border rounded-xl overflow-hidden transition-colors ${isOpen ? "border-purple-500/30 bg-purple-500/5" : "border-gray-200 dark:border-white/10 bg-gray-50 dark:bg-white/[0.02] hover:border-gray-300 dark:hover:border-white/20"}`}
    >
      <button
        onClick={toggle}
        className="w-full flex items-center justify-between p-5 text-left"
      >
        <span className="font-medium text-sm md:text-base text-gray-800 dark:text-gray-200 pr-4">{q}</span>
        <ChevronDown
          size={18}
          className={`text-gray-400 flex-shrink-0 transition-transform duration-300 ${isOpen ? "rotate-180 text-purple-400" : ""}`}
        />
      </button>
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.3 }}
          >
            <p className="px-5 pb-5 text-sm text-gray-500 dark:text-gray-400 leading-relaxed">{a}</p>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}

// ─── Main Page ───────────────────────────────────────────────────────

export default function Home() {
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });
  const [openFAQ, setOpenFAQ] = useState<number | null>(null);
  const [statsVisible, setStatsVisible] = useState(false);
  const [activeScreen, setActiveScreen] = useState(0);
  const statsRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      setMousePosition({ x: e.clientX, y: e.clientY });
    };
    window.addEventListener("mousemove", handleMouseMove);
    return () => window.removeEventListener("mousemove", handleMouseMove);
  }, []);

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => { if (entry.isIntersecting) setStatsVisible(true); },
      { threshold: 0.3 }
    );
    if (statsRef.current) observer.observe(statsRef.current);
    return () => observer.disconnect();
  }, []);

  // Auto-rotate mockup screens
  useEffect(() => {
    const interval = setInterval(() => {
      setActiveScreen((prev) => (prev + 1) % interfaceScreens.length);
    }, 4000);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="min-h-screen bg-white dark:bg-[#050505] text-gray-900 dark:text-white selection:bg-purple-500/30 font-sans">

      {/* ─── Background Grid ─── */}
      <div className="fixed inset-0 z-0 pointer-events-none dark:bg-[linear-gradient(to_right,#ffffff0a_1px,transparent_1px),linear-gradient(to_bottom,#ffffff0a_1px,transparent_1px)] bg-[linear-gradient(to_right,#00000008_1px,transparent_1px),linear-gradient(to_bottom,#00000008_1px,transparent_1px)] bg-[size:4rem_4rem] [mask-image:radial-gradient(ellipse_60%_50%_at_50%_0%,#000_70%,transparent_100%)]"></div>

      {/* ─── Navbar ─── */}
      <nav className="fixed top-0 w-full z-50 border-b border-gray-200 dark:border-white/10 bg-white/80 dark:bg-[#050505]/80 backdrop-blur-md">
        <div className="max-w-[1400px] mx-auto px-6 h-20 flex justify-between items-center">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-gradient-to-br from-purple-500 to-purple-700 text-white flex items-center justify-center rounded-lg font-bold text-lg">
              M
            </div>
            <span className="font-bold text-xl tracking-tight">MedAI</span>
          </div>

          <div className="hidden md:flex items-center gap-1 text-sm font-medium text-gray-500 dark:text-gray-400">
            {[
              { label: "Diagnostics", href: "/dashboard/diagnostics" },
              { label: "Dashboard", href: "/dashboard" },
              { label: "Doctor Portal", href: "/doctor" },
            ].map((item) => (
              <Link
                key={item.label}
                href={item.href}
                className="px-5 py-2 hover:bg-gray-100 dark:hover:bg-white/5 rounded-full transition-colors hover:text-gray-900 dark:hover:text-white"
              >
                {item.label}
              </Link>
            ))}
          </div>

          <div className="flex items-center gap-3">
            <ThemeToggle />
            <Link href="/login" className="hidden sm:block text-sm text-gray-500 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white transition-colors px-4 py-2">
              Sign In
            </Link>
            <Link href="/dashboard" className="bg-gradient-to-r from-purple-600 to-purple-700 hover:from-purple-700 hover:to-purple-800 text-white px-6 py-2.5 text-sm font-semibold rounded-lg transition-all shadow-lg shadow-purple-900/20">
              Launch App
            </Link>
          </div>
        </div>
      </nav>

      <main className="relative z-10">

        {/* ═══════════════════════════════════════════════════════
                    SECTION 1 — HERO
                ═══════════════════════════════════════════════════════ */}
        <section className="pt-32 pb-24 px-6 max-w-[1400px] mx-auto relative overflow-hidden">
          {/* Animated gradient orbs */}
          <div className="absolute top-20 left-1/4 w-[500px] h-[500px] bg-purple-600/20 rounded-full blur-[128px] animate-pulse pointer-events-none" />
          <div className="absolute bottom-0 right-1/4 w-[400px] h-[400px] bg-blue-600/15 rounded-full blur-[100px] animate-pulse pointer-events-none" style={{ animationDelay: "1s" }} />
          <div className="absolute top-40 right-10 w-[300px] h-[300px] bg-emerald-600/10 rounded-full blur-[80px] animate-pulse pointer-events-none" style={{ animationDelay: "2s" }} />

          <div className="grid grid-cols-1 md:grid-cols-12 gap-8 items-end">
            <div className="col-span-1 md:col-span-8">
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5 }}
                className="inline-flex items-center gap-2 mb-6 px-4 py-1.5 border border-purple-500/30 bg-purple-500/5 rounded-full text-xs font-mono text-purple-500 dark:text-purple-400 uppercase tracking-wider"
              >
                <div className="w-2 h-2 bg-purple-500 rounded-full animate-pulse" />
                Neural Engine v2.0 • GPT-4o Powered
              </motion.div>

              <motion.h1
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 0.1 }}
                className="text-4xl sm:text-6xl md:text-8xl font-medium tracking-tight leading-[0.95] mb-8"
              >
                The Medical <br />
                <span className="bg-gradient-to-r from-purple-400 via-purple-500 to-blue-500 bg-clip-text text-transparent">
                  Intelligence Layer
                </span>
              </motion.h1>

              <motion.p
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 0.15 }}
                className="text-gray-500 dark:text-gray-400 text-lg max-w-xl mb-10 leading-relaxed"
              >
                Decentralized AI-powered healthcare platform with real-time diagnostics,
                Web3 wallet integration, and a full doctor portal. Describe your symptoms —
                our neural engine handles the rest.
              </motion.p>

              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 0.2 }}
                className="flex flex-col sm:flex-row gap-4"
              >
                <Link href="/dashboard/ai-check" className="px-8 py-4 bg-gradient-to-r from-purple-600 to-purple-700 hover:from-purple-700 hover:to-purple-800 text-white rounded-lg font-medium transition-all flex items-center justify-center gap-2 shadow-lg shadow-purple-900/30">
                  Start Diagnosis <ArrowRight size={18} />
                </Link>
                <Link href="/signup" className="px-8 py-4 border border-gray-300 dark:border-white/20 hover:bg-gray-50 dark:hover:bg-white/5 rounded-lg font-medium transition-all flex items-center justify-center">
                  Create Account
                </Link>
              </motion.div>
            </div>

            <div className="col-span-1 md:col-span-4 text-right hidden md:block">
              <motion.p
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.4 }}
                className="text-gray-400 dark:text-gray-500 text-sm leading-relaxed max-w-xs ml-auto"
              >
                Decentralized protocol for symptom analysis and patient routing.
                Powered by zero-knowledge proofs and neural networks.
              </motion.p>
            </div>
          </div>
        </section>

        {/* ═══════════════════════════════════════════════════════
                    SECTION 1.5 — THE INTERFACE (MOCKUPS)
                ═══════════════════════════════════════════════════════ */}
        <section className="py-24 px-6 max-w-[1400px] mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-16"
          >
            <span className="text-xs font-mono uppercase tracking-widest text-purple-500 dark:text-purple-400 mb-4 block">00 / Experience</span>
            <h2 className="text-3xl md:text-5xl font-bold mb-4">The Interface</h2>
            <p className="text-gray-500 max-w-lg mx-auto">Navigate through your healthcare journey with a clean, modern dashboard.</p>
          </motion.div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            {/* Mockup Image */}
            <motion.div
              initial={{ opacity: 0, x: -30 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              className="relative"
            >
              <div className="relative rounded-2xl overflow-hidden border border-gray-200 dark:border-white/10 shadow-2xl shadow-purple-900/10 dark:shadow-purple-900/20 bg-gray-100 dark:bg-gray-900">
                {/* Browser chrome */}
                <div className="flex items-center gap-2 px-4 py-3 bg-gray-50 dark:bg-white/5 border-b border-gray-200 dark:border-white/10">
                  <div className="flex gap-1.5">
                    <div className="w-3 h-3 rounded-full bg-red-400/80" />
                    <div className="w-3 h-3 rounded-full bg-yellow-400/80" />
                    <div className="w-3 h-3 rounded-full bg-green-400/80" />
                  </div>
                  <div className="flex-1 ml-4">
                    <div className="bg-gray-200 dark:bg-white/10 rounded-md px-3 py-1 text-xs text-gray-400 font-mono max-w-xs">
                      medai.app/dashboard
                    </div>
                  </div>
                </div>

                {/* Screen content */}
                <AnimatePresence mode="wait">
                  <motion.div
                    key={activeScreen}
                    initial={{ opacity: 0, scale: 0.98 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.98 }}
                    transition={{ duration: 0.5 }}
                    className="relative aspect-[4/3] w-full"
                  >
                    <Image
                      src={interfaceScreens[activeScreen].image}
                      alt={interfaceScreens[activeScreen].title}
                      fill
                      sizes="(max-width: 768px) 100vw, 50vw"
                      className="object-cover"
                      priority
                    />
                  </motion.div>
                </AnimatePresence>
              </div>

              {/* Floating glow */}
              <div className="absolute -bottom-8 -right-8 w-[200px] h-[200px] bg-purple-500/20 rounded-full blur-[60px] pointer-events-none" />
            </motion.div>

            {/* Screen descriptions */}
            <motion.div
              initial={{ opacity: 0, x: 30 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              className="space-y-4"
            >
              {interfaceScreens.map((screen, i) => (
                <button
                  key={screen.title}
                  onClick={() => setActiveScreen(i)}
                  className={`w-full text-left p-6 rounded-xl border transition-all duration-300 ${activeScreen === i
                    ? "border-purple-500/30 bg-purple-500/5 dark:bg-purple-500/10"
                    : "border-gray-200 dark:border-white/10 bg-gray-50 dark:bg-white/[0.02] hover:border-gray-300 dark:hover:border-white/20"
                    }`}
                >
                  <div className="flex items-center gap-4">
                    <div className={`w-10 h-10 rounded-lg flex items-center justify-center text-sm font-mono font-bold ${activeScreen === i
                      ? "bg-purple-500 text-white"
                      : "bg-gray-200 dark:bg-white/10 text-gray-500 dark:text-gray-400"
                      }`}>
                      {String(i + 1).padStart(2, "0")}
                    </div>
                    <div>
                      <h3 className="font-semibold text-lg">{screen.title}</h3>
                      <p className="text-sm text-gray-500 dark:text-gray-400">{screen.desc}</p>
                    </div>
                  </div>

                  {/* Progress bar for active screen */}
                  {activeScreen === i && (
                    <motion.div
                      className="mt-4 h-1 bg-gray-200 dark:bg-white/10 rounded-full overflow-hidden"
                    >
                      <motion.div
                        className="h-full bg-gradient-to-r from-purple-500 to-blue-500 rounded-full"
                        initial={{ width: "0%" }}
                        animate={{ width: "100%" }}
                        transition={{ duration: 4, ease: "linear" }}
                        key={`progress-${activeScreen}`}
                      />
                    </motion.div>
                  )}
                </button>
              ))}
            </motion.div>
          </div>
        </section>

        {/* ═══════════════════════════════════════════════════════
                    SECTION 2 — STATS BAR
                ═══════════════════════════════════════════════════════ */}
        <section ref={statsRef} className="border-y border-gray-200 dark:border-white/10 bg-gray-50/50 dark:bg-white/[0.01]">
          <div className="max-w-[1400px] mx-auto grid grid-cols-2 md:grid-cols-4 divide-x divide-gray-200 dark:divide-white/10">
            {[
              { label: "Active Nodes", value: 8249, suffix: "" },
              { label: "Transactions", value: 2, suffix: "M+" },
              { label: "Uptime", value: 99.9, suffix: "%", decimals: 1 },
              { label: "Latency", value: 12, prefix: "<", suffix: "ms" },
            ].map((stat, i) => (
              <motion.div
                key={stat.label}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.1 }}
                className="py-10 md:py-14 px-6 text-center group hover:bg-gray-100/50 dark:hover:bg-white/[0.02] transition-colors"
              >
                <div className="text-3xl md:text-4xl font-bold mb-2">
                  {stat.prefix || ""}
                  {statsVisible ? (
                    <CountUp
                      end={stat.value}
                      duration={2.5}
                      separator=","
                      decimals={stat.decimals || 0}
                    />
                  ) : (
                    "0"
                  )}
                  {stat.suffix}
                </div>
                <div className="text-sm text-gray-400 dark:text-gray-500 font-mono uppercase tracking-wider">{stat.label}</div>
              </motion.div>
            ))}
          </div>
        </section>

        {/* ═══════════════════════════════════════════════════════
                    SECTION 3 — SERVICES (8 cards, 4-col grid)
                ═══════════════════════════════════════════════════════ */}
        <section className="py-24 px-6 max-w-[1400px] mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-16"
          >
            <span className="text-xs font-mono uppercase tracking-widest text-purple-500 dark:text-purple-400 mb-4 block">01 / Services</span>
            <h2 className="text-3xl md:text-5xl font-bold mb-4">Everything You Need</h2>
            <p className="text-gray-500 max-w-lg mx-auto">A complete healthcare ecosystem powered by artificial intelligence and blockchain technology.</p>
          </motion.div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {services.map((service, i) => (
              <Link key={service.title} href={service.href} className="block">
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: i * 0.06 }}
                  className={`group relative p-6 rounded-2xl border ${service.border} bg-gradient-to-br ${service.color} dark:backdrop-blur-sm overflow-hidden hover:border-gray-400 dark:hover:border-white/20 transition-all duration-300 cursor-pointer h-full`}
                >
                  {/* Mouse glow */}
                  <div
                    className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none"
                    style={{
                      background: `radial-gradient(600px circle at ${mousePosition.x}px ${mousePosition.y}px, rgba(139, 92, 246, 0.06), transparent 40%)`,
                    }}
                  />

                  <div className={`w-12 h-12 rounded-xl bg-white/10 dark:bg-white/5 flex items-center justify-center mb-4 ${service.iconColor} group-hover:scale-110 transition-transform`}>
                    {service.icon}
                  </div>
                  <h3 className="text-lg font-semibold mb-2">{service.title}</h3>
                  <p className="text-gray-500 dark:text-gray-400 text-sm leading-relaxed">{service.desc}</p>

                  <div className="absolute top-5 right-5 opacity-0 group-hover:opacity-100 transition-all duration-300 transform translate-x-2 group-hover:translate-x-0">
                    <ArrowRight className="text-gray-400 dark:text-white/40" size={18} />
                  </div>
                </motion.div>
              </Link>
            ))}
          </div>
        </section>

        {/* ═══════════════════════════════════════════════════════
                    SECTION 4 — HOW IT WORKS
                ═══════════════════════════════════════════════════════ */}
        <section className="py-24 px-6 max-w-[1400px] mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-16"
          >
            <span className="text-xs font-mono uppercase tracking-widest text-purple-500 dark:text-purple-400 mb-4 block">02 / How It Works</span>
            <h2 className="text-3xl md:text-5xl font-bold mb-4">Three Steps to Better Health</h2>
            <p className="text-gray-500 max-w-lg mx-auto">From symptom to specialist in minutes, not days.</p>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {steps.map((step, i) => (
              <Link key={step.step} href={step.href} className="block relative group">
                <motion.div
                  initial={{ opacity: 0, y: 30 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: i * 0.15 }}
                  className="relative h-full"
                >
                  {/* Connector line */}
                  {i < steps.length - 1 && (
                    <div className="hidden md:block absolute top-16 left-[calc(100%+1rem)] w-[calc(100%-2rem)] h-px bg-gradient-to-r from-gray-300 dark:from-white/10 to-transparent -translate-x-8" />
                  )}

                  <div className="p-8 bg-gray-50 dark:bg-white/[0.02] border border-gray-200 dark:border-white/10 rounded-2xl hover:border-purple-500/30 dark:hover:border-purple-500/30 hover:shadow-lg hover:shadow-purple-500/5 transition-all relative overflow-hidden cursor-pointer h-full">
                    <div className="absolute top-4 right-4 text-6xl font-black text-gray-100 dark:text-white/[0.03] leading-none select-none">
                      {step.step}
                    </div>
                    <div className={`w-14 h-14 rounded-2xl ${step.bg} flex items-center justify-center mb-6 ${step.color} group-hover:scale-110 transition-transform`}>
                      {step.icon}
                    </div>
                    <div className="text-xs font-mono text-gray-400 dark:text-gray-500 uppercase tracking-wider mb-2">Step {step.step}</div>
                    <h3 className="text-xl font-semibold mb-3">{step.title}</h3>
                    <p className="text-gray-500 dark:text-gray-400 text-sm leading-relaxed">{step.desc}</p>

                    <div className="mt-4 flex items-center gap-1.5 text-sm font-medium text-purple-500 dark:text-purple-400 opacity-0 group-hover:opacity-100 transition-opacity">
                      Try it now <ArrowRight size={14} />
                    </div>
                  </div>
                </motion.div>
              </Link>
            ))}
          </div>
        </section>

        {/* ═══════════════════════════════════════════════════════
                    SECTION 5 — WHY CHOOSE MEDAI
                ═══════════════════════════════════════════════════════ */}
        <section className="py-24 px-6 max-w-[1400px] mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-16"
          >
            <span className="text-xs font-mono uppercase tracking-widest text-purple-500 dark:text-purple-400 mb-4 block">03 / Why MedAI</span>
            <h2 className="text-3xl md:text-5xl font-bold mb-4">Built Different</h2>
            <p className="text-gray-500 max-w-lg mx-auto">Not just another health app. A decentralized intelligence layer for the future of medicine.</p>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {whyChoose.map((item, i) => (
              <motion.div
                key={item.title}
                initial={{ opacity: 0, x: i % 2 === 0 ? -20 : 20 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.1 }}
                className="flex gap-5 p-6 bg-gray-50 dark:bg-white/[0.02] border border-gray-200 dark:border-white/10 rounded-2xl hover:border-gray-300 dark:hover:border-white/20 transition-all group"
              >
                <div className={`w-12 h-12 rounded-xl bg-white dark:bg-white/5 shadow-sm dark:shadow-none flex items-center justify-center flex-shrink-0 ${item.color} group-hover:scale-110 transition-transform`}>
                  {item.icon}
                </div>
                <div>
                  <h3 className="text-lg font-semibold mb-1">{item.title}</h3>
                  <p className="text-gray-500 dark:text-gray-400 text-sm leading-relaxed">{item.desc}</p>
                </div>
              </motion.div>
            ))}
          </div>
        </section>

        {/* ═══════════════════════════════════════════════════════
                    SECTION 6 — TESTIMONIALS
                ═══════════════════════════════════════════════════════ */}
        <section className="py-24 px-6 max-w-[1400px] mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-16"
          >
            <span className="text-xs font-mono uppercase tracking-widest text-purple-500 dark:text-purple-400 mb-4 block">04 / Testimonials</span>
            <h2 className="text-3xl md:text-5xl font-bold mb-4">Trusted by Professionals</h2>
            <p className="text-gray-500 max-w-lg mx-auto">What doctors and patients say about MedAI.</p>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {testimonials.map((t, i) => (
              <motion.div
                key={t.name}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.1 }}
                className="p-6 bg-gray-50 dark:bg-white/[0.02] border border-gray-200 dark:border-white/10 rounded-2xl hover:border-gray-300 dark:hover:border-white/20 transition-all"
              >
                <div className="flex gap-1 mb-4">
                  {Array.from({ length: t.rating }).map((_, j) => (
                    <Star key={j} size={14} className="text-yellow-500 fill-yellow-500" />
                  ))}
                </div>
                <p className="text-gray-700 dark:text-gray-300 text-sm leading-relaxed mb-5">&ldquo;{t.text}&rdquo;</p>
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-gradient-to-br from-purple-500/30 to-blue-500/30 flex items-center justify-center text-sm font-bold text-purple-600 dark:text-purple-300">
                    {t.name.split(" ").map(n => n[0]).join("")}
                  </div>
                  <div>
                    <div className="font-medium text-sm">{t.name}</div>
                    <div className="text-xs text-gray-400 dark:text-gray-500">{t.role}</div>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </section>

        {/* ═══════════════════════════════════════════════════════
                    SECTION 7 — FAQ
                ═══════════════════════════════════════════════════════ */}
        <section className="py-24 px-6 max-w-[800px] mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-16"
          >
            <span className="text-xs font-mono uppercase tracking-widest text-purple-500 dark:text-purple-400 mb-4 block">05 / FAQ</span>
            <h2 className="text-3xl md:text-5xl font-bold mb-4">Common Questions</h2>
          </motion.div>

          <div className="space-y-3">
            {faqs.map((faq, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 10 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.05 }}
              >
                <FAQItem
                  q={faq.q}
                  a={faq.a}
                  isOpen={openFAQ === i}
                  toggle={() => setOpenFAQ(openFAQ === i ? null : i)}
                />
              </motion.div>
            ))}
          </div>
        </section>

        {/* ═══════════════════════════════════════════════════════
                    SECTION 8 — CTA
                ═══════════════════════════════════════════════════════ */}
        <section className="py-24 px-6">
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true }}
            className="max-w-[1000px] mx-auto relative overflow-hidden"
          >
            <div className="absolute inset-0 bg-gradient-to-br from-purple-600/20 via-purple-900/10 to-blue-600/10 rounded-3xl" />
            <div className="absolute top-0 right-0 w-[400px] h-[400px] bg-purple-500/10 rounded-full blur-[80px] pointer-events-none" />

            <div className="relative p-12 md:p-16 text-center rounded-3xl border border-purple-500/20">
              <h2 className="text-3xl md:text-5xl font-bold mb-4">
                Start Your Health <br />
                <span className="bg-gradient-to-r from-purple-400 to-blue-400 bg-clip-text text-transparent">Journey Today</span>
              </h2>
              <p className="text-gray-500 dark:text-gray-400 max-w-md mx-auto mb-8">
                Join the decentralized healthcare revolution. AI diagnostics, Web3 wallet, and
                a full medical ecosystem — free to start.
              </p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <Link href="/signup" className="px-8 py-4 bg-gradient-to-r from-purple-600 to-purple-700 hover:from-purple-700 hover:to-purple-800 text-white rounded-lg font-medium transition-all shadow-lg shadow-purple-900/30 flex items-center justify-center gap-2">
                  Create Free Account <ArrowRight size={18} />
                </Link>
                <Link href="https://github.com/Aayush9-spec/Health_AI" target="_blank" className="px-8 py-4 border border-gray-300 dark:border-white/20 hover:bg-gray-50 dark:hover:bg-white/5 rounded-lg font-medium transition-all flex items-center justify-center">
                  View on GitHub
                </Link>
              </div>
            </div>
          </motion.div>
        </section>

      </main>

      {/* ═══════════════════════════════════════════════════════
                FOOTER (Enhanced with Contact Info + Socials)
            ═══════════════════════════════════════════════════════ */}
      <footer className="border-t border-gray-200 dark:border-white/10 bg-gray-50 dark:bg-[#050505]">
        <div className="max-w-[1400px] mx-auto px-6 py-16">
          <div className="grid grid-cols-1 md:grid-cols-5 gap-12 mb-12">
            {/* Brand */}
            <div className="md:col-span-1">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-10 h-10 bg-gradient-to-br from-purple-500 to-purple-700 text-white flex items-center justify-center rounded-lg font-bold text-lg">
                  M
                </div>
                <span className="font-bold text-xl">MedAI</span>
              </div>
              <p className="text-gray-500 text-sm leading-relaxed">
                Decentralized health intelligence platform powered by AI and blockchain.
              </p>
            </div>

            {/* Platform */}
            <div>
              <h4 className="font-semibold text-sm uppercase tracking-wider text-gray-700 dark:text-gray-300 mb-4">Platform</h4>
              <div className="flex flex-col gap-3">
                <Link href="/dashboard/diagnostics" className="text-sm text-gray-500 hover:text-gray-900 dark:hover:text-white transition-colors">AI Diagnostics</Link>
                <Link href="/dashboard/appointments" className="text-sm text-gray-500 hover:text-gray-900 dark:hover:text-white transition-colors">Appointments</Link>
                <Link href="/dashboard/records" className="text-sm text-gray-500 hover:text-gray-900 dark:hover:text-white transition-colors">Health Records</Link>
                <Link href="/dashboard/wallet" className="text-sm text-gray-500 hover:text-gray-900 dark:hover:text-white transition-colors">Web3 Wallet</Link>
                <Link href="/dashboard/pathlab" className="text-sm text-gray-500 hover:text-gray-900 dark:hover:text-white transition-colors">Pathlab Services</Link>
                <Link href="/dashboard/radiology" className="text-sm text-gray-500 hover:text-gray-900 dark:hover:text-white transition-colors">Radiology Centers</Link>
              </div>
            </div>

            {/* Providers */}
            <div>
              <h4 className="font-semibold text-sm uppercase tracking-wider text-gray-700 dark:text-gray-300 mb-4">For Doctors</h4>
              <div className="flex flex-col gap-3">
                <Link href="/doctor" className="text-sm text-gray-500 hover:text-gray-900 dark:hover:text-white transition-colors">Doctor Dashboard</Link>
                <Link href="/doctor/patients" className="text-sm text-gray-500 hover:text-gray-900 dark:hover:text-white transition-colors">Patient Management</Link>
                <Link href="/doctor/prescriptions" className="text-sm text-gray-500 hover:text-gray-900 dark:hover:text-white transition-colors">Prescriptions</Link>
                <Link href="/doctor/appointments" className="text-sm text-gray-500 hover:text-gray-900 dark:hover:text-white transition-colors">Appointments</Link>
              </div>
            </div>

            {/* Contact Info */}
            <div>
              <h4 className="font-semibold text-sm uppercase tracking-wider text-gray-700 dark:text-gray-300 mb-4">Contact Us</h4>
              <div className="flex flex-col gap-3">
                <a href="tel:+916394882033" className="flex items-center gap-2 text-sm text-gray-500 hover:text-gray-900 dark:hover:text-white transition-colors">
                  <Phone size={14} /> +91 6394 882 033
                </a>
                <a href="mailto:support@medai.health" className="flex items-center gap-2 text-sm text-gray-500 hover:text-gray-900 dark:hover:text-white transition-colors">
                  <Mail size={14} /> support@medai.health
                </a>
                <span className="flex items-center gap-2 text-sm text-gray-500">
                  <MapPin size={14} /> New Delhi, India
                </span>
              </div>
            </div>

            {/* Socials */}
            <div>
              <h4 className="font-semibold text-sm uppercase tracking-wider text-gray-700 dark:text-gray-300 mb-4">Connect</h4>
              <div className="flex flex-col gap-3">
                <Link href="https://github.com/Aayush9-spec/Health_AI" target="_blank" className="text-sm text-gray-500 hover:text-gray-900 dark:hover:text-white transition-colors">GitHub</Link>
                <Link href="https://twitter.com" target="_blank" className="text-sm text-gray-500 hover:text-gray-900 dark:hover:text-white transition-colors">Twitter</Link>
                <Link href="https://linkedin.com" target="_blank" className="text-sm text-gray-500 hover:text-gray-900 dark:hover:text-white transition-colors">LinkedIn</Link>
                <Link href="https://instagram.com" target="_blank" className="text-sm text-gray-500 hover:text-gray-900 dark:hover:text-white transition-colors">Instagram</Link>
              </div>
              <div className="flex gap-3 mt-5">
                <a href="https://instagram.com" target="_blank" rel="noopener noreferrer" className="w-9 h-9 rounded-lg bg-gray-200 dark:bg-white/5 flex items-center justify-center text-gray-500 hover:text-purple-500 hover:bg-gray-300 dark:hover:bg-white/10 transition-all">
                  <Instagram size={16} />
                </a>
                <a href="https://linkedin.com" target="_blank" rel="noopener noreferrer" className="w-9 h-9 rounded-lg bg-gray-200 dark:bg-white/5 flex items-center justify-center text-gray-500 hover:text-purple-500 hover:bg-gray-300 dark:hover:bg-white/10 transition-all">
                  <Linkedin size={16} />
                </a>
                <a href="https://facebook.com" target="_blank" rel="noopener noreferrer" className="w-9 h-9 rounded-lg bg-gray-200 dark:bg-white/5 flex items-center justify-center text-gray-500 hover:text-purple-500 hover:bg-gray-300 dark:hover:bg-white/10 transition-all">
                  <Facebook size={16} />
                </a>
              </div>
            </div>
          </div>

          <div className="border-t border-gray-200 dark:border-white/10 pt-8 flex flex-col md:flex-row justify-between items-center gap-4">
            <div className="text-sm text-gray-400 dark:text-gray-600">
              © 2026 MedAI Protocol. All rights reserved.
            </div>
            <div className="flex gap-6 text-sm text-gray-400 dark:text-gray-600">
              <Link href="/privacy" className="hover:text-gray-600 dark:hover:text-gray-400 transition-colors">Privacy Policy</Link>
              <Link href="/terms" className="hover:text-gray-600 dark:hover:text-gray-400 transition-colors">Terms of Service</Link>
              <Link href="/medical-disclaimer" className="hover:text-gray-600 dark:hover:text-gray-400 transition-colors">Medical Disclaimer</Link>
            </div>
          </div>
        </div>
      </footer>

    </div>
  );
}
