import OpenAI from "openai";
import { NextResponse } from "next/server";

const openai = new OpenAI({
    apiKey: process.env.OPENAI_API_KEY || "dummy",
});

export async function POST(req: Request) {
    try {
        if (!process.env.OPENAI_API_KEY || process.env.OPENAI_API_KEY === "PASTE_YOUR_NEW_KEY_HERE" || process.env.OPENAI_API_KEY === "dummy") {
            // Wait 1.5 seconds to simulate AI processing time
            await new Promise((resolve) => setTimeout(resolve, 1500));
            
            return NextResponse.json({
                result: "### 💊 Amoxicillin 500mg\n\n* **Active Ingredients:** Amoxicillin Trihydrate (500mg)\n* **Category:** Antibiotic (Penicillin class)\n* **Common Uses:** Treats a wide variety of bacterial infections (e.g., ear, throat, pneumonia).\n* **Dosage Info:** Typically 1 capsule every 8 hours or 12 hours depending on severity.\n* **Warnings:** Do not take if you have a penicillin allergy. May cause upset stomach.\n\n> ⚠️ *This is a simulated AI analysis because the production keys are disconnected. Always verify with a licensed pharmacist.*",
            });
        }

        const { image } = await req.json();

        if (!image) {
            return NextResponse.json({ error: "No image provided" }, { status: 400 });
        }

        const completion = await openai.chat.completions.create({
            model: "gpt-4o",
            max_tokens: 1000,
            messages: [
                {
                    role: "system",
                    content: `You are MedAI Medicine Scanner, an expert pharmaceutical analysis system.

When shown an image of a medicine (pill, tablet, capsule, syrup bottle, packaging, or prescription label), analyze it and provide:

1. **Medicine Name** — identified name and brand
2. **Active Ingredients** — key compounds and their dosage
3. **Category** — e.g., Analgesic, Antibiotic, Antihypertensive
4. **Common Uses** — what it treats
5. **Dosage Info** — standard dosing from the packaging if visible
6. **Expiry / Batch** — if visible on packaging
7. **Warnings** — key contraindications or side effects
8. **Authenticity** — visual cues about legitimacy (packaging quality, hologram, etc.)

Format your response with clear markdown headers and bullet points.
If the image is NOT a medicine, politely say so and suggest uploading a medicine image.
Always end with: "⚠️ This is an AI analysis. Always verify with a licensed pharmacist."`,
                },
                {
                    role: "user",
                    content: [
                        {
                            type: "text",
                            text: "Analyze this medicine image. Identify the medicine, its ingredients, usage, and any safety information visible.",
                        },
                        {
                            type: "image_url",
                            image_url: {
                                url: image,
                                detail: "high",
                            },
                        },
                    ],
                },
            ],
        });

        const result = completion.choices[0]?.message?.content || "Unable to analyze the image.";

        return NextResponse.json({ result });
    } catch (error: any) {
        console.error("Scan API Error:", error);
        return NextResponse.json(
            { error: error?.message || "Failed to analyze medicine image" },
            { status: 500 }
        );
    }
}
