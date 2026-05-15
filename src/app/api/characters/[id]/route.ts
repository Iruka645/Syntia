import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import { encrypt } from "@/lib/encryption";
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

    const { id: charIdStr } = await params;
    const id = parseInt(charIdStr);
    const userId = parseInt((session.user as SessionUser).id);

    // Check ownership
    const character = await prisma.character.findUnique({
      where: { id },
    });

    if (!character) {
      return NextResponse.json({ message: "Character not found" }, { status: 404 });
    }

    if (character.createdBy !== userId) {
      return NextResponse.json({ message: "Forbidden" }, { status: 403 });
    }

    const { name, description, systemPrompt, greeting, avatarUrl, provider, model, apiKey } = await req.json();

    const updateData: {
      name: string;
      description: string;
      systemPrompt: string;
      greeting: string;
      avatarUrl: string;
      provider: string | null;
      model: string | null;
      apiKey?: string | null;
    } = {
      name,
      description,
      systemPrompt,
      greeting,
      avatarUrl,
      provider: provider || null,
      model: model || null,
    };

    if (apiKey && !apiKey.endsWith("...") && !apiKey.includes("••••")) {
      updateData.apiKey = encrypt(apiKey);
    } else if (apiKey === "") {
      updateData.apiKey = null;
    }

    const updatedCharacter = await prisma.character.update({
      where: { id },
      data: updateData,
    });

    return NextResponse.json(updatedCharacter);
  } catch (error) {
    console.error("Error updating character:", error);
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

    const { id: charIdStr } = await params;
    const id = parseInt(charIdStr);
    const userId = parseInt((session.user as SessionUser).id);

    // Check ownership
    const character = await prisma.character.findUnique({
      where: { id },
    });

    if (!character) {
      return NextResponse.json({ message: "Character not found" }, { status: 404 });
    }

    if (character.createdBy !== userId) {
      return NextResponse.json({ message: "Forbidden" }, { status: 403 });
    }

    await prisma.character.delete({
      where: { id },
    });

    return NextResponse.json({ message: "Character deleted successfully" });
  } catch (error) {
    console.error("Error deleting character:", error);
    return NextResponse.json({ message: "Internal server error" }, { status: 500 });
  }
}

export async function GET(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session) {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
    }

    const { id: charIdStr } = await params;
    const id = parseInt(charIdStr);

    const character = await prisma.character.findUnique({
      where: { id },
    });

    if (!character) {
      return NextResponse.json({ message: "Character not found" }, { status: 404 });
    }

    return NextResponse.json(character);
  } catch (error) {
    console.error("Error fetching character:", error);
    return NextResponse.json({ message: "Internal server error" }, { status: 500 });
  }
}
