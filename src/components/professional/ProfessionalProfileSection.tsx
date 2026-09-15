"use client";

import { useState, useRef, type ChangeEvent, type FormEvent } from "react";
import { useRouter } from "next/navigation";
import {
  SESSION_FORMATS,
  SESSION_FORMAT_LABELS,
  type SessionFormat,
} from "@/lib/session-format";
import { parseTagList } from "@/lib/tags";
import type { ProfessionalAccount } from "@/lib/professional-session";

type Status = "idle" | "loading" | "success" | "error";

const fieldClass =
  "w-full rounded-xl border border-border bg-paper px-4 py-3 text-sm text-ink placeholder:text-ink-soft/70 focus:border-primary focus:outline-none";
const labelClass = "mb-1.5 block text-sm font-medium text-ink";

const MAX_PHOTO_BYTES = 4 * 1024 * 1024;
const ALLOWED_PHOTO_TYPES = ["image/jpeg", "image/png", "image/webp"];
const MAX_PORTFOLIO_PHOTOS = 10;

function ProfessionalProfileEditForm({
  professional,
  onClose,
}: {
  professional: ProfessionalAccount;
  onClose: () => void;
}) {
  const router = useRouter();
  const [bio, setBio] = useState(professional.bio);
  const [yearsExperience, setYearsExperience] = useState(
    String(professional.years_experience)
  );
  const [specialties, setSpecialties] = useState(professional.specialties.join(", "));
  const [methods, setMethods] = useState(professional.methods.join(", "));
  const [personality, setPersonality] = useState(professional.personality ?? "");
  const [sessionFormat, setSessionFormat] = useState<SessionFormat>(
    professional.session_format
  );
  const [locationCity, setLocationCity] = useState(professional.location_city ?? "");
  const [locationState, setLocationState] = useState(professional.location_state ?? "");
  const [locationAddress, setLocationAddress] = useState(
    professional.location_address ?? ""
  );
  const [price, setPrice] = useState(String(professional.price_cents / 100));
  const [instagramUrl, setInstagramUrl] = useState(professional.instagram_url ?? "");
  const [whatsappUrl, setWhatsappUrl] = useState(professional.whatsapp_url ?? "");
  const [websiteUrl, setWebsiteUrl] = useState(professional.website_url ?? "");
  const [photo, setPhoto] = useState<File | null>(null);
  const [photoPreview, setPhotoPreview] = useState<string | null>(professional.photo_url);
  const [photoError, setPhotoError] = useState("");
  const [portfolioUrls, setPortfolioUrls] = useState<string[]>(
    professional.portfolio_photo_urls
  );
  const [newPortfolioFiles, setNewPortfolioFiles] = useState<File[]>([]);
  const [portfolioError, setPortfolioError] = useState("");
  const portfolioInputRef = useRef<HTMLInputElement>(null);
  const [status, setStatus] = useState<Status>("idle");
  const [message, setMessage] = useState("");

  const needsLocation = sessionFormat !== "online";
  const totalPortfolioCount = portfolioUrls.length + newPortfolioFiles.length;

  function handlePortfolioChange(event: ChangeEvent<HTMLInputElement>) {
    const files = Array.from(event.target.files ?? []);
    setPortfolioError("");
    if (files.length === 0) return;

    if (totalPortfolioCount + files.length > MAX_PORTFOLIO_PHOTOS) {
      setPortfolioError(`Você pode ter no máximo ${MAX_PORTFOLIO_PHOTOS} fotos no portfólio.`);
      event.target.value = "";
      return;
    }
    for (const file of files) {
      if (!ALLOWED_PHOTO_TYPES.includes(file.type)) {
        setPortfolioError("As fotos precisam ser JPG, PNG ou WEBP.");
        event.target.value = "";
        return;
      }
      if (file.size > MAX_PHOTO_BYTES) {
        setPortfolioError("Cada foto precisa ter no máximo 4MB.");
        event.target.value = "";
        return;
      }
    }
    setNewPortfolioFiles((prev) => [...prev, ...files]);
    event.target.value = "";
  }

  function removeExistingPortfolioPhoto(url: string) {
    setPortfolioUrls((prev) => prev.filter((item) => item !== url));
  }

  function removeNewPortfolioPhoto(index: number) {
    setNewPortfolioFiles((prev) => prev.filter((_, i) => i !== index));
  }

  function handlePhotoChange(event: ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0] ?? null;
    setPhotoError("");
    if (!file) return;
    if (!ALLOWED_PHOTO_TYPES.includes(file.type)) {
      setPhotoError("A foto precisa ser JPG, PNG ou WEBP.");
      event.target.value = "";
      return;
    }
    if (file.size > MAX_PHOTO_BYTES) {
      setPhotoError("A foto precisa ter no máximo 4MB.");
      event.target.value = "";
      return;
    }
    setPhoto(file);
    setPhotoPreview(URL.createObjectURL(file));
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setStatus("loading");
    setMessage("");

    const priceCents = Math.round(parseFloat(price.replace(",", ".")) * 100);

    const formData = new FormData();
    formData.set("bio", bio);
    formData.set("yearsExperience", yearsExperience);
    formData.set("specialties", JSON.stringify(parseTagList(specialties)));
    formData.set("methods", JSON.stringify(parseTagList(methods)));
    if (personality) formData.set("personality", personality);
    formData.set("sessionFormat", sessionFormat);
    if (needsLocation) {
      formData.set("locationCity", locationCity);
      formData.set("locationState", locationState);
      if (locationAddress) formData.set("locationAddress", locationAddress);
    }
    formData.set("priceCents", String(priceCents));
    if (instagramUrl) formData.set("instagramUrl", instagramUrl);
    if (whatsappUrl) formData.set("whatsappUrl", whatsappUrl);
    if (websiteUrl) formData.set("websiteUrl", websiteUrl);
    if (photo) formData.set("photo", photo);
    formData.set("portfolioPhotoUrls", JSON.stringify(portfolioUrls));
    for (const file of newPortfolioFiles) {
      formData.append("portfolioPhotos", file);
    }

    try {
      const response = await fetch("/api/professional/profile", {
        method: "PATCH",
        body: formData,
      });
      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error ?? "Não foi possível salvar agora.");
      }

      setStatus("success");
      setMessage("Perfil atualizado!");
      router.refresh();
      onClose();
    } catch (error) {
      setStatus("error");
      setMessage(
        error instanceof Error ? error.message : "Não foi possível salvar agora."
      );
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-5 rounded-2xl border border-border bg-paper-alt/40 p-5">
      <div>
        <label className={labelClass} htmlFor="edit-photo">
          Foto de perfil
        </label>
        <div className="flex items-center gap-4">
          {photoPreview && (
            // eslint-disable-next-line @next/next/no-img-element -- prévia local (blob URL ou foto atual), não uma imagem otimizável pelo next/image.
            <img
              src={photoPreview}
              alt="Prévia da foto de perfil"
              className="h-16 w-16 shrink-0 rounded-full border border-border object-cover"
            />
          )}
          <input
            id="edit-photo"
            type="file"
            accept="image/jpeg,image/png,image/webp"
            onChange={handlePhotoChange}
            className="block w-full text-sm text-ink-soft file:mr-3 file:rounded-lg file:border-0 file:bg-primary-light file:px-3 file:py-2 file:text-sm file:font-medium file:text-primary-dark hover:file:bg-primary-light/80"
          />
        </div>
        <p className="mt-1.5 text-xs text-ink-soft">JPG, PNG ou WEBP, até 4MB.</p>
        {photoError && (
          <p role="alert" className="mt-1.5 text-xs text-accent-dark">
            {photoError}
          </p>
        )}
      </div>

      <div>
        <label className={labelClass}>
          Portfólio ({totalPortfolioCount}/{MAX_PORTFOLIO_PHOTOS})
        </label>
        {totalPortfolioCount > 0 && (
          <div className="mb-3 flex flex-wrap gap-3">
            {portfolioUrls.map((url) => (
              <div key={url} className="group relative h-20 w-20 shrink-0">
                {/* eslint-disable-next-line @next/next/no-img-element -- prévia de foto já hospedada no Supabase Storage. */}
                <img
                  src={url}
                  alt="Foto do portfólio"
                  className="h-20 w-20 rounded-lg border border-border object-cover"
                />
                <button
                  type="button"
                  onClick={() => removeExistingPortfolioPhoto(url)}
                  aria-label="Remover foto do portfólio"
                  className="absolute -right-1.5 -top-1.5 flex h-5 w-5 items-center justify-center rounded-full bg-accent text-xs text-paper"
                >
                  ×
                </button>
              </div>
            ))}
            {newPortfolioFiles.map((file, index) => (
              <div key={`${file.name}-${index}`} className="group relative h-20 w-20 shrink-0">
                {/* eslint-disable-next-line @next/next/no-img-element -- prévia local (blob URL) de arquivo recém-selecionado. */}
                <img
                  src={URL.createObjectURL(file)}
                  alt="Prévia de nova foto do portfólio"
                  className="h-20 w-20 rounded-lg border border-border object-cover"
                />
                <button
                  type="button"
                  onClick={() => removeNewPortfolioPhoto(index)}
                  aria-label="Remover foto do portfólio"
                  className="absolute -right-1.5 -top-1.5 flex h-5 w-5 items-center justify-center rounded-full bg-accent text-xs text-paper"
                >
                  ×
                </button>
              </div>
            ))}
          </div>
        )}
        <input
          ref={portfolioInputRef}
          type="file"
          multiple
          accept="image/jpeg,image/png,image/webp"
          onChange={handlePortfolioChange}
          disabled={totalPortfolioCount >= MAX_PORTFOLIO_PHOTOS}
          className="block w-full text-sm text-ink-soft file:mr-3 file:rounded-lg file:border-0 file:bg-primary-light file:px-3 file:py-2 file:text-sm file:font-medium file:text-primary-dark hover:file:bg-primary-light/80 disabled:opacity-60"
        />
        <p className="mt-1.5 text-xs text-ink-soft">
          Fotos do seu espaço de atendimento, certificados, eventos — aparecem em
          carrossel no seu perfil público. JPG, PNG ou WEBP, até 4MB cada, máximo{" "}
          {MAX_PORTFOLIO_PHOTOS}.
        </p>
        {portfolioError && (
          <p role="alert" className="mt-1.5 text-xs text-accent-dark">
            {portfolioError}
          </p>
        )}
      </div>

      <div className="grid gap-5 sm:grid-cols-2">
        <div>
          <label className={labelClass} htmlFor="edit-years">
            Anos de experiência
          </label>
          <input
            id="edit-years"
            type="number"
            min={0}
            max={60}
            required
            value={yearsExperience}
            onChange={(event) => setYearsExperience(event.target.value)}
            className={fieldClass}
          />
        </div>
        <div>
          <label className={labelClass} htmlFor="edit-price">
            Preço por sessão (R$)
          </label>
          <input
            id="edit-price"
            type="number"
            min={0}
            step="0.01"
            required
            value={price}
            onChange={(event) => setPrice(event.target.value)}
            className={fieldClass}
          />
        </div>
      </div>

      <div>
        <label className={labelClass} htmlFor="edit-bio">
          Fale sobre sua experiência
        </label>
        <textarea
          id="edit-bio"
          required
          minLength={20}
          rows={4}
          value={bio}
          onChange={(event) => setBio(event.target.value)}
          className={fieldClass}
        />
      </div>

      <div className="grid gap-5 sm:grid-cols-2">
        <div>
          <label className={labelClass} htmlFor="edit-specialties">
            Especialidades
          </label>
          <input
            id="edit-specialties"
            required
            value={specialties}
            onChange={(event) => setSpecialties(event.target.value)}
            className={fieldClass}
          />
          <p className="mt-1.5 text-xs text-ink-soft">Separe por vírgula.</p>
        </div>
        <div>
          <label className={labelClass} htmlFor="edit-methods">
            Métodos/abordagens
          </label>
          <input
            id="edit-methods"
            value={methods}
            onChange={(event) => setMethods(event.target.value)}
            className={fieldClass}
          />
        </div>
      </div>

      <div>
        <label className={labelClass} htmlFor="edit-personality">
          Estilo de atendimento
        </label>
        <input
          id="edit-personality"
          value={personality}
          onChange={(event) => setPersonality(event.target.value)}
          className={fieldClass}
        />
      </div>

      <fieldset>
        <legend className={labelClass}>Formato de atendimento</legend>
        <div className="flex flex-wrap gap-4">
          {SESSION_FORMATS.map((value) => (
            <label key={value} className="flex items-center gap-2 text-sm text-ink">
              <input
                type="radio"
                name="edit-session-format"
                value={value}
                checked={sessionFormat === value}
                onChange={() => setSessionFormat(value)}
              />
              {SESSION_FORMAT_LABELS[value]}
            </label>
          ))}
        </div>
      </fieldset>

      {needsLocation && (
        <div className="grid gap-5 rounded-xl border border-border bg-paper p-4 sm:grid-cols-3">
          <div>
            <label className={labelClass} htmlFor="edit-city">
              Cidade
            </label>
            <input
              id="edit-city"
              required
              value={locationCity}
              onChange={(event) => setLocationCity(event.target.value)}
              className={fieldClass}
            />
          </div>
          <div>
            <label className={labelClass} htmlFor="edit-state">
              Estado (UF)
            </label>
            <input
              id="edit-state"
              required
              maxLength={2}
              value={locationState}
              onChange={(event) => setLocationState(event.target.value.toUpperCase())}
              className={fieldClass}
            />
          </div>
          <div>
            <label className={labelClass} htmlFor="edit-address">
              Endereço (opcional)
            </label>
            <input
              id="edit-address"
              value={locationAddress}
              onChange={(event) => setLocationAddress(event.target.value)}
              className={fieldClass}
            />
          </div>
        </div>
      )}

      <div className="grid gap-5 sm:grid-cols-3">
        <div>
          <label className={labelClass} htmlFor="edit-instagram">
            Instagram
          </label>
          <input
            id="edit-instagram"
            type="url"
            value={instagramUrl}
            onChange={(event) => setInstagramUrl(event.target.value)}
            className={fieldClass}
            placeholder="https://instagram.com/seuperfil"
          />
        </div>
        <div>
          <label className={labelClass} htmlFor="edit-whatsapp">
            WhatsApp
          </label>
          <input
            id="edit-whatsapp"
            type="url"
            value={whatsappUrl}
            onChange={(event) => setWhatsappUrl(event.target.value)}
            className={fieldClass}
            placeholder="https://wa.me/55..."
          />
        </div>
        <div>
          <label className={labelClass} htmlFor="edit-website">
            Site
          </label>
          <input
            id="edit-website"
            type="url"
            value={websiteUrl}
            onChange={(event) => setWebsiteUrl(event.target.value)}
            className={fieldClass}
            placeholder="https://..."
          />
        </div>
      </div>

      <div className="flex items-center gap-3">
        <button
          type="submit"
          disabled={status === "loading"}
          className="rounded-xl bg-primary px-5 py-3 text-sm font-semibold text-paper transition hover:bg-primary-dark disabled:opacity-60"
        >
          {status === "loading" ? "Salvando…" : "Salvar alterações"}
        </button>
        <button type="button" onClick={onClose} className="text-sm text-ink-soft">
          Cancelar
        </button>
      </div>

      {status === "error" && (
        <p role="alert" className="text-sm text-accent-dark">
          {message}
        </p>
      )}
    </form>
  );
}

