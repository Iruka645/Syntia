import { GoogleGenerativeAI, Content } from "@google/generative-ai";

export async function getGeminiResponse(
  apiKey: string,
  modelName: string,
  systemPrompt: string,
  history: { role: "user" | "assistant"; content: string }[],
  userMessage: string
) {
  try {
    const genAI = new GoogleGenerativeAI(apiKey);
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

    const model = genAI.getGenerativeModel({ 
      model: modelName || "gemini-2.0-flash-lite",
      systemInstruction: combinedPrompt,
      generationConfig: {
        maxOutputTokens: maxTokens,
      }
    });

    // Convert unified history to Gemini history
    const geminiHistory = history.map(msg => ({
      role: msg.role === "user" ? "user" : "model",
      parts: [{ text: msg.content }]
    }));

    const chat = model.startChat({
      history: geminiHistory as Content[],
    });

    const result = await chat.sendMessage(userMessage);
    const response = await result.response;
    return response.text();
  } catch (error) {
    console.error("Gemini API Error details:", error);
    throw error;
  }
}
