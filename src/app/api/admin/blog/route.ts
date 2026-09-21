import { NextResponse } from "next/server";
import { getSupabaseAdmin } from "@/lib/supabase-admin";
import { slugify } from "@/lib/blog";

const MAX_TITLE_LENGTH = 200;
const MAX_EXCERPT_LENGTH = 500;
const MAX_CONTENT_LENGTH = 50_000;
const MAX_TAGS = 6;
const MAX_TAG_LENGTH = 40;

async function uniqueSlug(
  supabase: ReturnType<typeof getSupabaseAdmin>,
  title: string
): Promise<string> {
  const base = slugify(title) || "post";
  let candidate = base;
  let suffix = 2;
  while (true) {
    const { data } = await supabase!
      .from("blog_posts")
      .select("id")
      .eq("slug", candidate)
      .maybeSingle();
    if (!data) return candidate;
    candidate = `${base}-${suffix}`;
    suffix += 1;
  }
}

export async function POST(request: Request) {
  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Corpo inválido." }, { status: 400 });
  }

  const { title, excerpt, content, tags, published } = (body ?? {}) as {
    title?: unknown;
    excerpt?: unknown;
    content?: unknown;
    tags?: unknown;
    published?: unknown;
  };

  const trimmedTitle = typeof title === "string" ? title.trim() : "";
  if (!trimmedTitle || trimmedTitle.length > MAX_TITLE_LENGTH) {
    return NextResponse.json({ error: "Informe um título válido." }, { status: 400 });
  }

  const trimmedExcerpt = typeof excerpt === "string" ? excerpt.trim() : "";
  if (!trimmedExcerpt || trimmedExcerpt.length > MAX_EXCERPT_LENGTH) {
    return NextResponse.json({ error: "Informe um resumo válido." }, { status: 400 });
  }

  const trimmedContent = typeof content === "string" ? content.trim() : "";
  if (!trimmedContent || trimmedContent.length > MAX_CONTENT_LENGTH) {
    return NextResponse.json({ error: "Informe o conteúdo do post." }, { status: 400 });
  }

  const cleanTags = Array.isArray(tags)
    ? tags
        .filter((t): t is string => typeof t === "string" && t.trim().length > 0)
        .map((t) => t.trim().slice(0, MAX_TAG_LENGTH))
        .slice(0, MAX_TAGS)
    : [];

  const isPublished = published === true;

  const supabase = getSupabaseAdmin();
  if (!supabase) {
    return NextResponse.json(
      { error: "Supabase ainda não está configurado." },
      { status: 503 }
    );
  }

  const slug = await uniqueSlug(supabase, trimmedTitle);

  const { data, error } = await supabase
    .from("blog_posts")
    .insert({
      slug,
      title: trimmedTitle,
      excerpt: trimmedExcerpt,
      content: trimmedContent,
      tags: cleanTags,
      published: isPublished,
      published_at: isPublished ? new Date().toISOString() : null,
    })
    .select("id, slug")
    .maybeSingle();

  if (error || !data) {
    console.error("[admin/blog] insert failed:", error?.message);
    return NextResponse.json(
      { error: "Não foi possível publicar agora." },
      { status: 500 }
    );
  }

  return NextResponse.json({ ok: true, id: data.id, slug: data.slug });
}
