import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import { prisma } from "@/lib/prisma";
import { SessionUser } from "@/types";

export async function GET() {
  const session = await getServerSession(authOptions);

  if (!session || !session.user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const archives = await prisma.userArchive.findMany({
      where: { userId: parseInt((session.user as SessionUser).id) },
      orderBy: { createdAt: "desc" },
    });

    return NextResponse.json(archives);
  } catch (error) {
    console.error("GET User Archives Error:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  const session = await getServerSession(authOptions);

  if (!session || !session.user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const body = await req.json();
    const { name, content, isDefault } = body;

    if (!name || !content) {
      return NextResponse.json({ error: "Name and content are required" }, { status: 400 });
    }

    const userId = parseInt((session.user as SessionUser).id);

    // If setting as default, unset other defaults
    if (isDefault) {
      await prisma.userArchive.updateMany({
        where: { userId, isDefault: true },
        data: { isDefault: false },
      });
    }

    const archive = await prisma.userArchive.create({
      data: {
        name,
        content,
        isDefault: isDefault || false,
        userId,
      },
    });

    return NextResponse.json(archive, { status: 201 });
  } catch (error) {
    console.error("POST User Archives Error:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
