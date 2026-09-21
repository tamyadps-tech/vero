import { AdminNav } from "@/components/admin/AdminNav";
import { BlogManager } from "@/components/admin/BlogManager";
import { listAllPostsAdmin } from "@/lib/blog";

export const dynamic = "force-dynamic";

export default async function AdminBlogPage() {
  const posts = await listAllPostsAdmin();

  return (
    <>
      <AdminNav active="/admin/blog" />
      <main className="mx-auto max-w-5xl px-6 py-10">
        <h1 className="text-2xl font-semibold tracking-tight text-ink">Blog</h1>
        <p className="mt-1 text-sm text-ink-soft">
          Conteúdo com dados e argumentos sobre saúde mental e desenvolvimento — sustenta a
          landing e dá material pra divulgar nas redes.
        </p>

        <div className="mt-8">
          {posts === null ? (
            <div className="rounded-2xl border border-dashed border-border bg-paper-alt/40 p-8 text-center">
              <p className="font-medium text-ink">Supabase ainda não está configurado.</p>
            </div>
          ) : (
            <BlogManager posts={posts} />
          )}
        </div>
      </main>
    </>
  );
}
