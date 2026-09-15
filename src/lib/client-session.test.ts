import { describe, it, expect, vi } from "vitest";
import { ensureClientForAuthUser } from "./client-session";
import type { SupabaseClient } from "@supabase/supabase-js";

/**
 * Fake mínimo do client do Supabase: cada chamada a `.from()` é
 * resolvida na ordem por uma fila de respostas — o suficiente pra
 * simular os 3 passos possíveis de `ensureClientForAuthUser` (buscar
 * por auth_user_id, buscar por email, e então linkar ou criar) sem
 * precisar de um mock genérico de query builder.
 */
function fakeAdmin(responses: Array<{ data: unknown; error?: { message: string } | null }>) {
  let call = 0;
  const chain = () => {
    const next = () => responses[call++] ?? { data: null, error: null };
    const builder: Record<string, unknown> = {};
    builder.select = () => builder;
    builder.eq = () => builder;
    builder.update = () => builder;
    builder.insert = () => builder;
    builder.maybeSingle = () => Promise.resolve(next());
    return builder;
  };
  return { from: () => chain() } as unknown as SupabaseClient;
}

describe("ensureClientForAuthUser", () => {
  it("returns the existing client when one is already linked by auth_user_id", async () => {
    const existing = {
      id: "c1",
      full_name: "Ana",
      email: "ana@example.com",
      phone_number: null,
      auth_user_id: "auth-1",
    };
    const admin = fakeAdmin([{ data: existing }]);

    const result = await ensureClientForAuthUser(admin, { id: "auth-1", email: "ana@example.com" });
    expect(result).toEqual(existing);
  });

  it("links an existing client (found by email) that has no auth_user_id yet", async () => {
    const linked = {
      id: "c2",
      full_name: "Bia",
      email: "bia@example.com",
      phone_number: null,
      auth_user_id: "auth-2",
    };
    const admin = fakeAdmin([
      { data: null }, // busca por auth_user_id: nada
      { data: { id: "c2", auth_user_id: null } }, // busca por email: acha sem vínculo
      { data: linked }, // update + select: linkado
    ]);

    const result = await ensureClientForAuthUser(admin, { id: "auth-2", email: "bia@example.com" });
    expect(result).toEqual(linked);
  });

  it("creates a new client when neither auth_user_id nor email match", async () => {
    const created = {
      id: "c3",
      full_name: "carol",
      email: "carol@example.com",
      phone_number: null,
      auth_user_id: "auth-3",
    };
    const admin = fakeAdmin([
      { data: null }, // busca por auth_user_id
      { data: null }, // busca por email
      { data: created }, // insert + select
    ]);

    const result = await ensureClientForAuthUser(admin, {
      id: "auth-3",
      email: "carol@example.com",
    });
    expect(result).toEqual(created);
  });

  it("falls back to the email prefix as full_name when auth user has no metadata", async () => {
    const admin = fakeAdmin([
      { data: null },
      { data: null },
      {
        data: {
          id: "c4",
          full_name: "dan",
          email: "dan@example.com",
          phone_number: null,
          auth_user_id: "auth-4",
        },
      },
    ]);

    const result = await ensureClientForAuthUser(admin, { id: "auth-4", email: "dan@example.com" });
    expect(result?.full_name).toBe("dan");
  });

  it("returns null when the auth user has no email at all", async () => {
    const admin = fakeAdmin([{ data: null }]);
    const result = await ensureClientForAuthUser(admin, { id: "auth-5" });
    expect(result).toBeNull();
  });

  it("returns null instead of creating a duplicate when the email belongs to a different linked account", async () => {
    const admin = fakeAdmin([
      { data: null }, // busca por auth_user_id
      { data: { id: "c6", auth_user_id: "some-other-auth-id" } }, // email já vinculado a outra conta
    ]);

    const result = await ensureClientForAuthUser(admin, { id: "auth-6", email: "eve@example.com" });
    expect(result).toBeNull();
  });

  it("returns null and logs when the insert fails", async () => {
    const consoleSpy = vi.spyOn(console, "error").mockImplementation(() => {});
    const admin = fakeAdmin([
      { data: null },
      { data: null },
      { data: null, error: { message: "boom" } },
    ]);

    const result = await ensureClientForAuthUser(admin, { id: "auth-7", email: "fay@example.com" });
    expect(result).toBeNull();
    expect(consoleSpy).toHaveBeenCalled();
    consoleSpy.mockRestore();
  });
});
