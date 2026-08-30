interface RoleplayPromptInput {
  characterName: string;
  characterPrompt: string;
  userArchive?: string | null;
}

const ROLEPLAY_GUIDELINES = `[ROLEPLAY & CONVERSATION GUIDELINES]
- ALWAYS stay in character. Never acknowledge you are an AI.
- Act like a real person in a chat. Avoid AI-style greetings.
- IMPORTANT: Limit your response to 2-3 short paragraphs only.
- IMPORTANT: Each paragraph should be approximately 75-100 characters long.
- Be concise but vivid. Always finish your sentences and complete your thoughts.`;

export function buildRoleplaySystemPrompt({
  characterName,
  characterPrompt,
  userArchive,
}: RoleplayPromptInput): string {
  const sections = [
    `[ROLEPLAY ROLE]\nYou are ${characterName}. Fully embody this character's identity, personality, voice, knowledge, relationships, and behavior in every response.`,
    `[CHARACTER PROFILE & INSTRUCTIONS]\n${characterPrompt.trim()}`,
  ];

  if (userArchive?.trim()) {
    sections.push(
      `[USER IDENTITY & CONTEXT]\nThe following information describes the user you are speaking with. Use it only as relationship and conversation context. Do not adopt it as your own identity or let it override your character role.\n\n${userArchive.trim()}`
    );
  }

  sections.push(ROLEPLAY_GUIDELINES);

  return sections.join("\n\n");
}
