"use client";

import { Calendar, Clock, Video, MapPin, Check, X, User, ChevronRight, Loader2 } from "lucide-react";
import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { getCurrentUserId, getDoctorAppointments, updateAppointmentStatus, DoctorAppointment } from "@/lib/supabase-helpers";

type AppointmentStatus = { [id: string]: "accepting" | "rejecting" };

export default function DoctorAppointmentsPage() {
    const [appointments, setAppointments] = useState<DoctorAppointment[]>([]);
    const [filter, setFilter] = useState<"all" | "upcoming" | "completed" | "cancelled">("all");
    const [loading, setLoading] = useState(true);
    const [actionStatus, setActionStatus] = useState<AppointmentStatus>({});

    useEffect(() => {
        loadAppointments();
    }, [filter]);

    const loadAppointments = async () => {
        const userId = await getCurrentUserId();
        if (!userId) { setLoading(false); return; }
        setLoading(true);
        const data = await getDoctorAppointments(
            userId,
            filter === "all" ? undefined : filter as "upcoming" | "completed" | "cancelled"
        );
        setAppointments(data);
        setLoading(false);
    };

    const handleAccept = async (id: string) => {
        setActionStatus((prev) => ({ ...prev, [id]: "accepting" }));
        await updateAppointmentStatus(id, "completed");
        setActionStatus((prev) => { const n = { ...prev }; delete n[id]; return n; });
        await loadAppointments();
    };

    const handleReject = async (id: string) => {
        setActionStatus((prev) => ({ ...prev, [id]: "rejecting" }));
        await updateAppointmentStatus(id, "cancelled");
        setActionStatus((prev) => { const n = { ...prev }; delete n[id]; return n; });
        await loadAppointments();
    };

    const getStatusBadge = (status: string) => {
        switch (status) {
            case "upcoming": return "bg-blue-500/10 text-blue-400 border-blue-500/20";
            case "completed": return "bg-green-500/10 text-green-400 border-green-500/20";
            case "cancelled": return "bg-red-500/10 text-red-400 border-red-500/20";
            case "rescheduled": return "bg-yellow-500/10 text-yellow-400 border-yellow-500/20";
            default: return "bg-gray-500/10 text-gray-400 border-gray-500/20";
        }
    };

    const filters = [
        { key: "all", label: "All" },
        { key: "upcoming", label: "Upcoming" },
        { key: "completed", label: "Completed" },
        { key: "cancelled", label: "Cancelled" },
    ];

    return (
        <div className="space-y-8">
            <div>
                <h1 className="text-2xl font-bold mb-1">Appointments</h1>
                <p className="text-gray-400 text-sm">Manage your patient appointments</p>
            </div>

            {/* Filters */}
            <div className="flex gap-2 flex-wrap">
                {filters.map((f) => (
                    <button
                        key={f.key}
                        onClick={() => setFilter(f.key as typeof filter)}
                        className={`px-4 py-2 rounded-lg text-sm font-medium transition-all border ${filter === f.key
                                ? "bg-blue-600/20 border-blue-500/30 text-blue-400"
                                : "bg-white/5 border-white/10 text-gray-400 hover:bg-white/10"
                            }`}
                    >
                        {f.label}
                    </button>
                ))}
            </div>

            {/* Appointments List */}
            {loading ? (
                <div className="flex items-center justify-center py-20">
                    <Loader2 className="animate-spin text-blue-500" size={32} />
                </div>
            ) : appointments.length === 0 ? (
                <div className="text-center py-20 text-gray-500">
                    <Calendar size={48} className="mx-auto mb-4 opacity-30" />
                    <p className="text-lg font-medium">No appointments found</p>
                    <p className="text-sm mt-1">Appointments booked by patients will appear here</p>
                </div>
            ) : (
                <div className="space-y-4">
                    {appointments.map((apt, i) => {
                        const patientName = (apt.patient as any)?.full_name || (apt.patient as any)?.email || "Patient";
                        const initials = patientName.split(" ").map((n: string) => n[0]).join("").slice(0, 2).toUpperCase();

                        return (
                            <motion.div
                                initial={{ opacity: 0, y: 10 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: i * 0.05 }}
                                key={apt.id}
                                className="p-5 bg-white/[0.02] border border-white/10 rounded-2xl hover:bg-white/[0.04] transition-colors"
                            >
                                <div className="flex items-start justify-between">
                                    <div className="flex items-center gap-4">
                                        <div className="w-12 h-12 rounded-full bg-gradient-to-br from-blue-600/30 to-purple-600/30 flex items-center justify-center text-sm font-bold border border-white/10">
                                            {initials}
                                        </div>
                                        <div>
                                            <h3 className="font-semibold text-gray-200">{patientName}</h3>
                                            <div className="flex items-center gap-3 text-xs text-gray-500 mt-1.5">
                                                <span className="flex items-center gap-1">
                                                    <Calendar size={12} />
                                                    {new Date(apt.date + "T00:00:00").toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })}
                                                </span>
                                                <span className="flex items-center gap-1">
                                                    <Clock size={12} /> {apt.time}
                                                </span>
                                                <span className="flex items-center gap-1">
                                                    {apt.type === "online" ? <Video size={12} /> : <MapPin size={12} />}
                                                    {apt.type === "online" ? "Online" : "In-Person"}
                                                </span>
                                            </div>
                                        </div>
                                    </div>

                                    <div className="flex items-center gap-3">
                                        <span className={`px-3 py-1 rounded-full text-xs font-medium border ${getStatusBadge(apt.status)}`}>
                                            {apt.status}
                                        </span>

                                        {apt.status === "upcoming" && (
                                            <div className="flex gap-2">
                                                <button
                                                    onClick={() => handleAccept(apt.id)}
                                                    disabled={!!actionStatus[apt.id]}
                                                    className="p-2 bg-green-500/10 hover:bg-green-500/20 text-green-400 rounded-lg transition-colors disabled:opacity-50"
                                                    title="Complete"
                                                >
                                                    {actionStatus[apt.id] === "accepting" ? <Loader2 size={16} className="animate-spin" /> : <Check size={16} />}
                                                </button>
                                                <button
                                                    onClick={() => handleReject(apt.id)}
                                                    disabled={!!actionStatus[apt.id]}
                                                    className="p-2 bg-red-500/10 hover:bg-red-500/20 text-red-400 rounded-lg transition-colors disabled:opacity-50"
                                                    title="Cancel"
                                                >
                                                    {actionStatus[apt.id] === "rejecting" ? <Loader2 size={16} className="animate-spin" /> : <X size={16} />}
                                                </button>
                                            </div>
                                        )}
                                    </div>
                                </div>

                                {apt.notes && (
                                    <div className="mt-3 pt-3 border-t border-white/5">
                                        <p className="text-xs text-gray-500"><span className="text-gray-400">Notes:</span> {apt.notes}</p>
                                    </div>
                                )}
                            </motion.div>
                        );
                    })}
                </div>
            )}
        </div>
    );
}
