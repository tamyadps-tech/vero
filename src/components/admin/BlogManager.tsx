"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import type { AdminBlogPost } from "@/lib/blog";

const dateFormatter = new Intl.DateTimeFormat("pt-BR", { dateStyle: "short", timeStyle: "short" });

interface FormState {
  title: string;
  excerpt: string;
  content: string;
  tags: string;
  published: boolean;
}

const EMPTY_FORM: FormState = { title: "", excerpt: "", content: "", tags: "", published: false };

export function BlogManager({ posts }: { posts: AdminBlogPost[] }) {
  const router = useRouter();
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [form, setForm] = useState<FormState>(EMPTY_FORM);
  const [pending, setPending] = useState(false);
  const [error, setError] = useState("");

  function startCreate() {
    setEditingId(null);
    setForm(EMPTY_FORM);
    setShowForm(true);
    setError("");
  }

  function startEdit(post: AdminBlogPost) {
    setEditingId(post.id);
    setForm({
      title: post.title,
      excerpt: post.excerpt,
      content: post.content,
      tags: post.tags.join(", "),
      published: post.published,
    });
    setShowForm(true);
    setError("");
  }

  async function submit() {
    if (!form.title.trim() || !form.excerpt.trim() || !form.content.trim()) {
      setError("Preencha título, resumo e conteúdo.");
      return;
    }

    setPending(true);
    setError("");
    try {
      const payload = {
        title: form.title.trim(),
        excerpt: form.excerpt.trim(),
        content: form.content.trim(),
        tags: form.tags
          .split(",")
          .map((t) => t.trim())
          .filter(Boolean),
        published: form.published,
      };

      const response = await fetch(
        editingId ? `/api/admin/blog/${editingId}` : "/api/admin/blog",
        {
          method: editingId ? "PATCH" : "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload),
        }
      );
      if (!response.ok) {
        const data = await response.json().catch(() => ({}));
        throw new Error(data.error ?? "Não foi possível salvar agora.");
      }
      setShowForm(false);
      setEditingId(null);
      setForm(EMPTY_FORM);
      router.refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Erro inesperado.");
    } finally {
      setPending(false);
    }
  }

  async function togglePublished(post: AdminBlogPost) {
    setPending(true);
    setError("");
    try {
      const response = await fetch(`/api/admin/blog/${post.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ published: !post.published }),
      });
      if (!response.ok) {
        const data = await response.json().catch(() => ({}));
        throw new Error(data.error ?? "Não foi possível atualizar agora.");
      }
      router.refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Erro inesperado.");
    } finally {
      setPending(false);
    }
  }

  async function removePost(postId: string) {
    if (!window.confirm("Remover esse post? Não dá pra desfazer.")) return;

    setPending(true);
    setError("");
    try {
      const response = await fetch(`/api/admin/blog/${postId}`, { method: "DELETE" });
      if (!response.ok) {
        const data = await response.json().catch(() => ({}));
        throw new Error(data.error ?? "Não foi possível remover agora.");
      }
      router.refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Erro inesperado.");
    } finally {
      setPending(false);
    }
  }

  return (
    <div>
      <div className="flex items-center justify-between">
        <p className="text-sm text-ink-soft">
          {posts.length} post{posts.length === 1 ? "" : "s"} — dados/argumentos que sustentam a
          landing e dão material pra divulgação.
        </p>
        <button
          type="button"
          onClick={() => (showForm ? setShowForm(false) : startCreate())}
          className="rounded-xl border border-primary px-4 py-2 text-sm font-semibold text-primary-dark transition hover:bg-primary-light"
        >
          {showForm ? "Cancelar" : "+ Novo post"}
        </button>
      </div>

      {showForm && (
        <div className="mt-4 space-y-3 rounded-2xl border border-border bg-paper p-5">
          <div>
            <label className="mb-1.5 block text-xs font-medium text-ink" htmlFor="blog-title">
              Título
            </label>
            <input
              id="blog-title"
              value={form.title}
              onChange={(e) => setForm((f) => ({ ...f, title: e.target.value }))}
              className="w-full rounded-xl border border-border bg-paper px-3 py-2 text-sm text-ink"
              placeholder="Sinais de que pode ser hora de buscar terapia"
            />
          </div>
          <div>
            <label className="mb-1.5 block text-xs font-medium text-ink" htmlFor="blog-excerpt">
              Resumo (aparece na listagem e nos compartilhamentos)
            </label>
            <textarea
              id="blog-excerpt"
              value={form.excerpt}
              onChange={(e) => setForm((f) => ({ ...f, excerpt: e.target.value }))}
              rows={2}
              className="w-full rounded-xl border border-border bg-paper px-3 py-2 text-sm text-ink"
            />
          </div>
          <div>
            <label className="mb-1.5 block text-xs font-medium text-ink" htmlFor="blog-content">
              Conteúdo (aceita Markdown — # título, **negrito**, listas com -)
            </label>
            <textarea
              id="blog-content"
              value={form.content}
              onChange={(e) => setForm((f) => ({ ...f, content: e.target.value }))}
              rows={14}
              className="w-full rounded-xl border border-border bg-paper px-3 py-2 font-mono text-sm text-ink"
            />
          </div>
          <div className="flex flex-wrap items-end gap-4">
            <div className="min-w-48 flex-1">
              <label className="mb-1.5 block text-xs font-medium text-ink" htmlFor="blog-tags">
                Tags (separadas por vírgula)
              </label>
              <input
                id="blog-tags"
                value={form.tags}
                onChange={(e) => setForm((f) => ({ ...f, tags: e.target.value }))}
                className="w-full rounded-xl border border-border bg-paper px-3 py-2 text-sm text-ink"
                placeholder="saúde mental, ansiedade"
              />
            </div>
            <label className="flex items-center gap-2 pb-2 text-sm text-ink">
              <input
                type="checkbox"
                checked={form.published}
                onChange={(e) => setForm((f) => ({ ...f, published: e.target.checked }))}
              />
              Publicar (fica visível em /blog)
            </label>
            <button
              type="button"
              disabled={pending}
              onClick={submit}
              className="rounded-xl bg-primary px-5 py-2.5 text-sm font-semibold text-paper transition hover:bg-primary-dark disabled:opacity-60"
            >
              {editingId ? "Salvar alterações" : "Criar post"}
            </button>
          </div>
        </div>
      )}

      {error && (
        <p role="alert" className="mt-2 text-sm text-accent-dark">
          {error}
        </p>
      )}

      <ul className="mt-6 space-y-2">
        {posts.length === 0 && (
          <li className="text-sm text-ink-soft">Nenhum post ainda.</li>
        )}
        {posts.map((post) => (
          <li
            key={post.id}
            className="flex flex-wrap items-center justify-between gap-2 rounded-xl border border-border bg-paper px-4 py-3 text-sm"
          >
            <div>
              <p className="font-medium text-ink">
                {post.title}{" "}
                <span
                  className={`ml-1 rounded-full px-2 py-0.5 text-xs ${
                    post.published
                      ? "bg-primary-light text-primary-dark"
                      : "bg-paper-alt text-ink-soft"
                  }`}
                >
                  {post.published ? "Publicado" : "Rascunho"}
                </span>
              </p>
              <p className="mt-0.5 text-xs text-ink-soft">
                Atualizado em {dateFormatter.format(new Date(post.updatedAt))}
                {post.tags.length > 0 && ` · ${post.tags.join(", ")}`}
              </p>
            </div>
            <div className="flex items-center gap-3 text-xs font-medium">
              {post.published && (
                <Link href={`/blog/${post.slug}`} target="_blank" className="text-primary hover:underline">
                  Ver no site
                </Link>
              )}
              <button
                type="button"
                disabled={pending}
                onClick={() => togglePublished(post)}
                className="text-ink-soft hover:text-ink disabled:opacity-60"
              >
                {post.published ? "Despublicar" : "Publicar"}
              </button>
              <button
                type="button"
                disabled={pending}
                onClick={() => startEdit(post)}
                className="text-ink-soft hover:text-ink disabled:opacity-60"
              >
                Editar
              </button>
              <button
                type="button"
                disabled={pending}
                onClick={() => removePost(post.id)}
                className="text-ink-soft hover:text-accent-dark disabled:opacity-60"
              >
                Remover
              </button>
            </div>
          </li>
        ))}
      </ul>
    </div>
  );
}
