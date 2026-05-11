import { GoogleGenerativeAI } from "@google/generative-ai";

export async function getChatResponse(
  systemPrompt: string,
  history: { role: "user" | "model"; parts: { text: string }[] }[],
  userMessage: string
) {
  const apiKey = process.env.GOOGLE_AI_API_KEY;
  
  if (!apiKey) {
    throw new Error("GOOGLE_AI_API_KEY is not defined in environment variables");
  }

  try {
    const genAI = new GoogleGenerativeAI(apiKey);
    const model = genAI.getGenerativeModel({ 
      model: "gemini-flash-latest",
      systemInstruction: systemPrompt
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
