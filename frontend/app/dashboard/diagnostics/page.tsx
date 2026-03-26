"use client";

import { Activity, Heart, Thermometer, Droplets, TrendingUp, TrendingDown, Clock, Loader2, Minus, Wind } from "lucide-react";
import { motion } from "framer-motion";
import { useState, useEffect } from "react";
import { getCurrentUserId, getVitalsHistory, getRecentActivity, VitalEntry } from "@/lib/supabase-helpers";

function MiniChart({ data, color }: { data: number[]; color: string }) {
    if (data.length < 2) return null;
    const min = Math.min(...data);
    const max = Math.max(...data);
    const range = max - min || 1;
    const w = 120;
    const h = 40;
    const points = data
        .map((v, i) => `${(i / (data.length - 1)) * w},${h - ((v - min) / range) * (h - 8) - 4}`)
        .join(" ");

    return (
        <svg width={w} height={h} className="opacity-50">
            <polyline fill="none" stroke={color} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" points={points} />
        </svg>
    );
}

export default function DiagnosticsPage() {
    const [vitals, setVitals] = useState<VitalEntry[]>([]);
    const [logs, setLogs] = useState<{ date: string; event: string; status: string; color: string }[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const load = async () => {
            const userId = await getCurrentUserId();
            if (!userId) { setLoading(false); return; }

            const [vitalsData, logsData] = await Promise.all([
                getVitalsHistory(userId, 15),
                getRecentActivity(userId),
            ]);

            setVitals(vitalsData);
            setLogs(logsData);
            setLoading(false);
        };
        load();
    }, []);

    // Build card data from latest vitals
    const hrData = vitals.filter(v => v.heart_rate != null).map(v => v.heart_rate!).reverse();
    const spo2Data = vitals.filter(v => v.spo2 != null).map(v => v.spo2!).reverse();
    const tempData = vitals.filter(v => v.temperature != null).map(v => v.temperature!).reverse();
    const latestBp = vitals.find(v => v.systolic != null);

    const getTrend = (data: number[]) => {
        if (data.length < 2) return "stable";
        return data[data.length - 1] > data[data.length - 2] ? "up" : data[data.length - 1] < data[data.length - 2] ? "down" : "stable";
    };

    const vitalCards = [
        {
            label: "Heart Rate",
            value: hrData.length > 0 ? hrData[hrData.length - 1] : "—",
            unit: "BPM",
            icon: <Heart size={20} />,
            color: "text-red-400",
            bg: "bg-red-500/10",
            chartColor: "#f87171",
            trend: getTrend(hrData),
            history: hrData,
        },
        {
            label: "Blood Pressure",
            value: latestBp ? `${latestBp.systolic}/${latestBp.diastolic}` : "—",
            unit: "mmHg",
            icon: <Activity size={20} />,
            color: "text-blue-400",
            bg: "bg-blue-500/10",
            chartColor: "#60a5fa",
            trend: "stable",
            history: [],
        },
        {
            label: "SpO₂",
            value: spo2Data.length > 0 ? spo2Data[spo2Data.length - 1] : "—",
            unit: "%",
            icon: <Droplets size={20} />,
            color: "text-cyan-400",
            bg: "bg-cyan-500/10",
            chartColor: "#22d3ee",
            trend: getTrend(spo2Data),
            history: spo2Data,
        },
        {
            label: "Temperature",
            value: tempData.length > 0 ? tempData[tempData.length - 1] : "—",
            unit: "°F",
            icon: <Thermometer size={20} />,
            color: "text-orange-400",
            bg: "bg-orange-500/10",
            chartColor: "#fb923c",
            trend: getTrend(tempData),
            history: tempData,
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
            <div>
                <h1 className="text-2xl font-bold mb-1">Diagnostics Overview</h1>
                <p className="text-gray-400 text-sm">Your health metrics and recent activity at a glance</p>
            </div>

            {/* Vitals Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
                {vitalCards.map((vital, index) => (
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: index * 0.1 }}
                        key={vital.label}
                        className="p-5 bg-white/[0.02] border border-white/10 rounded-2xl hover:bg-white/[0.04] transition-colors relative overflow-hidden"
                    >
                        <div className="flex items-center justify-between mb-3">
                            <div className={`p-2.5 rounded-xl ${vital.bg} ${vital.color}`}>
                                {vital.icon}
                            </div>
                            <div className="flex items-center gap-1">
                                {vital.trend === "up" && <TrendingUp size={14} className="text-green-400" />}
                                {vital.trend === "down" && <TrendingDown size={14} className="text-red-400" />}
                                {vital.trend === "stable" && <Minus size={14} className="text-gray-500" />}
                            </div>
                        </div>
                        <h3 className="text-2xl font-bold mb-0.5">
                            {vital.value}
                            <span className="text-xs font-normal text-gray-500 ml-1">{vital.unit}</span>
                        </h3>
                        <p className="text-xs text-gray-500">{vital.label}</p>

                        {vital.history.length > 1 && (
                            <div className="mt-2 -mx-1">
                                <MiniChart data={vital.history} color={vital.chartColor} />
                            </div>
                        )}
                    </motion.div>
                ))}
            </div>

            {/* Recent Health Activity */}
            <div className="bg-white/[0.02] border border-white/10 rounded-2xl p-6">
                <h2 className="text-lg font-semibold mb-4 flex items-center gap-2">
                    <Clock size={18} className="text-gray-400" /> Recent Health Activity
                </h2>

                {logs.length > 0 ? (
                    <div className="space-y-3">
                        {logs.map((log, i) => (
                            <motion.div
                                initial={{ opacity: 0, x: -10 }}
                                animate={{ opacity: 1, x: 0 }}
                                transition={{ delay: i * 0.05 }}
                                key={i}
                                className="flex items-center justify-between p-3 bg-white/[0.02] rounded-xl border border-white/5"
                            >
                                <div className="flex items-center gap-4">
                                    <span className="text-xs text-gray-500 font-mono w-14">{log.date}</span>
                                    <span className="text-sm text-gray-300">{log.event}</span>
                                </div>
                                <span className={`text-xs font-medium ${log.color}`}>{log.status}</span>
                            </motion.div>
                        ))}
                    </div>
                ) : (
                    <p className="text-gray-500 text-sm">No recent activity. Book an appointment or log your vitals to see activity here.</p>
                )}
            </div>
        </div>
    );
}
