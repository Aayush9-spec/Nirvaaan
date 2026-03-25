"use client";

import { useState, useEffect } from "react";
import { HeartPulse, Thermometer, Droplets, Wind, Activity, TrendingUp, TrendingDown, Minus, Plus, X, Loader2, Save } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { getCurrentUserId, logVitals, getVitalsHistory, VitalEntry } from "@/lib/supabase-helpers";

// ─── Sparkline ──────────────────────────────────────────────────────
function Sparkline({ data, color, height = 48 }: { data: number[]; color: string; height?: number }) {
    if (data.length < 2) return null;
    const min = Math.min(...data);
    const max = Math.max(...data);
    const range = max - min || 1;
    const w = 160;
    const points = data
        .map((v, i) => `${(i / (data.length - 1)) * w},${height - ((v - min) / range) * (height - 8) - 4}`)
        .join(" ");

    return (
        <svg width={w} height={height} className="opacity-60">
            <polyline fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" points={points} />
        </svg>
    );
}

// ─── Trend Icon ─────────────────────────────────────────────────────
function TrendIcon({ trend }: { trend: "up" | "down" | "stable" }) {
    if (trend === "up") return <TrendingUp size={14} className="text-green-400" />;
    if (trend === "down") return <TrendingDown size={14} className="text-red-400" />;
    return <Minus size={14} className="text-gray-400" />;
}

function getTrend(data: number[]): "up" | "down" | "stable" {
    if (data.length < 2) return "stable";
    const last = data[data.length - 1];
    const prev = data[data.length - 2];
    if (last > prev) return "up";
    if (last < prev) return "down";
    return "stable";
}

