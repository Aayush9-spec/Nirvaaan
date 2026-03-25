"use client";

import { useState, useEffect } from "react";
import { FlaskConical, Clock, MapPin, Calendar, CheckCircle, Loader2, X, Plus, Home as HomeIcon, AlertCircle } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import Link from "next/link";
import { getCurrentUserId, getLabTests, bookLabTest, getLabBookings, LabTest, LabBooking } from "@/lib/supabase-helpers";

export default function PathlabPage() {
    const [tests, setTests] = useState<LabTest[]>([]);
    const [bookings, setBookings] = useState<LabBooking[]>([]);
    const [loading, setLoading] = useState(true);
    const [showBooking, setShowBooking] = useState(false);
    const [selectedTest, setSelectedTest] = useState<LabTest | null>(null);
    const [bookDate, setBookDate] = useState("");
    const [bookTime, setBookTime] = useState("09:00 AM");
    const [bookLocation, setBookLocation] = useState("Home Collection");
    const [booking, setBooking] = useState(false);

    useEffect(() => {
        loadData();
    }, []);

    const loadData = async () => {
        const userId = await getCurrentUserId();
        const [testsData, bookingsData] = await Promise.all([
            getLabTests("pathlab"),
            userId ? getLabBookings(userId, "pathlab") : Promise.resolve([]),
        ]);
        setTests(testsData);
        setBookings(bookingsData);
        setLoading(false);
    };

    const handleBook = async () => {
        const userId = await getCurrentUserId();
        if (!userId || !selectedTest || !bookDate) return;

        setBooking(true);
        const success = await bookLabTest({
            patient_id: userId,
            test_id: selectedTest.id,
            date: bookDate,
            time: bookTime,
            location: bookLocation,
        });

        if (success) {
            setShowBooking(false);
            setSelectedTest(null);
            setBookDate("");
            await loadData();
        }
        setBooking(false);
    };

    const openBooking = (test: LabTest) => {
        setSelectedTest(test);
        setShowBooking(true);
    };

    const statusColors: Record<string, string> = {
        booked: "text-blue-400 bg-blue-500/10 border-blue-500/20",
        sample_collected: "text-yellow-400 bg-yellow-500/10 border-yellow-500/20",
        processing: "text-orange-400 bg-orange-500/10 border-orange-500/20",
        completed: "text-green-400 bg-green-500/10 border-green-500/20",
        cancelled: "text-red-400 bg-red-500/10 border-red-500/20",
    };

    if (loading) {
        return (
            <div className="flex items-center justify-center min-h-[60vh]">
                <Loader2 className="animate-spin text-teal-500" size={32} />
            </div>
        );
    }

    return (
        <div className="space-y-8">
            <div>
                <h1 className="text-2xl font-bold mb-1">Pathlab Services</h1>
                <p className="text-gray-400 text-sm">Book lab tests from certified partners with home sample collection</p>
            </div>

            {/* Available Tests */}
            <div>
                <h2 className="text-lg font-semibold mb-4">Available Tests</h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {tests.map((test, index) => (
                        <motion.div
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: index * 0.06 }}
                            key={test.id}
                            className="p-5 bg-white/[0.02] border border-white/10 rounded-2xl hover:bg-white/[0.04] hover:border-teal-500/20 transition-all group"
                        >
                            <div className="flex items-start justify-between mb-3">
                                <div className="flex items-center gap-3">
                                    <div className="p-2.5 rounded-xl bg-teal-500/10 text-teal-400">
                                        <FlaskConical size={18} />
                                    </div>
                                    <div>
                                        <h3 className="font-semibold text-sm text-gray-200">{test.name}</h3>
                                        <p className="text-xs text-gray-500 mt-0.5">{test.description}</p>
                                    </div>
                                </div>
                            </div>

                            <div className="flex items-center gap-4 text-xs text-gray-500 mb-4">
                                <span className="flex items-center gap-1"><Clock size={12} /> {test.duration}</span>
                                <span className="flex items-center gap-1"><AlertCircle size={12} /> {test.preparation}</span>
                            </div>

                            <div className="flex items-center justify-between">
                                <span className="text-lg font-bold text-teal-400">₹{test.price}</span>
                                <button
                                    onClick={() => openBooking(test)}
                                    className="px-4 py-2 bg-teal-600/20 hover:bg-teal-600/30 border border-teal-500/20 text-teal-400 rounded-lg text-sm font-medium transition-all"
                                >
                                    Book Now
                                </button>
                            </div>
                        </motion.div>
                    ))}
                </div>
            </div>

            {/* My Bookings */}
            {bookings.length > 0 && (
                <div>
                    <h2 className="text-lg font-semibold mb-4">My Bookings</h2>
                    <div className="space-y-3">
                        {bookings.map((b) => (
                            <motion.div
                                initial={{ opacity: 0, x: -20 }}
                                animate={{ opacity: 1, x: 0 }}
                                key={b.id}
                                className="p-4 bg-white/[0.02] border border-white/10 rounded-xl flex items-center justify-between"
                            >
                                <div className="flex items-center gap-4">
                                    <div className="p-2 rounded-lg bg-teal-500/10 text-teal-400">
                                        <FlaskConical size={16} />
                                    </div>
                                    <div>
                                        <h4 className="font-medium text-sm text-gray-200">{(b as any).lab_test?.name || "Lab Test"}</h4>
                                        <div className="flex items-center gap-3 text-xs text-gray-500 mt-1">
                                            <span className="flex items-center gap-1"><Calendar size={11} /> {new Date(b.date + "T00:00:00").toLocaleDateString("en-US", { month: "short", day: "numeric" })}</span>
                                            {b.time && <span className="flex items-center gap-1"><Clock size={11} /> {b.time}</span>}
                                            <span className="flex items-center gap-1"><MapPin size={11} /> {b.location}</span>
                                        </div>
                                    </div>
                                </div>
                                <span className={`px-3 py-1 rounded-full text-xs font-medium border ${statusColors[b.status] || statusColors.booked}`}>
                                    {b.status.replace(/_/g, " ")}
                                </span>
                            </motion.div>
                        ))}
                    </div>
                </div>
            )}

            {/* Booking Modal */}
            <AnimatePresence>
                {showBooking && selectedTest && (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4"
                        onClick={() => setShowBooking(false)}
                    >
                        <motion.div
                            initial={{ scale: 0.95 }}
                            animate={{ scale: 1 }}
                            exit={{ scale: 0.95 }}
                            onClick={(e) => e.stopPropagation()}
                            className="bg-[#0a0a0a] border border-white/10 rounded-2xl p-6 w-full max-w-md"
                        >
                            <div className="flex items-center justify-between mb-6">
                                <h3 className="text-lg font-bold">Book Test</h3>
                                <button onClick={() => setShowBooking(false)} className="text-gray-500 hover:text-white"><X size={20} /></button>
                            </div>

                            <div className="p-4 bg-teal-500/5 border border-teal-500/20 rounded-xl mb-6">
                                <h4 className="font-semibold text-sm text-teal-400">{selectedTest.name}</h4>
                                <p className="text-xs text-gray-500 mt-1">{selectedTest.description}</p>
                                <p className="text-lg font-bold text-teal-400 mt-2">₹{selectedTest.price}</p>
                            </div>

                            <div className="space-y-4 mb-6">
                                <div className="space-y-1.5">
                                    <label className="text-sm text-gray-400">Date</label>
                                    <input
                                        type="date"
                                        value={bookDate}
                                        onChange={(e) => setBookDate(e.target.value)}
                                        min={new Date().toISOString().split("T")[0]}
                                        className="w-full bg-white/5 border border-white/10 rounded-lg px-4 py-2.5 text-white text-sm focus:outline-none focus:border-teal-500/50"
                                    />
                                </div>
                                <div className="space-y-1.5">
                                    <label className="text-sm text-gray-400">Preferred Time</label>
                                    <select
                                        value={bookTime}
                                        onChange={(e) => setBookTime(e.target.value)}
                                        className="w-full bg-white/5 border border-white/10 rounded-lg px-4 py-2.5 text-white text-sm focus:outline-none focus:border-teal-500/50"
                                    >
                                        <option value="07:00 AM">07:00 AM</option>
                                        <option value="08:00 AM">08:00 AM</option>
                                        <option value="09:00 AM">09:00 AM</option>
                                        <option value="10:00 AM">10:00 AM</option>
                                        <option value="11:00 AM">11:00 AM</option>
                                        <option value="02:00 PM">02:00 PM</option>
                                        <option value="04:00 PM">04:00 PM</option>
                                    </select>
                                </div>
                                <div className="space-y-1.5">
                                    <label className="text-sm text-gray-400">Collection Location</label>
                                    <select
                                        value={bookLocation}
                                        onChange={(e) => setBookLocation(e.target.value)}
                                        className="w-full bg-white/5 border border-white/10 rounded-lg px-4 py-2.5 text-white text-sm focus:outline-none focus:border-teal-500/50"
                                    >
                                        <option value="Home Collection">Home Collection</option>
                                        <option value="Lab Visit">Visit Lab Center</option>
                                    </select>
                                </div>
                            </div>

                            {selectedTest.preparation && (
                                <div className="p-3 bg-yellow-500/5 border border-yellow-500/20 rounded-lg mb-6 text-xs text-yellow-400 flex items-start gap-2">
                                    <AlertCircle size={14} className="flex-shrink-0 mt-0.5" />
                                    <span><strong>Preparation:</strong> {selectedTest.preparation}</span>
                                </div>
                            )}

                            <button
                                onClick={handleBook}
                                disabled={booking || !bookDate}
                                className="w-full py-3 bg-teal-600 hover:bg-teal-700 disabled:opacity-50 disabled:cursor-not-allowed text-white rounded-xl font-medium transition-colors flex items-center justify-center gap-2"
                            >
                                {booking ? <Loader2 size={18} className="animate-spin" /> : <><CheckCircle size={18} /> Confirm Booking</>}
                            </button>
                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
}
