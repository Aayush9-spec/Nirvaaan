"use client";

import { motion } from "framer-motion";
import dynamic from "next/dynamic";
import { Truck, MapPin, Package, Clock, ShieldCheck, Phone } from "lucide-react";

// Dynamically import map to avoid SSR issues with Leaflet
const DeliveryMap = dynamic(() => import("@/components/DeliveryMap"), {
    ssr: false,
    loading: () => (
        <div className="w-full h-[500px] flex items-center justify-center bg-white/5 rounded-2xl animate-pulse">
            <p className="text-gray-400">Loading Map...</p>
        </div>
    ),
});

export default function DeliveryDashboard() {
    return (
        <div className="space-y-8">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <h1 className="text-3xl font-bold bg-gradient-to-r from-orange-400 to-amber-500 bg-clip-text text-transparent">
                        Delivery Partner
                    </h1>
                    <p className="text-gray-400 mt-1">Track deliveries, optimize routes, and manage earnings.</p>
                </div>
                <div className="flex items-center gap-2">
                    <span className="w-3 h-3 bg-green-500 rounded-full animate-pulse shadow-[0_0_10px_rgba(34,197,94,0.5)]"></span>
                    <span className="text-sm font-medium text-green-400">Online & Available</span>
                </div>
            </div>

            {/* Stats Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                {[
                    { label: "Active Tasks", value: "3", icon: <Package size={24} />, color: "text-orange-400", bg: "bg-orange-500/10 border-orange-500/20" },
                    { label: "Completed Today", value: "12", icon: <ShieldCheck size={24} />, color: "text-green-400", bg: "bg-green-500/10 border-green-500/20" },
                    { label: "Today's Earnings", value: "₹1,450", icon: <Clock size={24} />, color: "text-blue-400", bg: "bg-blue-500/10 border-blue-500/20" },
                    { label: "Avg. Time", value: "24m", icon: <Truck size={24} />, color: "text-purple-400", bg: "bg-purple-500/10 border-purple-500/20" },
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

            {/* Map & Tasks Split */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* Real interactive Map */}
                <div className="lg:col-span-2">
                    <DeliveryMap />
                </div>

                {/* Task List */}
                <div className="space-y-4">
                    <h3 className="font-semibold text-lg px-2">Current Deliveries</h3>
                    {[
                        { id: "DL-8921", from: "Green Cross Pharmacy", to: "Sector 45, Apartment 12B", status: "In Transit", time: "12m left" },
                        { id: "DL-8924", from: "City Hospital Labs", to: "Dr. Lal PathLabs", status: "Pickup Pending", time: "Start now" },
                    ].map((task, i) => (
                        <div key={i} className="p-4 rounded-xl bg-white/5 border border-white/10 hover:bg-white/[0.08] transition-colors cursor-pointer group">
                            <div className="flex justify-between items-start mb-3">
                                <span className="text-xs font-mono text-orange-400 bg-orange-500/10 px-2 py-1 rounded">#{task.id}</span>
                                <span className="text-xs font-bold text-white">{task.time}</span>
                            </div>
                            <div className="space-y-3 relative">
                                {/* Connector Line */}
                                <div className="absolute left-[5px] top-[6px] bottom-[26px] w-0.5 bg-gray-700"></div>

                                <div className="flex items-start gap-3">
                                    <div className="w-3 h-3 rounded-full bg-blue-500 mt-1 relative z-10 box-content border-2 border-[#111]"></div>
                                    <div>
                                        <div className="text-xs text-gray-500">Pickup</div>
                                        <div className="text-sm font-medium">{task.from}</div>
                                    </div>
                                </div>
                                <div className="flex items-start gap-3">
                                    <div className="w-3 h-3 rounded-full bg-green-500 mt-1 relative z-10 box-content border-2 border-[#111]"></div>
                                    <div>
                                        <div className="text-xs text-gray-500">Dropoff</div>
                                        <div className="text-sm font-medium">{task.to}</div>
                                    </div>
                                </div>
                            </div>
                            <div className="mt-4 flex gap-2">
                                <button className="flex-1 py-1.5 bg-white/10 hover:bg-white/20 rounded-lg text-xs font-medium transition-colors">
                                    Details
                                </button>
                                <button className="p-1.5 bg-green-500/20 text-green-400 rounded-lg hover:bg-green-500/30 transition-colors">
                                    <Phone size={16} />
                                </button>
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
}
