import { NextResponse } from "next/server";
import { getAiRuntime } from "@/lib/server-ai";
import { z } from "zod";
import { apiError } from "@/lib/api-utils";

const ScanSchema = z.object({
    image: z.string().url(),
});

export async function POST(req: Request) {
    try {
        const body = await req.json();
        const validation = ScanSchema.safeParse(body);
        if (!validation.success) return apiError("Invalid image URL", 400, validation.error.format());

        const { image } = validation.data;
        const runtime = getAiRuntime("vision");

        if (!runtime) {
            return NextResponse.json({
                result: "### 💊 Medicine Scan Preview\n\n- No vision AI configured.\n- Add `OPENROUTER_API_KEY` to enable real analysis.\n\n⚠️ This is an AI analysis. Always verify with a licensed pharmacist.",
            });
        }

        const completion = await runtime.client.chat.completions.create({
            model: runtime.model,
            max_tokens: 1000,
            messages: [
                {
                    role: "system",
                    content: "You are NIRVAAAN Medicine Scanner. Analyze medicine image: name, ingredients, category, uses, dosage, expiry, warnings. End with disclaimer.",
                },
                {
                    role: "user",
                    content: [
                        { type: "text", text: "Analyze this medicine image." },
                        { type: "image_url", image_url: { url: image, detail: "high" } },
                    ],
                },
            ],
        });

        const result = completion.choices[0]?.message?.content || "Unable to analyze image.";
        return NextResponse.json({ result, provider: runtime.provider });
    } catch (error: any) {
        return apiError(error.message || "Failed to analyze image", 500);
    }
}
