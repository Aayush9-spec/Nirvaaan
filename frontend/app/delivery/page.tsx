"use client";

import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { 
    Package, 
    MapPin, 
    CheckCircle, 
    Clock, 
    ArrowRight, 
    Navigation,
    Loader2
} from "lucide-react";
import { createClient } from "@/utils/supabase/client";
import Skeleton from "@/components/Skeleton";
import EmptyState from "@/components/EmptyState";

interface DeliveryTask {
    id: string;
    order_id: string;
    status: string;
    pickup_location: string;
    delivery_location: string;
    created_at: string;
}

export default function DeliveryDashboard() {
    const [tasks, setTasks] = useState<DeliveryTask[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchTasks();
    }, []);

    async function fetchTasks() {
        setLoading(true);
        try {
            const supabase = createClient();
            const { data, error } = await supabase
                .from('deliveries')
                .select(`
                    *,
                    orders(diagnosis, profiles(full_name))
                `)
                .eq('status', 'assigned')
                .order('created_at', { ascending: true });

            if (error) throw error;
            setTasks(data || []);
        } catch (err) {
            console.error("Delivery Dashboard Error:", err);
        } finally {
            setLoading(false);
        }
    }

    const updateStatus = async (deliveryId: string, newStatus: string) => {
        try {
            const supabase = createClient();
            const { error } = await supabase
                .from('deliveries')
                .update({ status: newStatus })
                .eq('id', deliveryId);
            
            if (error) throw error;
            alert(`Status updated to ${newStatus}!`);
            fetchTasks();
        } catch (err: any) {
            alert(err.message);
        }
    };

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
                <div>
                    <h1 className="text-3xl font-bold text-white tracking-tight">Active Logistics</h1>
                    <p className="text-gray-400">Manage your assigned medicine deliveries</p>
                </div>
                <div className="px-4 py-2 bg-blue-500/10 border border-blue-500/20 rounded-full text-blue-400 text-sm font-medium flex items-center gap-2">
                    <div className="w-2 h-2 bg-blue-500 rounded-full animate-pulse" />
                    On Duty
                </div>
            </div>

            <div className="grid gap-6">
                {tasks.length > 0 ? (
                    tasks.map((task) => (
                        <motion.div 
                            key={task.id} 
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            className="bg-white/[0.03] border border-white/10 rounded-2xl p-6 hover:border-blue-500/30 transition-all group"
                        >
                            <div className="flex flex-col lg:flex-row justify-between items-start gap-6">
                                <div className="flex gap-4">
                                    <div className="w-12 h-12 rounded-xl bg-blue-500/10 flex items-center justify-center text-blue-400">
                                        <Package size={24} />
                                    </div>
                                    <div className="space-y-1">
                                        <div className="flex items-center gap-2">
                                            <h3 className="font-bold text-lg text-white">Delivery #{task.id.slice(0, 8)}</h3>
                                            <span className="text-[10px] bg-blue-500/10 text-blue-400 border border-blue-500/20 px-2 py-0.5 rounded-full font-medium">{task.status}</span>
                                        </div>
                                        <p className="text-gray-400 text-sm">Patient: {task.orders?.profiles?.full_name || "Loading..."}</p>
                                        <p className="text-xs text-gray-600 mt-1">Ordered: {new Date(task.created_at).toLocaleDateString()}</p>
                                    </div>
                                </div>

                                <div className="flex items-center gap-3 w-full lg:w-auto">
                                    <button className="flex-1 lg:flex-none px-4 py-2 bg-white/5 hover:bg-white/10 border border-white/10 rounded-xl text-sm font-medium text-gray-300 transition-all flex items-center justify-center gap-2">
                                        <Navigation size={16} /> Get Directions
                                    </button>
                                    <button 
                                        onClick={() => updateStatus(task.id, 'picked_up')}
                                        className="flex-1 lg:flex-none px-4 py-2 bg-blue-600 hover:bg-blue-500 rounded-xl text-sm font-bold text-white transition-all flex items-center justify-center gap-2 group shadow-lg shadow-blue-900/20"
                                    >
                                        Confirm Pickup <ArrowRight size={16} className="group-hover:translate-x-1 transition-transform" />
                                    </button>
                                </div>
                            </div>
                        </motion.div>
                    ))
                ) : (
                    <EmptyState 
                        icon={Package} 
                        title="No assigned tasks" 
                        description="You're all caught up! New delivery tasks will be assigned by the pharmacy." 
                    />
                )}
            </div>
        </div>
    );
}
