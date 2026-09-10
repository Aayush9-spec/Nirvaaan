"use client";

import { motion } from "framer-motion";

export default function Skeleton({ className }: { className?: string }) {
    return (
        <motion.div 
            className={`bg-white/5 animate-pulse rounded-md ${className}`}
            initial={{ opacity: 0.5 }}
            animate={{ opacity: [0.5, 0.8, 0.5] }}
            transition={{ duration: 1.5, repeat: Infinity, ease: "easeInOut" }}
        />
    );
}