const SOCIAL_LINKS: Array<{ key: "instagram_url" | "whatsapp_url" | "website_url"; label: string }> = [
  { key: "instagram_url", label: "Instagram" },
  { key: "whatsapp_url", label: "WhatsApp" },
  { key: "website_url", label: "Site" },
];

export function ProfessionalProfileSection({
  professional,
}: {
  professional: ProfessionalAccount;
}) {
  const [isEditing, setIsEditing] = useState(false);

  if (isEditing) {
    return (
      <ProfessionalProfileEditForm
        professional={professional}
        onClose={() => setIsEditing(false)}
      />
    );
  }

  const links = SOCIAL_LINKS.filter((link) => professional[link.key]);

  return (
    <div className="flex flex-wrap items-start justify-between gap-4 rounded-2xl border border-border bg-paper-alt/40 p-5">
      <div className="flex items-start gap-4">
        {professional.photo_url ? (
          // eslint-disable-next-line @next/next/no-img-element -- avatar servido pelo Supabase Storage, sem domínio fixo pra configurar no next/image.
          <img
            src={professional.photo_url}
            alt={professional.full_name}
            className="h-16 w-16 shrink-0 rounded-full border border-border object-cover"
          />
        ) : (
          <span className="flex h-16 w-16 shrink-0 items-center justify-center rounded-full bg-primary-light text-sm font-semibold text-primary-dark">
            Sem foto
          </span>
        )}
        <div>
          <p className="text-sm text-ink-soft">{professional.bio}</p>
          {professional.specialties.length > 0 && (
            <div className="mt-2 flex flex-wrap gap-1.5">
              {professional.specialties.map((tag) => (
                <span
                  key={tag}
                  className="rounded-full bg-primary-light px-2.5 py-0.5 text-xs text-primary-dark"
                >
                  {tag}
                </span>
              ))}
            </div>
          )}
          {links.length > 0 && (
            <div className="mt-2 flex flex-wrap gap-3 text-xs">
              {links.map((link) => (
                <a
                  key={link.key}
                  href={professional[link.key] as string}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-primary hover:underline"
                >
                  {link.label}
                </a>
              ))}
            </div>
          )}
        </div>
      </div>
      <button
        type="button"
        onClick={() => setIsEditing(true)}
        className="whitespace-nowrap rounded-lg bg-primary px-3 py-1.5 text-xs font-semibold text-paper transition hover:bg-primary-dark"
      >
        Editar perfil
      </button>
    </div>
  );
}
