import { getSupabaseAdmin } from "@/lib/supabase-admin";
import { listProfessionalClients, type ProfessionalClient } from "@/lib/professional-clients";
import type { EngagementStatus } from "@/lib/client-engagement";

export type CrmStage = "lead" | "contatado" | "agendado" | "cliente_ativo" | "inativo";

export const CRM_STAGES: CrmStage[] = ["lead", "contatado", "agendado", "cliente_ativo", "inativo"];

export const CRM_STAGE_LABELS: Record<CrmStage, string> = {
  lead: "Lead",
  contatado: "Contatado",
  agendado: "Agendado",
  cliente_ativo: "Cliente ativo",
  inativo: "Inativo",
};

/**
 * A página de detalhe usa um id único de rota tanto pra clientes reais
 * (identificados pelo clientId, estável mesmo sem linha em
 * professional_contacts ainda) quanto pra leads puros (só existem como
 * linha em professional_contacts). Prefixo evita ambiguidade.
 */
export function contactLinkId(contact: { id: string | null; clientId: string | null }): string {
  return contact.clientId ? `c-${contact.clientId}` : `l-${contact.id}`;
}

export function parseContactLinkId(
  linkId: string
): { clientId: string } | { contactId: string } | null {
  if (linkId.startsWith("c-")) return { clientId: linkId.slice(2) };
  if (linkId.startsWith("l-")) return { contactId: linkId.slice(2) };
  return null;
}

/**
 * Um contato do CRM é um lead manual (clientId null) ou o enriquecimento
 * de um cliente real que já teve sessão (clientId preenchido). `id` é
 * null quando é um cliente real que ainda não tem linha própria em
 * `professional_contacts` — ela só é criada na primeira nota/tag/estágio
 * que o profissional registrar (lazy), pra não ter que fazer bulk-insert
 * pra toda a base de clientes existente.
 */
export interface CrmContactSummary {
  id: string | null;
  clientId: string | null;
  fullName: string;
  email: string;
  phone: string | null;
  stage: CrmStage;
  tags: string[];
  isLead: boolean;
  sessionCount: number;
  lastSessionAt: string | null;
  totalPaidCents: number;
  engagementStatus: EngagementStatus | null;
}

export interface CrmNote {
  id: string;
  body: string;
  createdAt: string;
}

export interface CrmTask {
  id: string;
  title: string;
  dueDate: string | null;
  done: boolean;
  createdAt: string;
}

export interface CrmMessageLogEntry {
  id: string;
  channel: "email" | "whatsapp";
  templateId: string;
  sentAt: string;
}

export interface CrmContactDetail extends CrmContactSummary {
  notes: CrmNote[];
  tasks: CrmTask[];
  messages: CrmMessageLogEntry[];
  client: ProfessionalClient | null;
}

type ContactRow = {
  id: string;
  professional_id: string;
  client_id: string | null;
  full_name: string;
  email: string;
  phone: string | null;
  stage: CrmStage;
  tags: string[];
};

/**
 * Lista unificada: contatos manuais (leads) + clientes reais (derivados
 * de `sessions`, via listProfessionalClients), sobrepondo estágio/tags
 * de `professional_contacts` quando existir uma linha pra aquele email.
 * Retorna null quando o Supabase ainda não está configurado.
 */
export async function listProfessionalContacts(
  professionalId: string
): Promise<CrmContactSummary[] | null> {
  const supabase = getSupabaseAdmin();
  if (!supabase) return null;

  const [{ data: contactRows, error }, realClients] = await Promise.all([
    supabase
      .from("professional_contacts")
      .select("id, professional_id, client_id, full_name, email, phone, stage, tags")
      .eq("professional_id", professionalId),
    listProfessionalClients(professionalId),
  ]);

  if (error) {
    console.error("[professional-crm] Failed to list contacts:", error.message);
    return [];
  }

  const contactsByEmail = new Map<string, ContactRow>();
  for (const row of (contactRows ?? []) as ContactRow[]) {
    contactsByEmail.set(row.email.toLowerCase(), row);
  }

  const result: CrmContactSummary[] = [];
  const matchedEmails = new Set<string>();

  for (const client of realClients ?? []) {
    const contact = contactsByEmail.get(client.email.toLowerCase());
    if (contact) matchedEmails.add(contact.email.toLowerCase());

    result.push({
      id: contact?.id ?? null,
      clientId: client.id,
      fullName: client.full_name,
      email: client.email,
      phone: client.phone_number,
      stage: contact?.stage ?? "cliente_ativo",
      tags: contact?.tags ?? [],
      isLead: false,
      sessionCount: client.sessionCount,
      lastSessionAt: client.lastSessionAt,
      totalPaidCents: client.totalPaidCents,
      engagementStatus: client.engagementStatus,
    });
  }

  for (const contact of contactsByEmail.values()) {
    if (matchedEmails.has(contact.email.toLowerCase())) continue;
    // Lead puro — sem sessão, client_id null (ou apontando pra um cliente
    // sem sessão nenhuma ainda, caso raro, tratado igual).
    result.push({
      id: contact.id,
      clientId: contact.client_id,
      fullName: contact.full_name,
      email: contact.email,
      phone: contact.phone,
      stage: contact.stage,
      tags: contact.tags,
      isLead: contact.client_id === null,
      sessionCount: 0,
      lastSessionAt: null,
      totalPaidCents: 0,
      engagementStatus: null,
    });
  }

  return result.sort((a, b) => a.fullName.localeCompare(b.fullName, "pt-BR"));
}

