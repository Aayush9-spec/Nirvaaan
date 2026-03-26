import OpenAI from "openai";
import { NextResponse } from "next/server";

const openai = new OpenAI({
    apiKey: process.env.OPENAI_API_KEY || "dummy",
});

export async function POST(req: Request) {
    try {
        const body = await req.json();
        const { messages, guided } = body;

        if (!process.env.OPENAI_API_KEY || process.env.OPENAI_API_KEY === "dummy") {
            await new Promise(resolve => setTimeout(resolve, 1500));

            // Guided mode: return structured JSON result card
            if (guided) {
                const userMsg = messages?.[messages.length - 1]?.content || "";
                const hasFever = /fever/i.test(userMsg);
                const hasChestPain = /chest pain/i.test(userMsg);
                const hasSevere = /severe/i.test(userMsg);
                const hasHeadache = /headache/i.test(userMsg);

                let result;
                if (hasChestPain) {
                    result = {
                        risk: "High",
                        urgency: "Visit a doctor immediately",
                        diagnosis: "Potential Cardiac Event — requires ECG and evaluation",
                        specialist: "Cardiologist",
                        advice: "Do not ignore chest pain. Sit down, stay calm, and seek emergency medical attention. Avoid strenuous activity until evaluated.",
                        disclaimer: "This is an AI-generated assessment. Chest pain can indicate serious conditions. Call emergency services if pain is severe.",
                    };
                } else if (hasSevere) {
                    result = {
                        risk: "High",
                        urgency: "Consult a doctor today",
                        diagnosis: hasFever ? "Acute Viral Infection with possible bacterial complication" : "Condition requiring clinical evaluation",
                        specialist: hasFever ? "Internal Medicine / General Physician" : "General Physician",
                        advice: "Your symptoms are severe enough to warrant a same-day medical consultation. Stay hydrated, rest, and avoid self-medication until a doctor evaluates you.",
                        disclaimer: "This is an AI-generated assessment. Always consult a qualified healthcare professional for accurate diagnosis.",
                    };
                } else if (hasFever) {
                    result = {
                        risk: "Medium",
                        urgency: "Consult within 24 hours",
                        diagnosis: "Viral Fever / Upper Respiratory Infection",
                        specialist: "General Physician",
                        advice: "Stay hydrated, take adequate rest, and take paracetamol for fever if above 100°F. If fever persists beyond 3 days or exceeds 103°F, seek immediate care.",
                        disclaimer: "This is an AI-generated assessment. Always consult a qualified healthcare professional for accurate diagnosis.",
                    };
                } else if (hasHeadache) {
                    result = {
                        risk: "Low",
                        urgency: "Monitor for 2-3 days",
                        diagnosis: "Tension Headache / Stress-related Cephalalgia",
                        specialist: "General Physician",
                        advice: "Ensure you are sleeping well, staying hydrated, and managing screen time. OTC pain relievers like ibuprofen can help. Consult if headaches become frequent or intense.",
                        disclaimer: "This is an AI-generated assessment. Always consult a qualified healthcare professional for accurate diagnosis.",
                    };
                } else {
                    result = {
                        risk: "Low",
                        urgency: "Monitor for 2-3 days",
                        diagnosis: "General Discomfort — likely self-limiting",
                        specialist: "General Physician",
                        advice: "Stay hydrated, get adequate rest, and monitor your symptoms. If symptoms worsen or new symptoms appear, schedule a consultation.",
                        disclaimer: "This is an AI-generated assessment. Always consult a qualified healthcare professional for accurate diagnosis.",
                    };
                }

                return NextResponse.json({ structured: result }, { status: 200 });
            }

            // Regular chat mode
            return NextResponse.json(
                {
                    role: "assistant",
                    content: "*(Simulated AI Mode)*\n\nBased on the symptoms you've shared, this appears to be a common mild reaction. Ensure you stay hydrated and get plenty of rest.\n\nIf these symptoms persist for more than 48 hours or worsen, I strongly recommend scheduling an appointment with a General Physician.\n\n*Disclaimer: I am an AI, not a doctor. Please consult a professional.*"
                },
                { status: 200 }
            );
        }

        // Real OpenAI mode
        const systemPrompt = guided
            ? `You are MedAI. Analyze the patient's symptoms and return ONLY a valid JSON object with these fields:
- risk: "Low" | "Medium" | "High" | "Critical"
- urgency: string (e.g. "Consult within 24 hours")
- diagnosis: string (the most likely condition)
- specialist: string (recommended doctor type)
- advice: string (2-3 sentences of care advice)
- disclaimer: string (AI disclaimer)
Return ONLY the JSON, no markdown.`
            : `You are MedAI, an advanced decentralized medical intelligence assistant. 
Your goal is to analyze symptoms, suggest potential diagnoses (with disclaimers), and recommend actions.
Tone: Professional, Empathetic, Concise, and medically grounded.
Format your response with clear markdown.
IMPORTANT: Always end with a disclaimer: "I am an AI, not a doctor. Please consult a professional."`;

        const completion = await openai.chat.completions.create({
            model: "gpt-4o",
            messages: [
                { role: "system", content: systemPrompt },
                ...messages
            ],
        });

        const aiMessage = completion.choices[0].message;

        if (guided) {
            try {
                const parsed = JSON.parse(aiMessage.content || "{}");
                return NextResponse.json({ structured: parsed });
            } catch {
                return NextResponse.json({
                    structured: {
                        risk: "Medium",
                        urgency: "Consult within 24 hours",
                        diagnosis: "Unable to parse — please consult a doctor",
                        specialist: "General Physician",
                        advice: aiMessage.content || "Please book an appointment for a proper evaluation.",
                        disclaimer: "This is an AI-generated assessment. Always consult a qualified healthcare professional.",
                    }
                });
            }
        }

        return NextResponse.json(aiMessage);

    } catch (error) {
        console.error("AI Error:", error);
        return NextResponse.json(
            { error: "Internal Server Error" },
            { status: 500 }
        );
    }
}
