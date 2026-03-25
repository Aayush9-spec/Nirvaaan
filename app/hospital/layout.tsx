"use client";

import HospitalSidebar from "@/components/HospitalSidebar";

export default function HospitalLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    return (
        <div className="min-h-screen bg-[#050505] text-white flex">
            <HospitalSidebar />
            <main className="flex-1 md:ml-64 min-h-screen relative overflow-hidden">
                {/* Background Grid - Cyan Tint for Hospital */}
                <div className="absolute inset-0 z-0 pointer-events-none bg-[linear-gradient(to_right,#06b6d405_1px,transparent_1px),linear-gradient(to_bottom,#06b6d405_1px,transparent_1px)] bg-[size:2rem_2rem]"></div>

                <div className="relative z-10 p-6 md:p-12 max-w-7xl mx-auto h-full">
                    {children}
                </div>
            </main>
        </div>
    );
}
