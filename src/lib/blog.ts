import { marked } from "marked";
import { getSupabaseAdmin } from "@/lib/supabase-admin";

export interface BlogPostSummary {
  id: string;
  slug: string;
  title: string;
  excerpt: string;
  tags: string[];
  publishedAt: string;
}

export interface BlogPost extends BlogPostSummary {
  content: string;
}

export interface AdminBlogPost extends BlogPost {
  published: boolean;
  updatedAt: string;
}

/** "Como escolher seu terapeuta" -> "como-escolher-seu-terapeuta" */
export function slugify(title: string): string {
  return title
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 80);
}

export function renderBlogContent(markdown: string): string {
  return marked.parse(markdown) as string;
}

/** Retorna null quando o Supabase ainda não está configurado. */
export async function listPublishedPosts(): Promise<BlogPostSummary[] | null> {
  const supabase = getSupabaseAdmin();
  if (!supabase) return null;

  const { data, error } = await supabase
    .from("blog_posts")
    .select("id, slug, title, excerpt, tags, published_at")
    .eq("published", true)
    .order("published_at", { ascending: false });

  if (error) {
    console.error("[blog] Failed to list published posts:", error.message);
    return [];
  }

  return (data ?? []).map((row) => ({
    id: row.id,
    slug: row.slug,
    title: row.title,
    excerpt: row.excerpt,
    tags: row.tags,
    publishedAt: row.published_at,
  }));
}

export async function getPublishedPostBySlug(slug: string): Promise<BlogPost | null> {
  const supabase = getSupabaseAdmin();
  if (!supabase) return null;

  const { data, error } = await supabase
    .from("blog_posts")
    .select("id, slug, title, excerpt, content, tags, published_at")
    .eq("slug", slug)
    .eq("published", true)
    .maybeSingle();

  if (error || !data) return null;

  return {
    id: data.id,
    slug: data.slug,
    title: data.title,
    excerpt: data.excerpt,
    content: data.content,
    tags: data.tags,
    publishedAt: data.published_at,
  };
}

export async function listAllPostsAdmin(): Promise<AdminBlogPost[] | null> {
  const supabase = getSupabaseAdmin();
  if (!supabase) return null;

  const { data, error } = await supabase
    .from("blog_posts")
    .select("id, slug, title, excerpt, content, tags, published, published_at, updated_at")
    .order("created_at", { ascending: false });

  if (error) {
    console.error("[blog] Failed to list posts (admin):", error.message);
    return [];
  }

  return (data ?? []).map((row) => ({
    id: row.id,
    slug: row.slug,
    title: row.title,
    excerpt: row.excerpt,
    content: row.content,
    tags: row.tags,
    published: row.published,
    publishedAt: row.published_at,
    updatedAt: row.updated_at,
  }));
}
