import OpenAI from "openai";

type Task = "chat" | "vision";
type Provider = "groq" | "openrouter" | "openai";

const INVALID_KEYS = new Set([
    "",
    "dummy",
    "your-api-key-here",
    "PASTE_YOUR_NEW_KEY_HERE",
    "placeholder",
    "placeholder-key",
]);

function clean(value: string | undefined): string {
    return (value || "").trim();
}

function hasValidKey(value: string | undefined): boolean {
    const key = clean(value);
    return Boolean(key) && !INVALID_KEYS.has(key);
}

function toProvider(value: string | undefined): Provider | null {
    const normalized = clean(value).toLowerCase();
    if (normalized === "groq" || normalized === "openrouter" || normalized === "openai") {
        return normalized;
    }
    return null;
}

function getClient(provider: Provider): OpenAI | null {
    if (provider === "groq") {
        if (!hasValidKey(process.env.GROQ_API_KEY)) return null;
        return new OpenAI({
            apiKey: process.env.GROQ_API_KEY,
            baseURL: process.env.GROQ_BASE_URL || "https://api.groq.com/openai/v1",
        });
    }

    if (provider === "openrouter") {
        if (!hasValidKey(process.env.OPENROUTER_API_KEY)) return null;
        return new OpenAI({
            apiKey: process.env.OPENROUTER_API_KEY,
            baseURL: process.env.OPENROUTER_BASE_URL || "https://openrouter.ai/api/v1",
            defaultHeaders: {
                "HTTP-Referer": process.env.NEXT_PUBLIC_APP_URL || "https://health-ai-murex-zeta.vercel.app",
                "X-Title": "NIRVAAAN Platform",
            },
        });
    }

    if (!hasValidKey(process.env.OPENAI_API_KEY)) return null;
    return new OpenAI({
        apiKey: process.env.OPENAI_API_KEY,
    });
}

function modelFor(provider: Provider, task: Task): string {
    if (provider === "groq") {
        return process.env.GROQ_MODEL || "llama-3.3-70b-versatile";
    }

    if (provider === "openrouter") {
        if (task === "vision") {
            return process.env.OPENROUTER_VISION_MODEL || process.env.OPENROUTER_MODEL || "openai/gpt-4o-mini";
        }
        return process.env.OPENROUTER_MODEL || "openai/gpt-4o-mini";
    }

    if (task === "vision") {
        return process.env.OPENAI_VISION_MODEL || process.env.OPENAI_MODEL || "gpt-4o-mini";
    }
    return process.env.OPENAI_MODEL || "gpt-4o-mini";
}

export function getAiRuntime(task: Task): { client: OpenAI; provider: Provider; model: string } | null {
    const providerOverride = toProvider(process.env.AI_PROVIDER);

    const textPriority: Provider[] = providerOverride
        ? [providerOverride, "groq", "openrouter", "openai"]
        : ["groq", "openrouter", "openai"];

    const visionPriority: Provider[] = providerOverride
        ? [providerOverride, "openrouter", "openai"]
        : ["openrouter", "openai"];

    const providers = task === "vision" ? visionPriority : textPriority;

    for (const provider of providers) {
        if (task === "vision" && provider === "groq") {
            continue;
        }

        const client = getClient(provider);
        if (!client) continue;

        return {
            client,
            provider,
            model: modelFor(provider, task),
        };
    }

    return null;
}

export function parseJsonObject<T = Record<string, unknown>>(raw: string | null | undefined): T | null {
    if (!raw) return null;

    const trimmed = raw.trim();
    try {
        return JSON.parse(trimmed) as T;
    } catch {
        const match = trimmed.match(/\{[\s\S]*\}/);
        if (!match) return null;
        try {
            return JSON.parse(match[0]) as T;
        } catch {
            return null;
        }
    }
}

