import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { getPublishedPostBySlug, renderBlogContent } from "@/lib/blog";

export const dynamic = "force-dynamic";

const dateFormatter = new Intl.DateTimeFormat("pt-BR", { dateStyle: "long" });

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const post = await getPublishedPostBySlug(slug);
  if (!post) return { title: "Post não encontrado — Vero" };

  return {
    title: `${post.title} — Vero`,
    description: post.excerpt,
  };
}

export default async function BlogPostPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const post = await getPublishedPostBySlug(slug);
  if (!post) notFound();

  const html = renderBlogContent(post.content);

  return (
    <>
      <Header />
      <main className="flex-1">
        <article className="mx-auto max-w-3xl px-6 py-16">
          <Link href="/blog" className="text-sm text-primary hover:underline">
            ← Voltar pro blog
          </Link>
          <p className="mt-4 text-xs text-ink-soft">
            {dateFormatter.format(new Date(post.publishedAt))}
          </p>
          <h1 className="mt-1 font-display text-3xl font-medium tracking-tight text-ink sm:text-4xl">
            {post.title}
          </h1>
          {post.tags.length > 0 && (
            <p className="mt-4 flex flex-wrap gap-1.5">
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

          <div
            className="prose prose-neutral mt-10 max-w-none prose-headings:font-display prose-headings:text-ink prose-a:text-primary"
            dangerouslySetInnerHTML={{ __html: html }}
          />

          <div className="mt-14 rounded-2xl border border-primary/20 bg-primary-light/40 p-8 text-center shadow-soft">
            <h2 className="font-display text-xl font-medium text-ink">
              Pronto(a) pra dar o próximo passo?
            </h2>
            <p className="mx-auto mt-2 max-w-md text-sm text-ink-soft">
              Na Vero você encontra profissionais verificados, com avaliações reais de quem
              já passou por sessão com eles.
            </p>
            <Link
              href="/profissionais"
              className="mt-5 inline-flex items-center gap-2 rounded-xl bg-primary px-6 py-3 text-sm font-semibold text-paper shadow-soft transition hover:bg-primary-dark hover:shadow-lifted"
            >
              Encontrar meu profissional
              <span>→</span>
            </Link>
          </div>
        </article>
      </main>
      <Footer />
    </>
  );
}