/**
 * Garante que existe uma linha em `professional_contacts` pro contato
 * pedido, criando-a sob demanda quando ainda não existe. Sempre confere
 * que o cliente/contato pertence de fato a esse profissional antes de
 * criar ou retornar. Retorna null se não encontrar / não pertencer.
 */
export async function ensureContactId(
  professionalId: string,
  { contactId, clientId }: { contactId?: string; clientId?: string }
): Promise<string | null> {
  const supabase = getSupabaseAdmin();
  if (!supabase) return null;

  if (contactId) {
    const { data } = await supabase
      .from("professional_contacts")
      .select("id")
      .eq("id", contactId)
      .eq("professional_id", professionalId)
      .maybeSingle();
    return data?.id ?? null;
  }

  if (!clientId) return null;

  const { data: existing } = await supabase
    .from("professional_contacts")
    .select("id")
    .eq("professional_id", professionalId)
    .eq("client_id", clientId)
    .maybeSingle();
  if (existing) return existing.id;

  // Nunca confia num clientId vindo de fora sem confirmar que esse
  // cliente de fato já teve sessão com este profissional.
  const { data: session } = await supabase
    .from("sessions")
    .select("client:clients(id, full_name, email, phone_number)")
    .eq("professional_id", professionalId)
    .eq("client_id", clientId)
    .limit(1)
    .maybeSingle();

  const client = session?.client as unknown as
    | { id: string; full_name: string; email: string; phone_number: string | null }
    | undefined;
  if (!client) return null;

  const { data: created, error } = await supabase
    .from("professional_contacts")
    .insert({
      professional_id: professionalId,
      client_id: client.id,
      full_name: client.full_name,
      email: client.email,
      phone: client.phone_number,
      stage: "cliente_ativo",
    })
    .select("id")
    .single();

  if (error || !created) {
    console.error("[professional-crm] Failed to create contact row:", error?.message);
    return null;
  }

  return created.id;
}

export interface CreateLeadInput {
  fullName: string;
  email: string;
  phone: string | null;
}

export type CreateLeadResult =
  | { ok: true; contactId: string }
  | { ok: false; reason: "not_configured" | "duplicate" | "error" };

export async function createLead(
  professionalId: string,
  input: CreateLeadInput
): Promise<CreateLeadResult> {
  const supabase = getSupabaseAdmin();
  if (!supabase) return { ok: false, reason: "not_configured" };

  const { data, error } = await supabase
    .from("professional_contacts")
    .insert({
      professional_id: professionalId,
      client_id: null,
      full_name: input.fullName,
      email: input.email,
      phone: input.phone,
      stage: "lead",
    })
    .select("id")
    .single();

  if (error) {
    if (error.code === "23505") return { ok: false, reason: "duplicate" };
    console.error("[professional-crm] Failed to create lead:", error.message);
    return { ok: false, reason: "error" };
  }

  return { ok: true, contactId: data.id };
}

export interface UpdateContactInput {
  stage?: CrmStage;
  tags?: string[];
  fullName?: string;
  phone?: string | null;
}

