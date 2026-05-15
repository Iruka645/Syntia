import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import { getChatResponse, AIProvider } from "@/lib/ai-provider";
import { decrypt } from "@/lib/encryption";
import { SessionUser } from "@/types";

export async function GET(req: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session) {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
    }

    const { searchParams } = new URL(req.url);
    const chatId = parseInt(searchParams.get("chatId") || "");

    if (!chatId) {
      return NextResponse.json({ message: "Missing chatId" }, { status: 400 });
    }

    const messages = await prisma.message.findMany({
      where: { chatId },
      orderBy: { createdAt: "asc" },
    });

    return NextResponse.json(messages);
  } catch (error) {
    console.error("Error fetching messages:", error);
    return NextResponse.json({ message: "Internal server error" }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session || !session.user) {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
    }

    const userId = parseInt((session.user as SessionUser).id);
    const { chatId, content, isReroll, oldAiMessageId } = await req.json();

    if (!chatId || !content) {
      return NextResponse.json({ message: "Missing required fields" }, { status: 400 });
    }

    // 1. Get Chat, Character, User AI Settings and Archive
    const chat = await prisma.chat.findUnique({
      where: { id: chatId },
      include: { 
        character: true,
        archive: true // Include archive content
      },
    });

    if (!chat) {
      return NextResponse.json({ message: "Chat not found" }, { status: 404 });
    }

    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: { defaultProvider: true, defaultModel: true, apiKey: true }
    });

    // Determine Provider and Key with layered priority
    const provider: AIProvider = (chat.character.provider as AIProvider) || (user?.defaultProvider as AIProvider) || "gemini";
    let apiKey = "";

    try {
      if (chat.character.apiKey) {
        apiKey = decrypt(chat.character.apiKey);
      } else if (user?.apiKey) {
        apiKey = decrypt(user.apiKey);
      }
    } catch (e) {
      console.error("Failed to decrypt API key:", e);
    }

    // Fallback to ENV if no key found in DB
    if (!apiKey) {
      if (provider === "gemini") apiKey = process.env.GOOGLE_AI_API_KEY || "";
      else if (provider === "openai") apiKey = process.env.OPENAI_API_KEY || "";
      else if (provider === "claude") apiKey = process.env.ANTHROPIC_API_KEY || "";
      else if (provider === "grok") apiKey = process.env.XAI_API_KEY || "";
    }

    if (!apiKey) {
      return NextResponse.json({ 
        message: `API Key for ${provider} is missing. Please set it in Settings or Character settings.` 
      }, { status: 400 });
    }

    let userMessage = null;
    if (!isReroll) {
      // 2. Save User Message (only if not re-rolling)
      userMessage = await prisma.message.create({
        data: {
          chatId,
          role: "user",
          content,
        },
      });
    }

    // 3. Get Recent History for AI context
    const limit = parseInt(process.env.CONTEXT_WINDOW_LIMIT || "20");
    const previousMessages = await prisma.message.findMany({
      where: { 
        chatId,
        id: isReroll ? { not: oldAiMessageId } : undefined 
      },
      orderBy: { createdAt: "desc" },
      take: limit,
    });

    // Format history for unified dispatcher
    const history = previousMessages
      .filter(m => !userMessage || m.id !== userMessage.id) 
      .reverse()
      .map(m => ({
        role: (m.role === "user" ? "user" : "assistant") as "user" | "assistant",
        content: m.content,
      }));

    // Construct final system prompt with Archive context if available
    let finalSystemPrompt = chat.character.systemPrompt;
    if (chat.archive) {
      finalSystemPrompt = `USER IDENTITY ARCHIVE:\n${chat.archive.content}\n\n${finalSystemPrompt}`;
    }

    // Resolve Model Name with layered priority
    let modelName = (chat.character.model as string) || (user?.defaultModel as string) || "";
    if (!modelName) {
      if (provider === "gemini") modelName = process.env.GEMINI_MODEL || "gemini-2.5-flash";
      else if (provider === "openai") modelName = "gpt-4o";
      else if (provider === "claude") modelName = "claude-3-5-sonnet-20241022";
      else if (provider === "grok") modelName = "grok-2-latest";
    }

    // 4. Get AI Response
    const aiResponseText = await getChatResponse(
      provider,
      apiKey,
      modelName,
      finalSystemPrompt,
      history,
      content
    );

    // 5. Save or Update AI Message
    let aiMessage;
    if (isReroll && oldAiMessageId) {
      aiMessage = await prisma.message.update({
        where: { id: oldAiMessageId },
        data: { content: aiResponseText }
      });
    } else {
      aiMessage = await prisma.message.create({
        data: {
          chatId,
          role: "assistant",
          content: aiResponseText,
        },
      });
    }

    return NextResponse.json({
      userMessage,
      aiMessage,
    });
  } catch (error) {
    console.error("Error in message route:", error);
    const errStr = String(error);
    let userAdvice = "An unknown error occurred while communicating with the AI provider.";

    const message = error instanceof Error ? error.message : errStr;

    if (errStr.includes("503") || errStr.toLowerCase().includes("high demand") || errStr.toLowerCase().includes("overloaded") || errStr.toLowerCase().includes("service unavailable")) {
      userAdvice = `Model is currently experiencing high demand/heavy load. Please try selecting a different model in Settings or try again later.`;
    } else if (errStr.includes("401") || errStr.toLowerCase().includes("unauthorized") || errStr.toLowerCase().includes("invalid api key") || errStr.toLowerCase().includes("api_key_invalid")) {
      userAdvice = `API Key appears to be invalid or unauthorized. Please verify your credentials.`;
    } else if (errStr.includes("404") || errStr.toLowerCase().includes("not found") || errStr.toLowerCase().includes("does not exist")) {
      userAdvice = `Model was not found or is not supported by your API key/tier. Please verify the model name.`;
    } else {
      userAdvice = `Provider error: ${message}`;
    }

    return NextResponse.json({ 
      error: true, 
      message: userAdvice,
      rawError: errStr 
    }, { status: 500 });
  }
}
