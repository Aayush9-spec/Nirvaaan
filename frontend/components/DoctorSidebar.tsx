"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import {
    BriefcaseMedical,
    CalendarCheck,
    Users,
    FileText,
    LogOut,
    Menu,
    X,
    Stethoscope,
    Settings
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { createClient } from "@/utils/supabase/client";

const sidebarItems = [
    { icon: <BriefcaseMedical size={20} />, label: "Doctor Dashboard", href: "/doctor" },
    { icon: <CalendarCheck size={20} />, label: "Appointments", href: "/doctor/appointments" },
    { icon: <Users size={20} />, label: "Patients", href: "/doctor/patients" },
    { icon: <FileText size={20} />, label: "Prescriptions", href: "/doctor/prescriptions" },
    { icon: <Settings size={20} />, label: "Settings", href: "/doctor/settings" },
];

export default function DoctorSidebar() {
    const pathname = usePathname();
    const router = useRouter();
    const [isOpen, setIsOpen] = useState(false);

    const handleSignOut = async () => {
        const supabase = createClient();
        await supabase.auth.signOut();
        router.push("/login");
        router.refresh();
    };

    return (
        <>
            <button
                className="md:hidden fixed top-4 left-4 z-50 p-2 bg-white/10 backdrop-blur-md rounded-full text-white border border-white/20 transition-all active:scale-95"
                onClick={() => setIsOpen(!isOpen)}
            >
                {isOpen ? <X /> : <Menu />}
            </button>

            <AnimatePresence mode="wait">
                {(isOpen || typeof window !== 'undefined' && window.innerWidth >= 768) && (
                    <motion.div
                        initial={{ x: -260 }}
                        animate={{ x: 0 }}
                        exit={{ x: -260 }}
                        className={`fixed inset-y-0 left-0 z-40 w-64 bg-black/40 backdrop-blur-2xl border-r border-white/10 flex flex-col ${isOpen ? "shadow-2xl shadow-blue-900/20" : ""}`}
                    >
                        <Link href="/" className="h-20 p-6 border-b border-white/10 flex items-center gap-3 group transition-all">
                            <div className="w-9 h-9 rounded-lg bg-gradient-to-br from-blue-600 to-cyan-600 flex items-center justify-center text-white shadow-lg shadow-blue-500/20 group-hover:scale-110 transition-transform">
                                <Stethoscope size={18} />
                            </div >
                            <span className="font-bold text-xl text-white tracking-tight">NIRVAAAN <span className="text-blue-400 text-xs uppercase ml-1">Doctor</span></span >
                        </Link>

                        <nav className="flex-1 p-4 space-y-1 overflow-y-auto">
                            <div className="px-4 py-2 text-xs font-semibold text-gray-500 uppercase tracking-wider">
                                Practice Management
                            </div >
                            {sidebarItems.map((item) => {
                                const isActive = pathname === item.href;
                                return (
                                    <Link
                                        key={item.href}
                                        href={item.href}
                                        onClick={() => setIsOpen(false)}
                                        className={`relative flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-all group ${isActive
                                            ? "text-white"
                                            : "text-gray-400 hover:text-gray-200"
                                            }`}
                                    >
                                        {isActive && (
                                            <motion.div
                                                layoutId="doctorActiveNav"
                                                className="absolute inset-0 bg-gradient-to-r from-blue-600/20 to-cyan-600/20 border border-blue-500/30 rounded-xl z-0"
                                                transition={{ type: "spring", bounce: 0.2, duration: 0.6 }}
                                            />
                                        )}
                                        <span className={`relative z-10 transition-colors ${isActive ? "text-blue-400" : "group-hover:text-white"}`}>
                                            {item.icon}
                                        </span >
                                        <span className="relative z-10">{item.label}</span>
                                    </Link>
                                );
                            })}
                        </nav>

                        <div className="p-4 border-t border-white/10">
                            <div className="bg-white/5 rounded-xl p-3 flex items-center gap-3 border border-white/10 hover:border-blue-500/30 transition-all group">
                                <div className="w-10 h-10 rounded-full bg-gradient-to-tr from-blue-500 to-cyan-500 flex items-center justify-center text-white font-bold text-sm shadow-lg ring-2 ring-white/10 group-hover:ring-blue-500/50 transition-all">
                                    DR
                                </div >
                                <div className="flex-1 min-w-0">
                                    <div className="text-sm font-medium text-white truncate group-hover:text-blue-400 transition-colors">Doctor</div >
                                    <div className="text-xs text-gray-500 truncate">Provider Portal</div >
                                </div >
                                <button
                                    onClick={handleSignOut}
                                    className="text-gray-500 hover:text-red-400 transition-all group-hover:translate-x-1"
                                >
                                    <LogOut size={18} />
                                </button>
                            </div >
                        </div >
                    </motion.div>
                )}
            </AnimatePresence>

            {isOpen && (
                <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    onClick={() => setIsOpen(false)}
                    className="fixed inset-0 bg-black/60 backdrop-blur-sm z-30 md:hidden"
                />
            )}
        </>
    );
}