"use server";

import OpenAI from "openai";

const openai = new OpenAI({
    apiKey: process.env.OPENAI_API_KEY,
});

export async function analyzeMedicineImage(formData: FormData) {
    const file = formData.get("image") as File;

    if (!file) {
        return { error: "No image provided" };
    }

    // Convert file to base64
    const buffer = await file.arrayBuffer();
    const base64Image = Buffer.from(buffer).toString("base64");
    const dataUrl = `data:${file.type};base64,${base64Image}`;

    try {
        // Mock response if API key is missing or invalid (for testing without billing)
        if (!process.env.OPENAI_API_KEY || process.env.OPENAI_API_KEY === "your-api-key-here") {
            console.log("Using Mock AI Response (No API Key)");
            await new Promise((resolve) => setTimeout(resolve, 2000)); // Simulate delay
            return {
                result: {
                    name: "Paracetamol (Dolo 650)",
                    generic_name: "Acetaminophen",
                    purpose: "Pain relief and fever reduction",
                    dosage: "Typically 650mg every 4-6 hours, not exceeding 4g per day.",
                    warnings: [
                        "Do not exceed recommended dose.",
                        "Avoid alcohol while taking this medication.",
                        "Consult a doctor if you have liver disease."
                    ],
                    side_effects: ["Nausea", "Stomach pain", "Loss of appetite"]
                }
            };
        }

        const response = await openai.chat.completions.create({
            model: "gpt-4o",
            messages: [
                {
                    role: "system",
                    content: `You are an expert medical pharmacist AI. Analyze the image provided, which is likely a medicine strip, bottle, or prescription.
                    Identify the medicine and return a strictly valid JSON object with the following fields:
                    - name: The brand name of the medicine.
                    - generic_name: The active ingredient(s).
                    - purpose: What valid medical condition it treats.
                    - dosage: Standard dosage instructions (general guideline).
                    - warnings: Array of key warnings or contraindications.
                    - side_effects: Array of common side effects.
                    If the image is not a medicine, return an error field in the JSON explaining why.`
                },
                {
                    role: "user",
                    content: [
                        { type: "text", text: "Analyze this medicine image." },
                        {
                            type: "image_url",
                            image_url: {
                                url: dataUrl,
                            },
                        },
                    ],
                },
            ],
            response_format: { type: "json_object" },
            max_tokens: 500,
        });

        const content = response.choices[0].message.content;
        if (!content) throw new Error("No response from AI");

        return { result: JSON.parse(content) };

    } catch (error: any) {
        console.error("AI Analysis Error:", error);
        return { error: error.message || "Failed to analyze image" };
    }
}
