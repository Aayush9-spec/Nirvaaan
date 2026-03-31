"use client";

import { Activity, Lock, Mail, Loader2, Github, Eye, EyeOff, User, Check, X, ArrowLeft, Stethoscope, MapPin, Video } from "lucide-react";
import { useState, useMemo } from "react";
import { createClient } from "@/utils/supabase/client";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { motion } from "framer-motion";

function getPasswordStrength(password: string) {
    let score = 0;
    if (password.length >= 8) score++;
    if (/[A-Z]/.test(password)) score++;
    if (/[0-9]/.test(password)) score++;
    if (/[^A-Za-z0-9]/.test(password)) score++;
    if (password.length >= 12) score++;
    if (score <= 1) return { label: "Weak", color: "bg-red-500", width: "w-1/4", text: "text-red-400" };
    if (score <= 2) return { label: "Fair", color: "bg-orange-500", width: "w-2/4", text: "text-orange-400" };
    if (score <= 3) return { label: "Good", color: "bg-yellow-500", width: "w-3/4", text: "text-yellow-400" };
    return { label: "Strong", color: "bg-green-500", width: "w-full", text: "text-green-400" };
}

export default function SignupPage() {
    const [fullName, setFullName] = useState("");
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [confirmPassword, setConfirmPassword] = useState("");
    const [showPassword, setShowPassword] = useState(false);
    const [showConfirm, setShowConfirm] = useState(false);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [success, setSuccess] = useState(false);
    const [role, setRole] = useState<"patient" | "doctor">("patient");
    const [specialty, setSpecialty] = useState("");
    const [meetLink, setMeetLink] = useState("");
    const router = useRouter();
    const supabase = createClient();

    const strength = useMemo(() => getPasswordStrength(password), [password]);

    const requirements = useMemo(() => [
        { label: "At least 8 characters", met: password.length >= 8 },
        { label: "One uppercase letter", met: /[A-Z]/.test(password) },
        { label: "One number", met: /[0-9]/.test(password) },
        { label: "One special character", met: /[^A-Za-z0-9]/.test(password) },
    ], [password]);

    const passwordsMatch = confirmPassword.length > 0 && password === confirmPassword;
    const passwordsMismatch = confirmPassword.length > 0 && password !== confirmPassword;
    const allValid = requirements.every(r => r.met) && passwordsMatch && email.length > 0 && fullName.length > 0;

    const handleSignup = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!allValid) return;

        setLoading(true);
        setError(null);

        try {
            const metadata: Record<string, string> = {
                full_name: fullName,
                role,
            };
            if (role === "doctor") {
                metadata.specialty = specialty || "General Physician";
                metadata.meet_link = meetLink;
            }

            const { data, error } = await supabase.auth.signUp({
                email,
                password,
                options: {
                    data: metadata,
                },
            });

            if (error) {
                setError(error.message);
            } else if (data?.session) {
                // If a session is returned immediately (e.g., email confirmations are disabled), redirect to dashboard
                router.push("/dashboard");
                router.refresh();
            } else {
                setSuccess(true);
            }
        } catch (err: any) {
            setError(err.message || "An unexpected error occurred");
        } finally {
            setLoading(false);
        }
    };

    const handleOAuth = async (provider: "github" | "google") => {
        const supabase = createClient();
        await supabase.auth.signInWithOAuth({
            provider,
            options: {
                redirectTo: `${window.location.origin}/auth/callback`,
            },
        });
    };

    if (success) {
        return (
            <div className="min-h-screen bg-[#050505] flex flex-col items-center justify-center p-6 relative overflow-hidden">
                <div className="absolute inset-0 z-0 pointer-events-none">
                    <div className="absolute inset-0 bg-[linear-gradient(to_right,#ffffff05_1px,transparent_1px),linear-gradient(to_bottom,#ffffff05_1px,transparent_1px)] bg-[size:2rem_2rem]"></div>
                    <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] bg-green-600/20 blur-[120px] rounded-full"></div>
                </div>

                <motion.div
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ duration: 0.5 }}
                    className="w-full max-w-md bg-white/[0.02] border border-white/10 p-10 rounded-2xl relative z-10 backdrop-blur-xl text-center"
                >
                    <motion.div
                        initial={{ scale: 0 }}
                        animate={{ scale: 1 }}
                        transition={{ delay: 0.2, type: "spring", stiffness: 200 }}
                        className="w-20 h-20 bg-green-500/10 border border-green-500/20 rounded-full flex items-center justify-center mx-auto mb-6"
                    >
                        <Check className="text-green-400" size={36} />
                    </motion.div>

                    <h2 className="text-2xl font-bold text-white mb-3">Check Your Email</h2>
                    <p className="text-gray-400 text-sm mb-2">
                        We&apos;ve sent a confirmation link to
                    </p>
                    <p className="text-purple-400 font-medium mb-6">{email}</p>
                    <p className="text-gray-500 text-xs mb-8">
                        Click the link in your email to verify your account and start using NIRVAAAN.
                        The link will expire in 24 hours.
                    </p>

                    <div className="space-y-3">
                        <Link
                            href="/login"
                            className="block w-full py-3 bg-purple-600 hover:bg-purple-700 text-white rounded-xl font-medium transition-all text-center"
                        >
                            Go to Login
                        </Link>
                        <button
                            onClick={() => { setSuccess(false); setError(null); }}
                            className="w-full py-3 bg-white/5 hover:bg-white/10 border border-white/10 text-gray-300 rounded-xl font-medium transition-all text-sm"
                        >
                            Resend or try another email
                        </button>
                    </div>
                </motion.div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-[#050505] flex flex-col items-center justify-center p-6 relative overflow-hidden">
            {/* Background */}
            <div className="absolute inset-0 z-0 pointer-events-none">
                <div className="absolute inset-0 bg-[linear-gradient(to_right,#ffffff05_1px,transparent_1px),linear-gradient(to_bottom,#ffffff05_1px,transparent_1px)] bg-[size:2rem_2rem]"></div>
                <div className="absolute top-1/3 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-purple-600/15 blur-[120px] rounded-full"></div>
                <div className="absolute bottom-0 right-0 w-[400px] h-[400px] bg-blue-600/10 blur-[100px] rounded-full"></div>
            </div>

            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5 }}
                className="w-full max-w-md relative z-10"
            >
                {/* Back to Home */}
                <Link
                    href="/"
                    className="inline-flex items-center gap-2 text-gray-500 hover:text-gray-300 text-sm mb-6 transition-colors"
                >
                    <ArrowLeft size={16} /> Back to Home
                </Link>

                <div className="bg-white/[0.02] border border-white/10 p-8 rounded-2xl backdrop-blur-xl">
                    {/* Logo */}
                    <div className="flex justify-center mb-6">
                        <div className="flex items-center gap-3">
                            <Activity className="text-purple-500" size={32} />
                            <span className="font-bold text-2xl text-white">NIRVAAAN</span>
                        </div>
                    </div>

                    <h2 className="text-xl font-semibold text-center text-white mb-1">Create Your Account</h2>
                    <p className="text-gray-400 text-center text-sm mb-6">Join the future of healthcare intelligence</p>

                    {/* OAuth Buttons */}
                    <div className="grid grid-cols-2 gap-3 mb-6">
                        <motion.button
                            whileHover={{ scale: 1.02 }}
                            whileTap={{ scale: 0.98 }}
                            type="button"
                            onClick={() => handleOAuth("github")}
                            className="py-2.5 bg-white/5 hover:bg-white/10 border border-white/10 rounded-xl text-sm font-medium transition-colors flex items-center justify-center gap-2 text-gray-300"
                        >
                            <Github size={18} /> GitHub
                        </motion.button>
                        <motion.button
                            whileHover={{ scale: 1.02 }}
                            whileTap={{ scale: 0.98 }}
                            type="button"
                            onClick={() => handleOAuth("google")}
                            className="py-2.5 bg-white/5 hover:bg-white/10 border border-white/10 rounded-xl text-sm font-medium transition-colors flex items-center justify-center gap-2 text-gray-300"
                        >
                            <svg viewBox="0 0 24 24" width="18" height="18" fill="currentColor"><path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 01-2.2 3.32v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.1z" fill="#4285F4" /><path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853" /><path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05" /><path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335" /></svg>
                            Google
                        </motion.button>
                    </div>

                    {/* Divider */}
                    <div className="relative mb-6">
                        <div className="absolute inset-0 flex items-center">
                            <span className="w-full border-t border-white/10" />
                        </div>
                        <div className="relative flex justify-center text-xs uppercase">
                            <span className="bg-[#070707] px-3 text-gray-500">or sign up with email</span>
                        </div>
                    </div>

                    <form onSubmit={handleSignup} className="space-y-4">
                        {/* Full Name */}
                        <motion.div
                            initial={{ opacity: 0, x: -10 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ delay: 0.1 }}
                            className="space-y-1.5"
                        >
                            <label className="text-sm text-gray-400 ml-1">Full Name</label>
                            <div className="relative">
                                <User className="absolute left-3 top-3 text-gray-500" size={18} />
                                <input
                                    type="text"
                                    required
                                    value={fullName}
                                    onChange={(e) => setFullName(e.target.value)}
                                    className="w-full bg-black/40 border border-white/10 rounded-xl py-2.5 pl-10 pr-4 text-white placeholder-gray-600 focus:outline-none focus:border-purple-500/50 transition-colors"
                                    placeholder="Dr. Jane Smith"
                                />
                            </div>
                        </motion.div>

                        {/* Role Selector */}
                        <motion.div
                            initial={{ opacity: 0, x: -10 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ delay: 0.12 }}
                            className="space-y-1.5"
                        >
                            <label className="text-sm text-gray-400 ml-1">I am a</label>
                            <div className="grid grid-cols-2 gap-3">
                                <button
                                    type="button"
                                    onClick={() => setRole("patient")}
                                    className={`py-2.5 rounded-xl border text-sm font-medium transition-all flex items-center justify-center gap-2 ${role === "patient"
                                            ? "bg-purple-600/20 border-purple-500/40 text-purple-300"
                                            : "bg-black/40 border-white/10 text-gray-400 hover:bg-white/5"
                                        }`}
                                >
                                    <User size={16} /> Patient
                                </button>
                                <button
                                    type="button"
                                    onClick={() => setRole("doctor")}
                                    className={`py-2.5 rounded-xl border text-sm font-medium transition-all flex items-center justify-center gap-2 ${role === "doctor"
                                            ? "bg-blue-600/20 border-blue-500/40 text-blue-300"
                                            : "bg-black/40 border-white/10 text-gray-400 hover:bg-white/5"
                                        }`}
                                >
                                    <Stethoscope size={16} /> Doctor
                                </button>
                            </div>
                        </motion.div>

                        {/* Doctor-specific fields */}
                        {role === "doctor" && (
                            <motion.div
                                initial={{ opacity: 0, height: 0 }}
                                animate={{ opacity: 1, height: "auto" }}
                                exit={{ opacity: 0, height: 0 }}
                                className="space-y-4"
                            >
                                <div className="space-y-1.5">
                                    <label className="text-sm text-gray-400 ml-1">Specialty</label>
                                    <div className="relative">
                                        <Stethoscope className="absolute left-3 top-3 text-gray-500" size={18} />
                                        <input
                                            type="text"
                                            value={specialty}
                                            onChange={(e) => setSpecialty(e.target.value)}
                                            className="w-full bg-black/40 border border-white/10 rounded-xl py-2.5 pl-10 pr-4 text-white placeholder-gray-600 focus:outline-none focus:border-blue-500/50 transition-colors"
                                            placeholder="e.g. Cardiologist, Dermatologist"
                                        />
                                    </div>
                                </div>
                                <div className="space-y-1.5">
                                    <label className="text-sm text-gray-400 ml-1">Meet / Video Call Link <span className="text-gray-600">(optional)</span></label>
                                    <div className="relative">
                                        <Video className="absolute left-3 top-3 text-gray-500" size={18} />
                                        <input
                                            type="url"
                                            value={meetLink}
                                            onChange={(e) => setMeetLink(e.target.value)}
                                            className="w-full bg-black/40 border border-white/10 rounded-xl py-2.5 pl-10 pr-4 text-white placeholder-gray-600 focus:outline-none focus:border-blue-500/50 transition-colors"
                                            placeholder="https://meet.google.com/..."
                                        />
                                    </div>
                                </div>
                            </motion.div>
                        )}

                        {/* Email */}
                        <motion.div
                            initial={{ opacity: 0, x: -10 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ delay: 0.15 }}
                            className="space-y-1.5"
                        >
                            <label className="text-sm text-gray-400 ml-1">Email Address</label>
                            <div className="relative">
                                <Mail className="absolute left-3 top-3 text-gray-500" size={18} />
                                <input
                                    type="email"
                                    required
                                    value={email}
                                    onChange={(e) => setEmail(e.target.value)}
                                    className="w-full bg-black/40 border border-white/10 rounded-xl py-2.5 pl-10 pr-4 text-white placeholder-gray-600 focus:outline-none focus:border-purple-500/50 transition-colors"
                                    placeholder="doctor@nirvaaan.protocol"
                                />
                            </div>
                        </motion.div>

                        {/* Password */}
                        <motion.div
                            initial={{ opacity: 0, x: -10 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ delay: 0.2 }}
                            className="space-y-1.5"
                        >
                            <label className="text-sm text-gray-400 ml-1">Password</label>
                            <div className="relative">
                                <Lock className="absolute left-3 top-3 text-gray-500" size={18} />
                                <input
                                    type={showPassword ? "text" : "password"}
                                    required
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                    className="w-full bg-black/40 border border-white/10 rounded-xl py-2.5 pl-10 pr-12 text-white placeholder-gray-600 focus:outline-none focus:border-purple-500/50 transition-colors"
                                    placeholder="••••••••"
                                />
                                <button
                                    type="button"
                                    onClick={() => setShowPassword(!showPassword)}
                                    className="absolute right-3 top-3 text-gray-500 hover:text-gray-300 transition-colors"
                                >
                                    {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                                </button>
                            </div>

                            {/* Strength Bar */}
                            {password.length > 0 && (
                                <motion.div
                                    initial={{ opacity: 0, height: 0 }}
                                    animate={{ opacity: 1, height: "auto" }}
                                    className="space-y-2 pt-1"
                                >
                                    <div className="flex items-center justify-between">
                                        <div className="h-1.5 flex-1 bg-white/5 rounded-full overflow-hidden mr-3">
                                            <motion.div
                                                className={`h-full ${strength.color} rounded-full`}
                                                initial={{ width: 0 }}
                                                animate={{ width: strength.width === "w-1/4" ? "25%" : strength.width === "w-2/4" ? "50%" : strength.width === "w-3/4" ? "75%" : "100%" }}
                                                transition={{ duration: 0.3 }}
                                            />
                                        </div>
                                        <span className={`text-xs font-medium ${strength.text}`}>{strength.label}</span>
                                    </div>

                                    {/* Requirements */}
                                    <div className="grid grid-cols-2 gap-1">
                                        {requirements.map((req, i) => (
                                            <div key={i} className="flex items-center gap-1.5 text-xs">
                                                {req.met ? (
                                                    <Check size={12} className="text-green-400 flex-shrink-0" />
                                                ) : (
                                                    <X size={12} className="text-gray-600 flex-shrink-0" />
                                                )}
                                                <span className={req.met ? "text-green-400" : "text-gray-500"}>{req.label}</span>
                                            </div>
                                        ))}
                                    </div>
                                </motion.div>
                            )}
                        </motion.div>

                        {/* Confirm Password */}
                        <motion.div
                            initial={{ opacity: 0, x: -10 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ delay: 0.25 }}
                            className="space-y-1.5"
                        >
                            <label className="text-sm text-gray-400 ml-1">Confirm Password</label>
                            <div className="relative">
                                <Lock className="absolute left-3 top-3 text-gray-500" size={18} />
                                <input
                                    type={showConfirm ? "text" : "password"}
                                    required
                                    value={confirmPassword}
                                    onChange={(e) => setConfirmPassword(e.target.value)}
                                    className={`w-full bg-black/40 border rounded-xl py-2.5 pl-10 pr-12 text-white placeholder-gray-600 focus:outline-none transition-colors ${passwordsMismatch
                                        ? "border-red-500/50 focus:border-red-500/50"
                                        : passwordsMatch
                                            ? "border-green-500/30 focus:border-green-500/50"
                                            : "border-white/10 focus:border-purple-500/50"
                                        }`}
                                    placeholder="••••••••"
                                />
                                <button
                                    type="button"
                                    onClick={() => setShowConfirm(!showConfirm)}
                                    className="absolute right-3 top-3 text-gray-500 hover:text-gray-300 transition-colors"
                                >
                                    {showConfirm ? <EyeOff size={18} /> : <Eye size={18} />}
                                </button>
                            </div>
                            {passwordsMismatch && (
                                <p className="text-xs text-red-400 ml-1">Passwords do not match</p>
                            )}
                            {passwordsMatch && (
                                <p className="text-xs text-green-400 ml-1 flex items-center gap-1">
                                    <Check size={12} /> Passwords match
                                </p>
                            )}
                        </motion.div>

                        {/* Error */}
                        {error && (
                            <motion.div
                                initial={{ opacity: 0, y: -5 }}
                                animate={{ opacity: 1, y: 0 }}
                                className="p-3 bg-red-500/10 border border-red-500/20 rounded-xl text-sm text-red-400"
                            >
                                {error}
                            </motion.div>
                        )}

                        {/* Submit */}
                        <motion.button
                            whileHover={{ scale: 1.01 }}
                            whileTap={{ scale: 0.99 }}
                            type="submit"
                            disabled={loading || !allValid}
                            className="w-full py-3 bg-gradient-to-r from-purple-600 to-purple-700 hover:from-purple-700 hover:to-purple-800 disabled:opacity-40 disabled:cursor-not-allowed text-white rounded-xl font-medium transition-all shadow-lg shadow-purple-900/20 flex items-center justify-center gap-2"
                        >
                            {loading ? <Loader2 size={18} className="animate-spin" /> : "Create Account"}
                        </motion.button>
                    </form>

                    {/* Footer */}
                    <p className="mt-6 text-center text-sm text-gray-500">
                        Already have an account?{" "}
                        <Link href="/login" className="text-purple-400 hover:text-purple-300 font-medium transition-colors">
                            Sign in
                        </Link>
                    </p>
                </div>

                {/* Terms */}
                <p className="mt-4 text-center text-xs text-gray-600 leading-relaxed">
                    By creating an account, you agree to our{" "}
                    <span className="text-gray-500 hover:text-gray-400 cursor-pointer">Terms of Service</span>{" "}
                    and{" "}
                    <span className="text-gray-500 hover:text-gray-400 cursor-pointer">Privacy Policy</span>
                </p>
            </motion.div>
        </div>
    );
}
