export function escapeHtml(value: string): string {
  return value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");
}

const dateFormatter = new Intl.DateTimeFormat("pt-BR", {
  dateStyle: "long",
  timeStyle: "short",
});

export function shell(title: string, bodyHtml: string): string {
  return `<!DOCTYPE html>
<html lang="pt-BR">
<head><meta charset="UTF-8"><meta name="viewport" content="width=device-width, initial-scale=1.0"><title>${escapeHtml(title)}</title></head>
<body style="margin:0;padding:0;background-color:#f8f9fa;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,Helvetica,Arial,sans-serif;color:#1b2421;">
  <div style="max-width:560px;margin:0 auto;background-color:#ffffff;">
    <div style="background:linear-gradient(135deg,#0f6e64 0%,#0a4f48 100%);color:#fbf8f3;padding:32px 24px;text-align:center;">
      <p style="margin:0;font-size:20px;font-weight:700;">Vero</p>
    </div>
    <div style="padding:28px 24px;">
      ${bodyHtml}
    </div>
    <div style="padding:20px 24px;border-top:1px solid #e4dccc;text-align:center;">
      <p style="margin:0;font-size:12px;color:#5b6763;">
        Vero · <a href="mailto:suporte@vero.app" style="color:#0f6e64;">suporte@vero.app</a>
      </p>
    </div>
  </div>
</body>
</html>`;
}

export function button(href: string, label: string): string {
  return `<a href="${escapeHtml(href)}" style="display:inline-block;background:#0f6e64;color:#fbf8f3;padding:12px 24px;border-radius:6px;text-decoration:none;font-weight:600;font-size:14px;">${escapeHtml(label)}</a>`;
}

/**
 * Texto livre (digitado por quem edita um modelo de campanha) → parágrafos
 * HTML seguros. Linha em branco separa parágrafos; quebra de linha simples
 * vira <br>. Sempre escapa o texto — nunca confia em HTML vindo do editor.
 */
export function textToParagraphsHtml(text: string): string {
  return text
    .split(/\n{2,}/)
    .map((paragraph) => paragraph.trim())
    .filter(Boolean)
    .map(
      (paragraph) =>
        `<p style="font-size:14px;line-height:1.6;color:#5b6763;">${escapeHtml(paragraph).replace(/\n/g, "<br>")}</p>`
    )
    .join("\n");
}

export function bookingConfirmationEmail({
  clientName,
  professionalName,
  scheduledAt,
  progressUrl,
}: {
  clientName: string;
  professionalName: string;
  scheduledAt: string;
  progressUrl: string;
}): { subject: string; html: string } {
  const when = dateFormatter.format(new Date(scheduledAt));
  const body = `
    <p style="font-size:16px;">Olá, <strong>${escapeHtml(clientName)}</strong>,</p>
    <p style="font-size:14px;line-height:1.6;color:#5b6763;">
      Sua sessão com <strong>${escapeHtml(professionalName)}</strong> foi agendada para:
    </p>
    <p style="font-size:18px;font-weight:600;margin:16px 0;">${escapeHtml(when)}</p>
    <p style="font-size:14px;line-height:1.6;color:#5b6763;">
      Entre na sua conta pra acompanhar o progresso das suas sessões.
    </p>
    <p style="margin:24px 0;">${button(progressUrl, "Ver meu progresso")}</p>
  `;
  return {
    subject: `Sessão confirmada com ${professionalName}`,
    html: shell("Sessão confirmada — Vero", body),
  };
}

export function sessionSummaryEmail({
  clientName,
  professionalName,
  topics,
  homework,
  nextSessionAt,
  progressUrl,
}: {
  clientName: string;
  professionalName: string;
  topics: string[];
  homework: string | null;
  nextSessionAt: string | null;
  progressUrl: string;
}): { subject: string; html: string } {
  const topicsHtml =
    topics.length > 0
      ? `<div style="margin:16px 0;">
          <p style="font-size:12px;font-weight:700;text-transform:uppercase;color:#0f6e64;margin:0 0 8px;">Tópicos abordados</p>
          ${topics
            .map(
              (t) =>
                `<span style="display:inline-block;background:#e4f2ef;color:#0a4f48;border-radius:999px;padding:4px 10px;font-size:12px;margin:0 4px 4px 0;">${escapeHtml(t)}</span>`
            )
            .join("")}
        </div>`
      : "";

  const homeworkHtml = homework
    ? `<div style="margin:16px 0;background:#fff8e1;border-left:4px solid #fbc02d;padding:12px 16px;border-radius:6px;">
        <p style="font-size:12px;font-weight:700;text-transform:uppercase;color:#f57c00;margin:0 0 6px;">Tarefa até a próxima sessão</p>
        <p style="font-size:14px;margin:0;color:#1b2421;">${escapeHtml(homework)}</p>
      </div>`
    : "";

  const nextSessionHtml = nextSessionAt
    ? `<div style="margin:16px 0;background:#e4f2ef;border-left:4px solid #0f6e64;padding:12px 16px;border-radius:6px;">
        <p style="font-size:12px;font-weight:700;text-transform:uppercase;color:#0f6e64;margin:0 0 6px;">Próxima sessão</p>
        <p style="font-size:14px;margin:0;color:#1b2421;">${escapeHtml(dateFormatter.format(new Date(nextSessionAt)))}</p>
      </div>`
    : "";

  const body = `
    <p style="font-size:16px;">Olá, <strong>${escapeHtml(clientName)}</strong>,</p>
    <p style="font-size:14px;line-height:1.6;color:#5b6763;">
      Aqui está o resumo da sua sessão com <strong>${escapeHtml(professionalName)}</strong>.
    </p>
    ${topicsHtml}
    ${homeworkHtml}
    ${nextSessionHtml}
    <p style="margin:24px 0;">${button(progressUrl, "Ver histórico completo")}</p>
  `;
  return {
    subject: `Resumo da sua sessão com ${professionalName}`,
    html: shell("Resumo da sessão — Vero", body),
  };
}

