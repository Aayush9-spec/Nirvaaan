"use client";

export default function DashboardLoading() {
    return (
        <div className="space-y-6 animate-pulse">
            {/* Header skeleton */}
            <div className="flex items-center justify-between">
                <div>
                    <div className="h-7 w-48 bg-white/10 rounded-lg mb-2" />
                    <div className="h-4 w-64 bg-white/5 rounded-lg" />
                </div>
                <div className="h-10 w-32 bg-white/10 rounded-lg" />
            </div>

            {/* Cards grid skeleton */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                {[...Array(4)].map((_, i) => (
                    <div key={i} className="bg-white/[0.02] border border-white/10 rounded-xl p-5">
                        <div className="flex items-center gap-3 mb-4">
                            <div className="w-10 h-10 bg-white/10 rounded-lg" />
                            <div className="h-4 w-20 bg-white/5 rounded-lg" />
                        </div>
                        <div className="h-8 w-24 bg-white/10 rounded-lg mb-2" />
                        <div className="h-3 w-16 bg-white/5 rounded-lg" />
                    </div>
                ))}
            </div>

            {/* Main content skeleton */}
            <div className="bg-white/[0.02] border border-white/10 rounded-xl p-6">
                <div className="h-5 w-36 bg-white/10 rounded-lg mb-6" />
                <div className="space-y-4">
                    {[...Array(5)].map((_, i) => (
                        <div key={i} className="flex items-center gap-4">
                            <div className="w-8 h-8 bg-white/10 rounded-full" />
                            <div className="flex-1">
                                <div className="h-4 bg-white/5 rounded-lg mb-2" style={{ width: `${60 + Math.random() * 30}%` }} />
                                <div className="h-3 bg-white/[0.03] rounded-lg" style={{ width: `${30 + Math.random() * 20}%` }} />
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
}
