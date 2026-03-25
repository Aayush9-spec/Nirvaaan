"use server";

import OpenAI from "openai";

const openai = new OpenAI({
    apiKey: process.env.OPENAI_API_KEY,
});

export interface AgentResponse {
    reply: string;
    booking_intent?: {
        specialization: string;
        doctor_name: string;
        date: string;
        time: string;
    } | null;
}

export async function processAgentRequest(userText: string): Promise<{ result?: AgentResponse; error?: string }> {
    if (!userText) {
        return { error: "No text provided" };
    }

    try {
        // Mock response if API key is missing (for testing)
        if (!process.env.OPENAI_API_KEY || process.env.OPENAI_API_KEY === "your-api-key-here") {
            console.log("Using Mock AI Agent Response");
            await new Promise((resolve) => setTimeout(resolve, 1500));

            const lowerText = userText.toLowerCase();
            let mockResponse: AgentResponse;

            if (lowerText.includes("headache") || lowerText.includes("fever")) {
                mockResponse = {
                    reply: "I understand you're not feeling well. For headaches and fever, I recommend seeing a General Physician. Dr. Sarah Johnson is available today at 4:30 PM. Would you like to book an appointment?",
                    booking_intent: {
                        specialization: "General Physician",
                        doctor_name: "Dr. Sarah Johnson",
                        date: "Today",
                        time: "04:30 PM"
                    }
                };
            } else if (lowerText.includes("heart") || lowerText.includes("chest")) {
                mockResponse = {
                    reply: "Chest pain can be serious. I strongly recommend a Cardiologist. Dr. Emily Chen has an emergency slot available immediately. Shall I guide you to emergency services or book the slot?",
                    booking_intent: {
                        specialization: "Cardiologist",
                        doctor_name: "Dr. Emily Chen",
                        date: "Today",
                        time: "Immediate"
                    }
                };
            } else {
                mockResponse = {
                    reply: "I'm listening. Could you describe your symptoms more clearly? For example, tell me if you have pain, fever, or other issues.",
                    booking_intent: null
                };
            }
            return { result: mockResponse };
        }

        const response = await openai.chat.completions.create({
            model: "gpt-4o",
            messages: [
                {
                    role: "system",
                    content: `You are an empathetic medical AI booking assistant. Your goal is to:
                    1. Listen to the patient's symptoms.
                    2. Determine the appropriate medical specialization.
                    3. Suggest a fictitious but realistic doctor and an availability time (usually today or tomorrow).
                    4. output a JSON response.

                    JSON Format:
                    {
                        "reply": "Conversational response to the user, empathetic and suggesting the doctor.",
                        "booking_intent": {
                            "specialization": "Specialization Name",
                            "doctor_name": "Doctor Name",
                            "date": "Date string (e.g. Today, Tomorrow, or YYYY-MM-DD)",
                            "time": "Time string (e.g. 10:00 AM)"
                        } 
                    }
                    
                    If the user input is not related to symptoms or booking, set "booking_intent" to null and just reply conversationally.`
                },
                {
                    role: "user",
                    content: userText
                }
            ],
            response_format: { type: "json_object" },
            max_tokens: 300,
        });

        const content = response.choices[0].message.content;
        if (!content) throw new Error("No response from AI");

        return { result: JSON.parse(content) };

    } catch (error: any) {
        console.error("Agent Logic Error:", error);
        return { error: error.message || "Failed to process request" };
    }
}
