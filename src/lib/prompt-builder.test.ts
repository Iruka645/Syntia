import { describe, expect, it } from "vitest";
import { buildRoleplaySystemPrompt } from "./prompt-builder";

describe("buildRoleplaySystemPrompt", () => {
  it("places the character role and profile before user context", () => {
    const prompt = buildRoleplaySystemPrompt({
      characterName: "Bronya",
      characterPrompt: "Bronya is a composed company president.",
      userArchive: "The user is Captain Sakato of the Hyperion.",
    });

    expect(prompt.indexOf("[ROLEPLAY ROLE]")).toBeLessThan(
      prompt.indexOf("[CHARACTER PROFILE & INSTRUCTIONS]")
    );
    expect(prompt.indexOf("[CHARACTER PROFILE & INSTRUCTIONS]")).toBeLessThan(
      prompt.indexOf("[USER IDENTITY & CONTEXT]")
    );
    expect(prompt.indexOf("[USER IDENTITY & CONTEXT]")).toBeLessThan(
      prompt.indexOf("[ROLEPLAY & CONVERSATION GUIDELINES]")
    );
  });

  it("makes the character and user identities unambiguous", () => {
    const prompt = buildRoleplaySystemPrompt({
      characterName: "Bronya",
      characterPrompt: "Character details",
      userArchive: "User details",
    });

    expect(prompt).toContain("You are Bronya.");
    expect(prompt).toContain("Do not adopt it as your own identity");
  });

  it("omits the user context section when no archive is selected", () => {
    const prompt = buildRoleplaySystemPrompt({
      characterName: "Bronya",
      characterPrompt: "Character details",
    });

    expect(prompt).not.toContain("[USER IDENTITY & CONTEXT]");
    expect(prompt).toContain("[ROLEPLAY & CONVERSATION GUIDELINES]");
  });
});
