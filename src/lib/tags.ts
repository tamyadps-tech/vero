/** Converte "Ansiedade, Casais,  Burnout" em ["Ansiedade", "Casais", "Burnout"]. */
export function parseTagList(input: string): string[] {
  const seen = new Set<string>();
  const result: string[] = [];
  for (const raw of input.split(",")) {
    const tag = raw.trim();
    if (!tag) continue;
    const key = tag.toLowerCase();
    if (seen.has(key)) continue;
    seen.add(key);
    result.push(tag);
  }
  return result;
}

const MAX_TAGS = 10;

/** Valida uma lista de tags vinda do corpo de uma requisição (já em array). */
export function parseTagArray(value: unknown): string[] | null {
  if (!Array.isArray(value)) return null;
  if (value.length > MAX_TAGS) return null;
  const tags: string[] = [];
  for (const item of value) {
    if (typeof item !== "string") return null;
    const tag = item.trim();
    if (!tag || tag.length > 40) return null;
    tags.push(tag);
  }
  return tags;
}

/** Mesma validação, mas a partir de um campo de FormData (string JSON). */
export function parseJsonTagField(value: unknown): string[] | null {
  if (typeof value !== "string") return null;
  try {
    return parseTagArray(JSON.parse(value));
  } catch {
    return null;
  }
}
