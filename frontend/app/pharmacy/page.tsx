"use client";

import { motion } from "framer-motion";
import { Pill, ShoppingCart, Clock, CheckCircle, Search } from "lucide-react";

export default function PharmacyDashboard() {
    return (
        <div className="space-y-8">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <h1 className="text-3xl font-bold bg-gradient-to-r from-emerald-400 to-teal-500 bg-clip-text text-transparent">
                        Pharmacy Store
                    </h1>
                    <p className="text-gray-400 mt-1">Manage prescriptions, inventory, and orders.</p>
                </div>
                <div className="relative">
                    <Search className="absolute left-3 top-2.5 text-gray-500" size={18} />
                    <input
                        type="text"
                        placeholder="Search medicines..."
                        className="bg-white/5 border border-white/10 rounded-full py-2 pl-10 pr-4 text-sm text-white focus:outline-none focus:border-emerald-500/50 w-64"
                    />
                </div>
            </div>

            {/* Stats Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                {[
                    { label: "New Orders", value: "12", icon: <ShoppingCart size={24} />, color: "text-emerald-400", bg: "bg-emerald-500/10 border-emerald-500/20" },
                    { label: "Pending Prescriptions", value: "5", icon: <Clock size={24} />, color: "text-orange-400", bg: "bg-orange-500/10 border-orange-500/20" },
                    { label: "Low Stock Items", value: "8", icon: <Pill size={24} />, color: "text-red-400", bg: "bg-red-500/10 border-red-500/20" },
                    { label: "Completed Today", value: "45", icon: <CheckCircle size={24} />, color: "text-blue-400", bg: "bg-blue-500/10 border-blue-500/20" },
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
                        </div>
                        <div className="text-3xl font-bold mb-1">{stat.value}</div>
                        <div className="text-sm text-gray-400">{stat.label}</div>
                    </motion.div>
                ))}
            </div>

            {/* Active Orders List */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                <div className="p-6 rounded-2xl border border-white/10 bg-white/[0.02]">
                    <h3 className="text-lg font-semibold mb-6 flex items-center gap-2">
                        <ShoppingCart size={20} className="text-emerald-400" /> Recent Orders
                    </h3>
                    <div className="space-y-4">
                        {[1, 2, 3].map((_, i) => (
                            <div key={i} className="p-4 rounded-xl bg-white/5 border border-white/5 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                                <div>
                                    <div className="font-medium text-emerald-400">Order #RX-{202400 + i}</div>
                                    <div className="text-sm text-gray-400">2 items • Paracetamol, Amoxicillin</div>
                                </div>
                                <div className="flex items-center gap-3">
                                    <span className="px-3 py-1 bg-yellow-500/10 text-yellow-400 text-xs rounded-full border border-yellow-500/20">
                                        Processing
                                    </span>
                                    <button className="px-3 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white text-xs rounded-lg transition-colors">
                                        View
                                    </button>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>

                <div className="p-6 rounded-2xl border border-white/10 bg-white/[0.02]">
                    <h3 className="text-lg font-semibold mb-6 flex items-center gap-2">
                        <Pill size={20} className="text-red-400" /> Low Stock Warning
                    </h3>
                    <div className="space-y-4">
                        {[
                            { name: "Metformin 500mg", stock: 12, unit: "strips" },
                            { name: "Atorvastatin 10mg", stock: 5, unit: "strips" },
                            { name: "Insulin Glargine", stock: 2, unit: "vials" },
                        ].map((item, i) => (
                            <div key={i} className="flex items-center justify-between p-3 rounded-lg hover:bg-white/5 transition-colors">
                                <div className="flex items-center gap-3">
                                    <div className="w-8 h-8 rounded-lg bg-red-500/10 flex items-center justify-center text-red-400 font-bold text-xs">
                                        !
                                    </div>
                                    <div>
                                        <div className="font-medium text-sm">{item.name}</div>
                                        <div className="text-xs text-gray-500">Stock: {item.stock} {item.unit}</div>
                                    </div>
                                </div>
                                <button className="text-xs text-emerald-400 hover:text-emerald-300">
                                    Restock
                                </button>
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        </div>
    );
}
