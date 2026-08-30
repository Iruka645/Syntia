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

    const model = genAI.getGenerativeModel({
      model: modelName || "gemini-2.0-flash-lite",
      systemInstruction: systemPrompt,
      generationConfig: {
        maxOutputTokens: maxTokens,
      },
    });

    // Convert unified history to Gemini history
    const geminiHistory = history.map((msg) => ({
      role: msg.role === "user" ? "user" : "model",
      parts: [{ text: msg.content }],
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