export async function updateContact(
  professionalId: string,
  contactId: string,
  patch: UpdateContactInput
): Promise<boolean> {
  const supabase = getSupabaseAdmin();
  if (!supabase) return false;

  const update: Record<string, unknown> = { updated_at: new Date().toISOString() };
  if (patch.stage !== undefined) update.stage = patch.stage;
  if (patch.tags !== undefined) update.tags = patch.tags;
  if (patch.fullName !== undefined) update.full_name = patch.fullName;
  if (patch.phone !== undefined) update.phone = patch.phone;

  const { error } = await supabase
    .from("professional_contacts")
    .update(update)
    .eq("id", contactId)
    .eq("professional_id", professionalId);

  if (error) {
    console.error("[professional-crm] Failed to update contact:", error.message);
    return false;
  }
  return true;
}

/** Só apaga leads (contact.client_id null) — um cliente real nunca é apagável, só editável. */
export async function deleteLead(professionalId: string, contactId: string): Promise<boolean> {
  const supabase = getSupabaseAdmin();
  if (!supabase) return false;

  const { error } = await supabase
    .from("professional_contacts")
    .delete()
    .eq("id", contactId)
    .eq("professional_id", professionalId)
    .is("client_id", null);

  if (error) {
    console.error("[professional-crm] Failed to delete lead:", error.message);
    return false;
  }
  return true;
}

/**
 * Se existe um lead manual (sem client_id ainda) com o mesmo email de
 * quem acabou de agendar a 1ª sessão de verdade, promove esse contato
 * pra "cliente_ativo" e linka o client_id — sem isso, um lead que vira
 * cliente real continuava marcado como lead até o profissional trocar
 * manualmente. Best-effort: nunca bloqueia o agendamento em si.
 */
export async function promoteContactOnBooking(
  professionalId: string,
  clientId: string,
  email: string
): Promise<void> {
  const supabase = getSupabaseAdmin();
  if (!supabase) return;

  const { data: contact } = await supabase
    .from("professional_contacts")
    .select("id, stage, client_id")
    .eq("professional_id", professionalId)
    .ilike("email", email)
    .maybeSingle();

  if (!contact || contact.client_id) return;
  if (!(["lead", "contatado", "agendado"] as CrmStage[]).includes(contact.stage)) return;

  const { error } = await supabase
    .from("professional_contacts")
    .update({ client_id: clientId, stage: "cliente_ativo", updated_at: new Date().toISOString() })
    .eq("id", contact.id);

  if (error) {
    console.error("[professional-crm] Failed to promote contact on booking:", error.message);
  }
}

export async function addNote(contactId: string, body: string): Promise<boolean> {
  const supabase = getSupabaseAdmin();
  if (!supabase) return false;

  const { error } = await supabase.from("professional_contact_notes").insert({
    contact_id: contactId,
    body,
  });

  if (error) {
    console.error("[professional-crm] Failed to add note:", error.message);
    return false;
  }
  return true;
}

export async function addTask(
  contactId: string,
  title: string,
  dueDate: string | null
): Promise<boolean> {
  const supabase = getSupabaseAdmin();
  if (!supabase) return false;

  const { error } = await supabase.from("professional_contact_tasks").insert({
    contact_id: contactId,
    title,
    due_date: dueDate,
  });

  if (error) {
    console.error("[professional-crm] Failed to add task:", error.message);
    return false;
  }
  return true;
}

export async function setTaskDone(
  professionalId: string,
  taskId: string,
  done: boolean
): Promise<boolean> {
  const supabase = getSupabaseAdmin();
  if (!supabase) return false;

  // Confere posse via join implícito: só atualiza se a task pertence a
  // um contato deste profissional.
  const { data: task } = await supabase
    .from("professional_contact_tasks")
    .select("id, contact:professional_contacts!inner(professional_id)")
    .eq("id", taskId)
    .eq("contact.professional_id", professionalId)
    .maybeSingle();

  if (!task) return false;

  const { error } = await supabase
    .from("professional_contact_tasks")
    .update({ done })
    .eq("id", taskId);

  if (error) {
    console.error("[professional-crm] Failed to update task:", error.message);
    return false;
  }
  return true;
}

export async function deleteTask(professionalId: string, taskId: string): Promise<boolean> {
  const supabase = getSupabaseAdmin();
  if (!supabase) return false;

  const { data: task } = await supabase
    .from("professional_contact_tasks")
    .select("id, contact:professional_contacts!inner(professional_id)")
    .eq("id", taskId)
    .eq("contact.professional_id", professionalId)
    .maybeSingle();

  if (!task) return false;

  const { error } = await supabase.from("professional_contact_tasks").delete().eq("id", taskId);

  if (error) {
    console.error("[professional-crm] Failed to delete task:", error.message);
    return false;
  }
  return true;
}

