import { expect, test } from "@playwright/test";

test("user can create a character and send a mocked chat message", async ({ page }) => {
  const uniqueId = Date.now();
  const username = `chat_${uniqueId}`;
  const characterName = `Guide ${uniqueId}`;

  await page.route("**/api/messages**", async (route) => {
    const request = route.request();

    if (request.method() !== "POST") {
      await route.continue();
      return;
    }

    const body = request.postDataJSON() as { content: string };
    await route.fulfill({
      status: 200,
      contentType: "application/json",
      body: JSON.stringify({
        userMessage: {
          id: 9001,
          role: "user",
          content: body.content,
          createdAt: new Date().toISOString(),
        },
        aiMessage: {
          id: 9002,
          role: "assistant",
          content: "Mocked AI response",
          createdAt: new Date().toISOString(),
        },
      }),
    });
  });

  await page.goto("/register");
  await page.getByPlaceholder("Display Name").fill("Chat E2E");
  await page.getByPlaceholder("Username").fill(username);
  await page.getByPlaceholder("Password").fill("password123");
  await page.getByRole("button", { name: "Create Account" }).click();

  await expect(page).toHaveURL(/\/login$/);

  await page.getByPlaceholder("Username").fill(username);
  await page.getByPlaceholder("Password").fill("password123");
  await page.getByRole("button", { name: "Sign In" }).click();

  await expect(page.getByRole("heading", { name: "Choose Your Character" })).toBeVisible();

  await page.getByRole("button", { name: "New Character" }).click();
  await page.getByPlaceholder("e.g. Miyori").fill(characterName);
  await page
    .getByPlaceholder("Briefly describe the personality...")
    .fill("A practical testing guide.");
  await page.getByPlaceholder("What should the character say first?").fill("Ready for a test run.");
  await page
    .getByPlaceholder("Instructions for the AI (Personality, tone, rules...)")
    .fill("Stay concise and helpful.");
  await page.getByRole("button", { name: "Create Character" }).click();

  await expect(page.getByText(characterName)).toBeVisible();
  await page.getByText(characterName).click();

  await expect(page.getByRole("heading", { name: characterName })).toBeVisible();

  await page.getByRole("textbox").fill("Hello from E2E");
  await page.getByRole("button", { name: "Send message" }).click();

  await expect(page.getByText("Hello from E2E")).toBeVisible();
  await expect(page.getByText("Mocked AI response")).toBeVisible();
});
