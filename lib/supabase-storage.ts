import { createClient } from "@/utils/supabase/client";

/**
 * Upload a profile avatar image.
 * Stores under: avatars/{userId}/avatar.{ext}
 */
export async function uploadAvatar(userId: string, file: File): Promise<string | null> {
    const supabase = createClient();
    const ext = file.name.split(".").pop() || "png";
    const path = `${userId}/avatar.${ext}`;

    const { error } = await supabase.storage
        .from("avatars")
        .upload(path, file, { upsert: true });

    if (error) {
        console.error("Avatar upload error:", error.message);
        return null;
    }

    const { data: urlData } = supabase.storage
        .from("avatars")
        .getPublicUrl(path);

    // Update profile with avatar URL
    await supabase
        .from("profiles")
        .update({ avatar_url: urlData.publicUrl })
        .eq("id", userId);

    return urlData.publicUrl;
}

/**
 * Get avatar URL for a user.
 */
export function getAvatarUrl(userId: string): string {
    const supabase = createClient();
    // List approach — find the file first
    const { data } = supabase.storage
        .from("avatars")
        .getPublicUrl(`${userId}/avatar.png`);
    return data.publicUrl;
}

/**
 * Upload a medical document (PDF, image, etc.).
 * Stores under: medical-docs/{userId}/{filename}
 */
export async function uploadMedicalDocument(
    userId: string,
    file: File,
    label?: string
): Promise<{ path: string; name: string } | null> {
    const supabase = createClient();
    const timestamp = Date.now();
    const safeName = file.name.replace(/[^a-zA-Z0-9._-]/g, "_");
    const path = `${userId}/${timestamp}_${safeName}`;

    const { error } = await supabase.storage
        .from("medical-docs")
        .upload(path, file);

    if (error) {
        console.error("Document upload error:", error.message);
        return null;
    }

    return { path, name: label || file.name };
}

/**
 * List a user's uploaded medical documents.
 */
export async function getUserDocuments(userId: string): Promise<
    { name: string; path: string; size: number; created: string }[]
> {
    const supabase = createClient();

    const { data, error } = await supabase.storage
        .from("medical-docs")
        .list(userId, { sortBy: { column: "created_at", order: "desc" } });

    if (error || !data) return [];

    return data.map((f) => ({
        name: f.name.replace(/^\d+_/, ""), // strip timestamp prefix
        path: `${userId}/${f.name}`,
        size: f.metadata?.size || 0,
        created: f.created_at,
    }));
}

/**
 * Get a signed URL for a private medical document.
 */
export async function getDocumentUrl(path: string): Promise<string | null> {
    const supabase = createClient();

    const { data, error } = await supabase.storage
        .from("medical-docs")
        .createSignedUrl(path, 3600); // 1 hour expiry

    if (error) return null;
    return data.signedUrl;
}

/**
 * Delete a medical document.
 */
export async function deleteDocument(path: string): Promise<boolean> {
    const supabase = createClient();

    const { error } = await supabase.storage
        .from("medical-docs")
        .remove([path]);

    return !error;
}
