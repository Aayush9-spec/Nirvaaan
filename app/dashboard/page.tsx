"use client";

import { useState, useEffect, useRef } from "react";
import { Send, Mic, Activity, Brain, User, Calendar, Loader2 } from "lucide-react";
import Link from "next/link";

// Type definition for SpeechRecognition
declare global {
    interface Window {
        SpeechRecognition: any;
        webkitSpeechRecognition: any;
    }
}

export default function DashboardHome() {
    const [messages, setMessages] = useState([
        {
            role: "ai",
            content: "Hello. I am MedAI, your decentralized health assistant. How are you feeling today? Describe your symptoms.",
        },
    ]);
    const [input, setInput] = useState("");
    const [isListening, setIsListening] = useState(false);
    const [isProcessing, setIsProcessing] = useState(false);
    const recognitionRef = useRef<any>(null);

    useEffect(() => {
        if (typeof window !== "undefined") {
            const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
            if (SpeechRecognition) {
                recognitionRef.current = new SpeechRecognition();
                recognitionRef.current.continuous = false;
                recognitionRef.current.interimResults = false;
                recognitionRef.current.lang = "en-US";

                recognitionRef.current.onstart = () => setIsListening(true);
                recognitionRef.current.onend = () => setIsListening(false);
                recognitionRef.current.onresult = (event: any) => {
                    const transcript = event.results[0][0].transcript;
                    setInput(transcript);
                    handleSend(transcript);
                };
            }
        }
    }, []);

    const toggleListening = () => {
        if (isListening) {
            recognitionRef.current?.stop(); // Stop listening
        } else {
            recognitionRef.current?.start(); // Start listening
        }
    };

    const handleSend = async (textOverride?: string) => {
        const text = textOverride || input;
        if (!text.trim()) return;

        const userMsg = { role: "user", content: text };
        setMessages((prev) => [...prev, userMsg]);
        setInput("");
        setIsProcessing(true);

        try {
            // Step 1: Call the Serverless AI Brain
            const response = await fetch("/api/chat", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ messages: [...messages, userMsg].map(m => ({ role: m.role, content: m.content })) }),
            });

            if (!response.ok) throw new Error("Network response was not ok");

            const data = await response.json();

            // Step 2: Handle API Key Missing / Fallback gracefully
            if (data.content && data.content.includes("medical-intelligence-node-missing")) {
                // Fallback to local simulation if no key (so the demo still works)
                runLocalSimulation(text);
            } else {
                // Real AI Response
                // Check for appointment intent in real response (basic keyword check on AI output)
                let action = undefined;
                const lowerContent = data.content.toLowerCase();
                if (lowerContent.includes("book") || lowerContent.includes("schedule")) {
                    action = "confirm_booking";
                } else if (lowerContent.includes("consult") || lowerContent.includes("doctor") || lowerContent.includes("specialist")) {
                    action = "book_appointment";
                }

                setMessages((prev) => [...prev, { role: "ai", content: data.content, action }]);
                setIsProcessing(false);
            }

        } catch (error) {
            console.error("AI Brain Error:", error);
            // Fallback on error
            runLocalSimulation(text);
        }
    };

    const runLocalSimulation = (text: string) => {
        setTimeout(() => {
            let aiResponse;
            const lowerText = text.toLowerCase();

            if (lowerText.includes("fever") || lowerText.includes("headache") || lowerText.includes("cold")) {
                aiResponse = {
                    role: "ai",
                    content: "Simulated: I've analyzed your symptoms. It indicates a potential viral infection. \n\n(Add OPENAI_API_KEY to .env.local for Real AI Analysis)",
                    action: "book_appointment",
                };
            } else if (lowerText.includes("book") || lowerText.includes("appointment")) {
                aiResponse = {
                    role: "ai",
                    content: "Simulated: I can schedule that for you. Accessing the global schedule mesh...",
                    action: "confirm_booking",
                };
            } else {
                aiResponse = {
                    role: "ai",
                    content: "Simulated: I understand. Could you provide more specific details? \n\n(This is a local fallback. Add your API Key to enable the real LLM.)",
                };
            }

            setMessages((prev) => [...prev, aiResponse]);
            setIsProcessing(false);
        }, 1500);
    };

    return (
        <div className="h-[calc(100vh-6rem)] flex flex-col">
            {/* Header */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
                <div>
                    <h1 className="text-2xl font-bold mb-1">Health Assistant</h1>
                    <p className="text-gray-400 text-sm">Voice Command Active • Neural Engine v2.0</p>
                </div>
                <div className="flex gap-4 self-start sm:self-auto">
                    <div className="px-3 py-1 bg-green-500/10 border border-green-500/20 text-green-400 rounded-full text-xs flex items-center gap-2">
                        <Activity size={12} />
                        System Optimal
                    </div>
                </div>
            </div>

            {/* Chat Area */}
            <div className="flex-1 bg-white/[0.02] border border-white/10 rounded-xl overflow-hidden flex flex-col relative">

                {/* Messages List */}
                <div className="flex-1 overflow-y-auto p-4 space-y-6 scrollbar-thin scrollbar-thumb-white/10">
                    {messages.map((msg, i) => (
                        <div
                            key={i}
                            className={`flex ${msg.role === "user" ? "justify-end" : "justify-start"}`}
                        >
                            <div
                                className={`max-w-[85%] rounded-2xl p-4 ${msg.role === "user"
                                    ? "bg-purple-600/20 text-purple-100 border border-purple-500/30"
                                    : "bg-white/5 text-gray-200 border border-white/5"
                                    }`}
                            >
                                {/* AI Label */}
                                {msg.role === "ai" && (
                                    <div className="flex items-center gap-2 mb-2 text-purple-400 text-xs uppercase tracking-wider font-bold">
                                        <Brain size={12} />
                                        Diagnosis Engine
                                    </div>
                                )}

                                {/* Message Content */}
                                <p className="leading-relaxed whitespace-pre-wrap text-sm">{msg.content}</p>

                                {/* AI Action Widgets */}
                                {/* Using type assertion or generic property access safely since 'action' might not exist on all messages */}
                                {(msg as any).action === "book_appointment" && (
                                    <div className="mt-4 p-3 bg-black/40 rounded-lg border border-white/10">
                                        <div className="flexStart flex items-center gap-3 mb-3">
                                            <div className="w-10 h-10 rounded-full bg-blue-500/20 flex items-center justify-center text-blue-400">
                                                <User size={20} />
                                            </div>
                                            <div>
                                                <div className="font-semibold text-sm">Dr. Sarah Chen</div>
                                                <div className="text-xs text-gray-400">General Physician • 1.2km away</div>
                                            </div>
                                        </div>
                                        <Link href="/dashboard/appointments" className="block w-full py-2 bg-purple-600 hover:bg-purple-700 text-white text-center rounded text-sm font-medium transition-colors">
                                            Book Appointment
                                        </Link>
                                    </div>
                                )}
                            </div>
                        </div>
                    ))}

                    {/* Processing Indicator */}
                    {isProcessing && (
                        <div className="flex justify-start">
                            <div className="bg-white/5 text-gray-400 rounded-2xl p-4 flex items-center gap-2 text-sm">
                                <Loader2 size={16} className="animate-spin text-purple-500" />
                                Analyzing symptoms...
                            </div>
                        </div>
                    )}
                </div>

                {/* Input Area */}
                <div className="p-4 bg-black/20 border-t border-white/10">
                    <div className="relative flex items-center gap-3">
                        <button
                            onClick={toggleListening}
                            className={`p-3 rounded-full transition-all border ${isListening
                                ? "bg-red-500/20 text-red-400 border-red-500/50 animate-pulse"
                                : "bg-white/5 text-gray-400 border-white/5 hover:bg-white/10 hover:text-white"
                                }`}
                        >
                            <Mic size={20} />
                        </button>
                        <input
                            type="text"
                            value={input}
                            onChange={(e) => setInput(e.target.value)}
                            onKeyDown={(e) => e.key === "Enter" && handleSend()}
                            placeholder={isListening ? "Listening..." : "Type 'fever' or speak..."}
                            className="flex-1 bg-transparent border-none outline-none text-sm text-white placeholder-gray-600 h-10"
                            disabled={isListening}
                        />
                        <button
                            onClick={() => handleSend()}
                            disabled={!input.trim() || isListening}
                            className="p-3 bg-white/10 hover:bg-white/20 text-white rounded-xl transition-colors disabled:opacity-50"
                        >
                            <Send size={18} />
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
}
