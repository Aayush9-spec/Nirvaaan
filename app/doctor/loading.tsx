"use client";

export default function DoctorLoading() {
    return (
        <div className="space-y-6 animate-pulse p-8">
            {/* Header skeleton */}
            <div className="flex items-center justify-between">
                <div>
                    <div className="h-7 w-52 bg-white/10 rounded-lg mb-2" />
                    <div className="h-4 w-72 bg-white/5 rounded-lg" />
                </div>
            </div>

            {/* Stats row skeleton */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                {[...Array(3)].map((_, i) => (
                    <div key={i} className="bg-white/[0.02] border border-white/10 rounded-xl p-5">
                        <div className="h-4 w-24 bg-white/5 rounded-lg mb-3" />
                        <div className="h-8 w-16 bg-white/10 rounded-lg" />
                    </div>
                ))}
            </div>

            {/* Table skeleton */}
            <div className="bg-white/[0.02] border border-white/10 rounded-xl p-6">
                <div className="h-5 w-40 bg-white/10 rounded-lg mb-6" />
                <div className="space-y-4">
                    {[...Array(4)].map((_, i) => (
                        <div key={i} className="flex items-center gap-4 py-3 border-b border-white/5 last:border-0">
                            <div className="w-10 h-10 bg-white/10 rounded-full" />
                            <div className="flex-1">
                                <div className="h-4 bg-white/5 rounded-lg mb-2 w-3/4" />
                                <div className="h-3 bg-white/[0.03] rounded-lg w-1/2" />
                            </div>
                            <div className="h-8 w-20 bg-white/10 rounded-lg" />
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
}
