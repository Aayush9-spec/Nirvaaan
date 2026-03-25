"use client";

import { useState, useEffect, useRef } from "react";
import { Mic, MicOff, Volume2, User, Bot, Calendar, Clock, Stethoscope } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { processAgentRequest, AgentResponse } from "@/app/actions/agent-booking";

// Type definition for Web Speech API
interface IWindow extends Window {
    webkitSpeechRecognition: any;
    SpeechRecognition: any;
}

export default function VoiceAgent() {
    const [isListening, setIsListening] = useState(false);
    const [transcript, setTranscript] = useState("");
    const [chatHistory, setChatHistory] = useState<{ role: 'user' | 'ai', text: string }[]>([]);
    const [loading, setLoading] = useState(false);
    const [bookingProposal, setBookingProposal] = useState<AgentResponse['booking_intent']>(null);
    const recognitionRef = useRef<any>(null);

    useEffect(() => {
        // Initialize Speech Recognition
        const { webkitSpeechRecognition, SpeechRecognition } = window as unknown as IWindow;
        if (typeof window !== "undefined" && (webkitSpeechRecognition || SpeechRecognition)) {
            const SpeechReflection = SpeechRecognition || webkitSpeechRecognition;
            recognitionRef.current = new SpeechReflection();
            recognitionRef.current.continuous = false;
            recognitionRef.current.interimResults = true;
            recognitionRef.current.lang = 'en-US';

            recognitionRef.current.onresult = (event: any) => {
                let interimTranscript = '';
                for (let i = event.resultIndex; i < event.results.length; ++i) {
                    if (event.results[i].isFinal) {
                        setTranscript(event.results[i][0].transcript);
                        handleStopListening();
                        processInput(event.results[i][0].transcript);
                    } else {
                        interimTranscript += event.results[i][0].transcript;
                        setTranscript(interimTranscript);
                    }
                }
            };

            recognitionRef.current.onerror = (event: any) => {
                console.error("Speech recognition error", event.error);
                setIsListening(false);
            };

            recognitionRef.current.onend = () => {
                setIsListening(false);
            };
        }
    }, []);

    const speak = (text: string) => {
        if ('speechSynthesis' in window) {
            const utterance = new SpeechSynthesisUtterance(text);
            // Optional: Choose a specific voice if available
            // const voices = window.speechSynthesis.getVoices();
            // utterance.voice = voices.find(v => v.name.includes("Google US English")) || null;
            window.speechSynthesis.speak(utterance);
        }
    };

    const handleStartListening = () => {
        setBookingProposal(null);
        setTranscript("");
        if (recognitionRef.current) {
            try {
                recognitionRef.current.start();
                setIsListening(true);
            } catch (e) {
                console.error("Recognition start failed", e);
            }
        } else {
            alert("Speech recognition not supported in this browser.");
        }
    };

    const handleStopListening = () => {
        if (recognitionRef.current) {
            recognitionRef.current.stop();
            setIsListening(false);
        }
    };

    const processInput = async (text: string) => {
        if (!text.trim()) return;

        setChatHistory(prev => [...prev, { role: 'user', text }]);
        setLoading(true);

        try {
            const { result, error } = await processAgentRequest(text);

            if (error) {
                const errorMsg = "Sorry, I had trouble connecting. Please try again.";
                setChatHistory(prev => [...prev, { role: 'ai', text: errorMsg }]);
                speak(errorMsg);
            } else if (result) {
                setChatHistory(prev => [...prev, { role: 'ai', text: result.reply }]);
                speak(result.reply);

                if (result.booking_intent) {
                    setBookingProposal(result.booking_intent);
                }
            }
        } catch (err) {
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    const confirmBooking = () => {
        const confirmMsg = `Great! I've booked your appointment with ${bookingProposal?.doctor_name} for ${bookingProposal?.time}.`;
        setChatHistory(prev => [...prev, { role: 'ai', text: confirmMsg }]);
        speak(confirmMsg);
        setBookingProposal(null);
        // Here you would call an actual booking API
    };

    return (
        <div className="max-w-2xl mx-auto h-[calc(100vh-140px)] flex flex-col">
            <div className="text-center mb-6">
                <h1 className="text-3xl font-bold mb-2 bg-gradient-to-r from-teal-400 to-blue-500 bg-clip-text text-transparent">
                    AI Health Assistant
                </h1>
                <p className="text-gray-400 text-sm">Tap the microphone and tell me how you feel.</p>
            </div>

            {/* Chat Area */}
            <div className="flex-1 overflow-y-auto space-y-4 mb-6 pr-2 scrollbar-hide">
                {chatHistory.length === 0 && (
                    <div className="flex flex-col items-center justify-center h-full text-gray-600 space-y-4 opacity-50">
                        <Bot size={48} />
                        <p>Try saying: "I have a severe headache"</p>
                    </div>
                )}

                {chatHistory.map((msg, i) => (
                    <motion.div
                        key={i}
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        className={`flex gap-3 ${msg.role === 'user' ? 'flex-row-reverse' : ''}`}
                    >
                        <div className={`w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 ${msg.role === 'user' ? 'bg-purple-600' : 'bg-teal-600'
                            }`}>
                            {msg.role === 'user' ? <User size={16} /> : <Bot size={16} />}
                        </div>
                        <div className={`p-4 rounded-2xl max-w-[80%] ${msg.role === 'user'
                                ? 'bg-purple-600/10 text-purple-100 rounded-tr-sm'
                                : 'bg-white/5 text-gray-200 rounded-tl-sm'
                            }`}>
                            {msg.text}
                        </div>
                    </motion.div>
                ))}

                {/* Loading Bubble */}
                {loading && (
                    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="flex gap-3">
                        <div className="w-8 h-8 rounded-full bg-teal-600 flex items-center justify-center">
                            <Bot size={16} />
                        </div>
                        <div className="p-4 rounded-2xl bg-white/5 rounded-tl-sm flex gap-2 items-center">
                            <span className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"></span>
                            <span className="w-2 h-2 bg-gray-400 rounded-full animate-bounce delay-100"></span>
                            <span className="w-2 h-2 bg-gray-400 rounded-full animate-bounce delay-200"></span>
                        </div>
                    </motion.div>
                )}

                {/* Booking Proposal Card */}
                {bookingProposal && (
                    <motion.div
                        initial={{ opacity: 0, scale: 0.95 }}
                        animate={{ opacity: 1, scale: 1 }}
                        className="mx-auto max-w-sm w-full bg-gradient-to-br from-teal-900/40 to-blue-900/40 border border-teal-500/30 p-5 rounded-3xl backdrop-blur-md"
                    >
                        <h3 className="text-teal-400 font-semibold mb-3 flex items-center gap-2">
                            <Calendar size={18} /> Appointment Suggested
                        </h3>
                        <div className="space-y-3 mb-5">
                            <div className="flex items-center gap-3">
                                <div className="w-10 h-10 rounded-full bg-white/10 flex items-center justify-center">
                                    <Stethoscope size={20} className="text-blue-300" />
                                </div>
                                <div>
                                    <div className="font-medium text-white">{bookingProposal.doctor_name}</div>
                                    <div className="text-xs text-gray-400">{bookingProposal.specialization}</div>
                                </div>
                            </div>
                            <div className="flex items-center gap-3 bg-black/20 p-3 rounded-xl border border-white/5">
                                <Clock size={18} className="text-teal-400" />
                                <div className="text-sm">
                                    <span className="text-gray-300">{bookingProposal.date} at </span>
                                    <span className="font-bold text-white">{bookingProposal.time}</span>
                                </div>
                            </div>
                        </div>
                        <div className="flex gap-3">
                            <button
                                onClick={() => setBookingProposal(null)}
                                className="flex-1 py-2.5 rounded-xl bg-white/5 hover:bg-white/10 text-gray-300 text-sm font-medium transition-colors"
                            >
                                Cancel
                            </button>
                            <button
                                onClick={confirmBooking}
                                className="flex-1 py-2.5 rounded-xl bg-teal-600 hover:bg-teal-500 text-white text-sm font-bold shadow-lg shadow-teal-900/20 transition-all transform hover:scale-[1.02]"
                            >
                                Confirm Booking
                            </button>
                        </div>
                    </motion.div>
                )}
            </div>

            {/* Controls */}
            <div className="relative flex justify-center items-center py-6">
                <AnimatePresence>
                    {isListening && (
                        <>
                            <motion.div
                                initial={{ opacity: 0, scale: 0.5 }}
                                animate={{ opacity: 1, scale: 1.5 }}
                                exit={{ opacity: 0, scale: 0.5 }}
                                className="absolute w-20 h-20 bg-teal-500/20 rounded-full blur-xl"
                            />
                            <motion.div
                                initial={{ opacity: 0, scale: 0.8 }}
                                animate={{ opacity: 1, scale: 2 }}
                                exit={{ opacity: 0, scale: 0.8 }}
                                transition={{ repeat: Infinity, duration: 1.5 }}
                                className="absolute w-20 h-20 border border-teal-500/30 rounded-full"
                            />
                        </>
                    )}
                </AnimatePresence>

                <button
                    onClick={isListening ? handleStopListening : handleStartListening}
                    className={`relative z-10 w-20 h-20 rounded-full flex items-center justify-center transition-all duration-300 shadow-[0_0_30px_rgba(0,0,0,0.3)] ${isListening
                            ? 'bg-red-500 hover:bg-red-600 text-white shadow-[0_0_30px_rgba(239,68,68,0.4)]'
                            : 'bg-gradient-to-tr from-teal-500 to-blue-500 hover:scale-105 text-white shadow-[0_0_30px_rgba(20,184,166,0.4)]'
                        }`}
                >
                    {isListening ? <MicOff size={32} /> : <Mic size={32} />}
                </button>

                {transcript && isListening && (
                    <div className="absolute -top-12 left-0 right-0 text-center">
                        <span className="bg-black/50 backdrop-blur-md px-4 py-2 rounded-full text-sm text-gray-200 border border-white/10">
                            {transcript}
                        </span>
                    </div>
                )}
            </div>
        </div>
    );
}
