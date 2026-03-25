import OpenAI from "openai";
import { NextResponse } from "next/server";

const openai = new OpenAI({
    apiKey: process.env.OPENAI_API_KEY || "dummy", // Fallback to avoid build errors, check in logic
});

export async function POST(req: Request) {
    try {
        const { messages } = await req.json();

        if (!process.env.OPENAI_API_KEY || process.env.OPENAI_API_KEY === "dummy") {
            await new Promise(resolve => setTimeout(resolve, 1500)); // Simulate thinking latency
            return NextResponse.json(
                {
                    role: "assistant",
                    content: "*(Simulated AI Mode)*\n\nBased on the symptoms you've shared, this appears to be a common mild reaction. Ensure you stay hydrated and get plenty of rest.\n\nIf these symptoms persist for more than 48 hours or worsen, I strongly recommend scheduling an appointment with a General Physician.\n\n*Disclaimer: I am an AI, not a doctor. Please consult a professional.*"
                },
                { status: 200 }
            );
        }

        const completion = await openai.chat.completions.create({
            model: "gpt-4o",
            messages: [
                {
                    role: "system",
                    content: `You are MedAI, an advanced decentralized medical intelligence assistant. 
          Your goal is to analyze symptoms, suggest potential diagnoses (with disclaimers), and recommend actions.
          
          Tone: Professional, Empathetic, Concise, and medically grounded.
          
          Capabilities:
          1. Analyze symptoms provided by the user.
          2. Suggest specialists (e.g., Neurologist, Cardiologist).
          3. Detect urgency (e.g., "Go to ER" for chest pain).
          4. If the user asks to book, output a structured JSON action hidden in the text or just confirm.
          
          Format your response with clear markdown.
          IMPORTANT: Always end with a disclaimer: "I am an AI, not a doctor. Please consult a professional."
          `
                },
                ...messages
            ],
        });

        const aiMessage = completion.choices[0].message;

        return NextResponse.json(aiMessage);

    } catch (error) {
        console.error("AI Error:", error);
        return NextResponse.json(
            { error: "Internal Server Error" },
            { status: 500 }
        );
    }
}
