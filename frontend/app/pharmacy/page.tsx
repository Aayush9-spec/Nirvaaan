"use client";

import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { 
    Package, 
    CheckCircle, 
    Clock, 
    AlertCircle, 
    ArrowRight, 
    Search, 
    Filter,
    Loader2
} from "lucide-react";
import { createClient } from "@/utils/supabase/client";
import Skeleton from "@/components/Skeleton";
import EmptyState from "@/components/EmptyState";

interface PendingOrder {
    id: string;
    patient_name: string;
    diagnosis: string;
    status: string;
    created_at: string;
    items: any[];
}

export default function PharmacyDashboard() {
    const [orders, setOrders] = useState<PendingOrder[]>([]);
    const [loading, setLoading] = useState(true);
    const [filter, setFilter] = useState("all");
    const [searchTerm, setSearchTerm] = useState("");

    useEffect(() => {
        fetchOrders();
    }, []);

    async function fetchOrders() {
        setLoading(true);
        try {
            const supabase = createClient();
            const { data, error } = await supabase
                .from('orders')
                .select(`
                    *,
                    profiles!inner(full_name)
                `)
                .eq('fulfillment_status', 'pending')
                .order('created_at', { ascending: false });

            if (error) throw error;
            
            const formatted = data.map(o => ({
                id: o.id,
                patient_name: o.profiles?.full_name || "Unknown Patient",
                diagnosis: o.diagnosis || "Medical Prescription",
                status: o.fulfillment_status,
                created_at: o.created_at,
                items: o.record_items || []
            }));
            
            setOrders(formatted);
        } catch (err) {
            console.error("Pharmacy Dashboard Error:", err);
        } finally {
            setLoading(false);
        }
    }

    const validateOrder = async (orderId: string) => {
        try {
            const response = await fetch("/api/pharmacy/validate-order", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ orderId }),
            });
            const data = await response.json();
            if (!response.ok) throw new Error(data.error || "Validation failed");
            
            alert("Order validated successfully!");
            fetchOrders();
        } catch (err: any) {
            alert(err.message);
        }
    };

    const filteredOrders = orders.filter(o => {
        const matchesSearch = o.patient_name.toLowerCase().includes(searchTerm.toLowerCase()) || 
                              o.diagnosis.toLowerCase().includes(searchTerm.toLowerCase());
        const matchesFilter = filter === "all" || (filter === "urgent" && o.diagnosis.toLowerCase().includes("critical"));
        return matchesSearch && matchesFilter;
    });

    if (loading) {
        return (
            <div className="space-y-8">
                <div className="flex justify-between items-center">
                    <div className="space-y-2">
                        <Skeleton className="w-64 h-8" />
                        <Skeleton className="w-48 h-4" />
                    </div>
                    <Skeleton className="w-32 h-10 rounded-full" />
                </div>
                <div className="grid grid-cols-3 gap-6">
                    <Skeleton className="h-24 w-full rounded-2xl" />
                    <Skeleton className="h-24 w-full rounded-2xl" />
                    <Skeleton className="h-24 w-full rounded-2xl" />
                </div>
                <Skeleton className="h-12 w-full rounded-2xl" />
                <div className="grid gap-4">
                    <Skeleton className="h-32 w-full rounded-2xl" />
                    <Skeleton className="h-32 w-full rounded-2xl" />
                </div>
            </div>
        );
    }

    return (
        <div className="space-y-8">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div className="max-w-2xl">
                    <h1 className="text-3xl font-bold text-white tracking-tight">Pharmacy Command Center</h1>
                    <p className="text-gray-400">Validate prescriptions and manage medicine fulfillment</p>
                </div>
                <div className="flex items-center gap-3">
                    <div className="px-4 py-2 bg-emerald-500/10 border border-emerald-500/20 rounded-full text-emerald-400 text-sm font-medium flex items-center gap-2">
                        <div className="w-2 h-2 bg-emerald-500 rounded-full animate-pulse" />
                        Store Online
                    </div>
                </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
                {[
                    { label: "Pending Validation", value: orders.length, icon: Clock, color: "text-yellow-400", bg: "bg-yellow-400/10" },
                    { label: "Preparing Now", value: "0", icon: Package, color: "text-blue-400", bg: "bg-blue-400/10" },
                    { label: "Ready for Pickup", value: "0", icon: CheckCircle, color: "text-emerald-400", bg: "bg-emerald-400/10" },
                ].map((stat, i) => (
                    <div key={i} className="bg-white/[0.03] border border-white/10 p-6 rounded-2xl backdrop-blur-sm">
                        <div className="flex items-center justify-between">
                            <div className="space-y-1">
                                <p className="text-gray-500 text-sm font-medium">{stat.label}</p>
                                <h3 className={`text-3xl font-bold ${stat.color}`}>{stat.value}</h3>
                            </div>
                            <div className={`p-3 rounded-xl ${stat.bg} ${stat.color}`}>
                                <stat.icon size={24} />
                            </div>
                        </div>
                    </div>
                ))}
            </div>

            <div className="flex flex-col sm:flex-row gap-4 items-center justify-between bg-white/[0.02] p-4 rounded-2xl border border-white/5">
                <div className="relative w-full sm:w-96">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500" size={18} />
                    <input 
                        type="text" 
                        placeholder="Search patient or medicine..." 
                        className="w-full pl-10 pr-4 py-2 bg-black/40 border border-white/10 rounded-xl text-sm text-white focus:outline-none focus:ring-2 focus:ring-emerald-500/50 transition-all"
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                    />
                </div>
                <div className="flex items-center gap-2 w-full sm:w-auto">
                    <Filter size={16} className="text-gray-500 ml-2" />
                    <select 
                        className="bg-black/40 border border-white/10 rounded-xl px-3 py-2 text-sm text-gray-300 focus:outline-none"
                        value={filter}
                        onChange={(e) => setFilter(e.target.value)}
                    >
                        <option value="all">All Orders</option>
                        <option value="urgent">Urgent / Critical</option>
                    </select>
                </div>
            </div>

            <div className="grid gap-4">
                {filteredOrders.length > 0 ? (
                    filteredOrders.map((order) => (
                        <motion.div 
                            key={order.id} 
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            className="bg-white/[0.03] border border-white/10 rounded-2xl p-6 hover:border-emerald-500/30 transition-all group"
                        >
                            <div className="flex flex-col lg:flex-row justify-between items-start gap-6">
                                <div className="flex gap-4">
                                    <div className="w-12 h-12 rounded-xl bg-emerald-500/10 flex items-center justify-center text-emerald-400">
                                        <Package size={24} />
                                    </div>
                                    <div className="space-y-1">
                                        <div className="flex items-center gap-2">
                                            <h3 className="font-bold text-lg text-white">{order.patient_name}</h3>
                                            <span className="text-[10px] bg-yellow-500/10 text-yellow-500 border border-yellow-500/20 px-2 py-0.5 rounded-full font-medium">Pending Validation</span>
                                        </div>
                                        <p className="text-gray-400 text-sm">{order.diagnosis}</p>
                                        <p className="text-xs text-gray-600 mt-1">Order ID: {order.id.slice(0, 8)} • {new Date(order.created_at).toLocaleDateString()}</p>
                                    </div>
                                </div>

                                <div className="flex items-center gap-3 w-full lg:w-auto">
                                    <button className="flex-1 lg:flex-none px-4 py-2 bg-white/5 hover:bg-white/10 border border-white/10 rounded-xl text-sm font-medium text-gray-300 transition-all">
                                        View Prescription
                                    </button>
                                    <button 
                                        onClick={() => validateOrder(order.id)}
                                        className="flex-1 lg:flex-none px-4 py-2 bg-emerald-600 hover:bg-emerald-500 rounded-xl text-sm font-bold text-white transition-all flex items-center justify-center gap-2 group shadow-lg shadow-emerald-900/20"
                                    >
                                        Validate Order <ArrowRight size={16} className="group-hover:translate-x-1 transition-transform" />
                                    </button>
                                </div>
                            </div>
                        </motion.div>
                    ))
                ) : (
                    <EmptyState 
                        icon={Package} 
                        title="No pending orders" 
                        description="Everything is currently caught up. New prescriptions will appear here automatically." 
                    />
                )}
            </div>
        </div>
    );
}
