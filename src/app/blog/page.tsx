import type { Metadata } from "next";
import Link from "next/link";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { listPublishedPosts } from "@/lib/blog";

export const metadata: Metadata = {
  title: "Blog — Vero",
  description:
    "Dados, estudos e reflexões sobre saúde mental e desenvolvimento pessoal — pra ajudar você a dar o primeiro passo.",
};

export const dynamic = "force-dynamic";

const dateFormatter = new Intl.DateTimeFormat("pt-BR", { dateStyle: "long" });

export default async function BlogPage() {
  const posts = await listPublishedPosts();

  return (
    <>
      <Header />
      <main className="flex-1">
        <section className="mx-auto max-w-4xl px-6 py-16">
          <h1 className="font-display text-3xl font-medium tracking-tight text-ink sm:text-4xl">
            Blog
          </h1>
          <p className="mt-2 text-ink-soft">
            Dados, estudos e reflexões sobre saúde mental e desenvolvimento pessoal — pra
            ajudar você a dar o primeiro passo.
          </p>

          {posts === null ? (
            <div className="mt-10 rounded-2xl border border-dashed border-border bg-paper-alt/40 p-8 text-center">
              <p className="font-medium text-ink">Supabase ainda não está configurado.</p>
            </div>
          ) : posts.length === 0 ? (
            <div className="mt-10 rounded-2xl border border-dashed border-border bg-paper-alt/40 p-8 text-center">
              <p className="font-medium text-ink">Ainda não publicamos nenhum post.</p>
              <p className="mt-1 text-sm text-ink-soft">Volte em breve.</p>
            </div>
          ) : (
            <div className="mt-10 space-y-5">
              {posts.map((post) => (
                <Link
                  key={post.id}
                  href={`/blog/${post.slug}`}
                  className="block rounded-2xl border border-border bg-paper p-6 shadow-soft transition hover:-translate-y-0.5 hover:shadow-lifted"
                >
                  <p className="text-xs text-ink-soft">
                    {dateFormatter.format(new Date(post.publishedAt))}
                  </p>
                  <h2 className="mt-1 font-display text-xl font-medium text-ink">
                    {post.title}
                  </h2>
                  <p className="mt-2 text-sm leading-relaxed text-ink-soft">{post.excerpt}</p>
                  {post.tags.length > 0 && (
                    <p className="mt-3 flex flex-wrap gap-1.5">
                      {post.tags.map((tag) => (
                        <span
                          key={tag}
                          className="rounded-full bg-paper-alt px-2.5 py-0.5 text-xs text-ink-soft"
                        >
                          {tag}
                        </span>
                      ))}
                    </p>
                  )}
                </Link>
              ))}
            </div>
          )}
        </section>
      </main>
      <Footer />
    </>
  );
}
