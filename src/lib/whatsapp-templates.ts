const dateFormatter = new Intl.DateTimeFormat("pt-BR", {
  dateStyle: "long",
  timeStyle: "short",
});

export function bookingConfirmationWhatsApp({
  clientName,
  professionalName,
  scheduledAt,
}: {
  clientName: string;
  professionalName: string;
  scheduledAt: string;
}): string {
  const when = dateFormatter.format(new Date(scheduledAt));
  return `Olá, ${clientName}! Sua sessão com ${professionalName} foi confirmada para ${when}. — Vero`;
}

export function sessionReminderWhatsApp({
  clientName,
  professionalName,
  scheduledAt,
}: {
  clientName: string;
  professionalName: string;
  scheduledAt: string;
}): string {
  const when = dateFormatter.format(new Date(scheduledAt));
  return `Oi, ${clientName}! Lembrete: você tem uma sessão com ${professionalName} amanhã, ${when}. — Vero`;
}
