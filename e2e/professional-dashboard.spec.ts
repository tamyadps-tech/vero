import { test, expect } from "@playwright/test";

test("old professional token link redirects to login", async ({ page }) => {
  const response = await page.goto(
    "/p/11111111-1111-1111-1111-111111111111"
  );
  expect(response?.status()).toBe(200);
  expect(page.url()).toContain("/p/entrar");
});

test("professional dashboard redirects to login when not authenticated", async ({
  page,
}) => {
  const response = await page.goto("/p/dashboard");
  expect(response?.status()).toBe(200);
  expect(page.url()).toContain("/p/entrar");
});

test("professional login page renders its form", async ({ page }) => {
  await page.goto("/p/entrar");
  await expect(
    page.getByRole("heading", { name: /entrar como profissional/i })
  ).toBeVisible();
  await expect(page.getByLabel(/^email$/i)).toBeVisible();
  await expect(page.getByLabel(/^senha$/i)).toBeVisible();
});
