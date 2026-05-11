export async function getGrokResponse(
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
    { role: "system", content: combinedPrompt },
    ...history.map(msg => ({ role: msg.role, content: msg.content })),
    { role: "user", content: userMessage }
  ];

  const response = await fetch("https://api.x.ai/v1/chat/completions", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "Authorization": `Bearer ${apiKey}`
    },
    body: JSON.stringify({
      model: modelName || "grok-2-latest",
      messages: messages,
      max_tokens: maxTokens,
    })
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(`Grok API Error: ${error.error?.message || response.statusText}`);
  }

  const data = await response.json();
  return data.choices[0].message.content;
}
