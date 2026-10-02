import type { MetadataRoute } from "next";

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "Vero — Profissionais verificados",
    short_name: "Vero",
    description:
      "Marketplace de terapeutas, psicólogos, coaches e consultores com verificação de credenciais, avaliações públicas e progresso visual.",
    start_url: "/",
    scope: "/",
    display: "standalone",
    background_color: "#f7f4ec",
    theme_color: "#454a34",
    lang: "pt-BR",
    icons: [
      {
        src: "/icons/icon-192.png",
        sizes: "192x192",
        type: "image/png",
        purpose: "any",
      },
      {
        src: "/icons/icon-512.png",
        sizes: "512x512",
        type: "image/png",
        purpose: "any",
      },
      {
        src: "/icons/icon-maskable-512.png",
        sizes: "512x512",
        type: "image/png",
        purpose: "maskable",
      },
    ],
  };
}
