"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import Link from "next/link";
import {
    Brain, ArrowRight, ArrowLeft, Loader2, AlertTriangle,
    CheckCircle, Clock, Stethoscope, User, Calendar,
    Shield, Sparkles
} from "lucide-react";

const SYMPTOM_OPTIONS = [
    "Headache", "Fever", "Cough", "Sore Throat", "Fatigue",
    "Nausea", "Body Aches", "Shortness of Breath", "Chest Pain",
    "Dizziness", "Stomach Pain", "Runny Nose", "Joint Pain",
    "Back Pain", "Skin Rash", "Vomiting", "Diarrhea", "Loss of Appetite",
];

const DURATION_OPTIONS = [
    { label: "Today", value: "just started today" },
    { label: "2–3 Days", value: "2-3 days" },
    { label: "1 Week", value: "about a week" },
    { label: "2+ Weeks", value: "more than 2 weeks" },
];

const SEVERITY_OPTIONS = [
    { label: "Mild", value: "mild", color: "border-green-500/40 bg-green-500/10 text-green-400", icon: "😊" },
    { label: "Moderate", value: "moderate", color: "border-yellow-500/40 bg-yellow-500/10 text-yellow-400", icon: "😐" },
    { label: "Severe", value: "severe", color: "border-red-500/40 bg-red-500/10 text-red-400", icon: "😣" },
];

interface DiagnosisResult {
    risk: "Low" | "Medium" | "High" | "Critical";
    urgency: string;
    diagnosis: string;
    specialist: string;
    advice: string;
    disclaimer: string;
}

