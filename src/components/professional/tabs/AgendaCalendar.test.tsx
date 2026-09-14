import { describe, it, expect, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { AgendaCalendar } from "./AgendaCalendar";
import type { AdminSession } from "@/lib/admin-sessions";

vi.mock("next/navigation", () => ({
  useRouter: () => ({ refresh: vi.fn() }),
}));

const TODAY_ISO = "2026-09-14T12:00:00.000Z";

function makeSession(overrides: Partial<AdminSession> = {}): AdminSession {
  return {
    id: "session-1",
    scheduled_at: "2026-09-14T14:00:00.000Z",
    status: "agendada",
    topics: null,
    homework: null,
    next_session_at: null,
    client: { full_name: "Maria Silva", email: "maria@example.com" },
    payment: null,
    ...overrides,
  };
}

describe("AgendaCalendar", () => {
  it("defaults to week view and shows today's session in the list", () => {
    render(<AgendaCalendar sessions={[makeSession()]} todayIso={TODAY_ISO} />);
    expect(screen.getByRole("button", { name: "Semana" })).toHaveClass("bg-primary");
    expect(screen.getByText("Maria Silva")).toBeInTheDocument();
  });

  it("switches to month view and shows a day-count dot", () => {
    render(<AgendaCalendar sessions={[makeSession()]} todayIso={TODAY_ISO} />);
    const user = userEvent.setup();
    return user.click(screen.getByRole("button", { name: "Mês" })).then(() => {
      expect(screen.getByRole("button", { name: "Mês" })).toHaveClass("bg-primary");
      // A sessão some da lista solta (só aparece ao clicar num dia).
      expect(screen.queryByText("Maria Silva")).not.toBeInTheDocument();
    });
  });

  it("clicking a day in month view switches to day view and filters sessions", async () => {
    render(
      <AgendaCalendar
        sessions={[
          makeSession({ id: "s1", scheduled_at: "2026-09-14T14:00:00.000Z" }),
          makeSession({
            id: "s2",
            scheduled_at: "2026-09-20T14:00:00.000Z",
            client: { full_name: "João Pereira", email: "joao@example.com" },
          }),
        ]}
        todayIso={TODAY_ISO}
      />
    );
    const user = userEvent.setup();
    await user.click(screen.getByRole("button", { name: "Mês" }));
    await user.click(screen.getByRole("button", { name: /^Dia 20/ }));

    expect(screen.getByRole("button", { name: "Dia" })).toHaveClass("bg-primary");
    expect(screen.getByText("João Pereira")).toBeInTheDocument();
    expect(screen.queryByText("Maria Silva")).not.toBeInTheDocument();
  });

  it("shows an empty state when there are no sessions in the period", () => {
    render(<AgendaCalendar sessions={[]} todayIso={TODAY_ISO} />);
    expect(screen.getByText(/nenhuma sessão nesse período/i)).toBeInTheDocument();
  });
});
