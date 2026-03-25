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
    Bell
} from "lucide-react";
import { useState, useEffect, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { createClient } from "@/utils/supabase/client";
import { getCurrentUserId, getUnreadCount, getProfile } from "@/lib/supabase-helpers";
import { useRealtimeSubscription } from "@/lib/use-realtime";

const sidebarItems = [
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

    // Real-time notification updates (instant badge)
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
                className="md:hidden fixed top-4 left-4 z-50 p-2 bg-white/10 rounded-md text-white"
            >
                {isOpen ? <X size={24} /> : <Menu size={24} />}
            </button>

            {/* Sidebar */}
            <AnimatePresence mode="wait">
                <motion.div
                    className={`fixed inset-y-0 left-0 z-40 w-64 bg-[#080808] border-r border-white/10 transform transition-transform duration-300 ease-in-out md:translate-x-0 ${isOpen ? "translate-x-0" : "-translate-x-full"
                        }`}
                >
                    <div className="flex flex-col h-full">
                        {/* Logo */}
                        <Link href="/" className="h-20 flex items-center px-6 border-b border-white/10 hover:bg-white/5 transition-colors">
                            <div className="w-8 h-8 bg-purple-600 rounded-sm flex items-center justify-center mr-3 font-bold text-white">
                                M
                            </div>
                            <span className="font-bold text-xl text-white tracking-tight">MedAI</span>
                        </Link>

                        {/* Navigation */}
                        <nav className="flex-1 px-4 py-8 space-y-2">
                            {sidebarItems.map((item) => {
                                const isActive = pathname === item.href;
                                return (
                                    <Link
                                        key={item.href}
                                        href={item.href}
                                        onClick={() => setIsOpen(false)}
                                        className={`flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-medium transition-all relative ${isActive
                                            ? "bg-purple-600/10 text-purple-400 border border-purple-600/20"
                                            : "text-gray-400 hover:text-white hover:bg-white/5"
                                            }`}
                                    >
                                        {item.icon}
                                        {item.label}
                                        {item.hasBadge && unread > 0 && (
                                            <span className="ml-auto px-1.5 py-0.5 text-[10px] font-bold bg-purple-600 text-white rounded-full min-w-[18px] text-center leading-tight">
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
                                className="w-full flex items-center gap-3 px-4 py-3 text-gray-400 hover:text-white transition-colors rounded-lg hover:bg-white/5"
                            >
                                {avatarUrl ? (
                                    <img src={avatarUrl} alt="" className="w-8 h-8 rounded-full object-cover" />
                                ) : (
                                    <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-purple-500 to-blue-500 flex items-center justify-center text-xs font-bold text-white">
                                        {userName.charAt(0).toUpperCase()}
                                    </div>
                                )}
                                <div className="flex-1 min-w-0 text-left">
                                    <p className="text-sm font-medium text-white truncate">{userName}</p>
                                    <p className="text-xs text-gray-500 truncate">Sign Out</p>
                                </div>
                                <LogOut size={18} />
                            </button>
                        </div>
                    </div>
                </motion.div>
            </AnimatePresence>

            {/* Overlay for mobile */}
            {isOpen && (
                <div
                    className="fixed inset-0 z-30 bg-black/50 backdrop-blur-sm md:hidden"
                    onClick={() => setIsOpen(false)}
                />
            )}
        </>
    );
}
