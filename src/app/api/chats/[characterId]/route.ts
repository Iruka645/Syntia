import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";

export async function GET(
  req: Request,
  { params }: { params: Promise<{ characterId: string }> }
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session) {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
    }

    const { characterId: charIdStr } = await params;
    const userId = parseInt((session.user as any).id);
    const characterId = parseInt(charIdStr);

    // Find or create chat
    let chat = await prisma.chat.findFirst({
      where: {
        userId,
        characterId,
      },
      include: {
        character: true,
      },
    });

    if (!chat) {
      chat = await prisma.chat.create({
        data: {
          userId,
          characterId,
        },
        include: {
          character: true,
        },
      });
    }

    return NextResponse.json(chat);
  } catch (error) {
    console.error("Error getting chat:", error);
    return NextResponse.json({ message: "Internal server error" }, { status: 500 });
  }
}
