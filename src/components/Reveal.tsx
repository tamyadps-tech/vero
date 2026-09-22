"use client";

import { useLayoutEffect, useRef, useState, type ReactNode } from "react";

/**
 * Revela o conteúdo com fade + leve deslocamento quando ele entra na tela.
 *
 * Começa visível por padrão (SSR e sem JS continuam mostrando tudo) — só
 * na montagem, via useLayoutEffect (roda antes da pintura, sem flash), é
 * que checamos se o elemento já está no viewport. Se já estiver (acima da
 * dobra) ou se a pessoa pediu `prefers-reduced-motion`, fica visível sem
 * animação nenhuma. Só quem está abaixo da dobra começa invisível e
 * aparece quando o scroll alcança.
 */
export function Reveal({
  children,
  className = "",
  delayMs = 0,
}: {
  children: ReactNode;
  className?: string;
  delayMs?: number;
}) {
  const ref = useRef<HTMLDivElement>(null);
  const [visible, setVisible] = useState(true);

  useLayoutEffect(() => {
    const el = ref.current;
    if (!el) return;

    const prefersReduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const alreadyInView = el.getBoundingClientRect().top < window.innerHeight * 0.92;

    if (prefersReduced || alreadyInView) {
      setVisible(true);
      return;
    }

    setVisible(false);
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setVisible(true);
          observer.disconnect();
        }
      },
      { threshold: 0.1, rootMargin: "0px 0px -60px 0px" }
    );
    observer.observe(el);
    return () => observer.disconnect();
  }, []);

  return (
    <div
      ref={ref}
      className={`transition-all duration-700 ease-out motion-reduce:transition-none ${
        visible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-8"
      } ${className}`}
      style={delayMs ? { transitionDelay: `${delayMs}ms` } : undefined}
    >
      {children}
    </div>
  );
}
