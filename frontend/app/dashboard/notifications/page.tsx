"use client";

import { useState, useEffect } from "react";
import { Bell, Calendar, FlaskConical, FileText, Heart, Info, Trash2, CheckCheck, Loader2 } from "lucide-react";
import { motion } from "framer-motion";
import {
    getCurrentUserId,
    getNotifications,
    markNotificationRead,
    markAllNotificationsRead,
    deleteAllNotifications,
    type Notification,
} from "@/lib/supabase-helpers";
import Link from "next/link";

const typeIcons: Record<string, React.ReactNode> = {
    appointment: <Calendar size={16} className="text-blue-400" />,
    lab: <FlaskConical size={16} className="text-teal-400" />,
    prescription: <FileText size={16} className="text-purple-400" />,
    vitals: <Heart size={16} className="text-red-400" />,
    system: <Bell size={16} className="text-yellow-400" />,
    info: <Info size={16} className="text-gray-400" />,
};

const typeBg: Record<string, string> = {
    appointment: "bg-blue-500/10",
    lab: "bg-teal-500/10",
    prescription: "bg-purple-500/10",
    vitals: "bg-red-500/10",
    system: "bg-yellow-500/10",
    info: "bg-gray-500/10",
};

export default function NotificationsPage() {
    const [notifications, setNotifications] = useState<Notification[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        loadNotifications();
    }, []);

    const loadNotifications = async () => {
        const userId = await getCurrentUserId();
        if (!userId) { setLoading(false); return; }
        const data = await getNotifications(userId);
        setNotifications(data);
        setLoading(false);
    };

    const handleMarkRead = async (id: string) => {
        await markNotificationRead(id);
        setNotifications(prev => prev.map(n => n.id === id ? { ...n, read: true } : n));
    };

    const handleMarkAllRead = async () => {
        const userId = await getCurrentUserId();
        if (!userId) return;
        await markAllNotificationsRead(userId);
        setNotifications(prev => prev.map(n => ({ ...n, read: true })));
    };

    const handleClearAll = async () => {
        const userId = await getCurrentUserId();
        if (!userId) return;
        await deleteAllNotifications(userId);
        setNotifications([]);
    };

    const unreadCount = notifications.filter(n => !n.read).length;

    // Group notifications by date
    const grouped = notifications.reduce<Record<string, Notification[]>>((acc, n) => {
        const date = new Date(n.created_at).toLocaleDateString("en-US", { month: "long", day: "numeric", year: "numeric" });
        if (!acc[date]) acc[date] = [];
        acc[date].push(n);
        return acc;
    }, {});

    if (loading) {
        return (
            <div className="flex items-center justify-center min-h-[60vh]">
                <Loader2 className="animate-spin text-purple-500" size={32} />
            </div>
        );
    }

    return (
        <div className="space-y-6 max-w-3xl">
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-2xl font-bold mb-1">Notifications</h1>
                    <p className="text-gray-400 text-sm">
                        {unreadCount > 0 ? `${unreadCount} unread notification${unreadCount > 1 ? "s" : ""}` : "All caught up!"}
                    </p>
                </div>

                {notifications.length > 0 && (
                    <div className="flex gap-2">
                        {unreadCount > 0 && (
                            <button
                                onClick={handleMarkAllRead}
                                className="flex items-center gap-1.5 px-3 py-2 bg-white/5 hover:bg-white/10 border border-white/10 rounded-lg text-xs text-gray-300 transition-colors"
                            >
                                <CheckCheck size={14} /> Mark all read
                            </button>
                        )}
                        <button
                            onClick={handleClearAll}
                            className="flex items-center gap-1.5 px-3 py-2 bg-red-500/5 hover:bg-red-500/10 border border-red-500/20 rounded-lg text-xs text-red-400 transition-colors"
                        >
                            <Trash2 size={14} /> Clear all
                        </button>
                    </div>
                )}
            </div>

            {notifications.length === 0 ? (
                <div className="text-center py-24">
                    <Bell size={48} className="mx-auto mb-4 text-gray-700" />
                    <p className="text-gray-500 text-lg font-medium">No notifications yet</p>
                    <p className="text-gray-600 text-sm mt-1">
                        You&apos;ll be notified when you book appointments, lab tests, or receive prescriptions
                    </p>
                </div>
            ) : (
                <div className="space-y-6">
                    {Object.entries(grouped).map(([date, items]) => (
                        <div key={date}>
                            <p className="text-xs font-medium text-gray-500 uppercase tracking-wide mb-3 px-1">{date}</p>
                            <div className="space-y-2">
                                {items.map((n, i) => {
                                    const content = (
                                        <motion.div
                                            initial={{ opacity: 0, y: 5 }}
                                            animate={{ opacity: 1, y: 0 }}
                                            transition={{ delay: i * 0.03 }}
                                            onClick={() => !n.read && handleMarkRead(n.id)}
                                            className={`p-4 rounded-xl border transition-all cursor-pointer ${n.read
                                                    ? "bg-white/[0.01] border-white/5 opacity-60"
                                                    : "bg-white/[0.03] border-white/10 hover:bg-white/[0.05]"
                                                }`}
                                        >
                                            <div className="flex items-start gap-3">
                                                <div className={`p-2 rounded-lg ${typeBg[n.type] || typeBg.info} flex-shrink-0 mt-0.5`}>
                                                    {typeIcons[n.type] || typeIcons.info}
                                                </div>
                                                <div className="flex-1 min-w-0">
                                                    <div className="flex items-center gap-2">
                                                        <h4 className={`text-sm font-semibold ${n.read ? "text-gray-400" : "text-gray-200"}`}>
                                                            {n.title}
                                                        </h4>
                                                        {!n.read && (
                                                            <span className="w-2 h-2 rounded-full bg-purple-500 flex-shrink-0" />
                                                        )}
                                                    </div>
                                                    <p className="text-xs text-gray-500 mt-1 leading-relaxed">{n.message}</p>
                                                    <p className="text-xs text-gray-600 mt-2">
                                                        {new Date(n.created_at).toLocaleTimeString("en-US", { hour: "2-digit", minute: "2-digit" })}
                                                    </p>
                                                </div>
                                            </div>
                                        </motion.div>
                                    );

                                    if (n.link) {
                                        return <Link key={n.id} href={n.link}>{content}</Link>;
                                    }
                                    return <div key={n.id}>{content}</div>;
                                })}
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
}
