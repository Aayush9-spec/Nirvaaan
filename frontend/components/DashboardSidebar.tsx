"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import {
    Activity,
    MessageSquare,
    Calendar,
    Camera,
    Mic,
    FileText,
    Wallet,
    Settings,
    LogOut,
    Menu,
    X,
    Bell,
    Brain
} from "lucide-react";
import { useState, useEffect, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { createClient } from "@/utils/supabase/client";
import { getCurrentUserId, getUnreadCount, getProfile } from "@/lib/supabase-helpers";
import { useRealtimeSubscription } from "@/lib/use-realtime";

const sidebarItems = [
    { icon: <Brain size={20} />, label: "AI Health Check", href: "/dashboard/ai-check" },
    { icon: <MessageSquare size={20} />, label: "Health Assistant", href: "/dashboard" },
    { icon: <Calendar size={20} />, label: "Appointments", href: "/dashboard/appointments" },
    { icon: <FileText size={20} />, label: "Medical Records", href: "/dashboard/records" },
    { icon: <Activity size={20} />, label: "Diagnostics", href: "/dashboard/diagnostics" },
    { icon: <Camera size={20} />, label: "Medicine Scanner", href: "/dashboard/scanner" },
    { icon: <Mic size={20} />, label: "AI Voice Agent", href: "/dashboard/agent" },
    { icon: <Bell size={20} />, label: "Notifications", href: "/dashboard/notifications", hasBadge: true },
    { icon: <Wallet size={20} />, label: "Web3 Wallet", href: "/dashboard/wallet" },
    { icon: <Settings size={20} />, label: "Settings", href: "/dashboard/settings" },
];

export default function DashboardSidebar() {
    const pathname = usePathname();
    const router = useRouter();
    const [isOpen, setIsOpen] = useState(false);
    const [unread, setUnread] = useState(0);
    const [userName, setUserName] = useState("Patient");
    const [avatarUrl, setAvatarUrl] = useState<string | null>(null);
    const [userId, setUserId] = useState<string | null>(null);

    const refreshUnread = useCallback(async () => {
        if (!userId) return;
        const count = await getUnreadCount(userId);
        setUnread(count);
    }, [userId]);

    useEffect(() => {
        const load = async () => {
            const uid = await getCurrentUserId();
            if (!uid) return;
            setUserId(uid);

            const [count, profile] = await Promise.all([
                getUnreadCount(uid),
                getProfile(uid),
            ]);
            setUnread(count);
            if (profile) {
                setUserName(profile.full_name || "Patient");
                setAvatarUrl(profile.avatar_url);
            }
        };
        load();
    }, []);

    useRealtimeSubscription("notifications", "user_id", userId, refreshUnread);

    const handleSignOut = async () => {
        const supabase = createClient();
        await supabase.auth.signOut();
        router.push("/login");
        router.refresh();
    };

    return (
        <>
            {/* Mobile Toggle */}
            <button
                onClick={() => setIsOpen(!isOpen)}
                className="md:hidden fixed top-4 left-4 z-50 p-2 bg-white/10 backdrop-blur-md rounded-full text-white border border-white/20 transition-all active:scale-95"
            >
                {isOpen ? <X size={24} /> : <Menu size={24} />}
            </button>

            {/* Sidebar */}
            <AnimatePresence mode="wait">
                <motion.div
                    initial={{ x: -260 }}
                    animate={{ x: isOpen ? 0 : 0 }}
                    className={`fixed inset-y-0 left-0 z-40 w-64 bg-black/40 backdrop-blur-2xl border-r border-white/10 transform transition-transform duration-300 ease-in-out md:translate-x-0 ${isOpen ? "translate-x-0" : "-translate-x-full"
                        }`}
                >
                    <div className="flex flex-col h-full">
                        {/* Logo */}
                        <Link href="/" className="h-20 flex items-center px-6 border-b border-white/10 group transition-all">
                            <div className="w-9 h-9 bg-gradient-to-br from-purple-600 to-indigo-600 rounded-lg flex items-center justify-center mr-3 font-bold text-white shadow-lg shadow-purple-500/20 group-hover:scale-110 transition-transform">
                                N
                            </div >
                            <span className="font-bold text-xl text-white tracking-tight">NIRVAAAN</span>
                        </Link>

                        {/* Navigation */}
                        <nav className="flex-1 px-4 py-8 space-y-1">
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
                                                layoutId="activeNav"
                                                className="absolute inset-0 bg-gradient-to-r from-purple-600/20 to-indigo-600/20 border border-purple-500/30 rounded-xl z-0"
                                                transition={{ type: "spring", bounce: 0.2, duration: 0.6 }}
                                            />
                                        )}
                                        <span className={`relative z-10 transition-colors ${isActive ? "text-purple-400" : "group-hover:text-white"}`}>
                                            {item.icon}
                                        </span>
                                        <span className="relative z-10">{item.label}</span>
                                        {item.hasBadge && unread > 0 && (
                                            <span className="relative z-10 ml-auto px-1.5 py-0.5 text-[10px] font-bold bg-purple-500 text-white rounded-full min-w-[18px] text-center leading-tight shadow-sm shadow-purple-500/50">
                                                {unread > 9 ? "9+" : unread}
                                            </span>
                                        )}
                                    </Link>
                                );
                            })}
                        </nav>

                        {/* User Profile / Logout */}
                        <div className="p-4 border-t border-white/10">
                            <button
                                onClick={handleSignOut}
                                className="w-full flex items-center gap-3 px-4 py-3 text-gray-400 hover:text-white transition-all rounded-xl hover:bg-white/5 group"
                            >
                                {avatarUrl ? (
                                    <img src={avatarUrl} alt="" className="w-8 h-8 rounded-full object-cover ring-2 ring-white/10 group-hover:ring-purple-500/50 transition-all" />
                                ) : (
                                    <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-purple-500 to-blue-500 flex items-center justify-center text-xs font-bold text-white ring-2 ring-white/10 group-hover:ring-purple-500/50 transition-all">
                                        {userName.charAt(0).toUpperCase()}
                                    </div>
                                )}
                                <div className="flex-1 min-w-0 text-left">
                                    <p className="text-sm font-medium text-white truncate">{userName}</p>
                                    <p className="text-xs text-gray-500 truncate group-hover:text-gray-400 transition-colors">Sign Out</p>
                                </div>
                                <LogOut size={18} className="group-hover:translate-x-1 transition-transform" />
                            </button>
                        </div>
                    </div>
                </motion.div>
            </AnimatePresence>

            {/* Overlay for mobile */}
            {isOpen && (
                <div
                    className="fixed inset-0 z-30 bg-black/60 backdrop-blur-sm md:hidden transition-opacity"
                    onClick={() => setIsOpen(false)}
                />
            )}
        </>
    );
}
