import { redirect } from "next/navigation";

// Link antigo (acesso por token, sem senha) — substituído por login de
// verdade. Redireciona pra tela de login em vez de quebrar quem ainda
// tiver esse link salvo.
export default function LegacyProfessionalTokenPage() {
  redirect("/p/entrar");
}
