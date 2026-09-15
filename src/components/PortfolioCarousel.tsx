"use client";

import { useState } from "react";

export function PortfolioCarousel({ photoUrls }: { photoUrls: string[] }) {
  const [index, setIndex] = useState(0);
  if (photoUrls.length === 0) return null;

  function goTo(next: number) {
    setIndex((next + photoUrls.length) % photoUrls.length);
  }

  return (
    <div className="mt-8">
      <h2 className="mb-3 text-sm font-semibold uppercase tracking-wide text-ink-soft">
        Portfólio
      </h2>
      <div className="relative overflow-hidden rounded-2xl border border-border bg-paper-alt/40">
        <div className="aspect-video w-full">
          {/* eslint-disable-next-line @next/next/no-img-element -- avatar servido pelo Supabase Storage, sem domínio fixo pra configurar no next/image. */}
          <img
            src={photoUrls[index]}
            alt={`Foto ${index + 1} do portfólio`}
            className="h-full w-full object-cover"
          />
        </div>
        {photoUrls.length > 1 && (
          <>
            <button
              type="button"
              onClick={() => goTo(index - 1)}
              aria-label="Foto anterior"
              className="absolute left-3 top-1/2 flex h-8 w-8 -translate-y-1/2 items-center justify-center rounded-full bg-paper/90 text-ink shadow hover:bg-paper"
            >
              ‹
            </button>
            <button
              type="button"
              onClick={() => goTo(index + 1)}
              aria-label="Próxima foto"
              className="absolute right-3 top-1/2 flex h-8 w-8 -translate-y-1/2 items-center justify-center rounded-full bg-paper/90 text-ink shadow hover:bg-paper"
            >
              ›
            </button>
            <div className="absolute bottom-3 left-1/2 flex -translate-x-1/2 gap-1.5">
              {photoUrls.map((url, i) => (
                <button
                  key={url}
                  type="button"
                  onClick={() => goTo(i)}
                  aria-label={`Ir pra foto ${i + 1}`}
                  aria-current={i === index}
                  className={`h-1.5 w-1.5 rounded-full transition ${
                    i === index ? "bg-primary" : "bg-paper/80"
                  }`}
                />
              ))}
            </div>
          </>
        )}
      </div>
    </div>
  );
}
