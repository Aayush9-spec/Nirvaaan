"use client";

import dynamic from "next/dynamic";
import { Loader2 } from "lucide-react";

const WalletPageContent = dynamic(() => import("./WalletPageContent"), {
    ssr: false,
    loading: () => (
        <div className="flex items-center justify-center min-h-[60vh]">
            <Loader2 className="animate-spin text-purple-500" size={32} />
        </div>
    ),
});

export default function WalletPage() {
    return <WalletPageContent />;
}
