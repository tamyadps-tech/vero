import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { ExerciseForm } from "./ExerciseForm";

vi.mock("next/navigation", () => ({
  useRouter: () => ({ refresh: vi.fn() }),
}));

describe("ExerciseForm", () => {
  beforeEach(() => {
    vi.stubGlobal("fetch", vi.fn());
  });

  afterEach(() => {
    vi.unstubAllGlobals();
  });

  it("disables submit until at least one prompt has text", async () => {
    const user = userEvent.setup();
    render(<ExerciseForm templateSlug="minha-rede-de-apoio" onClose={() => {}} />);

    const submit = screen.getByRole("button", { name: /^enviar$/i });
    expect(submit).toBeDisabled();

    const [firstField] = screen.getAllByRole("textbox");
    await user.type(firstField, "Minha mãe e minha melhor amiga.");
    expect(submit).toBeEnabled();
  });

  it("submits answers in prompt order and shows a confirmation", async () => {
    const fetchMock = fetch as unknown as ReturnType<typeof vi.fn>;
    fetchMock.mockResolvedValueOnce({
      ok: true,
      json: async () => ({ ok: true }),
    });

    const user = userEvent.setup();
    render(<ExerciseForm templateSlug="minha-rede-de-apoio" onClose={() => {}} />);

    const fields = screen.getAllByRole("textbox");
    await user.type(fields[0], "Minha mãe");
    await user.type(fields[1], "Grupo da igreja");
    await user.type(fields[2], "Ligar pra minha mãe");

    await user.click(screen.getByRole("button", { name: /^enviar$/i }));

    await waitFor(() =>
      expect(screen.getByText(/respostas enviadas/i)).toBeInTheDocument()
    );

    const [, options] = fetchMock.mock.calls[0];
    const sentBody = JSON.parse(options.body);
    expect(sentBody).toEqual({
      templateSlug: "minha-rede-de-apoio",
      answers: ["Minha mãe", "Grupo da igreja", "Ligar pra minha mãe"],
    });
  });
});
