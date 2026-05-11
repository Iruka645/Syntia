export async function getClaudeResponse(
  apiKey: string,
  modelName: string,
  systemPrompt: string,
  history: { role: "user" | "assistant"; content: string }[],
  userMessage: string
) {
  const maxTokens = parseInt(process.env.MAX_OUTPUT_TOKENS || "800");

  const GLOBAL_RESPONSE_GUIDE = `
[ROLEPLAY & CONVERSATION GUIDELINE]:
- ALWAYS stay in character. Never acknowledge you are an AI.
- Act like a real person in a chat. Avoid AI-style greetings.
- IMPORTANT: Limit your response to 2-3 short paragraphs only.
- IMPORTANT: Each paragraph should be approximately 75-100 characters long.
- Be concise but vivid. Always finish your sentences and complete your thoughts.
`;

  const combinedPrompt = `${systemPrompt}\n${GLOBAL_RESPONSE_GUIDE}`;

  const messages = [
    ...history.map(msg => ({ role: msg.role, content: msg.content })),
    { role: "user", content: userMessage }
  ];

  const response = await fetch("https://api.anthropic.com/v1/messages", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "x-api-key": apiKey,
      "anthropic-version": "2023-06-01"
    },
    body: JSON.stringify({
      model: modelName || "claude-3-5-sonnet-20240620",
      system: combinedPrompt,
      messages: messages,
      max_tokens: maxTokens,
    })
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(`Claude API Error: ${error.error?.message || response.statusText}`);
  }

  const data = await response.json();
  return data.content[0].text;
}