export function professionalApprovedEmail({
  professionalName,
  dashboardUrl,
}: {
  professionalName: string;
  dashboardUrl: string;
}): { subject: string; html: string } {
  const body = `
    <p style="font-size:16px;">Olá, <strong>${escapeHtml(professionalName)}</strong>,</p>
    <p style="font-size:14px;line-height:1.6;color:#5b6763;">
      Boas notícias: sua candidatura foi <strong>aprovada</strong> e seu
      perfil já está visível na Vero.
    </p>
    <p style="font-size:14px;line-height:1.6;color:#5b6763;">
      Entre com o email e a senha que você cadastrou na candidatura pra
      configurar sua disponibilidade e acompanhar suas sessões.
    </p>
    <p style="margin:24px 0;">${button(dashboardUrl, "Fazer login")}</p>
  `;
  return {
    subject: "Sua candidatura foi aprovada — Vero",
    html: shell("Candidatura aprovada — Vero", body),
  };
}

export function professionalRejectedEmail({
  professionalName,
  notes,
}: {
  professionalName: string;
  notes: string | null;
}): { subject: string; html: string } {
  const notesHtml = notes
    ? `<p style="font-size:14px;line-height:1.6;color:#5b6763;"><strong>Observação:</strong> ${escapeHtml(notes)}</p>`
    : "";
  const body = `
    <p style="font-size:16px;">Olá, <strong>${escapeHtml(professionalName)}</strong>,</p>
    <p style="font-size:14px;line-height:1.6;color:#5b6763;">
      Depois de revisar sua candidatura, não conseguimos aprová-la nesta
      etapa do vetting da Vero.
    </p>
    ${notesHtml}
    <p style="font-size:14px;line-height:1.6;color:#5b6763;">
      Dúvidas? Responda este email ou escreva pra
      <a href="mailto:suporte@vero.app" style="color:#0f6e64;">suporte@vero.app</a>.
    </p>
  `;
  return {
    subject: "Sobre sua candidatura — Vero",
    html: shell("Sobre sua candidatura — Vero", body),
  };
}

export function professionalMessageEmail({
  clientName,
  professionalName,
  subject,
  message,
}: {
  clientName: string;
  professionalName: string;
  subject: string;
  message: string;
}): { subject: string; html: string } {
  const messageHtml = escapeHtml(message).replace(/\n/g, "<br>");
  const body = `
    <p style="font-size:16px;">Olá, <strong>${escapeHtml(clientName)}</strong>,</p>
    <p style="font-size:14px;line-height:1.6;color:#1b2421;">${messageHtml}</p>
    <p style="margin-top:24px;font-size:12px;color:#5b6763;">
      Mensagem enviada por <strong>${escapeHtml(professionalName)}</strong> pela Vero.
    </p>
  `;
  return {
    subject: `${subject} — ${professionalName}`,
    html: shell(subject, body),
  };
}

const shortDateFormatter = new Intl.DateTimeFormat("pt-BR", { dateStyle: "short" });

export interface TaskReminderItem {
  contactName: string;
  title: string;
  dueDate: string;
  overdue: boolean;
}

export function taskReminderEmail({
  professionalName,
  tasks,
  dashboardUrl,
}: {
  professionalName: string;
  tasks: TaskReminderItem[];
  dashboardUrl: string;
}): { subject: string; html: string } {
  const overdueCount = tasks.filter((t) => t.overdue).length;
  const todayCount = tasks.length - overdueCount;

  const rowsHtml = tasks
    .map(
      (t) => `
      <tr>
        <td style="padding:8px 0;border-bottom:1px solid #e4dccc;font-size:14px;color:#1b2421;">
          <strong>${escapeHtml(t.contactName)}</strong> — ${escapeHtml(t.title)}
        </td>
        <td style="padding:8px 0;border-bottom:1px solid #e4dccc;font-size:12px;text-align:right;white-space:nowrap;color:${t.overdue ? "#c94e29" : "#5b6763"};">
          ${t.overdue ? "Atrasada · " : ""}${escapeHtml(shortDateFormatter.format(new Date(t.dueDate)))}
        </td>
      </tr>`
    )
    .join("\n");

  const summary =
    overdueCount > 0 && todayCount > 0
      ? `${overdueCount} atrasada${overdueCount === 1 ? "" : "s"} e ${todayCount} de hoje`
      : overdueCount > 0
        ? `${overdueCount} atrasada${overdueCount === 1 ? "" : "s"}`
        : `${todayCount} de hoje`;

  const body = `
    <p style="font-size:16px;">Olá, <strong>${escapeHtml(professionalName)}</strong>,</p>
    <p style="font-size:14px;line-height:1.6;color:#5b6763;">
      Você tem ${summary} no CRM da Vero:
    </p>
    <table style="width:100%;border-collapse:collapse;margin:16px 0;">
      ${rowsHtml}
    </table>
    <p style="margin:24px 0;">${button(dashboardUrl, "Ver no painel")}</p>
  `;
  return {
    subject:
      overdueCount > 0
        ? `${overdueCount} tarefa${overdueCount === 1 ? "" : "s"} atrasada${overdueCount === 1 ? "" : "s"} no CRM`
        : "Tarefas de hoje no CRM — Vero",
    html: shell("Tarefas do CRM — Vero", body),
  };
}