/**
 * Detalhe completo de um contato — por contactId (lead ou cliente
 * enriquecido) ou por clientId (cliente real sem linha própria ainda).
 * Retorna null quando não encontrado / não pertence a este profissional
 * / Supabase não configurado.
 */
export async function getContactDetail(
  professionalId: string,
  { contactId, clientId }: { contactId?: string; clientId?: string }
): Promise<CrmContactDetail | null> {
  const supabase = getSupabaseAdmin();
  if (!supabase) return null;

  let contact: ContactRow | null = null;
  if (contactId) {
    const { data } = await supabase
      .from("professional_contacts")
      .select("id, professional_id, client_id, full_name, email, phone, stage, tags")
      .eq("id", contactId)
      .eq("professional_id", professionalId)
      .maybeSingle();
    contact = (data as ContactRow) ?? null;
  }

  let resolvedClientId = contact?.client_id ?? clientId ?? null;

  // Cliente real sem linha em professional_contacts ainda — busca os
  // dados básicos direto de `clients`, confirmando posse via sessions.
  let fallbackClient: { id: string; full_name: string; email: string; phone_number: string | null } | null = null;
  if (!contact && resolvedClientId) {
    const { data: session } = await supabase
      .from("sessions")
      .select("client:clients(id, full_name, email, phone_number)")
      .eq("professional_id", professionalId)
      .eq("client_id", resolvedClientId)
      .limit(1)
      .maybeSingle();
    fallbackClient =
      (session?.client as unknown as {
        id: string;
        full_name: string;
        email: string;
        phone_number: string | null;
      } | undefined) ?? null;
    if (!fallbackClient) return null;
  }

  if (!contact && !fallbackClient) return null;

  resolvedClientId = contact?.client_id ?? fallbackClient?.id ?? null;

  const [notesResult, tasksResult, messagesResult, allClients] = await Promise.all([
    contact
      ? supabase
          .from("professional_contact_notes")
          .select("id, body, created_at")
          .eq("contact_id", contact.id)
          .order("created_at", { ascending: false })
      : Promise.resolve({ data: [], error: null }),
    contact
      ? supabase
          .from("professional_contact_tasks")
          .select("id, title, due_date, done, created_at")
          .eq("contact_id", contact.id)
          .order("due_date", { ascending: true, nullsFirst: false })
      : Promise.resolve({ data: [], error: null }),
    resolvedClientId
      ? supabase
          .from("professional_client_messages")
          .select("id, channel, template_id, sent_at")
          .eq("professional_id", professionalId)
          .eq("client_id", resolvedClientId)
          .order("sent_at", { ascending: false })
      : Promise.resolve({ data: [], error: null }),
    resolvedClientId ? listProfessionalClients(professionalId) : Promise.resolve(null),
  ]);

  const client = resolvedClientId
    ? (allClients ?? []).find((c) => c.id === resolvedClientId) ?? null
    : null;

  const fullName = contact?.full_name ?? client?.full_name ?? fallbackClient?.full_name ?? "";
  const email = contact?.email ?? client?.email ?? fallbackClient?.email ?? "";
  const phone = contact?.phone ?? client?.phone_number ?? fallbackClient?.phone_number ?? null;

  return {
    id: contact?.id ?? null,
    clientId: resolvedClientId,
    fullName,
    email,
    phone,
    stage: contact?.stage ?? (resolvedClientId ? "cliente_ativo" : "lead"),
    tags: contact?.tags ?? [],
    isLead: !resolvedClientId,
    sessionCount: client?.sessionCount ?? 0,
    lastSessionAt: client?.lastSessionAt ?? null,
    totalPaidCents: client?.totalPaidCents ?? 0,
    engagementStatus: client?.engagementStatus ?? null,
    notes: (notesResult.data ?? []).map((n) => ({
      id: n.id,
      body: n.body,
      createdAt: n.created_at,
    })),
    tasks: (tasksResult.data ?? []).map((t) => ({
      id: t.id,
      title: t.title,
      dueDate: t.due_date,
      done: t.done,
      createdAt: t.created_at,
    })),
    messages: (messagesResult.data ?? []).map((m) => ({
      id: m.id,
      channel: m.channel as "email" | "whatsapp",
      templateId: m.template_id,
      sentAt: m.sent_at,
    })),
    client,
  };
}
