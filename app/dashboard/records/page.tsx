"use client";

import { FileText, ShoppingBag, Truck, Scan, Pill, MapPin, Upload, CheckCircle, X, Loader2, Download } from "lucide-react";
import { useState, useRef, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import Link from "next/link";
import {
    getMedicalRecords,
    updateRecordStatus,
    getCurrentUserId,
    type MedicalRecord,
} from "@/lib/supabase-helpers";
import { uploadMedicalDocument, getUserDocuments, getDocumentUrl } from "@/lib/supabase-storage";

export default function MedicalRecordsPage() {
    const [activeTab, setActiveTab] = useState("prescriptions");
    const [isScanning, setIsScanning] = useState(false);
    const [scanResult, setScanResult] = useState<string | null>(null);
    const [scanLoading, setScanLoading] = useState(false);
    const [orderStatuses, setOrderStatuses] = useState<Record<string, string>>({});
    const [records, setRecords] = useState<MedicalRecord[]>([]);
    const [loading, setLoading] = useState(true);
    const [docs, setDocs] = useState<{ name: string; path: string; size: number; created: string }[]>([]);
    const [docUploading, setDocUploading] = useState(false);
    const fileInputRef = useRef<HTMLInputElement>(null);
    const docInputRef = useRef<HTMLInputElement>(null);

    useEffect(() => {
        async function loadRecords() {
            const userId = await getCurrentUserId();
            if (!userId) {
                setLoading(false);
                return;
            }
            const [data, userDocs] = await Promise.all([
                getMedicalRecords(userId),
                getUserDocuments(userId),
            ]);
            setRecords(data);
            setDocs(userDocs);
            setLoading(false);
        }
        loadRecords();
    }, []);

    const handleScanUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;

        setScanLoading(true);
        setScanResult(null);

        try {
            // Convert file to base64 data URI
            const reader = new FileReader();
            const base64Promise = new Promise<string>((resolve, reject) => {
                reader.onload = () => resolve(reader.result as string);
                reader.onerror = reject;
            });
            reader.readAsDataURL(file);
            const base64Image = await base64Promise;

            // Send to OpenAI Vision via our API route
            const response = await fetch("/api/scan", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ image: base64Image }),
            });

            const data = await response.json();

            if (data.error) {
                setScanResult(`❌ Error: ${data.error}`);
            } else {
                setScanResult(data.result);
            }
        } catch (err: any) {
            setScanResult(`❌ Analysis failed: ${err?.message || "Unknown error"}`);
        }

        setScanLoading(false);
    };

    const handleOrderMedicines = async (recordId: string) => {
        setOrderStatuses((prev) => ({ ...prev, [recordId]: "processing" }));
        const success = await updateRecordStatus(recordId, "Ordered");
        if (success) {
            setTimeout(() => {
                setOrderStatuses((prev) => ({ ...prev, [recordId]: "ordered" }));
            }, 1000);
        } else {
            setOrderStatuses((prev) => ({ ...prev, [recordId]: "" }));
        }
    };

    const formatDate = (dateStr: string) => {
        const date = new Date(dateStr + "T00:00:00");
        return date.toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" });
    };

    const pendingRecords = records.filter((r) => r.status === "Pending Order" || r.status === "Ordered");
    const archivedRecords = records.filter((r) => r.status === "Archived" || r.status === "Delivered");

    if (loading) {
        return (
            <div className="flex items-center justify-center min-h-[400px]">
                <Loader2 className="animate-spin text-purple-500" size={32} />
            </div>
        );
    }

    return (
        <div className="space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                    <h1 className="text-2xl font-bold mb-1">Medical Records & Pharmacy</h1>
                    <p className="text-gray-400 text-sm">Manage prescriptions, orders, and history</p>
                </div>

                {/* Camera/Scan Feature */}
                <button
                    onClick={() => {
                        setIsScanning(!isScanning);
                        setScanResult(null);
                    }}
                    className="flex items-center gap-2 px-4 py-2 bg-white/5 hover:bg-white/10 border border-white/10 rounded-lg text-sm transition-colors self-start sm:self-auto"
                >
                    <Scan size={18} className="text-purple-400" />
                    {isScanning ? "Close Scanner" : "Scan Medicine"}
                </button>
            </div>

            {/* Tabs */}
            <div className="flex gap-6 border-b border-white/10 text-sm font-medium">
                {["Prescriptions", "Orders", "History"].map((tab) => (
                    <button
                        key={tab}
                        onClick={() => setActiveTab(tab.toLowerCase())}
                        className={`pb-3 transition-colors capitalize ${activeTab === tab.toLowerCase()
                            ? "text-purple-400 border-b-2 border-purple-400"
                            : "text-gray-400 hover:text-white"
                            }`}
                    >
                        {tab}
                    </button>
                ))}
            </div>

            {/* Main Content */}
            <div className="grid gap-6">
                {activeTab === "prescriptions" && (
                    <>
                        {/* Scan UI with file upload */}
                        <AnimatePresence>
                            {isScanning && (
                                <motion.div
                                    initial={{ opacity: 0, height: 0 }}
                                    animate={{ opacity: 1, height: "auto" }}
                                    exit={{ opacity: 0, height: 0 }}
                                    className="bg-black/40 border border-purple-500/30 rounded-xl p-6 relative overflow-hidden"
                                >
                                    <input
                                        ref={fileInputRef}
                                        type="file"
                                        accept="image/*"
                                        capture="environment"
                                        onChange={handleScanUpload}
                                        className="hidden"
                                    />

                                    {scanResult ? (
                                        <div className="space-y-4">
                                            <div className="flex items-center justify-between">
                                                <h3 className="font-semibold text-green-400 flex items-center gap-2">
                                                    <CheckCircle size={18} /> AI Analysis Complete
                                                </h3>
                                                <button onClick={() => setScanResult(null)} className="text-gray-500 hover:text-white">
                                                    <X size={16} />
                                                </button>
                                            </div>
                                            <pre className="text-sm text-gray-300 whitespace-pre-wrap bg-white/5 p-4 rounded-lg">{scanResult}</pre>
                                        </div>
                                    ) : scanLoading ? (
                                        <div className="flex flex-col items-center justify-center py-8">
                                            <Loader2 size={32} className="text-purple-400 animate-spin mb-4" />
                                            <p className="text-sm font-medium">Analyzing medicine image...</p>
                                            <p className="text-xs text-gray-500 mt-1">Verifying composition and authenticity</p>
                                        </div>
                                    ) : (
                                        <button
                                            onClick={() => fileInputRef.current?.click()}
                                            className="w-full flex flex-col items-center justify-center py-8 border-2 border-dashed border-purple-500/30 rounded-lg hover:border-purple-500/60 transition-colors cursor-pointer"
                                        >
                                            <Upload size={32} className="text-purple-400 mb-4" />
                                            <p className="text-sm font-medium">Upload or Capture Medicine Image</p>
                                            <p className="text-xs text-gray-500 mt-1">Our AI will verify the composition</p>
                                        </button>
                                    )}
                                </motion.div>
                            )}
                        </AnimatePresence>

                        {pendingRecords.length > 0 ? (
                            pendingRecords.map((rec) => (
                                <div key={rec.id} className="bg-white/[0.02] border border-white/10 rounded-xl p-6 group">
                                    <div className="flex flex-col sm:flex-row justify-between items-start gap-4 mb-6">
                                        <div className="flex gap-4">
                                            <div className="w-12 h-12 rounded-lg bg-blue-500/10 flex items-center justify-center text-blue-400">
                                                <FileText size={24} />
                                            </div>
                                            <div>
                                                <h3 className="font-semibold text-lg">{rec.diagnosis || "Medical Record"}</h3>
                                                <p className="text-gray-400 text-sm">Prescribed by {rec.doctor?.name || "Doctor"}</p>
                                                <p className="text-xs text-gray-500 mt-1">{formatDate(rec.date)} • {rec.record_number || rec.id.slice(0, 8)}</p>
                                            </div>
                                        </div>
                                        <div className={`px-3 py-1 rounded-full text-xs font-medium border ${orderStatuses[rec.id] === "ordered" || rec.status === "Ordered"
                                            ? "bg-green-500/10 text-green-400 border-green-500/20"
                                            : "bg-yellow-500/10 text-yellow-500 border-yellow-500/20"
                                            }`}>
                                            {orderStatuses[rec.id] === "ordered" || rec.status === "Ordered" ? "Ordered ✓" : rec.status}
                                        </div>
                                    </div>

                                    {/* Medicines List */}
                                    {rec.record_items && rec.record_items.length > 0 && (
                                        <div className="space-y-3 mb-6">
                                            {rec.record_items.map((item) => (
                                                <div key={item.id} className="flex justify-between items-center p-3 bg-white/5 rounded-lg">
                                                    <div className="flex items-center gap-3">
                                                        <Pill size={16} className="text-gray-400" />
                                                        <div>
                                                            <div className="text-sm font-medium">{item.name}</div>
                                                            <div className="text-xs text-gray-500">{item.dosage}</div>
                                                        </div>
                                                    </div>
                                                    <div className="font-mono text-sm text-gray-300">{item.price} ETH</div>
                                                </div>
                                            ))}
                                        </div>
                                    )}

                                    {/* Action: Order Online */}
                                    {rec.status === "Pending Order" && !orderStatuses[rec.id] && (
                                        <div className="flex flex-col sm:flex-row gap-4 pt-4 border-t border-white/5">
                                            <button
                                                onClick={() => handleOrderMedicines(rec.id)}
                                                className="flex-1 py-2.5 bg-purple-600 hover:bg-purple-700 rounded-lg text-sm font-medium text-white flex items-center justify-center gap-2 transition-colors"
                                            >
                                                <ShoppingBag size={18} /> Order Medicines
                                            </button>
                                            <Link
                                                href="/dashboard/diagnostics"
                                                className="px-6 py-2.5 bg-white/5 hover:bg-white/10 rounded-lg text-sm font-medium text-gray-300 border border-white/10 text-center"
                                            >
                                                View Diagnostics
                                            </Link>
                                        </div>
                                    )}

                                    {orderStatuses[rec.id] === "processing" && (
                                        <div className="flex items-center justify-center gap-2 pt-4 border-t border-white/5 text-purple-400">
                                            <Loader2 size={16} className="animate-spin" />
                                            <span className="text-sm">Processing order...</span>
                                        </div>
                                    )}
                                </div>
                            ))
                        ) : (
                            <div className="text-gray-500 text-center py-20">No prescriptions found. They will appear here when a doctor writes one for you.</div>
                        )}
                    </>
                )}

                {activeTab === "orders" && (
                    records.filter((r) => r.status === "Ordered").length > 0 ? (
                        records.filter((r) => r.status === "Ordered").map((rec) => (
                            <div key={rec.id} className="bg-white/[0.02] border border-white/10 rounded-xl p-6">
                                <div className="flex gap-4 items-center mb-6">
                                    <div className="w-10 h-10 rounded-full bg-green-500/10 flex items-center justify-center text-green-400">
                                        <Truck size={20} />
                                    </div>
                                    <div>
                                        <h3 className="font-medium">Order #{rec.record_number || rec.id.slice(0, 8)}</h3>
                                        <p className="text-xs text-gray-500">{rec.diagnosis} • {formatDate(rec.date)}</p>
                                    </div>
                                </div>

                                {/* Track */}
                                <div className="h-32 w-full bg-white/5 rounded-lg border border-white/10 flex items-center justify-center relative overflow-hidden">
                                    <div className="absolute inset-0 bg-[radial-gradient(circle_at_30%_50%,rgba(168,85,247,0.2),transparent_50%)]"></div>
                                    <div className="flex items-center gap-2 text-gray-400 text-sm">
                                        <MapPin size={16} className="text-purple-500 animate-bounce" />
                                        Tracking Live
                                    </div>
                                </div>
                            </div>
                        ))
                    ) : (
                        <div className="text-gray-500 text-center py-20">No active orders.</div>
                    )
                )}

                {activeTab === "history" && (
                    <>
                        {/* Document Upload */}
                        <div className="bg-white/[0.02] border border-dashed border-white/10 rounded-xl p-6">
                            <input
                                ref={docInputRef}
                                type="file"
                                accept=".pdf,.jpg,.jpeg,.png,.doc,.docx"
                                className="hidden"
                                onChange={async (e) => {
                                    const file = e.target.files?.[0];
                                    if (!file) return;
                                    setDocUploading(true);
                                    const userId = await getCurrentUserId();
                                    if (userId) {
                                        await uploadMedicalDocument(userId, file);
                                        const updated = await getUserDocuments(userId);
                                        setDocs(updated);
                                    }
                                    setDocUploading(false);
                                }}
                            />
                            <button
                                onClick={() => docInputRef.current?.click()}
                                disabled={docUploading}
                                className="w-full flex flex-col items-center justify-center py-6 cursor-pointer"
                            >
                                {docUploading ? (
                                    <Loader2 size={28} className="text-purple-400 animate-spin mb-2" />
                                ) : (
                                    <Upload size={28} className="text-purple-400 mb-2" />
                                )}
                                <p className="text-sm font-medium text-gray-300">Upload Medical Document</p>
                                <p className="text-xs text-gray-600 mt-1">PDF, images, or Word documents</p>
                            </button>
                        </div>

                        {/* Uploaded Documents */}
                        {docs.length > 0 && (
                            <div className="space-y-2">
                                <h3 className="text-sm font-medium text-gray-400 px-1">Uploaded Documents</h3>
                                {docs.map((doc) => (
                                    <div key={doc.path} className="bg-white/[0.02] border border-white/10 rounded-xl p-4 flex items-center justify-between">
                                        <div className="flex items-center gap-3">
                                            <div className="w-10 h-10 rounded-lg bg-purple-500/10 flex items-center justify-center text-purple-400">
                                                <FileText size={18} />
                                            </div>
                                            <div>
                                                <p className="text-sm font-medium text-gray-200 truncate max-w-[200px]">{doc.name}</p>
                                                <p className="text-xs text-gray-500">{doc.created ? new Date(doc.created).toLocaleDateString() : ""}</p>
                                            </div>
                                        </div>
                                        <button
                                            onClick={async () => {
                                                const url = await getDocumentUrl(doc.path);
                                                if (url) window.open(url, "_blank");
                                            }}
                                            className="p-2 hover:bg-white/10 rounded-lg text-gray-400 hover:text-white transition-colors"
                                            title="Download"
                                        >
                                            <Download size={16} />
                                        </button>
                                    </div>
                                ))}
                            </div>
                        )}

                        {/* Archived Records */}
                        {archivedRecords.length > 0 ? (
                            archivedRecords.map((rec) => (
                                <div key={rec.id} className="bg-white/[0.02] border border-white/10 rounded-xl p-6 opacity-70">
                                    <div className="flex gap-4">
                                        <div className="w-12 h-12 rounded-lg bg-gray-500/10 flex items-center justify-center text-gray-400">
                                            <FileText size={24} />
                                        </div>
                                        <div>
                                            <h3 className="font-semibold">{rec.diagnosis || "Medical Record"}</h3>
                                            <p className="text-gray-400 text-sm">By {rec.doctor?.name || "Doctor"}</p>
                                            <p className="text-xs text-gray-500 mt-1">{formatDate(rec.date)} • {rec.record_number || rec.id.slice(0, 8)}</p>
                                        </div>
                                    </div>
                                </div>
                            ))
                        ) : (
                            docs.length === 0 && <div className="text-gray-500 text-center py-10">No historical records found.</div>
                        )}
                    </>
                )}
            </div>
        </div>
    );
}
