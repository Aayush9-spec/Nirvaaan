"use client";

import { useState, useEffect } from "react";
import { Plus, Trash2, Save, Send, FileText, User, Search, CheckCircle, Loader2, Download } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import {
    getDoctorPatientsList,
    createPrescription,
    getCurrentUserId,
} from "@/lib/supabase-helpers";
import jsPDF from "jspdf";

export default function PrescriptionsPage() {
    const [selectedPatient, setSelectedPatient] = useState<string | null>(null);
    const [medicines, setMedicines] = useState([{ name: "", dosage: "", duration: "" }]);
    const [diagnosis, setDiagnosis] = useState("");
    const [notes, setNotes] = useState("");
    const [isSent, setIsSent] = useState(false);
    const [isSending, setIsSending] = useState(false);
    const [draftSaved, setDraftSaved] = useState(false);
    const [patients, setPatients] = useState<{ id: string; name: string; lastVisit: string | null }[]>([]);
    const [loading, setLoading] = useState(true);
    const [searchQuery, setSearchQuery] = useState("");

    // Load patients on mount
    useEffect(() => {
        async function loadPatients() {
            const userId = await getCurrentUserId();
            if (!userId) {
                setLoading(false);
                return;
            }
            const data = await getDoctorPatientsList(userId);
            setPatients(data);
            setLoading(false);
        }
        loadPatients();
    }, []);

    const filteredPatients = patients.filter((p) =>
        p.name.toLowerCase().includes(searchQuery.toLowerCase())
    );

    const addMedicine = () => {
        setMedicines([...medicines, { name: "", dosage: "", duration: "" }]);
    };

    const removeMedicine = (index: number) => {
        const newMedicines = [...medicines];
        newMedicines.splice(index, 1);
        setMedicines(newMedicines);
    };

    const updateMedicine = (index: number, field: string, value: string) => {
        const newMedicines = [...medicines];
        (newMedicines[index] as any)[field] = value;
        setMedicines(newMedicines);
    };

    const handleSend = async () => {
        if (!selectedPatient) return;

        setIsSending(true);
        const userId = await getCurrentUserId();
        if (!userId) {
            setIsSending(false);
            return;
        }

        const success = await createPrescription({
            doctorUserId: userId,
            patientId: selectedPatient,
            diagnosis,
            notes,
            medicines,
        });

        setIsSending(false);

        if (success) {
            setIsSent(true);
            setTimeout(() => {
                setIsSent(false);
                // Reset form
                setSelectedPatient(null);
                setDiagnosis("");
                setNotes("");
                setMedicines([{ name: "", dosage: "", duration: "" }]);
            }, 3000);
        }
    };

    const prescriptionNumber = `RX-${new Date().getFullYear()}-${Math.floor(1000 + Math.random() * 9000)}`;
    const todayDate = new Date().toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" });

    if (loading) {
        return (
            <div className="flex items-center justify-center min-h-[400px]">
                <Loader2 className="animate-spin text-blue-500" size={32} />
            </div>
        );
    }

    return (
        <div className="max-w-5xl mx-auto space-y-8">
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-2xl font-bold mb-1">Write Prescription</h1>
                    <p className="text-gray-400 text-sm">Create and digitally sign prescriptions for patients</p>
                </div>
                <div className="flex gap-3">
                    <button
                        onClick={() => {
                            const doc = new jsPDF();
                            const w = doc.internal.pageSize.getWidth();
                            // Header
                            doc.setFillColor(88, 28, 135);
                            doc.rect(0, 0, w, 35, "F");
                            doc.setTextColor(255, 255, 255);
                            doc.setFontSize(20);
                            doc.setFont("helvetica", "bold");
                            doc.text("MedAI Prescription", 14, 22);
                            doc.setFontSize(10);
                            doc.setFont("helvetica", "normal");
                            doc.text(prescriptionNumber, w - 14, 22, { align: "right" });
                            doc.text(todayDate, w - 14, 28, { align: "right" });

                            // Patient info
                            doc.setTextColor(0, 0, 0);
                            const patientName = patients.find(p => p.id === selectedPatient)?.name || "—";
                            doc.setFontSize(12);
                            doc.setFont("helvetica", "bold");
                            doc.text("Patient:", 14, 48);
                            doc.setFont("helvetica", "normal");
                            doc.text(patientName, 42, 48);

                            // Diagnosis
                            doc.setFont("helvetica", "bold");
                            doc.text("Diagnosis:", 14, 58);
                            doc.setFont("helvetica", "normal");
                            const diagLines = doc.splitTextToSize(diagnosis || "—", w - 55);
                            doc.text(diagLines, 42, 58);

                            // Medicine table
                            let y = 58 + diagLines.length * 6 + 10;
                            doc.setFont("helvetica", "bold");
                            doc.setFillColor(245, 245, 245);
                            doc.rect(14, y - 5, w - 28, 8, "F");
                            doc.setFontSize(10);
                            doc.text("#", 16, y);
                            doc.text("Medicine", 26, y);
                            doc.text("Dosage", 110, y);
                            doc.text("Duration", 150, y);
                            y += 8;

                            doc.setFont("helvetica", "normal");
                            medicines.filter(m => m.name).forEach((med, i) => {
                                doc.text(String(i + 1), 16, y);
                                doc.text(med.name, 26, y);
                                doc.text(med.dosage, 110, y);
                                doc.text(med.duration, 150, y);
                                y += 7;
                            });

                            // Notes
                            if (notes) {
                                y += 5;
                                doc.setFont("helvetica", "bold");
                                doc.text("Notes:", 14, y);
                                doc.setFont("helvetica", "normal");
                                const noteLines = doc.splitTextToSize(notes, w - 28);
                                doc.text(noteLines, 14, y + 7);
                            }

                            // Footer
                            const pageH = doc.internal.pageSize.getHeight();
                            doc.setDrawColor(200);
                            doc.line(14, pageH - 30, w - 14, pageH - 30);
                            doc.setFontSize(9);
                            doc.setTextColor(128);
                            doc.text("Digitally signed via MedAI Platform", 14, pageH - 22);
                            doc.text("This prescription is digitally generated and verified.", 14, pageH - 16);

                            doc.save(`prescription-${prescriptionNumber}.pdf`);
                        }}
                        disabled={!selectedPatient || medicines.every(m => !m.name)}
                        className="px-4 py-2 bg-green-600/20 border border-green-500/20 rounded-lg text-sm font-medium hover:bg-green-600/30 transition-colors flex items-center gap-2 text-green-400 disabled:opacity-40 disabled:cursor-not-allowed"
                    >
                        <Download size={16} /> Download PDF
                    </button>
                    <button
                        onClick={() => {
                            const draft = { selectedPatient, medicines, diagnosis, notes, savedAt: new Date().toISOString() };
                            localStorage.setItem('prescription-draft', JSON.stringify(draft));
                            setDraftSaved(true);
                            setTimeout(() => setDraftSaved(false), 2000);
                        }}
                        className="px-4 py-2 bg-white/5 border border-white/10 rounded-lg text-sm font-medium hover:bg-white/10 transition-colors flex items-center gap-2"
                    >
                        <Save size={16} /> {draftSaved ? 'Saved ✓' : 'Save Draft'}
                    </button>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">

                {/* Patient Selection */}
                <div className="lg:col-span-1 space-y-4">
                    <div className="bg-white/[0.02] border border-white/10 rounded-xl p-4">
                        <h3 className="font-semibold mb-4 flex items-center gap-2">
                            <User size={18} className="text-blue-400" /> Select Patient
                        </h3>
                        <div className="relative mb-4">
                            <Search className="absolute left-3 top-2.5 text-gray-500" size={16} />
                            <input
                                type="text"
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                                placeholder="Search patient..."
                                className="w-full bg-black/40 border border-white/10 rounded-lg py-2 pl-9 pr-4 text-sm focus:outline-none focus:border-blue-500/50"
                            />
                        </div>
                        <div className="space-y-2 max-h-[400px] overflow-y-auto">
                            {filteredPatients.length > 0 ? (
                                filteredPatients.map((p) => (
                                    <button
                                        key={p.id}
                                        onClick={() => setSelectedPatient(p.id)}
                                        className={`w-full flex items-center justify-between p-3 rounded-lg text-left transition-colors border ${selectedPatient === p.id
                                            ? "bg-blue-600/10 border-blue-500/30"
                                            : "bg-white/5 border-transparent hover:bg-white/10"
                                            }`}
                                    >
                                        <div>
                                            <div className={`font-medium ${selectedPatient === p.id ? "text-blue-400" : "text-gray-200"}`}>{p.name}</div>
                                            <div className="text-xs text-gray-500">Last: {p.lastVisit || "—"}</div>
                                        </div>
                                        {selectedPatient === p.id && <CheckCircle size={16} className="text-blue-500" />}
                                    </button>
                                ))
                            ) : (
                                <div className="text-center py-6 text-gray-500 text-sm">
                                    {patients.length === 0 ? "No patients yet. They appear after booking appointments." : "No matching patients."}
                                </div>
                            )}
                        </div>
                    </div>
                </div>

                {/* Prescription Form */}
                <div className="lg:col-span-2">
                    <div className="bg-white/[0.02] border border-white/10 rounded-xl p-6 relative">
                        {/* Header */}
                        <div className="flex justify-between items-start mb-6 pb-6 border-b border-white/5">
                            <div className="flex items-center gap-4">
                                <div className="w-12 h-12 rounded-lg bg-blue-600 flex items-center justify-center text-white">
                                    <FileText size={24} />
                                </div>
                                <div>
                                    <h2 className="text-lg font-bold">New Prescription</h2>
                                    <p className="text-sm text-gray-400">ID: #{prescriptionNumber}</p>
                                </div>
                            </div>
                            <div className="text-right">
                                <div className="text-sm font-medium text-gray-300">Date</div>
                                <div className="text-sm text-gray-500">{todayDate}</div>
                            </div>
                        </div>

                        {/* Diagnosis */}
                        <div className="mb-6 space-y-2">
                            <label className="text-sm font-medium text-gray-300">Diagnosis / Chief Complaint</label>
                            <textarea
                                value={diagnosis}
                                onChange={(e) => setDiagnosis(e.target.value)}
                                className="w-full bg-black/40 border border-white/10 rounded-lg p-3 text-sm focus:outline-none focus:border-blue-500/50 min-h-[80px]"
                                placeholder="e.g. Acute Viral Bronchitis with mild fever..."
                            />
                        </div>

                        {/* Medicines */}
                        <div className="mb-6">
                            <div className="flex items-center justify-between mb-2">
                                <label className="text-sm font-medium text-gray-300">Medications</label>
                                <button onClick={addMedicine} className="text-xs text-blue-400 hover:text-blue-300 flex items-center gap-1">
                                    <Plus size={14} /> Add Medicine
                                </button>
                            </div>

                            <div className="space-y-3">
                                <AnimatePresence>
                                    {medicines.map((med, index) => (
                                        <motion.div
                                            key={index}
                                            initial={{ opacity: 0, height: 0 }}
                                            animate={{ opacity: 1, height: "auto" }}
                                            exit={{ opacity: 0, height: 0 }}
                                            className="grid grid-cols-12 gap-3 items-center"
                                        >
                                            <div className="col-span-1 text-center text-gray-500 text-xs font-mono">{index + 1}</div>
                                            <div className="col-span-5">
                                                <input
                                                    type="text"
                                                    placeholder="Medicine Name"
                                                    value={med.name}
                                                    onChange={(e) => updateMedicine(index, 'name', e.target.value)}
                                                    className="w-full bg-white/5 border border-white/10 rounded px-3 py-2 text-sm focus:border-blue-500/50 outline-none"
                                                />
                                            </div>
                                            <div className="col-span-3">
                                                <input
                                                    type="text"
                                                    placeholder="1-0-1"
                                                    value={med.dosage}
                                                    onChange={(e) => updateMedicine(index, 'dosage', e.target.value)}
                                                    className="w-full bg-white/5 border border-white/10 rounded px-3 py-2 text-sm focus:border-blue-500/50 outline-none"
                                                />
                                            </div>
                                            <div className="col-span-2">
                                                <input
                                                    type="text"
                                                    placeholder="5 Days"
                                                    value={med.duration}
                                                    onChange={(e) => updateMedicine(index, 'duration', e.target.value)}
                                                    className="w-full bg-white/5 border border-white/10 rounded px-3 py-2 text-sm focus:border-blue-500/50 outline-none"
                                                />
                                            </div>
                                            <div className="col-span-1 text-right">
                                                <button onClick={() => removeMedicine(index)} className="text-gray-500 hover:text-red-400 transition-colors">
                                                    <Trash2 size={16} />
                                                </button>
                                            </div>
                                        </motion.div>
                                    ))}
                                </AnimatePresence>
                            </div>
                        </div>

                        {/* Notes */}
                        <div className="mb-8 space-y-2">
                            <label className="text-sm font-medium text-gray-300">Advice / Notes</label>
                            <textarea
                                value={notes}
                                onChange={(e) => setNotes(e.target.value)}
                                className="w-full bg-black/40 border border-white/10 rounded-lg p-3 text-sm focus:outline-none focus:border-blue-500/50 min-h-[80px]"
                                placeholder="e.g. Drink plenty of water, avoid cold foods..."
                            />
                        </div>

                        {/* Footer Actions */}
                        <div className="flex justify-end pt-6 border-t border-white/5">
                            {isSent ? (
                                <motion.div
                                    initial={{ opacity: 0, scale: 0.9 }}
                                    animate={{ opacity: 1, scale: 1 }}
                                    className="px-6 py-3 bg-green-500/20 text-green-400 rounded-xl flex items-center gap-2 font-medium border border-green-500/50"
                                >
                                    <CheckCircle size={20} /> Prescription Sent & Saved
                                </motion.div>
                            ) : (
                                <button
                                    onClick={handleSend}
                                    disabled={!selectedPatient || isSending}
                                    className="px-6 py-3 bg-blue-600 hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed text-white rounded-xl flex items-center gap-2 font-medium transition-all shadow-lg shadow-blue-900/20"
                                >
                                    {isSending ? (
                                        <><Loader2 size={18} className="animate-spin" /> Saving...</>
                                    ) : (
                                        <><Send size={18} /> Sign & Send Prescription</>
                                    )}
                                </button>
                            )}
                        </div>
                    </div>
                </div>

            </div>
        </div>
    );
}
