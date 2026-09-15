/** Selo mostrado em todo profissional público — só aparece quem passou pelo vetting (vetting_status = 'aprovado'). */
export function VerifiedBadge() {
  return (
    <span
      title="Credenciais e experiência verificadas pela equipe da Vero"
      className="inline-flex items-center gap-1 rounded-full bg-primary-light px-2 py-0.5 text-xs font-medium text-primary-dark"
    >
      <svg viewBox="0 0 20 20" className="h-3 w-3" fill="currentColor" aria-hidden="true">
        <path d="M16.7 5.3a1 1 0 010 1.4l-7.4 7.4a1 1 0 01-1.4 0L3.3 9.5a1 1 0 111.4-1.4l3.6 3.6 6.7-6.7a1 1 0 011.4 0z" />
      </svg>
      Verificado
    </span>
  );
}