// ─── Main Page ──────────────────────────────────────────────────────
export default function VitalsPage() {
    const [history, setHistory] = useState<VitalEntry[]>([]);
    const [loading, setLoading] = useState(true);
    const [showForm, setShowForm] = useState(false);
    const [saving, setSaving] = useState(false);

    // Form fields
    const [heartRate, setHeartRate] = useState("");
    const [systolic, setSystolic] = useState("");
    const [diastolic, setDiastolic] = useState("");
    const [spo2, setSpo2] = useState("");
    const [temperature, setTemperature] = useState("");
    const [respRate, setRespRate] = useState("");
    const [notes, setNotes] = useState("");

    useEffect(() => {
        loadVitals();
    }, []);

    const loadVitals = async () => {
        const userId = await getCurrentUserId();
        if (!userId) { setLoading(false); return; }
        const data = await getVitalsHistory(userId, 30);
        setHistory(data);
        setLoading(false);
    };

    const handleSave = async () => {
        const userId = await getCurrentUserId();
        if (!userId) return;

        setSaving(true);
        const success = await logVitals({
            patient_id: userId,
            heart_rate: heartRate ? parseInt(heartRate) : undefined,
            systolic: systolic ? parseInt(systolic) : undefined,
            diastolic: diastolic ? parseInt(diastolic) : undefined,
            spo2: spo2 ? parseFloat(spo2) : undefined,
            temperature: temperature ? parseFloat(temperature) : undefined,
            respiratory_rate: respRate ? parseInt(respRate) : undefined,
            notes: notes || undefined,
        });

        if (success) {
            setShowForm(false);
            setHeartRate(""); setSystolic(""); setDiastolic(""); setSpo2(""); setTemperature(""); setRespRate(""); setNotes("");
            await loadVitals();
        }
        setSaving(false);
    };

    // Extract sparkline data from history
    const hrData = history.filter(v => v.heart_rate != null).map(v => v.heart_rate!).reverse();
    const spo2Data = history.filter(v => v.spo2 != null).map(v => v.spo2!).reverse();
    const tempData = history.filter(v => v.temperature != null).map(v => v.temperature!).reverse();
    const respData = history.filter(v => v.respiratory_rate != null).map(v => v.respiratory_rate!).reverse();

    const latestHr = hrData.length > 0 ? hrData[hrData.length - 1] : null;
    const latestSpo2 = spo2Data.length > 0 ? spo2Data[spo2Data.length - 1] : null;
    const latestTemp = tempData.length > 0 ? tempData[tempData.length - 1] : null;
    const latestResp = respData.length > 0 ? respData[respData.length - 1] : null;
    const latestBp = history.find(v => v.systolic != null && v.diastolic != null);

    const vitalCards = [
        {
            label: "Heart Rate",
            value: latestHr ?? "—",
            unit: "BPM",
            icon: <HeartPulse size={20} />,
            color: "text-red-400",
            bg: "bg-red-500/10",
            border: "border-red-500/20",
            sparkColor: "#f87171",
            trend: getTrend(hrData),
            data: hrData,
            normal: "60–100 BPM",
        },
        {
            label: "Blood Pressure",
            value: latestBp ? `${latestBp.systolic}/${latestBp.diastolic}` : "—",
            unit: "mmHg",
            icon: <Activity size={20} />,
            color: "text-blue-400",
            bg: "bg-blue-500/10",
            border: "border-blue-500/20",
            sparkColor: "#60a5fa",
            trend: "stable" as const,
            data: [],
            normal: "120/80 mmHg",
        },
        {
            label: "SpO₂",
            value: latestSpo2 ?? "—",
            unit: "%",
            icon: <Droplets size={20} />,
            color: "text-cyan-400",
            bg: "bg-cyan-500/10",
            border: "border-cyan-500/20",
            sparkColor: "#22d3ee",
            trend: getTrend(spo2Data),
            data: spo2Data,
            normal: "95–100%",
        },
        {
            label: "Temperature",
            value: latestTemp ?? "—",
            unit: "°F",
            icon: <Thermometer size={20} />,
            color: "text-orange-400",
            bg: "bg-orange-500/10",
            border: "border-orange-500/20",
            sparkColor: "#fb923c",
            trend: getTrend(tempData),
            data: tempData,
            normal: "97–99°F",
        },
        {
            label: "Respiratory Rate",
            value: latestResp ?? "—",
            unit: "BPM",
            icon: <Wind size={20} />,
            color: "text-green-400",
            bg: "bg-green-500/10",
            border: "border-green-500/20",
            sparkColor: "#4ade80",
            trend: getTrend(respData),
            data: respData,
            normal: "12–20 BPM",
        },
    ];

    if (loading) {
        return (
            <div className="flex items-center justify-center min-h-[60vh]">
                <Loader2 className="animate-spin text-purple-500" size={32} />
            </div>
        );
    }

    return (
        <div className="space-y-8">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                    <h1 className="text-2xl font-bold mb-1">Real-Time Vitals</h1>
                    <p className="text-gray-400 text-sm">
                        {history.length > 0 ? `${history.length} recorded entries` : "No vitals recorded yet — log your first entry"}
                    </p>
                </div>
                <motion.button
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={() => setShowForm(true)}
                    className="px-5 py-2.5 bg-gradient-to-r from-purple-600 to-purple-700 hover:from-purple-700 hover:to-purple-800 text-white rounded-xl font-medium transition-all shadow-lg shadow-purple-900/20 flex items-center gap-2 self-start"
                >
                    <Plus size={18} /> Log Vitals
                </motion.button>
            </div>

            {/* Vital Cards Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                {vitalCards.map((vital, index) => (
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: index * 0.08 }}
                        key={vital.label}
                        className={`p-6 bg-white/[0.02] border ${vital.border} rounded-2xl hover:bg-white/[0.04] transition-colors relative overflow-hidden`}
                    >
                        <div className="flex items-start justify-between mb-4">
                            <div className={`p-3 rounded-xl ${vital.bg} ${vital.color}`}>
                                {vital.icon}
                            </div>
                            <div className="flex items-center gap-1.5">
                                <TrendIcon trend={vital.trend} />
                                <span className="text-xs text-gray-500">{vital.trend}</span>
                            </div>
                        </div>

                        <h3 className="text-3xl font-bold mb-1">
                            {vital.value}
                            <span className="text-sm font-normal text-gray-500 ml-1.5">{vital.unit}</span>
                        </h3>
                        <p className="text-sm text-gray-500 mb-3">{vital.label}</p>

                        <div className="flex items-center justify-between">
                            <span className="text-xs text-gray-600">Normal: {vital.normal}</span>
                        </div>

                        {vital.data.length > 1 && (
                            <div className="mt-3 -mx-2">
                                <Sparkline data={vital.data} color={vital.sparkColor} />
                            </div>
                        )}
                    </motion.div>
                ))}
            </div>

            {/* History Table */}
            {history.length > 0 && (
                <div className="bg-white/[0.02] border border-white/10 rounded-2xl overflow-hidden">
                    <div className="p-5 border-b border-white/10">
                        <h3 className="font-semibold text-lg">Recent Readings</h3>
                    </div>
                    <div className="overflow-x-auto">
                        <table className="w-full text-sm">
                            <thead>
                                <tr className="text-gray-500 text-xs uppercase border-b border-white/5">
                                    <th className="text-left px-5 py-3 font-medium">Date</th>
                                    <th className="text-center px-3 py-3 font-medium">HR</th>
                                    <th className="text-center px-3 py-3 font-medium">BP</th>
                                    <th className="text-center px-3 py-3 font-medium">SpO₂</th>
                                    <th className="text-center px-3 py-3 font-medium">Temp</th>
                                    <th className="text-center px-3 py-3 font-medium">RR</th>
                                    <th className="text-left px-5 py-3 font-medium">Notes</th>
                                </tr>
                            </thead>
                            <tbody>
                                {history.slice(0, 10).map((entry, i) => (
                                    <tr key={entry.id} className="border-b border-white/5 last:border-0 hover:bg-white/[0.02] transition-colors">
                                        <td className="px-5 py-3 text-gray-300">
                                            {new Date(entry.recorded_at).toLocaleDateString("en-US", { month: "short", day: "numeric", hour: "2-digit", minute: "2-digit" })}
                                        </td>
                                        <td className="text-center px-3 py-3 text-red-400 font-mono">{entry.heart_rate ?? "—"}</td>
                                        <td className="text-center px-3 py-3 text-blue-400 font-mono">
                                            {entry.systolic && entry.diastolic ? `${entry.systolic}/${entry.diastolic}` : "—"}
                                        </td>
                                        <td className="text-center px-3 py-3 text-cyan-400 font-mono">{entry.spo2 ?? "—"}</td>
                                        <td className="text-center px-3 py-3 text-orange-400 font-mono">{entry.temperature ?? "—"}</td>
                                        <td className="text-center px-3 py-3 text-green-400 font-mono">{entry.respiratory_rate ?? "—"}</td>
                                        <td className="px-5 py-3 text-gray-500 text-xs max-w-[150px] truncate">{entry.notes || "—"}</td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>
            )}

            {/* Log Vitals Modal */}
            <AnimatePresence>
                {showForm && (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4"
                        onClick={() => setShowForm(false)}
                    >
                        <motion.div
                            initial={{ scale: 0.95 }}
                            animate={{ scale: 1 }}
                            exit={{ scale: 0.95 }}
                            onClick={(e) => e.stopPropagation()}
                            className="bg-[#0a0a0a] border border-white/10 rounded-2xl p-6 w-full max-w-lg"
                        >
                            <div className="flex items-center justify-between mb-6">
                                <h3 className="text-lg font-bold">Log Vitals</h3>
                                <button onClick={() => setShowForm(false)} className="text-gray-500 hover:text-white"><X size={20} /></button>
                            </div>

                            <div className="grid grid-cols-2 gap-4 mb-4">
                                <div className="space-y-1.5">
                                    <label className="text-xs text-gray-400">Heart Rate (BPM)</label>
                                    <input type="number" value={heartRate} onChange={(e) => setHeartRate(e.target.value)} placeholder="72" className="w-full bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-white text-sm focus:outline-none focus:border-red-500/50" />
                                </div>
                                <div className="space-y-1.5">
                                    <label className="text-xs text-gray-400">SpO₂ (%)</label>
                                    <input type="number" step="0.1" value={spo2} onChange={(e) => setSpo2(e.target.value)} placeholder="98" className="w-full bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-white text-sm focus:outline-none focus:border-cyan-500/50" />
                                </div>
                                <div className="space-y-1.5">
                                    <label className="text-xs text-gray-400">Systolic (mmHg)</label>
                                    <input type="number" value={systolic} onChange={(e) => setSystolic(e.target.value)} placeholder="120" className="w-full bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-white text-sm focus:outline-none focus:border-blue-500/50" />
                                </div>
                                <div className="space-y-1.5">
                                    <label className="text-xs text-gray-400">Diastolic (mmHg)</label>
                                    <input type="number" value={diastolic} onChange={(e) => setDiastolic(e.target.value)} placeholder="80" className="w-full bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-white text-sm focus:outline-none focus:border-blue-500/50" />
                                </div>
                                <div className="space-y-1.5">
                                    <label className="text-xs text-gray-400">Temperature (°F)</label>
                                    <input type="number" step="0.1" value={temperature} onChange={(e) => setTemperature(e.target.value)} placeholder="98.6" className="w-full bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-white text-sm focus:outline-none focus:border-orange-500/50" />
                                </div>
                                <div className="space-y-1.5">
                                    <label className="text-xs text-gray-400">Respiratory Rate</label>
                                    <input type="number" value={respRate} onChange={(e) => setRespRate(e.target.value)} placeholder="16" className="w-full bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-white text-sm focus:outline-none focus:border-green-500/50" />
                                </div>
                            </div>

                            <div className="space-y-1.5 mb-6">
                                <label className="text-xs text-gray-400">Notes (optional)</label>
                                <input type="text" value={notes} onChange={(e) => setNotes(e.target.value)} placeholder="Any additional notes..." className="w-full bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-white text-sm focus:outline-none focus:border-purple-500/50" />
                            </div>

                            <button
                                onClick={handleSave}
                                disabled={saving || (!heartRate && !systolic && !spo2 && !temperature && !respRate)}
                                className="w-full py-3 bg-purple-600 hover:bg-purple-700 disabled:opacity-50 disabled:cursor-not-allowed text-white rounded-xl font-medium transition-colors flex items-center justify-center gap-2"
                            >
                                {saving ? <Loader2 size={18} className="animate-spin" /> : <><Save size={18} /> Save Entry</>}
                            </button>
                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
}
