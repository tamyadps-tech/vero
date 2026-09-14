import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { ProfessionalApplyForm } from "./ProfessionalApplyForm";

describe("ProfessionalApplyForm", () => {
  beforeEach(() => {
    vi.stubGlobal("fetch", vi.fn());
  });

  afterEach(() => {
    vi.unstubAllGlobals();
  });

  it("submits the application and shows a success message", async () => {
    const fetchMock = fetch as unknown as ReturnType<typeof vi.fn>;
    fetchMock.mockResolvedValueOnce({
      ok: true,
      json: async () => ({ ok: true }),
    });

    const user = userEvent.setup();
    render(<ProfessionalApplyForm />);

    await user.type(screen.getByLabelText(/nome completo/i), "Maria Silva");
    await user.type(screen.getByLabelText(/^email$/i), "maria@example.com");
    await user.type(screen.getByLabelText(/crie uma senha/i), "senha1234");
    await user.type(screen.getByLabelText(/anos de experiência/i), "10");
    await user.type(
      screen.getByLabelText(/fale sobre sua experiência/i),
      "Psicóloga com 10 anos de experiência em terapia cognitivo-comportamental."
    );
    await user.type(
      screen.getByLabelText(/^especialidades$/i),
      "Ansiedade, Burnout"
    );
    await user.type(screen.getByLabelText(/preço por sessão/i), "250");
    await user.click(screen.getByRole("button", { name: /enviar candidatura/i }));

    await waitFor(() =>
      expect(screen.getByText(/candidatura recebida/i)).toBeInTheDocument()
    );
    expect(screen.getByRole("link", { name: /fazer login/i })).toHaveAttribute(
      "href",
      "/p/entrar"
    );

    const [, options] = fetchMock.mock.calls[0];
    const sentBody = options.body as FormData;
    expect(sentBody.get("fullName")).toBe("Maria Silva");
    expect(sentBody.get("email")).toBe("maria@example.com");
    expect(sentBody.get("password")).toBe("senha1234");
    expect(sentBody.get("category")).toBe("terapeuta");
    expect(sentBody.get("yearsExperience")).toBe("10");
    expect(JSON.parse(sentBody.get("specialties") as string)).toEqual([
      "Ansiedade",
      "Burnout",
    ]);
    expect(sentBody.get("sessionFormat")).toBe("online");
    expect(sentBody.get("priceCents")).toBe("25000");
  });

  it("shows an error message when the request fails", async () => {
    const fetchMock = fetch as unknown as ReturnType<typeof vi.fn>;
    fetchMock.mockResolvedValueOnce({
      ok: false,
      json: async () => ({ error: "Email já cadastrado." }),
    });

    const user = userEvent.setup();
    render(<ProfessionalApplyForm />);

    await user.type(screen.getByLabelText(/nome completo/i), "Maria Silva");
    await user.type(screen.getByLabelText(/^email$/i), "maria@example.com");
    await user.type(screen.getByLabelText(/crie uma senha/i), "senha1234");
    await user.type(screen.getByLabelText(/anos de experiência/i), "10");
    await user.type(
      screen.getByLabelText(/fale sobre sua experiência/i),
      "Psicóloga com 10 anos de experiência em terapia cognitivo-comportamental."
    );
    await user.type(
      screen.getByLabelText(/^especialidades$/i),
      "Ansiedade, Burnout"
    );
    await user.type(screen.getByLabelText(/preço por sessão/i), "250");
    await user.click(screen.getByRole("button", { name: /enviar candidatura/i }));

    await waitFor(() =>
      expect(screen.getByRole("alert")).toHaveTextContent("Email já cadastrado.")
    );
  });
});
