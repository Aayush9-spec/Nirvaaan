import { NextResponse } from "next/server";
import { getAiRuntime } from "@/lib/server-ai";

export async function POST(req: Request) {
    try {
        const { image } = await req.json();

        if (!image) {
            return NextResponse.json({ error: "No image provided" }, { status: 400 });
        }

        const runtime = getAiRuntime("vision");

        if (!runtime) {
            await new Promise((resolve) => setTimeout(resolve, 1200));
            return NextResponse.json({
                result:
                    "### 💊 Medicine Scan Preview\n\n- Unable to run live scan because no vision-capable AI provider is configured.\n- Add `OPENROUTER_API_KEY` (recommended) or `OPENAI_API_KEY` to enable real medicine analysis.\n\n⚠️ This is an AI analysis. Always verify with a licensed pharmacist.",
            });
        }

        const completion = await runtime.client.chat.completions.create({
            model: runtime.model,
            max_tokens: 1000,
            messages: [
                {
                    role: "system",
                    content: `You are NIRVAAAN Medicine Scanner.
Analyze medicine image content and provide:
1) Medicine name
2) Active ingredients
3) Category
4) Common uses
5) Dosage guidance (if visible)
6) Expiry/batch details (if visible)
7) Warnings
8) Authenticity cues
If image is not medicine, clearly say so.
End with: "⚠️ This is an AI analysis. Always verify with a licensed pharmacist."`,
                },
                {
                    role: "user",
                    content: [
                        {
                            type: "text",
                            text: "Analyze this medicine image. Identify medicine details and safety notes.",
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
        return NextResponse.json({ result, provider: runtime.provider });
    } catch (error: unknown) {
        console.error("Scan API Error:", error);
        return NextResponse.json(
            { error: "Failed to analyze medicine image" },
            { status: 500 }
        );
    }
}

