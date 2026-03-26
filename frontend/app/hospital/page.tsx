"use client";

import { motion } from "framer-motion";
import { Users, Stethoscope, Calendar, Activity, TrendingUp } from "lucide-react";

export default function HospitalDashboard() {
    return (
        <div className="space-y-8">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <h1 className="text-3xl font-bold bg-gradient-to-r from-cyan-400 to-blue-500 bg-clip-text text-transparent">
                        Hospital Overview
                    </h1>
                    <p className="text-gray-400 mt-1">Manage doctors, patients, and scheduling efficiently.</p>
                </div>
                <div className="flex items-center gap-2 px-3 py-1 bg-cyan-500/10 border border-cyan-500/20 rounded-full text-xs font-mono text-cyan-400">
                    <span className="relative flex h-2 w-2">
                        <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-cyan-400 opacity-75"></span>
                        <span className="relative inline-flex rounded-full h-2 w-2 bg-cyan-500"></span>
                    </span>
                    System Operational
                </div>
            </div>

            {/* Stats Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                {[
                    { label: "Total Doctors", value: "24", icon: <Stethoscope size={24} />, color: "text-blue-400", bg: "bg-blue-500/10 border-blue-500/20" },
                    { label: "Active Patients", value: "1,284", icon: <Users size={24} />, color: "text-green-400", bg: "bg-green-500/10 border-green-500/20" },
                    { label: "Today's Appointments", value: "86", icon: <Calendar size={24} />, color: "text-purple-400", bg: "bg-purple-500/10 border-purple-500/20" },
                    { label: "Bed Availability", value: "12%", icon: <Activity size={24} />, color: "text-orange-400", bg: "bg-orange-500/10 border-orange-500/20" },
                ].map((stat, i) => (
                    <motion.div
                        key={stat.label}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: i * 0.1 }}
                        className={`p-6 rounded-2xl border ${stat.bg} backdrop-blur-sm`}
                    >
                        <div className="flex justify-between items-start mb-4">
                            <div className={`p-3 rounded-xl bg-black/20 ${stat.color}`}>
                                {stat.icon}
                            </div>
                            <span className="text-xs font-mono text-gray-500 bg-white/5 px-2 py-1 rounded">
                                +{Math.floor(Math.random() * 10)}%
                            </span>
                        </div>
                        <div className="text-3xl font-bold mb-1">{stat.value}</div>
                        <div className="text-sm text-gray-400">{stat.label}</div>
                    </motion.div>
                ))}
            </div>

            {/* Recent Activity Mockup */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                <div className="lg:col-span-2 p-6 rounded-2xl border border-white/10 bg-white/[0.02]">
                    <h3 className="text-lg font-semibold mb-6 flex items-center gap-2">
                        <TrendingUp size={20} className="text-cyan-400" /> Recent Appointments
                    </h3>
                    <div className="space-y-4">
                        {[1, 2, 3, 4, 5].map((_, i) => (
                            <div key={i} className="flex items-center justify-between p-4 rounded-xl bg-white/5 border border-white/5 hover:bg-white/[0.07] transition-colors">
                                <div className="flex items-center gap-4">
                                    <div className="w-10 h-10 rounded-full bg-gradient-to-br from-gray-700 to-gray-800 flex items-center justify-center font-bold text-gray-300">
                                        P{i + 1}
                                    </div>
                                    <div>
                                        <div className="font-medium">Patient Details Hidden</div>
                                        <div className="text-xs text-gray-500">Cardiology • Dr. Sarah Chen</div>
                                    </div>
                                </div>
                                <div className="text-right">
                                    <div className="text-sm font-mono text-gray-300">10:30 AM</div>
                                    <div className="text-xs text-cyan-400">Confirmed</div>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>

                <div className="p-6 rounded-2xl border border-white/10 bg-white/[0.02]">
                    <h3 className="text-lg font-semibold mb-6">Department Status</h3>
                    <div className="space-y-6">
                        {[
                            { name: "Emergency", status: "Critical", color: "text-red-400", bar: "bg-red-500" },
                            { name: "Cardiology", status: "Busy", color: "text-orange-400", bar: "bg-orange-500" },
                            { name: "Neurology", status: "Normal", color: "text-green-400", bar: "bg-green-500" },
                            { name: "Pediatrics", status: "Normal", color: "text-green-400", bar: "bg-green-500" },
                        ].map((dept) => (
                            <div key={dept.name}>
                                <div className="flex justify-between items-center mb-2">
                                    <span className="text-sm font-medium text-gray-300">{dept.name}</span>
                                    <span className={`text-xs font-mono ${dept.color}`}>{dept.status}</span>
                                </div>
                                <div className="h-2 w-full bg-white/5 rounded-full overflow-hidden">
                                    <div className={`h-full ${dept.bar} w-[70%] rounded-full opacity-60`}></div>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        </div>
    );
}
