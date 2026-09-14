import { randomUUID } from "crypto";
import { getSupabaseAdmin } from "@/lib/supabase-admin";

export const MAX_PHOTO_BYTES = 4 * 1024 * 1024; // Vercel serverless functions rejeitam corpos > 4.5MB.
export const PHOTO_MIME_EXTENSIONS: Record<string, string> = {
  "image/jpeg": "jpg",
  "image/png": "png",
  "image/webp": "webp",
};

export function validatePhotoFile(value: unknown): { photo?: File } | { error: string } {
  if (!(value instanceof File) || value.size === 0) {
    return {};
  }
  if (!PHOTO_MIME_EXTENSIONS[value.type]) {
    return { error: "A foto precisa ser JPG, PNG ou WEBP." };
  }
  if (value.size > MAX_PHOTO_BYTES) {
    return { error: "A foto precisa ter no máximo 4MB." };
  }
  return { photo: value };
}

/** Retorna a URL pública da foto enviada, ou null se o upload falhar. */
export async function uploadProfessionalPhoto(
  supabase: NonNullable<ReturnType<typeof getSupabaseAdmin>>,
  photo: File
): Promise<string | null> {
  const ext = PHOTO_MIME_EXTENSIONS[photo.type];
  const path = `${randomUUID()}.${ext}`;
  const { error } = await supabase.storage
    .from("professional-photos")
    .upload(path, photo, { contentType: photo.type });

  if (error) {
    console.error("[photo-upload] Failed to upload photo:", error.message);
    return null;
  }

  return supabase.storage.from("professional-photos").getPublicUrl(path).data.publicUrl;
}
