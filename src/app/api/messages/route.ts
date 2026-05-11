import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import { getChatResponse } from "@/lib/gemini";

export async function POST(req: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session) {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
    }

    const { chatId, content } = await req.json();

    if (!chatId || !content) {
      return NextResponse.json({ message: "Missing required fields" }, { status: 400 });
    }

    // 1. Get Chat and Character Info
    const chat = await prisma.chat.findUnique({
      where: { id: chatId },
      include: { character: true },
    });

    if (!chat) {
      return NextResponse.json({ message: "Chat not found" }, { status: 404 });
    }

    // 2. Save User Message
    const userMessage = await prisma.message.create({
      data: {
        chatId,
        role: "user",
        content,
      },
    });

    // 3. Get Recent History for AI context
    const limit = parseInt(process.env.CONTEXT_WINDOW_LIMIT || "20");
    const previousMessages = await prisma.message.findMany({
      where: { chatId },
      orderBy: { createdAt: "desc" },
      take: limit,
    });

    // Format history for Gemini (Gemini uses 'user' and 'model' roles)
    // We reverse it to be in chronological order
    const history = previousMessages
      .filter(m => m.id !== userMessage.id) // Exclude current message
      .reverse()
      .map(m => ({
        role: (m.role === "user" ? "user" : "model") as "user" | "model",
        parts: [{ text: m.content }],
      }));

    // 4. Get AI Response
    const aiResponseText = await getChatResponse(
      chat.character.systemPrompt,
      history,
      content
    );

    // 5. Save AI Message
    const aiMessage = await prisma.message.create({
      data: {
        chatId,
        role: "assistant",
        content: aiResponseText,
      },
    });

    return NextResponse.json({
      userMessage,
      aiMessage,
    });
  } catch (error) {
    console.error("Error in message route:", error);
    return NextResponse.json({ message: "Internal server error" }, { status: 500 });
  }
}
