"use client";

import DashboardSidebar from "@/components/DashboardSidebar";
import DotGrid from "@/components/DotGrid";

export default function DashboardLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    return (
        <div className="min-h-screen bg-[#050505] text-white flex relative">
            {/* Background Grid for Dashboard */}
            <div className="fixed inset-0 z-0 pointer-events-none">
                <DotGrid 
                    baseColor="#333333" 
                    activeColor="#a855f7" 
                    gap={32}
                    dotSize={2}
                    className="opacity-50"
                />
            </div>

            <DashboardSidebar />
            
            <main className="flex-1 md:ml-64 min-h-screen relative overflow-hidden z-10 pointer-events-auto">
                <div className="relative z-10 p-6 md:p-12 max-w-6xl mx-auto h-full">
                    {children}
                </div>
            </main>
        </div>
    );
}
