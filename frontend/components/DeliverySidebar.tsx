"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import {
    Map,
    Package,
    History,
    Wallet,
    Settings,
    LogOut,
    Menu,
    X
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { createClient } from "@/utils/supabase/client";

const sidebarItems = [
    { icon: <Map size={20} />, label: "Active Deliveries", href: "/delivery" },
    { icon: <Package size={20} />, label: "Available Tasks", href: "/delivery/tasks" },
    { icon: <History size={20} />, label: "History", href: "/delivery/history" },
    { icon: <Wallet size={20} />, label: "Earnings", href: "/delivery/earnings" },
    { icon: <Settings size={20} />, label: "Settings", href: "/delivery/settings" },
];

export default function DeliverySidebar() {
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
                className="md:hidden fixed top-4 left-4 z-50 p-2 bg-white/10 rounded-lg backdrop-blur-md border border-white/10"
                onClick={() => setIsOpen(!isOpen)}
            >
                {isOpen ? <X /> : <Menu />}
            </button>

            <AnimatePresence>
                {(isOpen || typeof window !== 'undefined' && window.innerWidth >= 768) && (
                    <motion.div
                        initial={{ x: -300 }}
                        animate={{ x: 0 }}
                        exit={{ x: -300 }}
                        className={`fixed inset-y-0 left-0 z-40 w-64 bg-[#0a0a0a] border-r border-blue-500/20 flex flex-col ${isOpen ? "shadow-2xl shadow-blue-900/20" : ""}`}
                    >
                        <Link href="/" className="p-6 border-b border-blue-500/20 flex items-center gap-3 hover:bg-white/5 transition-colors">
                            <div className="w-8 h-8 rounded-lg bg-blue-600 flex items-center justify-center text-white shadow-lg shadow-blue-500/20">
                                <Map size={18} />
                            </div >
                            <span className="font-bold text-lg tracking-tight">NIRVAAAN <span className="text-blue-500 text-xs uppercase ml-1">Logistics</span></span >
                        </Link>

                        <nav className="flex-1 p-4 space-y-2 overflow-y-auto">
                            <div className="px-4 py-2 text-xs font-semibold text-gray-500 uppercase tracking-wider">
                                Delivery Management
                            </div >
                            {sidebarItems.map((item) => {
                                const isActive = pathname === item.href;
                                return (
                                    <Link
                                        key={item.href}
                                        href={item.href}
                                        onClick={() => setIsOpen(false)}
                                        className={`flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-200 group ${isActive
                                            ? "bg-blue-600/10 text-blue-400 border border-blue-600/20 shadow-[0_0_15px_-3px_rgba(37,99,235,0.2)]"
                                            : "text-gray-400 hover:text-white hover:bg-white/5"
                                            }`}
                                    >
                                        <div className={`transition-colors ${isActive ? "text-blue-400" : "text-gray-500 group-hover:text-gray-300"}`}>
                                            {item.icon}
                                        </div >
                                        <span className="font-medium text-sm">{item.label}</span>
                                    </Link>
                                );
                            })}
                        </nav>

                        <div className="p-4 border-t border-blue-500/20">
                            <div className="bg-white/5 rounded-xl p-3 flex items-center gap-3 border border-white/5 hover:border-white/10 transition-colors group">
                                <div className="w-10 h-10 rounded-full bg-gradient-to-tr from-blue-500 to-indigo-500 flex items-center justify-center text-white font-bold text-sm shadow-lg">
                                    DL
                                </div >
                                <div className="flex-1 min-w-0">
                                    <div className="text-sm font-medium truncate group-hover:text-blue-400 transition-colors">Driver</div >
                                    <div className="text-xs text-gray-500 truncate">Fleet Partner</div >
                                </div >
                                <button
                                    onClick={handleSignOut}
                                    className="text-gray-500 hover:text-red-400 transition-colors"
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
