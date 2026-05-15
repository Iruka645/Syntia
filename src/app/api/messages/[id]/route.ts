import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import { SessionUser } from "@/types";

export async function PATCH(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session) {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
    }

    const { id: messageIdStr } = await params;
    const id = parseInt(messageIdStr);
    const { content } = await req.json();

    // Verify ownership (the chat belongs to the user)
    const message = await prisma.message.findUnique({
      where: { id },
      include: { chat: true }
    });

    if (!message) {
      return NextResponse.json({ message: "Message not found" }, { status: 404 });
    }

    if (message.chat.userId !== parseInt((session.user as SessionUser).id)) {
      return NextResponse.json({ message: "Forbidden" }, { status: 403 });
    }

    const updatedMessage = await prisma.message.update({
      where: { id },
      data: { content }
    });

    return NextResponse.json(updatedMessage);
  } catch (error) {
    console.error("Error updating message:", error);
    return NextResponse.json({ message: "Internal server error" }, { status: 500 });
  }
}

export async function DELETE(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session) {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
    }

    const { id: messageIdStr } = await params;
    const id = parseInt(messageIdStr);

    // Verify ownership
    const message = await prisma.message.findUnique({
      where: { id },
      include: { chat: true }
    });

    if (!message) {
      return NextResponse.json({ message: "Message not found" }, { status: 404 });
    }

    if (message.chat.userId !== parseInt((session.user as SessionUser).id)) {
      return NextResponse.json({ message: "Forbidden" }, { status: 403 });
    }

    // Cascading Delete Logic
    if (message.role === "user") {
      // Find the next message (which should be the assistant's response)
      const nextMessage = await prisma.message.findFirst({
        where: {
          chatId: message.chatId,
          createdAt: { gt: message.createdAt },
          role: "assistant"
        },
        orderBy: { createdAt: "asc" }
      });

      if (nextMessage) {
        await prisma.message.delete({ where: { id: nextMessage.id } });
      }
    }

    await prisma.message.delete({ where: { id } });

    return NextResponse.json({ message: "Message deleted successfully" });
  } catch (error) {
    console.error("Error deleting message:", error);
    return NextResponse.json({ message: "Internal server error" }, { status: 500 });
  }
}
