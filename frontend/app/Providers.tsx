"use client";

import { ThemeProvider } from "next-themes";
import { Web3Providers } from "@/components/Web3Providers";

export function Providers({ children }: { children: React.ReactNode }) {
    return (
        <Web3Providers>
            <ThemeProvider attribute="class" defaultTheme="system" enableSystem disableTransitionOnChange>
                {children}
            </ThemeProvider>
        </Web3Providers>
    );
}
