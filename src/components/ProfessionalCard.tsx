import Link from "next/link";
import { CATEGORY_LABELS } from "@/lib/professional-categories";
import { SESSION_FORMAT_LABELS } from "@/lib/session-format";
import { RatingBadge } from "@/components/RatingBadge";
import type { PublicProfessional } from "@/lib/public-professionals";
import type { ReviewSummary } from "@/lib/reviews";

function formatPrice(cents: number) {
  return (cents / 100).toLocaleString("pt-BR", {
    style: "currency",
    currency: "BRL",
  });
}

function initials(fullName: string) {
  const parts = fullName.trim().split(/\s+/);
  return ((parts[0]?.[0] ?? "") + (parts[parts.length - 1]?.[0] ?? "")).toUpperCase();
}

export function ProfessionalCard({
  professional,
  rating,
}: {
  professional: PublicProfessional;
  rating: ReviewSummary;
}) {
  return (
    <Link
      href={`/profissionais/${professional.id}`}
      className="block rounded-2xl border border-border bg-paper p-6 transition hover:border-primary"
    >
      <div className="flex items-start justify-between gap-3">
        <div className="flex items-start gap-3">
          {professional.photo_url ? (
            // eslint-disable-next-line @next/next/no-img-element -- avatar servido pelo Supabase Storage, sem domínio fixo pra configurar no next/image.
            <img
              src={professional.photo_url}
              alt={professional.full_name}
              className="h-12 w-12 shrink-0 rounded-full border border-border object-cover"
            />
          ) : (
            <span className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-primary-light text-sm font-semibold text-primary-dark">
              {initials(professional.full_name)}
            </span>
          )}
          <div>
            <h3 className="font-semibold text-ink">{professional.full_name}</h3>
            <p className="text-sm text-ink-soft">
              {CATEGORY_LABELS[professional.category]} ·{" "}
              {professional.years_experience} anos de experiência
            </p>
            <div className="mt-1">
              <RatingBadge average={rating.average} count={rating.count} />
            </div>
          </div>
        </div>
        <span className="whitespace-nowrap text-sm font-semibold text-primary">
          {formatPrice(professional.price_cents)}
        </span>
      </div>

      <p className="mt-3 line-clamp-2 text-sm leading-relaxed text-ink-soft">
        {professional.bio}
      </p>

      {professional.specialties.length > 0 && (
        <div className="mt-3 flex flex-wrap gap-1.5">
          {professional.specialties.slice(0, 3).map((tag) => (
            <span
              key={tag}
              className="rounded-full bg-primary-light px-2.5 py-0.5 text-xs text-primary-dark"
            >
              {tag}
            </span>
          ))}
        </div>
      )}

      <p className="mt-3 text-xs text-ink-soft">
        {SESSION_FORMAT_LABELS[professional.session_format]}
        {professional.location_city &&
          ` · ${professional.location_city}/${professional.location_state}`}
      </p>
    </Link>
  );
}
