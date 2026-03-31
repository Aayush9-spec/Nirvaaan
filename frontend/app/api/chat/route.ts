import { NextResponse } from "next/server";
import { getAiRuntime, parseJsonObject } from "@/lib/server-ai";

type ChatRole = "user" | "assistant" | "system";

type GuidedResult = {
    risk: "Low" | "Medium" | "High" | "Critical";
    urgency: string;
    diagnosis: string;
    specialist: string;
    advice: string;
    disclaimer: string;
};

function normalizeRole(value: unknown): ChatRole | null {
    if (value === "user") return "user";
    if (value === "assistant" || value === "ai") return "assistant";
    if (value === "system") return "system";
    return null;
}

function sanitizeMessages(
    input: unknown
): Array<{ role: ChatRole; content: string }> {
    if (!Array.isArray(input)) return [];

    return input
        .map((entry) => {
            const role = normalizeRole((entry as { role?: unknown }).role);
            const content = String((entry as { content?: unknown }).content ?? "").trim();
            if (!role || !content) return null;
            return { role, content };
        })
        .filter((entry): entry is { role: ChatRole; content: string } => Boolean(entry));
}

function fallbackGuidedAnalysis(userText: string): GuidedResult {
    const hasFever = /fever/i.test(userText);
    const hasChestPain = /chest pain/i.test(userText);
    const hasSevere = /severe/i.test(userText);
    const hasHeadache = /headache/i.test(userText);

    if (hasChestPain) {
        return {
            risk: "High",
            urgency: "Visit a doctor immediately",
            diagnosis: "Potential Cardiac Event — requires ECG and urgent evaluation",
            specialist: "Cardiologist",
            advice: "Do not ignore chest pain. Sit down, avoid exertion, and seek emergency medical attention immediately.",
            disclaimer: "This is an AI-generated assessment. Chest pain can be serious. Contact emergency services if symptoms are severe.",
        };
    }

    if (hasSevere) {
        return {
            risk: "High",
            urgency: "Consult a doctor today",
            diagnosis: hasFever ? "Acute viral illness with possible bacterial superinfection" : "Condition requiring urgent clinical evaluation",
            specialist: "General Physician",
            advice: "Your symptoms need same-day medical review. Hydrate well, rest, and avoid self-medication until assessed by a doctor.",
            disclaimer: "This is an AI-generated assessment. Always consult a qualified healthcare professional for diagnosis.",
        };
    }

    if (hasFever) {
        return {
            risk: "Medium",
            urgency: "Consult within 24 hours",
            diagnosis: "Viral Fever / Upper Respiratory Infection",
            specialist: "General Physician",
            advice: "Hydrate, rest, and monitor temperature. Seek medical care quickly if fever persists or rises above 103°F.",
            disclaimer: "This is an AI-generated assessment. Always consult a qualified healthcare professional for diagnosis.",
        };
    }

    if (hasHeadache) {
        return {
            risk: "Low",
            urgency: "Monitor for 2-3 days",
            diagnosis: "Tension Headache / Stress-related headache",
            specialist: "General Physician",
            advice: "Prioritize rest, hydration, and reduced screen strain. Consult a doctor if headaches become frequent or severe.",
            disclaimer: "This is an AI-generated assessment. Always consult a qualified healthcare professional for diagnosis.",
        };
    }

    return {
        risk: "Low",
        urgency: "Monitor for 2-3 days",
        diagnosis: "General discomfort — likely self-limiting",
        specialist: "General Physician",
        advice: "Stay hydrated, sleep well, and monitor your symptoms. Book an appointment if symptoms worsen or persist.",
        disclaimer: "This is an AI-generated assessment. Always consult a qualified healthcare professional for diagnosis.",
    };
}

function normalizeGuidedResult(parsed: Partial<GuidedResult> | null, fallback: GuidedResult): GuidedResult {
    if (!parsed) return fallback;

    const safeRisk = parsed.risk;
    const allowedRisk: GuidedResult["risk"][] = ["Low", "Medium", "High", "Critical"];
    const risk = allowedRisk.includes(safeRisk as GuidedResult["risk"]) ? (safeRisk as GuidedResult["risk"]) : fallback.risk;

    return {
        risk,
        urgency: String(parsed.urgency || fallback.urgency),
        diagnosis: String(parsed.diagnosis || fallback.diagnosis),
        specialist: String(parsed.specialist || fallback.specialist),
        advice: String(parsed.advice || fallback.advice),
        disclaimer: String(
            parsed.disclaimer || "This is an AI-generated assessment. Always consult a qualified healthcare professional."
        ),
    };
}

export async function POST(req: Request) {
    let guided = false;
    let latestUserMessage = "";

    try {
        const body = await req.json();
        guided = Boolean(body?.guided);
        const messages = sanitizeMessages(body?.messages);
        latestUserMessage =
            [...messages].reverse().find((message) => message.role === "user")?.content || "";

        const runtime = getAiRuntime("chat");

        if (!runtime) {
            if (guided) {
                return NextResponse.json({ structured: fallbackGuidedAnalysis(latestUserMessage) }, { status: 200 });
            }

            return NextResponse.json(
                {
                    role: "assistant",
                    content:
                        "AI provider is not configured yet. Please set OPENROUTER_API_KEY or GROQ_API_KEY in environment variables.",
                },
                { status: 200 }
            );
        }

        const systemPrompt = guided
            ? `You are NIRVAAAN. Analyze the patient's symptoms and return ONLY valid JSON:
{
  "risk": "Low | Medium | High | Critical",
  "urgency": "short urgency guidance",
  "diagnosis": "most likely condition",
  "specialist": "recommended specialist",
  "advice": "2-3 concise care sentences",
  "disclaimer": "short AI disclaimer"
}`
            : `You are NIRVAAAN, an advanced medical assistant.
- Analyze symptoms and suggest safe next actions.
- Keep responses concise, empathetic, and medically grounded.
- Never claim certainty.
- Always end with: "I am an AI, not a doctor. Please consult a professional."`;

        const completion = await runtime.client.chat.completions.create({
            model: runtime.model,
            temperature: guided ? 0.2 : 0.6,
            max_tokens: guided ? 500 : 900,
            messages: [
                { role: "system", content: systemPrompt },
                ...messages,
            ],
        });

        const content = completion.choices[0]?.message?.content?.trim() || "";

        if (guided) {
            const fallback = fallbackGuidedAnalysis(latestUserMessage);
            const parsed = parseJsonObject<Partial<GuidedResult>>(content);
            return NextResponse.json({ structured: normalizeGuidedResult(parsed, fallback) }, { status: 200 });
        }

        return NextResponse.json(
            {
                role: "assistant",
                content: content || "I could not generate a response. Please try again.",
                provider: runtime.provider,
            },
            { status: 200 }
        );
    } catch (error) {
        console.error("AI Chat Error:", error);
        if (guided) {
            return NextResponse.json(
                { structured: fallbackGuidedAnalysis(latestUserMessage) },
                { status: 200 }
            );
        }

        return NextResponse.json(
            {
                role: "assistant",
                content:
                    "I am temporarily unable to reach the AI provider. Please try again in a moment. I am an AI, not a doctor. Please consult a professional.",
            },
            { status: 200 }
        );
    }
}
