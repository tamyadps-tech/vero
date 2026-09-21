import { describe, it, expect } from "vitest";
import {
  bookingConfirmationEmail,
  sessionSummaryEmail,
  taskReminderEmail,
  textToParagraphsHtml,
} from "./email-templates";

describe("textToParagraphsHtml", () => {
  it("splits on blank lines into separate <p> tags", () => {
    const html = textToParagraphsHtml("Primeiro parágrafo.\n\nSegundo parágrafo.");
    expect(html.match(/<p /g)).toHaveLength(2);
    expect(html).toContain("Primeiro parágrafo.");
    expect(html).toContain("Segundo parágrafo.");
  });

  it("converts a single line break within a paragraph to <br>", () => {
    const html = textToParagraphsHtml("Linha um\nLinha dois");
    expect(html).toContain("Linha um<br>Linha dois");
  });

  it("escapes HTML so user-edited text can't inject markup", () => {
    const html = textToParagraphsHtml('<img src=x onerror="alert(1)">');
    expect(html).not.toContain("<img src=x");
    expect(html).toContain("&lt;img");
  });

  it("drops empty paragraphs from extra blank lines", () => {
    const html = textToParagraphsHtml("Um\n\n\n\nDois");
    expect(html.match(/<p /g)).toHaveLength(2);
  });
});

describe("bookingConfirmationEmail", () => {
  it("includes the professional name in the subject and the progress link", () => {
    const { subject, html } = bookingConfirmationEmail({
      clientName: "Ana",
      professionalName: "Dra. Maria",
      scheduledAt: "2026-06-17T14:00:00.000Z",
      progressUrl: "https://vero.app/c/abc123",
    });
    expect(subject).toContain("Dra. Maria");
    expect(html).toContain("https://vero.app/c/abc123");
    expect(html).toContain("Ana");
  });

  it("escapes HTML in user-provided names (no injection into the email)", () => {
    const { html } = bookingConfirmationEmail({
      clientName: '<img src=x onerror="alert(1)">',
      professionalName: "Dra. Maria",
      scheduledAt: "2026-06-17T14:00:00.000Z",
      progressUrl: "https://vero.app/c/abc123",
    });
    expect(html).not.toContain("<img src=x");
    expect(html).toContain("&lt;img");
  });
});

describe("sessionSummaryEmail", () => {
  it("renders topics, homework and next session when present", () => {
    const { html } = sessionSummaryEmail({
      clientName: "Ana",
      professionalName: "Dra. Maria",
      topics: ["Ansiedade", "Respiração"],
      homework: "Praticar 5 minutos por dia",
      nextSessionAt: "2026-06-24T14:00:00.000Z",
      progressUrl: "https://vero.app/c/abc123",
    });
    expect(html).toContain("Ansiedade");
    expect(html).toContain("Respiração");
    expect(html).toContain("Praticar 5 minutos por dia");
  });

  it("omits optional sections when there is nothing to show", () => {
    const { html } = sessionSummaryEmail({
      clientName: "Ana",
      professionalName: "Dra. Maria",
      topics: [],
      homework: null,
      nextSessionAt: null,
      progressUrl: "https://vero.app/c/abc123",
    });
    expect(html).not.toContain("Tópicos abordados");
    expect(html).not.toContain("Tarefa até a próxima sessão");
    expect(html).not.toContain("Próxima sessão");
  });
});

describe("taskReminderEmail", () => {
  it("marks the subject with the overdue count when there are overdue tasks", () => {
    const { subject, html } = taskReminderEmail({
      professionalName: "Dra. Maria",
      tasks: [
        { contactName: "João", title: "Ligar pra remarcar", dueDate: "2026-01-01", overdue: true },
        { contactName: "Ana", title: "Enviar material", dueDate: "2026-01-10", overdue: false },
      ],
      dashboardUrl: "https://vero.app/p/dashboard",
    });
    expect(subject).toContain("1 tarefa atrasada");
    expect(html).toContain("João");
    expect(html).toContain("Ligar pra remarcar");
    expect(html).toContain("Atrasada");
  });

  it("uses a plain subject when nothing is overdue", () => {
    const { subject } = taskReminderEmail({
      professionalName: "Dra. Maria",
      tasks: [{ contactName: "Ana", title: "Enviar material", dueDate: "2026-01-10", overdue: false }],
      dashboardUrl: "https://vero.app/p/dashboard",
    });
    expect(subject).toBe("Tarefas de hoje no CRM — Vero");
  });
});
