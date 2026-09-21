import { NextResponse } from "next/server";
import { getSupabaseAdmin } from "@/lib/supabase-admin";

const MAX_TITLE_LENGTH = 200;
const MAX_EXCERPT_LENGTH = 500;
const MAX_CONTENT_LENGTH = 50_000;
const MAX_TAGS = 6;
const MAX_TAG_LENGTH = 40;

export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;

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

  const update: Record<string, unknown> = { updated_at: new Date().toISOString() };

  if (title !== undefined) {
    const trimmedTitle = typeof title === "string" ? title.trim() : "";
    if (!trimmedTitle || trimmedTitle.length > MAX_TITLE_LENGTH) {
      return NextResponse.json({ error: "Informe um título válido." }, { status: 400 });
    }
    update.title = trimmedTitle;
  }

  if (excerpt !== undefined) {
    const trimmedExcerpt = typeof excerpt === "string" ? excerpt.trim() : "";
    if (!trimmedExcerpt || trimmedExcerpt.length > MAX_EXCERPT_LENGTH) {
      return NextResponse.json({ error: "Informe um resumo válido." }, { status: 400 });
    }
    update.excerpt = trimmedExcerpt;
  }

  if (content !== undefined) {
    const trimmedContent = typeof content === "string" ? content.trim() : "";
    if (!trimmedContent || trimmedContent.length > MAX_CONTENT_LENGTH) {
      return NextResponse.json({ error: "Informe o conteúdo do post." }, { status: 400 });
    }
    update.content = trimmedContent;
  }

  if (tags !== undefined) {
    update.tags = Array.isArray(tags)
      ? tags
          .filter((t): t is string => typeof t === "string" && t.trim().length > 0)
          .map((t) => t.trim().slice(0, MAX_TAG_LENGTH))
          .slice(0, MAX_TAGS)
      : [];
  }

  if (published !== undefined) {
    update.published = published === true;
    if (published === true) {
      update.published_at = new Date().toISOString();
    }
  }

  const supabase = getSupabaseAdmin();
  if (!supabase) {
    return NextResponse.json(
      { error: "Supabase ainda não está configurado." },
      { status: 503 }
    );
  }

  const { error } = await supabase.from("blog_posts").update(update).eq("id", id);

  if (error) {
    console.error("[admin/blog] update failed:", error.message);
    return NextResponse.json(
      { error: "Não foi possível salvar agora." },
      { status: 500 }
    );
  }

  return NextResponse.json({ ok: true });
}

export async function DELETE(
  _request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;

  const supabase = getSupabaseAdmin();
  if (!supabase) {
    return NextResponse.json(
      { error: "Supabase ainda não está configurado." },
      { status: 503 }
    );
  }

  const { error } = await supabase.from("blog_posts").delete().eq("id", id);

  if (error) {
    console.error("[admin/blog] delete failed:", error.message);
    return NextResponse.json(
      { error: "Não foi possível remover agora." },
      { status: 500 }
    );
  }

  return NextResponse.json({ ok: true });
}
