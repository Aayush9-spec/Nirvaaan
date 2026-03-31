"use server";

import { getAiRuntime, parseJsonObject } from "@/lib/server-ai";

export interface AgentResponse {
    reply: string;
    booking_intent?: {
        specialization: string;
        doctor_name: string;
        date: string;
        time: string;
    } | null;
}

function fallbackResponse(userText: string): AgentResponse {
    const lowerText = userText.toLowerCase();

    if (lowerText.includes("headache") || lowerText.includes("fever")) {
        return {
            reply:
                "I understand you’re not feeling well. Based on these symptoms, a General Physician consult would be appropriate. I can prepare a booking now.",
            booking_intent: {
                specialization: "General Physician",
                doctor_name: "Available Doctor",
                date: "Today",
                time: "04:30 PM",
            },
        };
    }

    if (lowerText.includes("chest") || lowerText.includes("heart")) {
        return {
            reply:
                "Chest-related symptoms can be serious. Please seek urgent care. I can also prepare a cardiology appointment immediately.",
            booking_intent: {
                specialization: "Cardiologist",
                doctor_name: "Available Cardiologist",
                date: "Today",
                time: "Immediate",
            },
        };
    }

    return {
        reply:
            "Please describe your symptoms in detail, including duration and severity, and I will suggest the right specialist.",
        booking_intent: null,
    };
}

function normalizeAgentResponse(parsed: unknown, rawText: string): AgentResponse {
    const data = (parsed || {}) as {
        reply?: unknown;
        booking_intent?: {
            specialization?: unknown;
            doctor_name?: unknown;
            date?: unknown;
            time?: unknown;
        } | null;
    };

    const reply = String(data.reply || "").trim() || rawText || "I can help with symptom triage and booking.";
    const booking = data.booking_intent;

    if (!booking) {
        return { reply, booking_intent: null };
    }

    const specialization = String(booking.specialization || "").trim();
    const doctorName = String(booking.doctor_name || "").trim();
    const date = String(booking.date || "").trim();
    const time = String(booking.time || "").trim();

    if (!specialization || !date || !time) {
        return { reply, booking_intent: null };
    }

    return {
        reply,
        booking_intent: {
            specialization,
            doctor_name: doctorName || "Available Doctor",
            date,
            time,
        },
    };
}

export async function processAgentRequest(userText: string): Promise<{ result?: AgentResponse; error?: string }> {
    if (!userText?.trim()) {
        return { error: "No text provided" };
    }

    const runtime = getAiRuntime("chat");

    if (!runtime) {
        return { result: fallbackResponse(userText) };
    }

    try {
        const response = await runtime.client.chat.completions.create({
            model: runtime.model,
            temperature: 0.4,
            max_tokens: 350,
            messages: [
                {
                    role: "system",
                    content: `You are NIRVAAAN voice triage assistant.
Return ONLY valid JSON:
{
  "reply": "empathetic clinical guidance in 1-3 sentences",
  "booking_intent": {
    "specialization": "recommended specialization",
    "doctor_name": "preferred doctor name or Available Doctor",
    "date": "Today | Tomorrow | YYYY-MM-DD",
    "time": "hh:mm AM/PM | Immediate"
  } | null
}
Rules:
- Set booking_intent to null if booking is not appropriate yet.
- For severe/emergency symptoms, advise urgent care first.`,
                },
                {
                    role: "user",
                    content: userText,
                },
            ],
        });

        const raw = response.choices[0]?.message?.content || "";
        const parsed = parseJsonObject(raw);
        return { result: normalizeAgentResponse(parsed, raw) };
    } catch (error: unknown) {
        const message = error instanceof Error ? error.message : "Failed to process request";
        console.error("Agent Logic Error:", message);
        return { error: message };
    }
}

