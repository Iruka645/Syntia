import { GoogleGenerativeAI } from "@google/generative-ai";

export async function getChatResponse(
  systemPrompt: string,
  history: { role: "user" | "model"; parts: { text: string }[] }[],
  userMessage: string
) {
  const apiKey = process.env.GOOGLE_AI_API_KEY;
  // ดึงชื่อโมเดลจาก .env (เริ่มต้นด้วย 3.1-flash-lite)
  const gemini_model = process.env.GEMINI_MODEL || "gemini-3.1-flash-lite";
  
  if (!apiKey) {
    throw new Error("GOOGLE_AI_API_KEY is not defined in environment variables");
  }

  try {
    const genAI = new GoogleGenerativeAI(apiKey);
    const maxTokens = parseInt(process.env.MAX_OUTPUT_TOKENS || "800");

    // คำสั่งกลางเพื่อควบคุมสไตล์การตอบแบบ Roleplay
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
      model: gemini_model,
      systemInstruction: combinedPrompt,
      generationConfig: {
        maxOutputTokens: maxTokens,
      }
    });

    const chat = model.startChat({
      history: history,
    });

    const result = await chat.sendMessage(userMessage);
    const response = await result.response;
    return response.text();
  } catch (error) {
    console.error("Gemini API Error details:", error);
    throw error;
  }
}