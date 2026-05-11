import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import { getChatResponse } from "@/lib/gemini";

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
    if (!session) {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
    }

    const { chatId, content, isReroll, oldAiMessageId } = await req.json();

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
        id: isReroll ? { not: oldAiMessageId } : undefined // Exclude the message we are re-rolling
      },
      orderBy: { createdAt: "desc" },
      take: limit,
    });

    // Format history for Gemini (Gemini uses 'user' and 'model' roles)
    const history = previousMessages
      .filter(m => !userMessage || m.id !== userMessage.id) 
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
    return NextResponse.json({ message: "Internal server error" }, { status: 500 });
  }
}
