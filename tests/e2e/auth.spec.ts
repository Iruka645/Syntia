import { expect, test } from "@playwright/test";
import Database from "better-sqlite3";
import path from "node:path";

test("login shows an error for invalid credentials", async ({ page }) => {
  await page.goto("/login");

  await expect(page.getByRole("heading", { name: "Welcome Back" })).toBeVisible();

  await page.getByPlaceholder("Username").fill("missing-user");
  await page.getByPlaceholder("Password").fill("wrong-password");
  await page.getByRole("button", { name: "Sign In" }).click();

  await expect(page.getByText("Invalid username or password")).toBeVisible();
});

test("registration creates a local database user", async ({ page }) => {
  const username = `e2e_${Date.now()}`;

  await page.goto("/register");
  await page.getByPlaceholder("Display Name").fill("E2E User");
  await page.getByPlaceholder("Username").fill(username);
  await page.getByPlaceholder("Password").fill("password123");
  await page.getByRole("button", { name: "Create Account" }).click();

  await expect(page).toHaveURL(/\/login$/);

  const db = new Database(path.join(process.cwd(), "dev.db"), { readonly: true });
  const user = db.prepare("select username from users where username = ?").get(username);
  db.close();

  expect(user).toMatchObject({ username });
});