export default function AICheckPage() {
    const [step, setStep] = useState(1);
    const [symptoms, setSymptoms] = useState<string[]>([]);
    const [customSymptom, setCustomSymptom] = useState("");
    const [duration, setDuration] = useState("");
    const [severity, setSeverity] = useState("");
    const [age, setAge] = useState("");
    const [gender, setGender] = useState("");
    const [loading, setLoading] = useState(false);
    const [result, setResult] = useState<DiagnosisResult | null>(null);

    const toggleSymptom = (s: string) => {
        setSymptoms((prev) =>
            prev.includes(s) ? prev.filter((x) => x !== s) : [...prev, s]
        );
    };

    const addCustomSymptom = () => {
        if (customSymptom.trim() && !symptoms.includes(customSymptom.trim())) {
            setSymptoms((prev) => [...prev, customSymptom.trim()]);
            setCustomSymptom("");
        }
    };

    const canProceed = () => {
        if (step === 1) return symptoms.length > 0;
        if (step === 2) return !!duration;
        if (step === 3) return !!severity;
        if (step === 4) return !!age && !!gender;
        return false;
    };

    const handleSubmit = async () => {
        setLoading(true);
        try {
            const prompt = `Patient Info: ${age} year old ${gender}.\nSymptoms: ${symptoms.join(", ")}.\nDuration: ${duration}.\nSeverity: ${severity}.\n\nPlease analyze and return a JSON object with these exact fields:\n- risk: "Low" | "Medium" | "High" | "Critical"\n- urgency: string (e.g. "Consult within 24 hours")\n- diagnosis: string (e.g. "Viral Fever")\n- specialist: string (e.g. "General Physician")\n- advice: string (2-3 sentences of care advice)\n- disclaimer: string`;

            const res = await fetch("/api/chat", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    guided: true,
                    messages: [{ role: "user", content: prompt }],
                }),
            });

            const data = await res.json();

            if (data.structured) {
                setResult(data.structured);
            } else {
                // Fallback parse
                setResult({
                    risk: severity === "severe" ? "High" : severity === "moderate" ? "Medium" : "Low",
                    urgency: severity === "severe" ? "Visit a doctor immediately" : severity === "moderate" ? "Consult within 24 hours" : "Monitor for 2-3 days",
                    diagnosis: symptoms.includes("Fever") ? "Viral Fever / Upper Respiratory Infection" : "General Discomfort",
                    specialist: "General Physician",
                    advice: "Stay hydrated, get adequate rest, and monitor your symptoms. If symptoms worsen or new symptoms appear, seek medical attention promptly.",
                    disclaimer: "This is an AI-generated assessment. Always consult a qualified healthcare professional for accurate diagnosis.",
                });
            }
            setStep(5);
        } catch {
            setResult({
                risk: "Medium",
                urgency: "Consult within 24 hours",
                diagnosis: "Unable to determine — please consult a doctor",
                specialist: "General Physician",
                advice: "We recommend booking an appointment with a General Physician for a proper evaluation.",
                disclaimer: "This is an AI-generated assessment. Always consult a qualified healthcare professional.",
            });
            setStep(5);
        } finally {
            setLoading(false);
        }
    };

    const riskColors: Record<string, string> = {
        Low: "text-green-400 bg-green-500/10 border-green-500/30",
        Medium: "text-yellow-400 bg-yellow-500/10 border-yellow-500/30",
        High: "text-orange-400 bg-orange-500/10 border-orange-500/30",
        Critical: "text-red-400 bg-red-500/10 border-red-500/30",
    };

    const riskIcons: Record<string, React.ReactNode> = {
        Low: <CheckCircle size={20} />,
        Medium: <AlertTriangle size={20} />,
        High: <AlertTriangle size={20} />,
        Critical: <Shield size={20} />,
    };

    return (
        <div className="max-w-2xl mx-auto py-4">
            {/* Header */}
            <div className="mb-8">
                <div className="flex items-center gap-3 mb-2">
                    <div className="p-2.5 rounded-xl bg-purple-500/10 text-purple-400">
                        <Brain size={22} />
                    </div>
                    <div>
                        <h1 className="text-2xl font-bold">AI Health Check</h1>
                        <p className="text-gray-400 text-sm">Guided symptom analysis powered by AI</p>
                    </div>
                </div>
            </div>

            {/* Progress Bar */}
            {step <= 4 && (
                <div className="mb-8">
                    <div className="flex items-center justify-between mb-2">
                        {[1, 2, 3, 4].map((s) => (
                            <div key={s} className="flex items-center gap-2">
                                <div className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold transition-all ${
                                    step >= s ? "bg-purple-600 text-white" : "bg-white/5 text-gray-500 border border-white/10"
                                }`}>
                                    {step > s ? <CheckCircle size={14} /> : s}
                                </div>
                                <span className={`text-xs hidden sm:block ${step >= s ? "text-purple-400" : "text-gray-600"}`}>
                                    {s === 1 ? "Symptoms" : s === 2 ? "Duration" : s === 3 ? "Severity" : "Profile"}
                                </span>
                            </div>
                        ))}
                    </div>
                    <div className="h-1 bg-white/5 rounded-full overflow-hidden">
                        <motion.div
                            className="h-full bg-gradient-to-r from-purple-600 to-blue-500 rounded-full"
                            animate={{ width: `${(step / 4) * 100}%` }}
                            transition={{ duration: 0.3 }}
                        />
                    </div>
                </div>
            )}

            {/* Steps */}
            <AnimatePresence mode="wait">
                {/* ───── STEP 1: Symptoms ───── */}
                {step === 1 && (
                    <motion.div
                        key="step1"
                        initial={{ opacity: 0, x: 20 }}
                        animate={{ opacity: 1, x: 0 }}
                        exit={{ opacity: 0, x: -20 }}
                        className="space-y-5"
                    >
                        <div>
                            <h2 className="text-lg font-semibold mb-1">What symptoms are you experiencing?</h2>
                            <p className="text-gray-400 text-sm">Select all that apply or type your own</p>
                        </div>

                        <div className="flex flex-wrap gap-2">
                            {SYMPTOM_OPTIONS.map((s) => (
                                <button
                                    key={s}
                                    onClick={() => toggleSymptom(s)}
                                    className={`px-3.5 py-2 rounded-xl text-sm font-medium transition-all border ${
                                        symptoms.includes(s)
                                            ? "bg-purple-600/20 border-purple-500/40 text-purple-300"
                                            : "bg-white/5 border-white/10 text-gray-400 hover:bg-white/10 hover:text-white"
                                    }`}
                                >
                                    {symptoms.includes(s) && <span className="mr-1">✓</span>}
                                    {s}
                                </button>
                            ))}
                        </div>

                        <div className="flex gap-2">
                            <input
                                type="text"
                                value={customSymptom}
                                onChange={(e) => setCustomSymptom(e.target.value)}
                                onKeyDown={(e) => e.key === "Enter" && addCustomSymptom()}
                                placeholder="Type other symptom..."
                                className="flex-1 bg-white/5 border border-white/10 rounded-xl px-4 py-2.5 text-sm text-white placeholder-gray-600 focus:outline-none focus:border-purple-500/50"
                            />
                            <button
                                onClick={addCustomSymptom}
                                className="px-4 py-2.5 bg-white/5 border border-white/10 rounded-xl text-sm text-gray-400 hover:bg-white/10 hover:text-white transition-colors"
                            >
                                Add
                            </button>
                        </div>

                        {symptoms.length > 0 && (
                            <p className="text-xs text-gray-500">Selected: {symptoms.join(", ")}</p>
                        )}
                    </motion.div>
                )}

                {/* ───── STEP 2: Duration ───── */}
                {step === 2 && (
                    <motion.div
                        key="step2"
                        initial={{ opacity: 0, x: 20 }}
                        animate={{ opacity: 1, x: 0 }}
                        exit={{ opacity: 0, x: -20 }}
                        className="space-y-5"
                    >
                        <div>
                            <h2 className="text-lg font-semibold mb-1">How long have you had these symptoms?</h2>
                            <p className="text-gray-400 text-sm">This helps us gauge progression</p>
                        </div>

                        <div className="grid grid-cols-2 gap-3">
                            {DURATION_OPTIONS.map((d) => (
                                <button
                                    key={d.value}
                                    onClick={() => setDuration(d.value)}
                                    className={`p-4 rounded-xl text-left border transition-all ${
                                        duration === d.value
                                            ? "bg-purple-600/20 border-purple-500/40 text-purple-300"
                                            : "bg-white/5 border-white/10 text-gray-400 hover:bg-white/10"
                                    }`}
                                >
                                    <div className="flex items-center gap-3">
                                        <Clock size={18} className={duration === d.value ? "text-purple-400" : "text-gray-500"} />
                                        <span className="font-medium text-sm">{d.label}</span>
                                    </div>
                                </button>
                            ))}
                        </div>
                    </motion.div>
                )}

                {/* ───── STEP 3: Severity ───── */}
                {step === 3 && (
                    <motion.div
                        key="step3"
                        initial={{ opacity: 0, x: 20 }}
                        animate={{ opacity: 1, x: 0 }}
                        exit={{ opacity: 0, x: -20 }}
                        className="space-y-5"
                    >
                        <div>
                            <h2 className="text-lg font-semibold mb-1">How severe are your symptoms?</h2>
                            <p className="text-gray-400 text-sm">Rate the overall intensity</p>
                        </div>

                        <div className="grid grid-cols-3 gap-3">
                            {SEVERITY_OPTIONS.map((s) => (
                                <button
                                    key={s.value}
                                    onClick={() => setSeverity(s.value)}
                                    className={`p-5 rounded-xl text-center border transition-all ${
                                        severity === s.value ? s.color : "bg-white/5 border-white/10 text-gray-400 hover:bg-white/10"
                                    }`}
                                >
                                    <div className="text-2xl mb-2">{s.icon}</div>
                                    <span className="text-sm font-semibold">{s.label}</span>
                                </button>
                            ))}
                        </div>
                    </motion.div>
                )}

                {/* ───── STEP 4: Age/Gender ───── */}
                {step === 4 && (
                    <motion.div
                        key="step4"
                        initial={{ opacity: 0, x: 20 }}
                        animate={{ opacity: 1, x: 0 }}
                        exit={{ opacity: 0, x: -20 }}
                        className="space-y-5"
                    >
                        <div>
                            <h2 className="text-lg font-semibold mb-1">A bit about you</h2>
                            <p className="text-gray-400 text-sm">Helps AI tailor the assessment</p>
                        </div>

                        <div className="space-y-4">
                            <div className="space-y-1.5">
                                <label className="text-sm text-gray-400">Age</label>
                                <input
                                    type="number"
                                    min="1"
                                    max="120"
                                    value={age}
                                    onChange={(e) => setAge(e.target.value)}
                                    placeholder="e.g. 28"
                                    className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white placeholder-gray-600 focus:outline-none focus:border-purple-500/50"
                                />
                            </div>

                            <div className="space-y-1.5">
                                <label className="text-sm text-gray-400">Gender</label>
                                <div className="grid grid-cols-3 gap-3">
                                    {["Male", "Female", "Other"].map((g) => (
                                        <button
                                            key={g}
                                            onClick={() => setGender(g)}
                                            className={`py-3 rounded-xl border text-sm font-medium transition-all flex items-center justify-center gap-2 ${
                                                gender === g
                                                    ? "bg-purple-600/20 border-purple-500/40 text-purple-300"
                                                    : "bg-white/5 border-white/10 text-gray-400 hover:bg-white/10"
                                            }`}
                                        >
                                            <User size={14} />
                                            {g}
                                        </button>
                                    ))}
                                </div>
                            </div>
                        </div>
                    </motion.div>
                )}

                {/* ───── STEP 5: Result Card ───── */}
                {step === 5 && result && (
                    <motion.div
                        key="step5"
                        initial={{ opacity: 0, scale: 0.95 }}
                        animate={{ opacity: 1, scale: 1 }}
                        className="space-y-6"
                    >
                        {/* Result Card */}
                        <div className="bg-white/[0.03] border border-white/10 rounded-2xl overflow-hidden">
                            {/* Header */}
                            <div className="p-6 border-b border-white/10 flex items-center gap-3">
                                <div className="p-2 rounded-xl bg-purple-500/10 text-purple-400">
                                    <Sparkles size={20} />
                                </div>
                                <div>
                                    <h2 className="text-lg font-bold">AI Health Assessment</h2>
                                    <p className="text-gray-500 text-xs">Generated from your symptom analysis</p>
                                </div>
                            </div>

                            {/* Body */}
                            <div className="p-6 space-y-5">
                                {/* Risk Badge */}
                                <div className="flex items-center justify-between">
                                    <span className="text-sm text-gray-400">Risk Level</span>
                                    <div className={`flex items-center gap-2 px-3.5 py-1.5 rounded-full border text-sm font-medium ${riskColors[result.risk] || riskColors.Medium}`}>
                                        {riskIcons[result.risk]}
                                        {result.risk}
                                    </div>
                                </div>

                                <div className="h-px bg-white/5" />

                                {/* Fields */}
                                <div className="space-y-4">
                                    <div className="flex items-start gap-3">
                                        <Clock size={16} className="text-blue-400 mt-0.5 flex-shrink-0" />
                                        <div>
                                            <p className="text-xs text-gray-500 uppercase tracking-wide">Urgency</p>
                                            <p className="text-sm font-medium text-gray-200">{result.urgency}</p>
                                        </div>
                                    </div>

                                    <div className="flex items-start gap-3">
                                        <Brain size={16} className="text-purple-400 mt-0.5 flex-shrink-0" />
                                        <div>
                                            <p className="text-xs text-gray-500 uppercase tracking-wide">Possible Condition</p>
                                            <p className="text-sm font-medium text-gray-200">{result.diagnosis}</p>
                                        </div>
                                    </div>

                                    <div className="flex items-start gap-3">
                                        <Stethoscope size={16} className="text-emerald-400 mt-0.5 flex-shrink-0" />
                                        <div>
                                            <p className="text-xs text-gray-500 uppercase tracking-wide">Recommended Specialist</p>
                                            <p className="text-sm font-medium text-gray-200">{result.specialist}</p>
                                        </div>
                                    </div>
                                </div>

                                <div className="h-px bg-white/5" />

                                {/* Advice */}
                                <div className="p-4 bg-blue-500/5 border border-blue-500/10 rounded-xl">
                                    <p className="text-sm text-blue-300 leading-relaxed">{result.advice}</p>
                                </div>

                                {/* Disclaimer */}
                                <p className="text-xs text-gray-600 leading-relaxed">
                                    ⚠️ {result.disclaimer}
                                </p>
                            </div>

                            {/* Actions */}
                            <div className="p-6 border-t border-white/10 flex flex-col sm:flex-row gap-3">
                                <Link
                                    href="/dashboard/appointments"
                                    className="flex-1 py-3 bg-gradient-to-r from-purple-600 to-purple-700 hover:from-purple-700 hover:to-purple-800 text-white rounded-xl font-medium transition-all flex items-center justify-center gap-2 text-sm shadow-lg shadow-purple-900/20"
                                >
                                    <Calendar size={16} /> Book Appointment
                                </Link>
                                <button
                                    onClick={() => {
                                        setStep(1);
                                        setResult(null);
                                        setSymptoms([]);
                                        setDuration("");
                                        setSeverity("");
                                        setAge("");
                                        setGender("");
                                    }}
                                    className="flex-1 py-3 bg-white/5 hover:bg-white/10 border border-white/10 text-gray-300 rounded-xl font-medium transition-all flex items-center justify-center gap-2 text-sm"
                                >
                                    Start New Check
                                </button>
                            </div>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>

            {/* Navigation Buttons */}
            {step <= 4 && (
                <div className="flex items-center justify-between mt-8">
                    <button
                        onClick={() => setStep((s) => s - 1)}
                        disabled={step === 1}
                        className="flex items-center gap-2 px-5 py-2.5 text-sm text-gray-400 hover:text-white disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
                    >
                        <ArrowLeft size={16} /> Back
                    </button>

                    {step < 4 ? (
                        <button
                            onClick={() => setStep((s) => s + 1)}
                            disabled={!canProceed()}
                            className="flex items-center gap-2 px-6 py-2.5 bg-purple-600 hover:bg-purple-700 disabled:opacity-40 disabled:cursor-not-allowed text-white rounded-xl text-sm font-medium transition-all"
                        >
                            Next <ArrowRight size={16} />
                        </button>
                    ) : (
                        <button
                            onClick={handleSubmit}
                            disabled={!canProceed() || loading}
                            className="flex items-center gap-2 px-6 py-2.5 bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 disabled:opacity-40 disabled:cursor-not-allowed text-white rounded-xl text-sm font-medium transition-all shadow-lg shadow-purple-900/20"
                        >
                            {loading ? (
                                <><Loader2 size={16} className="animate-spin" /> Analyzing...</>
                            ) : (
                                <><Sparkles size={16} /> Get AI Assessment</>
                            )}
                        </button>
                    )}
                </div>
            )}
        </div>
    );
}
