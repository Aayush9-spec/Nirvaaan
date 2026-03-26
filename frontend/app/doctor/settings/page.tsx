"use client";

import { useState, useEffect } from "react";
import { User, Bell, Lock, Shield, Smartphone, Globe, ToggleLeft, ToggleRight, LogOut, Save, Loader2, DollarSign, Briefcase, FileText } from "lucide-react";
import { createClient } from "@/utils/supabase/client";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import {
    getDoctorProfile,
    updateDoctorProfile,
    getCurrentUserId,
    type Doctor,
} from "@/lib/supabase-helpers";

export default function DoctorSettingsPage() {
    const [doctor, setDoctor] = useState<Doctor | null>(null);
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [message, setMessage] = useState<{ type: "success" | "error"; text: string } | null>(null);
    const router = useRouter();

    // Form states
    const [name, setName] = useState("");
    const [specialty, setSpecialty] = useState("");
    const [experience, setExperience] = useState(0);
    const [bio, setBio] = useState("");
    const [consultationFee, setConsultationFee] = useState(0);
    const [phone, setPhone] = useState("");
    const [available, setAvailable] = useState(true);
    const [meetLink, setMeetLink] = useState("");
    const [location, setLocation] = useState("");

    useEffect(() => {
        const load = async () => {
            const userId = await getCurrentUserId();
            if (!userId) {
                router.push("/login");
                return;
            }

            const docProfile = await getDoctorProfile(userId);
            if (docProfile) {
                setDoctor(docProfile);
                setName(docProfile.name);
                setSpecialty(docProfile.specialty);
                setExperience(docProfile.experience || 0);
                setBio(docProfile.bio || "");
                setConsultationFee(docProfile.consultation_fee || 0);
                setPhone(docProfile.phone || "");
                setAvailable(docProfile.available);
                setMeetLink(docProfile.meet_link || "");
                setLocation(docProfile.location || "");
            }
            setLoading(false);
        };
        load();
    }, [router]);

    const handleSave = async () => {
        if (!doctor?.user_id) return;
        setSaving(true);
        setMessage(null);

        const success = await updateDoctorProfile(doctor.user_id, {
            name,
            specialty,
            experience,
            bio,
            consultation_fee: consultationFee,
            phone,
            available,
            meet_link: meetLink,
            location,
        });

        if (success) {
            setMessage({ type: "success", text: "Profile updated successfully!" });
            setTimeout(() => setMessage(null), 3000);
        } else {
            setMessage({ type: "error", text: "Failed to update profile." });
        }
        setSaving(false);
    };

    const handleSignOut = async () => {
        const supabase = createClient();
        await supabase.auth.signOut();
        router.push("/login");
    };

    if (loading) {
        return (
            <div className="flex items-center justify-center min-h-[400px]">
                <Loader2 className="animate-spin text-blue-500" size={32} />
            </div>
        );
    }

    return (
        <div className="max-w-4xl mx-auto space-y-8">
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-2xl font-bold mb-1">Settings</h1>
                    <p className="text-gray-400 text-sm">Manage your professional profile and account</p>
                </div>
                <button
                    onClick={handleSave}
                    disabled={saving}
                    className="px-6 py-2.5 bg-blue-600 hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed text-white rounded-xl font-medium transition-all shadow-lg shadow-blue-900/20 flex items-center gap-2"
                >
                    {saving ? <Loader2 size={18} className="animate-spin" /> : <Save size={18} />}
                    Save Changes
                </button>
            </div>

            {message && (
                <motion.div
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className={`p-4 rounded-xl border ${message.type === "success"
                        ? "bg-green-500/10 border-green-500/20 text-green-400"
                        : "bg-red-500/10 border-red-500/20 text-red-400"
                        }`}
                >
                    {message.text}
                </motion.div>
            )}

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {/* Navigation/Sidebar (optional or integrated) - keeping simple for now */}

                {/* Main Form */}
                <div className="md:col-span-3 space-y-6">

                    {/* Professional Info */}
                    <section className="bg-white/[0.02] border border-white/10 rounded-2xl p-6">
                        <h2 className="text-lg font-semibold mb-6 flex items-center gap-2">
                            <Briefcase size={20} className="text-blue-400" /> Professional Details
                        </h2>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div className="space-y-2">
                                <label className="text-sm text-gray-400">Full Name</label>
                                <div className="relative">
                                    <User className="absolute left-3 top-3 text-gray-500" size={18} />
                                    <input
                                        type="text"
                                        value={name}
                                        onChange={(e) => setName(e.target.value)}
                                        className="w-full bg-black/40 border border-white/10 rounded-xl py-2.5 pl-10 pr-4 text-white focus:outline-none focus:border-blue-500/50"
                                    />
                                </div>
                            </div>

                            <div className="space-y-2">
                                <label className="text-sm text-gray-400">Specialty</label>
                                <div className="relative">
                                    <Shield className="absolute left-3 top-3 text-gray-500" size={18} />
                                    <input
                                        type="text"
                                        value={specialty}
                                        onChange={(e) => setSpecialty(e.target.value)}
                                        className="w-full bg-black/40 border border-white/10 rounded-xl py-2.5 pl-10 pr-4 text-white focus:outline-none focus:border-blue-500/50"
                                    />
                                </div>
                            </div>

                            <div className="space-y-2">
                                <label className="text-sm text-gray-400">Experience (Years)</label>
                                <div className="relative">
                                    <Briefcase className="absolute left-3 top-3 text-gray-500" size={18} />
                                    <input
                                        type="number"
                                        value={experience}
                                        onChange={(e) => setExperience(parseInt(e.target.value) || 0)}
                                        className="w-full bg-black/40 border border-white/10 rounded-xl py-2.5 pl-10 pr-4 text-white focus:outline-none focus:border-blue-500/50"
                                    />
                                </div>
                            </div>

                            <div className="space-y-2">
                                <label className="text-sm text-gray-400">Consultation Fee (₹)</label>
                                <div className="relative">
                                    <DollarSign className="absolute left-3 top-3 text-gray-500" size={18} />
                                    <input
                                        type="number"
                                        value={consultationFee}
                                        onChange={(e) => setConsultationFee(parseFloat(e.target.value) || 0)}
                                        className="w-full bg-black/40 border border-white/10 rounded-xl py-2.5 pl-10 pr-4 text-white focus:outline-none focus:border-blue-500/50"
                                    />
                                </div>
                            </div>
                        </div>

                        <div className="mt-6 space-y-2">
                            <label className="text-sm text-gray-400">Bio / About</label>
                            <textarea
                                value={bio}
                                onChange={(e) => setBio(e.target.value)}
                                className="w-full bg-black/40 border border-white/10 rounded-xl p-4 text-white focus:outline-none focus:border-blue-500/50 min-h-[100px]"
                                placeholder="Tell patients about your expertise and background..."
                            />
                        </div>
                    </section>

                    {/* Contact & Availability */}
                    <section className="bg-white/[0.02] border border-white/10 rounded-2xl p-6">
                        <h2 className="text-lg font-semibold mb-6 flex items-center gap-2">
                            <Globe size={20} className="text-purple-400" /> Contact & Availability
                        </h2>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div className="space-y-2">
                                <label className="text-sm text-gray-400">Phone Number</label>
                                <div className="relative">
                                    <Smartphone className="absolute left-3 top-3 text-gray-500" size={18} />
                                    <input
                                        type="tel"
                                        value={phone}
                                        onChange={(e) => setPhone(e.target.value)}
                                        className="w-full bg-black/40 border border-white/10 rounded-xl py-2.5 pl-10 pr-4 text-white focus:outline-none focus:border-purple-500/50"
                                    />
                                </div>
                            </div>

                            <div className="space-y-2">
                                <label className="text-sm text-gray-400">Google Meet Link</label>
                                <div className="relative">
                                    <Globe className="absolute left-3 top-3 text-gray-500" size={18} />
                                    <input
                                        type="url"
                                        value={meetLink}
                                        onChange={(e) => setMeetLink(e.target.value)}
                                        placeholder="https://meet.google.com/..."
                                        className="w-full bg-black/40 border border-white/10 rounded-xl py-2.5 pl-10 pr-4 text-white focus:outline-none focus:border-purple-500/50"
                                    />
                                </div>
                            </div>

                            <div className="md:col-span-2 space-y-2">
                                <label className="text-sm text-gray-400">Clinic Location</label>
                                <div className="relative">
                                    <Globe className="absolute left-3 top-3 text-gray-500" size={18} />
                                    <input
                                        type="text"
                                        value={location}
                                        onChange={(e) => setLocation(e.target.value)}
                                        placeholder="e.g. City Hospital, Building A"
                                        className="w-full bg-black/40 border border-white/10 rounded-xl py-2.5 pl-10 pr-4 text-white focus:outline-none focus:border-purple-500/50"
                                    />
                                </div>
                            </div>
                        </div>

                        <div className="mt-6 flex items-center justify-between p-4 bg-white/5 rounded-xl border border-white/10">
                            <div>
                                <h3 className="font-medium">Available for Appointments</h3>
                                <p className="text-sm text-gray-400">Turn off to stop accepting new bookings</p>
                            </div>
                            <button
                                onClick={() => setAvailable(!available)}
                                className={`p-2 rounded-lg transition-colors ${available ? "text-green-400 bg-green-400/10" : "text-gray-500 bg-white/5"}`}
                            >
                                {available ? <ToggleRight size={32} /> : <ToggleLeft size={32} />}
                            </button>
                        </div>
                    </section>

                    {/* Account Actions */}
                    <section className="bg-red-500/5 border border-red-500/10 rounded-2xl p-6">
                        <h2 className="text-lg font-semibold mb-4 text-red-400 flex items-center gap-2">
                            <Lock size={20} /> Account Actions
                        </h2>
                        <button
                            onClick={handleSignOut}
                            className="flex items-center gap-2 px-4 py-2 bg-red-500/10 hover:bg-red-500/20 text-red-400 rounded-lg text-sm font-medium transition-colors border border-red-500/20"
                        >
                            <LogOut size={16} /> Sign Out
                        </button>
                    </section>
                </div>
            </div>
        </div>
    );
}
