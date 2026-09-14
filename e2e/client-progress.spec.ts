import { test, expect } from "@playwright/test";

test("old client token link redirects to login", async ({ page }) => {
  const response = await page.goto(
    "/c/11111111-1111-1111-1111-111111111111"
  );
  expect(response?.status()).toBe(200);
  expect(page.url()).toContain("/c/entrar");
});

test("client dashboard redirects to login when not authenticated", async ({
  page,
}) => {
  const response = await page.goto("/c/dashboard");
  expect(response?.status()).toBe(200);
  expect(page.url()).toContain("/c/entrar");
});

test("client login and signup pages render their forms", async ({ page }) => {
  await page.goto("/c/entrar");
  await expect(page.getByRole("heading", { name: /^entrar$/i })).toBeVisible();
  await expect(page.getByLabel(/^email$/i)).toBeVisible();

  await page.goto("/c/cadastrar");
  await expect(page.getByRole("heading", { name: /criar conta/i })).toBeVisible();
  await expect(page.getByLabel(/nome completo/i)).toBeVisible();
});
