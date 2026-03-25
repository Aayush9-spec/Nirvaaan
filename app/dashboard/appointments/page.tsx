"use client";

import { Calendar, Clock, MapPin, Video, CheckCircle, X, Plus, Search, Loader2 } from "lucide-react";
import { useState, useEffect, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import Link from "next/link";
import Script from "next/script";
import { useRealtimeSubscription } from "@/lib/use-realtime";
import {
    getDoctors,
    getAppointments,
    bookAppointment,
    rescheduleAppointment,
    cancelAppointment,
    getCurrentUserId,
    getProfile,
    type Doctor,
    type Appointment,
} from "@/lib/supabase-helpers";

export default function AppointmentsPage() {
    const [activeTab, setActiveTab] = useState("upcoming");
    const [showBooking, setShowBooking] = useState(false);
    const [rescheduleId, setRescheduleId] = useState<string | null>(null);
    const [rescheduleDate, setRescheduleDate] = useState("");
    const [bookingSuccess, setBookingSuccess] = useState(false);
    const [selectedDoctor, setSelectedDoctor] = useState<string | null>(null);
    const [bookingDate, setBookingDate] = useState("");
    const [bookingTime, setBookingTime] = useState("");
    const [loading, setLoading] = useState(true);
    const [booking, setBooking] = useState(false);
    const [cancelling, setCancelling] = useState<string | null>(null);
    const [razorpayLoaded, setRazorpayLoaded] = useState(false);

    const [doctors, setDoctors] = useState<Doctor[]>([]);
    const [upcomingAppointments, setUpcomingAppointments] = useState<Appointment[]>([]);
    const [pastAppointments, setPastAppointments] = useState<Appointment[]>([]);
    const [userId, setUserId] = useState<string | null>(null);

    const refreshAppointments = useCallback(async () => {
        if (!userId) return;
        const [upcoming, past] = await Promise.all([
            getAppointments(userId, "upcoming"),
            getAppointments(userId, "completed"),
        ]);
        setUpcomingAppointments(upcoming);
        setPastAppointments(past);
    }, [userId]);

    useRealtimeSubscription("appointments", "patient_id", userId, refreshAppointments);

    // Load data on mount
    useEffect(() => {
        async function loadData() {
            const uid = await getCurrentUserId();
            if (!uid) {
                setLoading(false);
                return;
            }
            setUserId(uid);

            const [allDoctors, upcoming, past] = await Promise.all([
                getDoctors(),
                getAppointments(uid, "upcoming"),
                getAppointments(uid, "completed"),
            ]);

            setDoctors(allDoctors);
            setUpcomingAppointments(upcoming);
            setPastAppointments(past);
            setLoading(false);
        }
        loadData();
    }, []);

    const handleCancel = async (id: string) => {
        setCancelling(id);
        const success = await cancelAppointment(id);
        if (success) {
            setUpcomingAppointments((prev) => prev.filter((a) => a.id !== id));
        }
        setCancelling(null);
    };

    const handleJoinMeet = (meetLink: string | null) => {
        if (meetLink) {
            window.open(meetLink, "_blank", "noopener,noreferrer");
        }
    };

    const handleReschedule = (id: string) => {
        setRescheduleId(id);
    };

    const confirmReschedule = async () => {
        if (!rescheduleId || !rescheduleDate) return;
        const success = await rescheduleAppointment(rescheduleId, rescheduleDate);
        if (success) {
            // Update local state
            setUpcomingAppointments((prev) =>
                prev.map((a) => (a.id === rescheduleId ? { ...a, date: rescheduleDate } : a))
            );
        }
        setRescheduleId(null);
        setRescheduleDate("");
    };

    const handleBook = async () => {
        if (!selectedDoctor || !bookingDate || !bookingTime) return;

        setBooking(true);
        const userId = await getCurrentUserId();
        if (!userId) {
            setBooking(false);
            return;
        }

        const [doctor, profile] = await Promise.all([
            doctors.find((d) => d.id === selectedDoctor),
            getProfile(userId)
        ]);

        const fee = doctor?.consultation_fee || 0;

        // If fee > 0, initiate Razorpay
        if (fee > 0 && razorpayLoaded) {
            try {
                // 1. Create Order
                const res = await fetch("/api/create-order", {
                    method: "POST",
                    body: JSON.stringify({ amount: fee, currency: "INR" }),
                });
                const order = await res.json();

                if (!order.id) throw new Error("Order creation failed");

                const options = {
                    key: process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID || "rzp_test_placeholder", 
                    amount: order.amount,
                    currency: order.currency,
                    name: "MedAI Platform",
                    description: `Consultation with ${doctor?.name}`,
                    order_id: order.id,
                    handler: async (response: any) => {
                        await completeBooking(userId, doctor, response.razorpay_payment_id, response.razorpay_order_id, fee);
                    },
                    prefill: {
                        name: profile?.full_name || "Patient",
                        contact: profile?.phone || "",
                        email: profile?.email || "",
                    },
                    theme: {
                        color: "#9333ea",
                    },
                };

                if (!process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID || process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID === "rzp_test_placeholder") {
                    console.log("Mock Payment Mode Active: Auto-completing fake payment.");
                    setTimeout(() => {
                        options.handler({ razorpay_payment_id: "pay_mock_" + Date.now(), razorpay_order_id: order.id });
                    }, 1500); // Simulate processing time
                } else {
                    const rzp = new (window as any).Razorpay(options);
                    rzp.open();
                }
                
                setBooking(false); // Modal stays open until payment completes
            } catch (err) {
                console.error("Payment failed", err);
                setBooking(false);
                alert("Payment initiation failed. Please try again.");
            }
        } else {
            // Free consultation or offline
            await completeBooking(userId, doctor);
        }
    };

    const completeBooking = async (userId: string, doctor: any, paymentId?: string, orderId?: string, amount?: number) => {
        setBooking(true);
        const success = await bookAppointment({
            patient_id: userId,
            doctor_id: selectedDoctor!,
            date: bookingDate,
            time: bookingTime,
            type: doctor?.meet_link ? "online" : "offline",
            meet_link: doctor?.meet_link || undefined,
            payment_status: paymentId ? "paid" : "pending",
            payment_id: paymentId,
            order_id: orderId,
            amount: amount,
        });

        setBooking(false);

        if (success) {
            setBookingSuccess(true);
            const updated = await getAppointments(userId, "upcoming");
            setUpcomingAppointments(updated);

            setTimeout(() => {
                setShowBooking(false);
                setBookingSuccess(false);
                setSelectedDoctor(null);
                setBookingDate("");
                setBookingTime("");
            }, 2000);
        }
    };

    const formatDate = (dateStr: string) => {
        const date = new Date(dateStr + "T00:00:00");
        return date.toLocaleDateString("en-US", { weekday: "short", month: "short", day: "numeric" });
    };

    if (loading) {
        return (
            <div className="flex items-center justify-center min-h-[400px]">
                <Loader2 className="animate-spin text-purple-500" size={32} />
            </div>
        );
    }

    return (
        <div className="space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                    <h1 className="text-2xl font-bold mb-1">Appointments</h1>
                    <p className="text-gray-400 text-sm">Manage your scheduled visits</p>
                </div>
                <Script
                    src="https://checkout.razorpay.com/v1/checkout.js"
                    onLoad={() => setRazorpayLoaded(true)}
                />
                <button
                    onClick={() => setShowBooking(true)}
                    className="px-4 py-2 bg-purple-600 hover:bg-purple-700 text-white rounded-lg text-sm font-medium transition-colors flex items-center gap-2 self-start sm:self-auto"
                >
                    <Plus size={16} /> New Booking
                </button>
            </div>

            {/* Booking Modal */}
            <AnimatePresence>
                {showBooking && (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4"
                        onClick={() => setShowBooking(false)}
                    >
                        <motion.div
                            initial={{ scale: 0.95, opacity: 0 }}
                            animate={{ scale: 1, opacity: 1 }}
                            exit={{ scale: 0.95, opacity: 0 }}
                            onClick={(e) => e.stopPropagation()}
                            className="bg-[#0a0a0a] border border-white/10 rounded-2xl p-6 w-full max-w-md"
                        >
                            {bookingSuccess ? (
                                <div className="flex flex-col items-center py-8">
                                    <CheckCircle size={48} className="text-green-400 mb-4" />
                                    <h3 className="text-lg font-bold mb-1">Appointment Booked!</h3>
                                    <p className="text-gray-400 text-sm">You&apos;ll receive a confirmation email shortly.</p>
                                </div>
                            ) : (
                                <>
                                    <div className="flex items-center justify-between mb-6">
                                        <h3 className="text-lg font-bold">Book Appointment</h3>
                                        <button onClick={() => setShowBooking(false)} className="text-gray-500 hover:text-white">
                                            <X size={20} />
                                        </button>
                                    </div>

                                    <div className="space-y-4">
                                        <div className="space-y-2">
                                            <label className="text-sm text-gray-400">Select Doctor</label>
                                            <div className="space-y-2 max-h-[200px] overflow-y-auto">
                                                {doctors.map((doc) => (
                                                    <button
                                                        key={doc.id}
                                                        onClick={() => setSelectedDoctor(doc.id)}
                                                        className={`w-full p-3 rounded-lg text-left transition-colors border text-sm ${selectedDoctor === doc.id
                                                            ? "bg-purple-600/10 border-purple-500/30 text-purple-400"
                                                            : "bg-white/5 border-transparent hover:bg-white/10"
                                                            }`}
                                                    >
                                                        <div className="flex justify-between items-start">
                                                            <div>
                                                                <div className="font-medium">{doc.name}</div>
                                                                <div className="text-xs text-gray-500">{doc.specialty}</div>
                                                            </div>
                                                            {doc.consultation_fee && doc.consultation_fee > 0 && (
                                                                <div className="text-xs font-bold text-green-400 bg-green-400/10 px-2 py-1 rounded">
                                                                    ₹{doc.consultation_fee}
                                                                </div>
                                                            )}
                                                        </div>
                                                        {doc.bio && selectedDoctor === doc.id && (
                                                            <div className="mt-2 text-xs text-gray-400 line-clamp-2">{doc.bio}</div>
                                                        )}
                                                    </button>
                                                ))}
                                            </div>
                                        </div>

                                        <div className="space-y-2">
                                            <label className="text-sm text-gray-400">Date</label>
                                            <input
                                                type="date"
                                                value={bookingDate}
                                                onChange={(e) => setBookingDate(e.target.value)}
                                                className="w-full bg-white/5 border border-white/10 rounded-lg px-4 py-2.5 text-white focus:outline-none focus:border-purple-500/50 [color-scheme:dark]"
                                            />
                                        </div>

                                        <div className="space-y-2">
                                            <label className="text-sm text-gray-400">Preferred Time</label>
                                            <input
                                                type="time"
                                                value={bookingTime}
                                                onChange={(e) => setBookingTime(e.target.value)}
                                                className="w-full bg-white/5 border border-white/10 rounded-lg px-4 py-2.5 text-white focus:outline-none focus:border-purple-500/50 [color-scheme:dark]"
                                            />
                                        </div>

                                        <button
                                            onClick={handleBook}
                                            disabled={!selectedDoctor || !bookingDate || !bookingTime || booking}
                                            className="w-full py-3 bg-purple-600 hover:bg-purple-700 disabled:opacity-50 disabled:cursor-not-allowed text-white rounded-xl font-medium transition-colors flex items-center justify-center gap-2"
                                        >
                                            {booking ? (
                                                <><Loader2 size={16} className="animate-spin" /> Processing...</>
                                            ) : (
                                                doctors.find(d => d.id === selectedDoctor)?.consultation_fee ?
                                                    `Pay ₹${doctors.find(d => d.id === selectedDoctor)?.consultation_fee} & Book` :
                                                    "Confirm Booking"
                                            )}
                                        </button>
                                    </div>
                                </>
                            )}
                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence>

            {/* Tabs */}
            <div className="flex gap-6 border-b border-white/10 text-sm font-medium">
                <button
                    onClick={() => setActiveTab("upcoming")}
                    className={`pb-3 transition-colors ${activeTab === "upcoming"
                        ? "text-purple-400 border-b-2 border-purple-400"
                        : "text-gray-400 hover:text-white"
                        }`}
                >
                    Upcoming
                </button>
                <button
                    onClick={() => setActiveTab("history")}
                    className={`pb-3 transition-colors ${activeTab === "history"
                        ? "text-purple-400 border-b-2 border-purple-400"
                        : "text-gray-400 hover:text-white"
                        }`}
                >
                    History
                </button>
            </div>

            {/* List */}
            <div className="grid gap-4">
                {activeTab === "upcoming" ? (
                    upcomingAppointments.length > 0 ? (
                        upcomingAppointments.map((apt) => (
                            <div
                                key={apt.id}
                                className="p-5 bg-white/[0.02] border border-white/10 rounded-xl hover:bg-white/[0.04] transition-colors flex flex-col md:flex-row gap-6 items-start md:items-center"
                            >
                                {/* Doctor Avatar */}
                                <div className={`w-12 h-12 rounded-full ${apt.doctor?.image_color || 'bg-blue-500'} flex items-center justify-center text-white font-bold text-lg`}>
                                    {apt.doctor?.name?.[0] || "D"}
                                </div>

                                {/* Info */}
                                <div className="flex-1 space-y-1">
                                    <div className="flex items-center gap-2">
                                        <h3 className="font-semibold text-lg">{apt.doctor?.name || "Doctor"}</h3>
                                        {apt.type === "online" && (
                                            <span className="bg-blue-500/10 text-blue-400 text-[10px] px-2 py-0.5 rounded-full border border-blue-500/20 uppercase font-medium tracking-wide">
                                                Video Call
                                            </span>
                                        )}
                                    </div>

                                    <p className="text-gray-400 text-sm">{apt.doctor?.specialty}</p>

                                    <div className="flex items-center gap-4 text-xs text-gray-500 mt-2">
                                        <div className="flex items-center gap-1">
                                            <MapPin size={12} /> {apt.doctor?.location || "Clinic"}
                                        </div>
                                        <div className="flex items-center gap-1">
                                            <Clock size={12} /> {apt.time}
                                        </div>
                                        <div className="flex items-center gap-1">
                                            <Calendar size={12} /> {formatDate(apt.date)}
                                        </div>
                                    </div>
                                </div>

                                {/* Status/Action */}
                                <div className="flex items-center gap-3 w-full md:w-auto">
                                    {apt.type === "online" ? (
                                        <button
                                            onClick={() => handleJoinMeet(apt.meet_link || apt.doctor?.meet_link || null)}
                                            className="flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-sm font-medium transition-colors shadow-lg shadow-blue-500/20"
                                        >
                                            <Video size={16} /> Join Google Meet
                                        </button>
                                    ) : (
                                        <div className="flex items-center gap-2 px-3 py-1.5 bg-green-500/10 text-green-400 rounded-full text-xs font-medium border border-green-500/20">
                                            <CheckCircle size={12} /> Appointment Confirmed
                                        </div>
                                    )}

                                    {rescheduleId === apt.id ? (
                                        <div className="flex items-center gap-2">
                                            <input
                                                type="date"
                                                value={rescheduleDate}
                                                onChange={(e) => setRescheduleDate(e.target.value)}
                                                className="bg-white/5 border border-white/10 rounded-lg px-3 py-1.5 text-sm text-white [color-scheme:dark]"
                                            />
                                            <button
                                                onClick={confirmReschedule}
                                                className="px-3 py-1.5 bg-green-600 hover:bg-green-700 text-white rounded-lg text-sm transition-colors"
                                            >
                                                OK
                                            </button>
                                            <button
                                                onClick={() => setRescheduleId(null)}
                                                className="text-gray-500 hover:text-white"
                                            >
                                                <X size={16} />
                                            </button>
                                        </div>
                                    ) : (
                                        <>
                                            <button
                                                onClick={() => handleReschedule(apt.id)}
                                                className="px-3 py-2 bg-white/5 hover:bg-white/10 border border-white/10 rounded-lg text-sm transition-colors text-gray-400"
                                            >
                                                Reschedule
                                            </button>
                                            <button
                                                onClick={() => handleCancel(apt.id)}
                                                disabled={cancelling === apt.id}
                                                className="px-3 py-2 bg-red-500/10 hover:bg-red-500/20 border border-red-500/20 rounded-lg text-sm transition-colors text-red-400 disabled:opacity-50"
                                            >
                                                {cancelling === apt.id ? "Cancelling..." : "Cancel"}
                                            </button>
                                        </>
                                    )}
                                </div>
                            </div>
                        ))
                    ) : (
                        <div className="text-gray-500 text-center py-20">No upcoming appointments. Book one above!</div>
                    )
                ) : (
                    pastAppointments.length > 0 ? (
                        pastAppointments.map((apt) => (
                            <div
                                key={apt.id}
                                className="p-5 bg-white/[0.02] border border-white/10 rounded-xl flex flex-col md:flex-row gap-6 items-start md:items-center opacity-70"
                            >
                                <div className={`w-12 h-12 rounded-full ${apt.doctor?.image_color || 'bg-gray-500'} flex items-center justify-center text-white font-bold text-lg`}>
                                    {apt.doctor?.name?.[0] || "D"}
                                </div>
                                <div className="flex-1 space-y-1">
                                    <h3 className="font-semibold text-lg">{apt.doctor?.name || "Doctor"}</h3>
                                    <p className="text-gray-400 text-sm">{apt.doctor?.specialty}</p>
                                    <div className="flex items-center gap-4 text-xs text-gray-500 mt-2">
                                        <div className="flex items-center gap-1">
                                            <Calendar size={12} /> {formatDate(apt.date)}
                                        </div>
                                        <div className="flex items-center gap-1">
                                            <Clock size={12} /> {apt.time}
                                        </div>
                                    </div>
                                </div>
                                <div className="flex items-center gap-2 px-3 py-1.5 bg-gray-500/10 text-gray-400 rounded-full text-xs font-medium border border-gray-500/20">
                                    <CheckCircle size={12} /> Completed
                                </div>
                            </div>
                        ))
                    ) : (
                        <div className="text-gray-500 text-center py-20">No past appointments found.</div>
                    )
                )}
            </div>
        </div>
    );
}
