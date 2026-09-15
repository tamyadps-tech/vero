import { randomUUID } from "crypto";
import { getSupabaseAdmin } from "@/lib/supabase-admin";

export const MAX_PHOTO_BYTES = 4 * 1024 * 1024; // Vercel serverless functions rejeitam corpos > 4.5MB.
export const PHOTO_MIME_EXTENSIONS: Record<string, string> = {
  "image/jpeg": "jpg",
  "image/png": "png",
  "image/webp": "webp",
};

export const MAX_PORTFOLIO_PHOTOS = 10;

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

/** Como `validatePhotoFile`, mas pra uma lista (portfólio) — rejeita qualquer arquivo inválido da lista. */
export function validatePortfolioFiles(
  value: unknown
): { photos: File[] } | { error: string } {
  const files = (Array.isArray(value) ? value : [value]).filter(
    (item): item is File => item instanceof File && item.size > 0
  );
  if (files.length > MAX_PORTFOLIO_PHOTOS) {
    return { error: `Envie no máximo ${MAX_PORTFOLIO_PHOTOS} fotos por vez.` };
  }
  for (const file of files) {
    const result = validatePhotoFile(file);
    if ("error" in result) return { error: result.error };
  }
  return { photos: files };
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

/** Sobe várias fotos de portfólio; ignora silenciosamente qualquer uma que falhar no upload. */
export async function uploadPortfolioPhotos(
  supabase: NonNullable<ReturnType<typeof getSupabaseAdmin>>,
  photos: File[]
): Promise<string[]> {
  const urls: string[] = [];
  for (const photo of photos) {
    const ext = PHOTO_MIME_EXTENSIONS[photo.type];
    const path = `portfolio/${randomUUID()}.${ext}`;
    const { error } = await supabase.storage
      .from("professional-photos")
      .upload(path, photo, { contentType: photo.type });

    if (error) {
      console.error("[photo-upload] Failed to upload portfolio photo:", error.message);
      continue;
    }
    urls.push(supabase.storage.from("professional-photos").getPublicUrl(path).data.publicUrl);
  }
  return urls;
}
