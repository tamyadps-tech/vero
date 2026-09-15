import { Suspense } from "react";
import type { Metadata } from "next";
import { GoogleCallbackClient } from "@/components/auth/GoogleCallbackClient";

export const metadata: Metadata = {
  title: "Entrando… — Vero",
  robots: { index: false, follow: false },
};

export default function GoogleCallbackPage() {
  return (
    <main className="flex min-h-[60vh] items-center justify-center px-6">
      <Suspense fallback={<p className="text-sm text-ink-soft">Entrando com Google…</p>}>
        <GoogleCallbackClient />
      </Suspense>
    </main>
  );
}
