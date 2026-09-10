"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { 
    Pill, 
    Plus, 
    Save, 
    Trash2, 
    Search, 
    AlertTriangle,
    Loader2
} from "lucide-react";
import { createClient } from "@/utils/supabase/client";

interface InventoryItem {
    id: string;
    medicine_name: string;
    stock_quantity: number;
    unit_price: number;
    category: string;
}

export default function PharmacyInventory() {
    const [inventory, setInventory] = useState<InventoryItem[]>([]);
    const [loading, setLoading] = useState(true);
    const [isAdding, setIsAdding] = useState(false);
    const [newItem, setNewItem] = useState({
        medicine_name: "",
        stock_quantity: 0,
        unit_price: 0,
        category: ""
    });
    const [editingId, setEditingId] = useState<string | null>(null);
    const [editItem, setEditItem] = useState<InventoryItem | null>(null);
    const [searchTerm, setSearchTerm] = useState("");

    useEffect(() => {
        fetchInventory();
    }, []);

    async function fetchInventory() {
        setLoading(true);
        try {
            const supabase = createClient();
            const { data, error } = await supabase
                .from('pharmacy_inventory')
                .select('*')
                .order('medicine_name', { ascending: true });

            if (error) throw error;
            setInventory(data || []);
        } catch (err) {
            console.error("Inventory fetch error:", err);
        } finally {
            setLoading(false);
        }
    }

    async function handleSave() {
        try {
            const supabase = createClient();
            const { data: phData } = await supabase
                .from('pharmacy_details')
                .select('id')
                .single();
            
            if (!phData) throw new Error("Pharmacy profile not found");

            if (editingId) {
                const { error } = await supabase
                    .from('pharmacy_inventory')
                    .update({ 
                        medicine_name: editItem?.medicine_name, 
                        stock_quantity: editItem?.stock_quantity, 
                        unit_price: editItem?.unit_price,
                        category: editItem?.category 
                    })
                    .eq('id', editingId);
                if (error) throw error;
            } else {
                const { error } = await supabase
                    .from('pharmacy_inventory')
                    .insert({ 
                        ...newItem, 
                        pharmacy_id: phData.id 
                    });
                if (error) throw error;
            }
            
            setIsAdding(false);
            setEditingId(null);
            setEditItem(null);
            setNewItem({ medicine_name: "", stock_quantity: 0, unit_price: 0, category: "" });
            await fetchInventory();
        } catch (err: any) {
            alert(err.message);
        }
    }

    async function handleDelete(id: string) {
        if (!confirm("Are you sure you want to remove this item?")) return;
        try {
            const supabase = createClient();
            const { error } = await supabase.from('pharmacy_inventory').delete().eq('id', id);
            if (error) throw error;
            await fetchInventory();
        } catch (err: any) {
            alert(err.message);
        }
    }

    const filteredInventory = inventory.filter(item => 
        item.medicine_name.toLowerCase().includes(searchTerm.toLowerCase()) || 
        item.category?.toLowerCase().includes(searchTerm.toLowerCase())
    );

    if (loading) {
        return (
            <div className="flex items-center justify-center min-h-[60vh]">
                <Loader2 className="animate-spin text-emerald-500" size={40} />
            </div>
        );
    }

    return (
        <div className="space-y-8">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <h1 className="text-3xl font-bold text-white tracking-tight">Medicine Inventory</h1>
                    <p className="text-gray-400">Manage stock levels and pricing for your pharmacy</p>
                </div>
                <button 
                    onClick={() => setIsAdding(true)}
                    className="flex items-center gap-2 px-4 py-2 bg-emerald-600 hover:bg-emerald-500 rounded-xl text-sm font-bold text-white transition-all shadow-lg shadow-emerald-900/20"
                >
                    <Plus size={18} /> Add Medicine
                </button>
            </div>

            <AnimatePresence>
                {(isAdding || editingId) && (
                    <motion.div 
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm"
                    >
                        <motion.div 
                            initial={{ scale: 0.9, opacity: 0 }}
                            animate={{ scale: 1, opacity: 1 }}
                            className="bg-[#0a0a0a] border border-white/10 p-8 rounded-3xl w-full max-w-md shadow-2xl"
                        >
                            <h2 className="text-2xl font-bold text-white mb-6">
                                {editingId ? "Edit Medicine" : "Add New Medicine"}
                            </h2>
                            <div className="space-y-4">
                                <div>
                                    <label className="block text-xs font-medium text-gray-500 mb-1">Medicine Name</label>
                                    <input 
                                        className="w-full px-4 py-2 bg-black/40 border border-white/10 rounded-xl text-white focus:ring-2 focus:ring-emerald-500/50 outline-none"
                                        value={editingId ? editItem?.medicine_name : newItem.medicine_name}
                                        onChange={(e) => editingId 
                                            ? setEditItem({...editItem!, medicine_name: e.target.value}) 
                                            : setNewItem({...newItem, medicine_name: e.target.value})
                                        }
                                    />
                                </div>
                                <div className="grid grid-cols-2 gap-4">
                                    <div>
                                        <label className="block text-xs font-medium text-gray-500 mb-1">Stock Quantity</label>
                                        <input 
                                            type="number"
                                            className="w-full px-4 py-2 bg-black/40 border border-white/10 rounded-xl text-white focus:ring-2 focus:ring-emerald-500/50 outline-none"
                                            value={editingId ? editItem?.stock_quantity : newItem.stock_quantity}
                                            onChange={(e) => editingId 
                                                ? setEditItem({...editItem!, stock_quantity: parseInt(e.target.value)}) 
                                                : setNewItem({...newItem, stock_quantity: parseInt(e.target.value)})
                                            }
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-xs font-medium text-gray-500 mb-1">Unit Price (ETH)</label>
                                        <input 
                                            type="number" step="0.0001"
                                            className="w-full px-4 py-2 bg-black/40 border border-white/10 rounded-xl text-white focus:ring-2 focus:ring-emerald-500/50 outline-none"
                                            value={editingId ? editItem?.unit_price : newItem.unit_price}
                                            onChange={(e) => editingId 
                                                ? setEditItem({...editItem!, unit_price: parseFloat(e.target.value)}) 
                                                : setNewItem({...newItem, unit_price: parseFloat(e.target.value)})
                                            }
                                        />
                                    </div>
                                </div>
                                <div>
                                    <label className="block text-xs font-medium text-gray-500 mb-1">Category</label>
                                    <input 
                                        className="w-full px-4 py-2 bg-black/40 border border-white/10 rounded-xl text-white focus:ring-2 focus:ring-emerald-500/50 outline-none"
                                        value={editingId ? editItem?.category : newItem.category}
                                        onChange={(e) => editingId 
                                            ? setEditItem({...editItem!, category: e.target.value}) 
                                            : setNewItem({...newItem, category: e.target.value})
                                        }
                                    />
                                </div>
                            </div>
                            <div className="flex gap-3 mt-8">
                                <button 
                                    onClick={() => { setIsAdding(false); setEditingId(null); }}
                                    className="flex-1 px-4 py-2 bg-white/5 hover:bg-white/10 rounded-xl text-sm font-medium text-gray-400 transition-all"
                                >
                                    Cancel
                                </button>
                                <button 
                                    onClick={handleSave}
                                    className="flex-1 px-4 py-2 bg-emerald-600 hover:bg-emerald-500 rounded-xl text-sm font-bold text-white transition-all flex items-center justify-center gap-2"
                                >
                                    <Save size={16} /> Save Item
                                </button>
                            </div>
                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence>

            <div className="relative w-full max-w-md">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500" size={18} />
                <input 
                    type="text" 
                    placeholder="Search inventory..." 
                    className="w-full pl-10 pr-4 py-2 bg-white/[0.03] border border-white/10 rounded-xl text-sm text-white focus:outline-none focus:ring-2 focus:ring-emerald-500/50 transition-all"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                />
            </div>

            <div className="bg-white/[0.03] border border-white/10 rounded-2xl overflow-hidden backdrop-blur-sm">
                <table className="w-full text-left text-sm">
                    <thead className="bg-white/5 text-gray-400 uppercase text-[10px] font-bold tracking-wider">
                        <tr>
                            <th className="px-6 py-4">Medicine</th>
                            <th className="px-6 py-4">Category</th>
                            <th className="px-6 py-4">Stock</th>
                            <th className="px-6 py-4">Price</th>
                            <th className="px-6 py-4 text-right">Actions</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-white/5">
                        {filteredInventory.length > 0 ? filteredInventory.map((item) => (
                            <tr key={item.id} className="hover:bg-white/[0.02] transition-colors group">
                                <td className="px-6 py-4">
                                    <div className="flex items-center gap-3">
                                        <div className="p-2 bg-emerald-500/10 rounded-lg text-emerald-400">
                                            <Pill size={16} />
                                        </div>
                                        <span className="font-medium text-white">{item.medicine_name}</span>
                                    </div>
                                </td>
                                <td className="px-6 py-4 text-gray-400">{item.category || "N/A"}</td>
                                <td className="px-6 py-4">
                                    <div className="flex items-center gap-2">
                                        <span className={`font-mono ${item.stock_quantity < 10 ? "text-red-400 font-bold" : "text-gray-300"}`}>
                                            {item.stock_quantity}
                                        </span>
                                        {item.stock_quantity < 10 && (
                                            <AlertTriangle size={14} className="text-red-500" />
                                        )}
                                    </div>
                                </td>
                                <td className="px-6 py-4 font-mono text-gray-300">{item.unit_price} ETH</td>
                                <td className="px-6 py-4 text-right space-x-2">
                                    <button 
                                        onClick={() => {
                                            setEditingId(item.id);
                                            setEditItem(item);
                                            setIsAdding(false);
                                        }}
                                        className="p-2 hover:bg-white/10 rounded-lg text-gray-400 hover:text-white transition-all"
                                    >
                                        <Save size={16} />
                                    </button>
                                    <button 
                                        onClick={() => handleDelete(item.id)}
                                        className="p-2 hover:bg-red-500/10 rounded-lg text-gray-400 hover:text-red-400 transition-all"
                                    >
                                        <Trash2 size={16} />
                                    </button>
                                </td>
                            </tr>
                        )) : (
                            <tr>
                                <td colSpan={5} className="px-6 py-20 text-center text-gray-500">
                                    No medicines found in inventory.
                                </td>
                            </tr>
                        )}
                    </tbody>
                </table>
            </div>
        </div>
    );
}
