"use client";

import { motion } from "framer-motion";
import { LucideIcon } from "lucide-react";

interface EmptyStateProps {
    icon: LucideIcon;
    title: string;
    description: string;
    action?: {
        label: string;
        onClick: () => void;
    };
}

export default function EmptyState({ icon: Icon, title, description, action }: EmptyStateProps) {
    return (
        <div className="flex flex-col items-center justify-center py-20 text-center space-y-4">
            <motion.div 
                initial={{ scale: 0, rotate: -20 }}
                animate={{ scale: 1, rotate: 0 }}
                className="w-20 h-20 bg-white/5 rounded-full flex items-center justify-center text-gray-600"
            >
                <Icon size={32} />
            </motion.div>
            <div className="space-y-2">
                <h3 className="text-xl font-bold text-white">{title}</h3>
                <p className="text-gray-500 max-w-xs mx-auto">{description}</p>
            </div>
            {action && (
                <button 
                    onClick={action.onClick}
                    className="px-6 py-2 bg-white/10 hover:bg-white/20 rounded-xl text-sm font-medium text-white transition-all"
                >
                    {action.label}
                </button>
            )}
        </div>
    );
}
