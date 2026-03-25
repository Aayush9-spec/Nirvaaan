"use client";

import { useState } from "react";
import { ArrowLeft, Mail, Loader2, CheckCircle } from "lucide-react";
import Link from "next/link";
import { createClient } from "@/utils/supabase/client";
import { motion } from "framer-motion";

export default function ForgotPasswordPage() {
    const [email, setEmail] = useState("");
    const [loading, setLoading] = useState(false);
    const [sent, setSent] = useState(false);
    const [error, setError] = useState("");

    const handleReset = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setError("");

        const supabase = createClient();
        const { error } = await supabase.auth.resetPasswordForEmail(email, {
            redirectTo: `${window.location.origin}/auth/callback?next=/dashboard/settings`,
        });

        setLoading(false);
        if (error) {
            setError(error.message);
        } else {
            setSent(true);
        }
    };

    return (
        <div className="min-h-screen bg-[#050505] text-white flex items-center justify-center p-6">
            {/* Background grid */}
            <div className="fixed inset-0 z-0 pointer-events-none bg-[linear-gradient(to_right,#ffffff0a_1px,transparent_1px),linear-gradient(to_bottom,#ffffff0a_1px,transparent_1px)] bg-[size:4rem_4rem] [mask-image:radial-gradient(ellipse_60%_50%_at_50%_0%,#000_70%,transparent_100%)]" />

            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="w-full max-w-md relative z-10"
            >
                {/* Logo */}
                <div className="flex items-center gap-3 mb-10">
                    <div className="w-10 h-10 bg-gradient-to-br from-purple-500 to-purple-700 text-white flex items-center justify-center rounded-lg font-bold text-lg">
                        M
                    </div>
                    <span className="font-bold text-xl tracking-tight">MedAI</span>
                </div>

                {sent ? (
                    <div className="bg-white/[0.02] border border-white/10 rounded-2xl p-8 text-center">
                        <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-green-500/10 flex items-center justify-center">
                            <CheckCircle size={32} className="text-green-400" />
                        </div>
                        <h2 className="text-xl font-bold mb-2">Check Your Email</h2>
                        <p className="text-gray-400 text-sm mb-6">
                            We&apos;ve sent a password reset link to <span className="text-white font-medium">{email}</span>. Click the link to reset your password.
                        </p>
                        <Link
                            href="/login"
                            className="text-purple-400 hover:text-purple-300 text-sm font-medium transition-colors"
                        >
                            ← Back to Sign In
                        </Link>
                    </div>
                ) : (
                    <div className="bg-white/[0.02] border border-white/10 rounded-2xl p-8">
                        <h2 className="text-2xl font-bold mb-2">Forgot Password?</h2>
                        <p className="text-gray-400 text-sm mb-8">
                            Enter your email and we&apos;ll send you a reset link.
                        </p>

                        <form onSubmit={handleReset} className="space-y-5">
                            <div className="space-y-2">
                                <label className="text-sm text-gray-400">Email</label>
                                <div className="relative">
                                    <Mail size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500" />
                                    <input
                                        type="email"
                                        value={email}
                                        onChange={(e) => setEmail(e.target.value)}
                                        required
                                        placeholder="you@example.com"
                                        className="w-full bg-white/5 border border-white/10 rounded-xl pl-11 pr-4 py-3 text-white placeholder-gray-600 focus:outline-none focus:border-purple-500/50 transition-colors text-sm"
                                    />
                                </div>
                            </div>

                            {error && (
                                <p className="text-red-400 text-sm bg-red-500/10 border border-red-500/20 rounded-lg px-4 py-2">
                                    {error}
                                </p>
                            )}

                            <button
                                type="submit"
                                disabled={loading || !email}
                                className="w-full py-3 bg-gradient-to-r from-purple-600 to-purple-700 hover:from-purple-700 hover:to-purple-800 disabled:opacity-50 disabled:cursor-not-allowed text-white rounded-xl font-medium transition-all flex items-center justify-center gap-2"
                            >
                                {loading ? (
                                    <><Loader2 size={16} className="animate-spin" /> Sending...</>
                                ) : (
                                    "Send Reset Link"
                                )}
                            </button>
                        </form>

                        <div className="mt-6 text-center">
                            <Link
                                href="/login"
                                className="text-gray-400 hover:text-white text-sm transition-colors flex items-center justify-center gap-2"
                            >
                                <ArrowLeft size={14} /> Back to Sign In
                            </Link>
                        </div>
                    </div>
                )}
            </motion.div>
        </div>
    );
}
