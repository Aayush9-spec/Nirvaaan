"use client";

import { motion } from "framer-motion";
import { Activity, Calendar, Pill, FileText, CheckCircle } from "lucide-react";

interface HealthEvent {
    id: string;
    type: "ai_analysis" | "appointment" | "prescription" | "diagnostic";
    title: string;
    date: string;
    description: string;
    status: "completed" | "pending";
}

export default function HealthTimeline({ events }: { events: HealthEvent[] }) {
    return (
        <div className="relative max-w-2xl mx-auto py-8 px-4">
            {/* Central Line */}
            <div className="absolute left-8 top-0 bottom-0 w-0.5 bg-gradient-to-b from-purple-600 via-blue-500 to-transparent opacity-30" />

            <div className="space-y-12">
                {events.map((event, index) => (
                    <motion.div 
                        key={event.id}
                        initial={{ opacity: 0, x: -20 }}
                        whileInView={{ opacity: 1, x: 0 }}
                        viewport={{ once: true }}
                        transition={{ delay: index * 0.1 }}
                        className="relative pl-16 group"
                    >
                        {/* Timeline Dot */}
                        <div className={`absolute left-6 top-2 w-4 h-4 rounded-full border-2 z-10 transition-all duration-300 group-hover:scale-125 ${
                            event.type === "ai_analysis" ? "bg-purple-500 border-purple-300 shadow-[0_0_10px_rgba(168,85,247,0.5)]" : 
                            event.type === "appointment" ? "bg-blue-500 border-blue-300" : 
                            event.type === "prescription" ? "bg-green-500 border-green-300" : "bg-orange-500 border-orange-300"
                        }`} />

                        <div className="bg-white/[0.03] border border-white/10 p-4 rounded-2xl backdrop-blur-sm group-hover:bg-white/[0.06] transition-all duration-300 hover:border-purple-500/30">
                            <div className="flex justify-between items-start mb-2">
                                <div className="flex items-center gap-2">
                                    {event.type === "ai_analysis" && <Activity size={16} className="text-purple-400" />}
                                    {event.type === "appointment" && <Calendar size={16} className="text-blue-400" />}
                                    {event.type === "prescription" && <Pill size={16} className="text-green-400" />}
                                    {event.type === "diagnostic" && <FileText size={16} className="text-orange-400" />}
                                    <span className="text-sm font-bold text-white">{event.title}</span>
                                </div>
                                <span className="text-[10px] font-medium text-gray-500 bg-white/5 px-2 py-1 rounded-full">
                                    {event.date}
                                </span>
                            </div>
                            <p className="text-xs text-gray-400 leading-relaxed">{event.description}</p>
                            {event.status === "completed" && (
                                <div className="flex items-center gap-1 mt-2 text-[10px] text-green-500 font-medium">
                                    <CheckCircle size={10} /> Verified & Integrated
                                </div>
                            )}
                        </div>
                    </motion.div>
                ))}
            </div>
        </div>
    );
}
