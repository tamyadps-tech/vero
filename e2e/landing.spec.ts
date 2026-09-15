import { test, expect } from "@playwright/test";

test("landing page shows the Vero value proposition and signup CTA", async ({
  page,
}) => {
  await page.goto("/");

  await expect(page).toHaveTitle(/Vero/);
  await expect(
    page.getByRole("heading", { name: /profissionais verificados/i })
  ).toBeVisible();

  await expect(
    page.getByRole("link", { name: /cadastre-se aqui/i }).first()
  ).toHaveAttribute("href", "/c/cadastrar");
  await expect(
    page.getByRole("link", { name: /termo de uso/i }).first()
  ).toBeVisible();
});

test("legal pages render the Termo de Uso and Política de Privacidade", async ({
  page,
}) => {
  await page.goto("/termos");
  await expect(
    page.getByRole("heading", { name: /termo de uso/i, level: 1 })
  ).toBeVisible();

  await page.goto("/privacidade");
  await expect(
    page.getByRole("heading", { name: /política de privacidade/i, level: 1 })
  ).toBeVisible();
});
