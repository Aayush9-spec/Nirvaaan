"use client";

import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { 
    UserCheck, 
    UserX, 
    Users, 
    ShieldAlert, 
    Loader2,
    Search
} from "lucide-react";
import { createClient } from "@/utils/supabase/client";
import Skeleton from "@/components/Skeleton";
import EmptyState from "@/components/EmptyState";

export default function AdminDashboard() {
    const [pendingUsers, setPendingUsers] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState("");

    useEffect(() => {
        fetchPendingUsers();
    }, []);

    async function fetchPendingUsers() {
        setLoading(true);
        try {
            const supabase = createClient();
            const { data, error } = await supabase
                .from('profiles')
                .select('*')
                .eq('is_approved', false)
                .order('created_at', { ascending: true });

            if (error) throw error;
            setPendingUsers(data || []);
        } catch (err) {
            console.error("Admin Dashboard Error:", err);
        } finally {
            setLoading(false);
        }
    }

    const handleApproval = async (userId: string, approved: boolean) => {
        try {
            const supabase = createClient();
            const { error } = await supabase
                .from('profiles')
                .update({ is_approved: approved })
                .eq('id', userId);
            
            if (error) throw error;
            alert(approved ? "User approved successfully!" : "User request denied.");
            fetchPendingUsers();
        } catch (err: any) {
            alert(err.message);
        }
    };

    const filteredUsers = pendingUsers.filter(u => 
        u.full_name?.toLowerCase().includes(searchTerm.toLowerCase()) || 
        u.role?.toLowerCase().includes(searchTerm.toLowerCase())
    );

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
                    <h1 className="text-3xl font-bold text-white tracking-tight">Governance Center</h1>
                    <p className="text-gray-400">Verify and approve new healthcare providers and partners</p>
                </div>
                <div className="px-4 py-2 bg-amber-500/10 border border-amber-500/20 rounded-full text-amber-400 text-sm font-medium flex items-center gap-2">
                    <ShieldAlert size={16} />
                    System-Wide Admin Mode
                </div>
            </div>

            <div className="bg-white/[0.03] border border-white/10 p-4 rounded-2xl flex items-center gap-4">
                <Search className="text-gray-500" size={18} />
                <input 
                    type="text" 
                    placeholder="Search pending approvals..." 
                    className="bg-transparent border-none outline-none text-sm text-white w-full"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                />
            </div>

            <div className="grid gap-4">
                {filteredUsers.length > 0 ? (
                    filteredUsers.map((user) => (
                        <motion.div 
                            key={user.id} 
                            initial={{ opacity: 0, x: -10 }}
                            animate={{ opacity: 1, x: 0 }}
                            className="bg-white/[0.03] border border-white/10 rounded-2xl p-6 hover:border-amber-500/30 transition-all group"
                        >
                            <div className="flex flex-col lg:flex-row justify-between items-start gap-6">
                                <div className="flex gap-4">
                                    <div className="w-12 h-12 rounded-xl bg-amber-500/10 flex items-center justify-center text-amber-400">
                                        <Users size={24} />
                                    </div>
                                    <div className="space-y-1">
                                        <div className="flex items-center gap-2">
                                            <h3 className="font-bold text-lg text-white">{user.full_name || "Unnamed User"}</h3>
                                            <span className="text-[10px] bg-white/10 text-gray-400 border border-white/20 px-2 py-0.5 rounded-full font-medium uppercase">{user.role}</span>
                                        </div>
                                        <p className="text-gray-400 text-sm mt-1">Requested access on {new Date(user.created_at).toLocaleDateString()}</p>
                                        <p className="text-xs text-gray-600 mt-1">ID: {user.id.slice(0, 8)}</p>
                                    </div>
                                </div>

                                <div className="flex items-center gap-3 w-full lg:w-auto">
                                    <button 
                                        onClick={() => handleApproval(user.id, false)}
                                        className="flex-1 lg:flex-none px-4 py-2 bg-red-500/10 hover:bg-red-500/20 border border-red-500/20 rounded-xl text-sm font-medium text-red-400 transition-all flex items-center justify-center gap-2"
                                    >
                                        <UserX size={16} /> Deny
                                    </button>
                                    <button 
                                        onClick={() => handleApproval(user.id, true)}
                                        className="flex-1 lg:flex-none px-4 py-2 bg-amber-600 hover:bg-amber-500 rounded-xl text-sm font-bold text-white transition-all flex items-center justify-center gap-2 shadow-lg shadow-amber-900/20"
                                    >
                                        <UserCheck size={16} /> Approve
                                    </button>
                                </div>
                            </div>
                        </motion.div>
                    ))
                ) : (
                    <EmptyState 
                        icon={ShieldCheck} 
                        title="No pending approvals" 
                        description="All current requests have been processed. The system is secure." 
                    />
                )}
            </div>
        </div>
    );
}
