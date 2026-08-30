import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import { encrypt } from "@/lib/encryption";
import { SessionUser } from "@/types";

export async function GET() {
  try {
    const session = await getServerSession(authOptions);

    if (!session) {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
    }

    const characters = await prisma.character.findMany({
      orderBy: { createdAt: "desc" },
    });

    return NextResponse.json(characters);
  } catch (error) {
    console.error("Error fetching characters:", error);
    return NextResponse.json({ message: "Internal server error" }, { status: 500 });
  }
}
export async function POST(req: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session) {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
    }

    const {
      name,
      description,
      systemPrompt,
      greeting,
      avatarUrl,
      provider,
      model,
      apiKey,
      baseUrl,
    } = await req.json();

    if (!name || !description || !systemPrompt || !greeting) {
      return NextResponse.json({ message: "Missing required fields" }, { status: 400 });
    }

    const character = await prisma.character.create({
      data: {
        name,
        description,
        systemPrompt,
        greeting,
        avatarUrl,
        provider: provider || null,
        model: model || null,
        apiKey: apiKey ? encrypt(apiKey) : null,
        baseUrl: baseUrl?.trim() || null,
        createdBy: parseInt((session.user as SessionUser).id),
      },
    });

    return NextResponse.json(character);
  } catch (error) {
    console.error("Error creating character:", error);
    return NextResponse.json({ message: "Internal server error" }, { status: 500 });
  }
}
