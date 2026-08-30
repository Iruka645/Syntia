import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import { SessionUser } from "@/types";

export async function GET(req: Request, { params }: { params: Promise<{ characterId: string }> }) {
  try {
    const session = await getServerSession(authOptions);
    if (!session) {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
    }

    const { characterId: charIdStr } = await params;
    const userId = parseInt((session.user as SessionUser).id);
    const characterId = parseInt(charIdStr);

    // Find or create chat
    let chat = await prisma.chat.findFirst({
      where: {
        userId,
        characterId,
      },
      include: {
        character: true,
        archive: true,
      },
    });

    if (!chat) {
      // Check for default archive
      const defaultArchive = await prisma.userArchive.findFirst({
        where: { userId, isDefault: true },
      });

      chat = await prisma.chat.create({
        data: {
          userId,
          characterId,
          archiveId: defaultArchive?.id || null,
        },
        include: {
          character: true,
          archive: true,
        },
      });
    }

    return NextResponse.json(chat);
  } catch (error) {
    console.error("Error getting chat:", error);
    return NextResponse.json({ message: "Internal server error" }, { status: 500 });
  }
}

export async function PATCH(
  req: Request,
  { params }: { params: Promise<{ characterId: string }> }
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session) {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
    }

    const { characterId: charIdStr } = await params;
    const userId = parseInt((session.user as SessionUser).id);
    const characterId = parseInt(charIdStr);
    const { archiveId } = await req.json();

    // Find the chat first to ensure it exists and belongs to the user
    const existingChat = await prisma.chat.findFirst({
      where: { userId, characterId },
    });

    if (!existingChat) {
      return NextResponse.json({ message: "Chat not found" }, { status: 404 });
    }

    const updatedChat = await prisma.chat.update({
      where: { id: existingChat.id },
      data: { archiveId: archiveId || null },
      include: {
        character: true,
        archive: true,
      },
    });

    return NextResponse.json(updatedChat);
  } catch (error) {
    console.error("Error updating chat archive:", error);
    return NextResponse.json({ message: "Internal server error" }, { status: 500 });
  }
}

export async function DELETE(
  _req: Request,
  { params }: { params: Promise<{ characterId: string }> }
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session) {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
    }

    const { characterId: charIdStr } = await params;
    const userId = parseInt((session.user as SessionUser).id);
    const characterId = parseInt(charIdStr);

    if (!Number.isInteger(characterId)) {
      return NextResponse.json({ message: "Invalid character ID" }, { status: 400 });
    }

    const chat = await prisma.chat.findFirst({
      where: { userId, characterId },
      select: { id: true },
    });

    if (!chat) {
      return NextResponse.json({ message: "Chat not found" }, { status: 404 });
    }

    const result = await prisma.message.deleteMany({
      where: { chatId: chat.id },
    });

    return NextResponse.json({
      message: "Chat history reset successfully",
      deletedCount: result.count,
    });
  } catch (error) {
    console.error("Error resetting chat history:", error);
    return NextResponse.json({ message: "Internal server error" }, { status: 500 });
  }
}
