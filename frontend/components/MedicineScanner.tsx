"use client";

import { useState, useRef } from "react";
import { Upload, Camera, Loader2, AlertCircle, CheckCircle, Pill, FileText, X } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { analyzeMedicineImage } from "@/app/actions/analyze-medicine";
import Image from "next/image";

interface MedicineAnalysis {
    name: string;
    generic_name: string;
    purpose: string;
    dosage: string;
    warnings: string[];
    side_effects: string[];
}

export default function MedicineScanner() {
    const [imagePreview, setImagePreview] = useState<string | null>(null);
    const [analyzing, setAnalyzing] = useState(false);
    const [result, setResult] = useState<MedicineAnalysis | null>(null);
    const [error, setError] = useState<string | null>(null);
    const fileInputRef = useRef<HTMLInputElement>(null);

    const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            const reader = new FileReader();
            reader.onloadend = () => {
                setImagePreview(reader.result as string);
                setResult(null);
                setError(null);
            };
            reader.readAsDataURL(file);
        }
    };

    const handleAnalyze = async () => {
        if (!fileInputRef.current?.files?.[0]) return;

        setAnalyzing(true);
        setError(null);

        const formData = new FormData();
        formData.append("image", fileInputRef.current.files[0]);

        try {
            const response = await analyzeMedicineImage(formData);
            if (response.error) {
                setError(response.error);
            } else {
                setResult(response.result);
            }
        } catch (err) {
            setError("Failed to connect to the server.");
        } finally {
            setAnalyzing(false);
        }
    };

    const handleReset = () => {
        setImagePreview(null);
        setResult(null);
        setError(null);
        if (fileInputRef.current) fileInputRef.current.value = "";
    };

    return (
        <div className="max-w-4xl mx-auto space-y-8">
            <div className="text-center space-y-2">
                <h1 className="text-3xl font-bold bg-gradient-to-r from-blue-400 to-purple-500 bg-clip-text text-transparent">
                    AI Medicine Scanner
                </h1>
                <p className="text-gray-400">
                    Upload a photo of any medicine strip or bottle to instantly identify it.
                </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                {/* ─── Input Section ─── */}
                <div className="space-y-6">
                    <div
                        className={`relative aspect-square rounded-3xl border-2 border-dashed transition-all overflow-hidden bg-white/5 flex flex-col items-center justify-center cursor-pointer group ${imagePreview ? "border-purple-500/50" : "border-gray-700 hover:border-gray-500 hover:bg-white/10"
                            }`}
                        onClick={() => !imagePreview && fileInputRef.current?.click()}
                    >
                        <input
                            type="file"
                            accept="image/*"
                            capture="environment"
                            className="hidden"
                            ref={fileInputRef}
                            onChange={handleFileSelect}
                        />

                        {imagePreview ? (
                            <>
                                <Image
                                    src={imagePreview}
                                    alt="Preview"
                                    fill
                                    sizes="(max-width: 768px) 100vw, 50vw"
                                    className="object-cover opacity-80"
                                />
                                <button
                                    onClick={(e) => {
                                        e.stopPropagation();
                                        handleReset();
                                    }}
                                    className="absolute top-4 right-4 p-2 bg-black/50 hover:bg-red-500/80 text-white rounded-full backdrop-blur-sm transition-colors"
                                >
                                    <X size={20} />
                                </button>
                            </>
                        ) : (
                            <div className="text-center space-y-4 p-6">
                                <div className="w-16 h-16 rounded-full bg-purple-500/10 flex items-center justify-center mx-auto text-purple-400 group-hover:scale-110 transition-transform">
                                    <Camera size={32} />
                                </div>
                                <div>
                                    <p className="font-medium text-lg">Tap to Capture</p>
                                    <p className="text-sm text-gray-500">or upload from gallery</p>
                                </div>
                            </div>
                        )}
                    </div>

                    <button
                        onClick={handleAnalyze}
                        disabled={!imagePreview || analyzing}
                        className="w-full py-4 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 disabled:opacity-50 disabled:cursor-not-allowed text-white rounded-xl font-bold text-lg shadow-lg shadow-purple-900/20 transition-all flex items-center justify-center gap-2"
                    >
                        {analyzing ? (
                            <>
                                <Loader2 className="animate-spin" size={20} /> Analyzing...
                            </>
                        ) : (
                            <>
                                <Upload size={20} /> Identify Medicine
                            </>
                        )}
                    </button>
                </div>

                {/* ─── Result Section ─── */}
                <div className="relative min-h-[400px]">
                    <AnimatePresence mode="wait">
                        {analyzing ? (
                            <motion.div
                                key="loading"
                                initial={{ opacity: 0 }}
                                animate={{ opacity: 1 }}
                                exit={{ opacity: 0 }}
                                className="absolute inset-0 flex flex-col items-center justify-center text-center space-y-4 rounded-3xl border border-white/10 bg-white/5 backdrop-blur-sm"
                            >
                                <div className="relative w-20 h-20">
                                    <div className="absolute inset-0 border-4 border-purple-500/20 rounded-full"></div>
                                    <div className="absolute inset-0 border-4 border-t-purple-500 rounded-full animate-spin"></div>
                                    <Pill className="absolute inset-0 m-auto text-purple-400 animate-pulse" size={32} />
                                </div>
                                <p className="text-lg font-medium animate-pulse">Scanning formulation...</p>
                            </motion.div>
                        ) : result ? (
                            <motion.div
                                key="result"
                                initial={{ opacity: 0, x: 20 }}
                                animate={{ opacity: 1, x: 0 }}
                                className="space-y-6"
                            >
                                <div className="p-6 rounded-3xl bg-gradient-to-br from-green-500/10 to-emerald-500/5 border border-green-500/20">
                                    <div className="flex items-start justify-between mb-4">
                                        <div>
                                            <h2 className="text-2xl font-bold text-white">{result.name}</h2>
                                            <p className="text-green-400 font-mono text-sm">{result.generic_name}</p>
                                        </div>
                                        <div className="p-2 bg-green-500/20 text-green-400 rounded-full">
                                            <CheckCircle size={24} />
                                        </div>
                                    </div>

                                    <div className="space-y-4">
                                        <div className="bg-black/20 p-4 rounded-xl">
                                            <h3 className="text-sm font-semibold text-gray-400 mb-1 flex items-center gap-2">
                                                <Pill size={14} /> Usage
                                            </h3>
                                            <p className="text-gray-200">{result.purpose}</p>
                                        </div>

                                        <div className="grid grid-cols-2 gap-4">
                                            <div className="bg-black/20 p-4 rounded-xl">
                                                <h3 className="text-sm font-semibold text-gray-400 mb-1 flex items-center gap-2">
                                                    <FileText size={14} /> Dosage
                                                </h3>
                                                <p className="text-gray-200 text-sm">{result.dosage}</p>
                                            </div>
                                            <div className="bg-black/20 p-4 rounded-xl border border-red-500/20 bg-red-500/5">
                                                <h3 className="text-sm font-semibold text-red-400 mb-1 flex items-center gap-2">
                                                    <AlertCircle size={14} /> Warnings
                                                </h3>
                                                <ul className="text-red-200 text-xs space-y-1 list-disc list-inside">
                                                    {result.warnings.slice(0, 2).map((w, i) => (
                                                        <li key={i}>{w}</li>
                                                    ))}
                                                </ul>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </motion.div>
                        ) : error ? (
                            <motion.div
                                key="error"
                                initial={{ opacity: 0 }}
                                animate={{ opacity: 1 }}
                                className="h-full flex flex-col items-center justify-center text-center p-8 rounded-3xl border border-red-500/20 bg-red-500/5"
                            >
                                <AlertCircle size={48} className="text-red-500 mb-4" />
                                <h3 className="text-xl font-bold text-red-400">Scan Failed</h3>
                                <p className="text-gray-400 mt-2">{error}</p>
                            </motion.div>
                        ) : (
                            <div className="h-full flex flex-col items-center justify-center text-center p-8 rounded-3xl border border-white/5 bg-white/[0.02] text-gray-500">
                                <Image
                                    src="/scan-placeholder.png" // Placeholder, might not exist but browser handles nicely usually or shows alt
                                    width={200}
                                    height={200}
                                    alt="Scan illustration"
                                    className="opacity-20 mb-6 grayscale"
                                />
                                <p className="text-lg font-medium">Ready to Scan</p>
                                <p className="text-sm max-w-xs mx-auto mt-2">
                                    Upload a clear image of the medicine name or composition details.
                                </p>
                            </div>
                        )}
                    </AnimatePresence>
                </div>
            </div>
        </div>
    );
}
