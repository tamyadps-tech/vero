"use client";

import { useState } from "react";
import { AssessmentForm } from "@/components/AssessmentForm";

/**
 * Deixa o profissional fazer o teste ele mesmo, dentro do catálogo, pra
 * entender como funciona — sem salvar nada. O `key` força o formulário a
 * remontar (zerar respostas) quando o profissional fecha o resultado e
 * quer tentar de novo.
 */
export function TestPreview({ templateSlug }: { templateSlug: string }) {
  const [resetKey, setResetKey] = useState(0);

  return (
    <AssessmentForm
      key={resetKey}
      templateSlug={templateSlug}
      onClose={() => setResetKey((k) => k + 1)}
      previewOnly
    />
  );
}
