"use client";

import { Activity, Users, Calendar, FileText, ArrowUpRight, Clock, Loader2 } from "lucide-react";
import { motion } from "framer-motion";
import { useState, useEffect } from "react";
import { getCurrentUserId, getDoctorStats, getNextDoctorAppointment, getProfile, DoctorStats, DoctorAppointment } from "@/lib/supabase-helpers";

export default function DoctorDashboard() {
    const [stats, setStats] = useState<DoctorStats | null>(null);
    const [nextApt, setNextApt] = useState<DoctorAppointment | null>(null);
    const [doctorName, setDoctorName] = useState("");
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const load = async () => {
            const userId = await getCurrentUserId();
            if (!userId) { setLoading(false); return; }

            const [statsData, nextData, profile] = await Promise.all([
                getDoctorStats(userId),
                getNextDoctorAppointment(userId),
                getProfile(userId),
            ]);

            setStats(statsData);
            setNextApt(nextData);
            setDoctorName(profile?.full_name || "Doctor");
            setLoading(false);
        };
        load();
    }, []);

    if (loading) {
        return (
            <div className="flex items-center justify-center min-h-[60vh]">
                <Loader2 className="animate-spin text-blue-500" size={32} />
            </div>
        );
    }

    const greeting = () => {
        const hour = new Date().getHours();
        if (hour < 12) return "Good Morning";
        if (hour < 17) return "Good Afternoon";
        return "Good Evening";
    };

    const statCards = [
        {
            label: "Today's Appointments",
            value: stats?.todayAppointments ?? 0,
            icon: <Calendar />,
            color: "text-blue-400",
            bg: "bg-blue-500/10",
        },
        {
            label: "Total Patients",
            value: stats?.totalPatients ?? 0,
            icon: <Users />,
            color: "text-purple-400",
            bg: "bg-purple-500/10",
        },
        {
            label: "Pending Reports",
            value: stats?.pendingReports ?? 0,
            icon: <Activity />,
            color: "text-orange-400",
            bg: "bg-orange-500/10",
        },
        {
            label: "Prescriptions Sent",
            value: stats?.totalPrescriptions ?? 0,
            icon: <FileText />,
            color: "text-green-400",
            bg: "bg-green-500/10",
        },
    ];

    return (
        <div className="space-y-8">
            <div>
                <h1 className="text-3xl font-bold mb-2">
                    {greeting()}, Dr. {doctorName.split(" ").pop()}
                </h1>
                <p className="text-gray-400">Here&apos;s your daily practice overview</p>
            </div>

            {/* Stats Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                {statCards.map((stat, index) => (
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: index * 0.1 }}
                        key={stat.label}
                        className="p-6 bg-white/[0.02] border border-white/5 rounded-2xl hover:bg-white/[0.04] transition-colors"
                    >
                        <div className="flex justify-between items-start mb-4">
                            <div className={`p-3 rounded-xl ${stat.bg} ${stat.color}`}>
                                {stat.icon}
                            </div>
                        </div>
                        <h3 className="text-2xl font-bold mb-1">{stat.value}</h3>
                        <p className="text-sm text-gray-500">{stat.label}</p>
                    </motion.div>
                ))}
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* Quick Links */}
                <div className="lg:col-span-2 bg-white/[0.02] border border-white/10 rounded-2xl p-6">
                    <h2 className="text-xl font-semibold mb-6">Quick Actions</h2>
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                        {[
                            { label: "View Patients", href: "/doctor/patients", color: "text-purple-400 hover:border-purple-500/30" },
                            { label: "Appointments", href: "/doctor/appointments", color: "text-blue-400 hover:border-blue-500/30" },
                            { label: "Write Prescription", href: "/doctor/prescriptions", color: "text-green-400 hover:border-green-500/30" },
                        ].map((link) => (
                            <a
                                key={link.label}
                                href={link.href}
                                className={`flex items-center justify-between p-4 bg-white/5 rounded-xl border border-white/5 ${link.color} transition-colors`}
                            >
                                <span className="font-medium text-sm">{link.label}</span>
                                <ArrowUpRight size={18} />
                            </a>
                        ))}
                    </div>
                </div>

                {/* Next Appointment Card */}
                <div className="bg-gradient-to-br from-blue-900/20 to-indigo-900/20 border border-blue-500/20 rounded-2xl p-6 relative overflow-hidden">
                    <div className="absolute top-0 right-0 w-32 h-32 bg-blue-500/10 rounded-full blur-3xl -mr-16 -mt-16 pointer-events-none" />

                    <h2 className="text-lg font-semibold mb-6 flex items-center gap-2">
                        <Clock size={18} className="text-blue-400" /> Up Next
                    </h2>

                    {nextApt ? (
                        <div className="space-y-6 relative z-10">
                            <div className="flex items-center gap-4">
                                <div className="w-12 h-12 rounded-full bg-gray-700 flex items-center justify-center text-lg font-bold">
                                    {(nextApt.patient?.full_name || "P").charAt(0).toUpperCase()}
                                </div>
                                <div>
                                    <h3 className="font-semibold text-lg">{nextApt.patient?.full_name || "Patient"}</h3>
                                    <p className="text-blue-300 text-sm">{nextApt.type === "online" ? "Online Consultation" : "In-Person Visit"}</p>
                                </div>
                            </div>

                            <div className="flex gap-3 text-sm">
                                <div className="px-3 py-1.5 bg-black/30 rounded-lg text-gray-300 border border-white/5">
                                    {nextApt.time}
                                </div>
                                <div className="px-3 py-1.5 bg-black/30 rounded-lg text-gray-300 border border-white/5">
                                    {new Date(nextApt.date + "T00:00:00").toLocaleDateString("en-US", { month: "short", day: "numeric" })}
                                </div>
                            </div>

                            <div className="w-full h-px bg-white/10" />

                            <div className="flex gap-3">
                                {nextApt.type === "online" && nextApt.meet_link && (
                                    <a
                                        href={nextApt.meet_link}
                                        target="_blank"
                                        className="flex-1 py-2 rounded-lg bg-blue-600 hover:bg-blue-700 text-white font-medium text-sm transition-colors text-center"
                                    >
                                        Join Call
                                    </a>
                                )}
                                <a
                                    href="/doctor/appointments"
                                    className="px-4 py-2 rounded-lg bg-white/5 hover:bg-white/10 text-gray-300 border border-white/10 text-sm font-medium transition-colors text-center flex-1"
                                >
                                    View All
                                </a>
                            </div>
                        </div>
                    ) : (
                        <div className="text-center py-6">
                            <p className="text-gray-500 text-sm">No upcoming appointments</p>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}
