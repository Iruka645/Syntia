import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import { prisma } from "@/lib/prisma";
import { encrypt } from "@/lib/encryption";
import bcrypt from "bcryptjs";
import { SessionUser } from "@/types";

export async function GET() {
  const session = await getServerSession(authOptions);

  if (!session || !session.user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const user = await prisma.user.findUnique({
      where: { id: parseInt((session.user as SessionUser).id) },
      select: {
        name: true,
        username: true,
        defaultProvider: true,
        defaultModel: true,
        apiKey: true,
      },
    });

    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    // Mask API key for security visually filled like a standard password box
    const maskedKey = user.apiKey ? "••••••••••••••••••••••••••••••••" : "";

    return NextResponse.json({
      name: user.name,
      username: user.username,
      defaultProvider: user.defaultProvider || "gemini",
      defaultModel: user.defaultModel || "",
      apiKey: maskedKey,
      hasKey: !!user.apiKey,
    });
  } catch (error) {
    console.error("GET User Settings Error:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}

export async function PATCH(req: NextRequest) {
  const session = await getServerSession(authOptions);

  if (!session || !session.user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const body = await req.json();
    const { name, username, password, defaultProvider, defaultModel, apiKey } = body;

    const userId = parseInt((session.user as SessionUser).id);
    const updateData: {
      name?: string;
      username?: string;
      password?: string;
      defaultProvider?: string;
      defaultModel?: string | null;
      apiKey?: string | null;
    } = {};
    
    if (name) updateData.name = name;
    
    if (username) {
      // Check if username is already taken by another user
      const existing = await prisma.user.findFirst({
        where: { username, id: { not: userId } },
      });
      if (existing) {
        return NextResponse.json({ error: "Username already taken" }, { status: 400 });
      }
      updateData.username = username;
    }

    if (password) {
      updateData.password = await bcrypt.hash(password, 10);
    }

    if (defaultProvider) updateData.defaultProvider = defaultProvider;
    if (defaultModel !== undefined) updateData.defaultModel = defaultModel || null;
    
    // Only update API key if it's provided and not the masked version
    if (apiKey && !apiKey.endsWith("...") && !apiKey.includes("••••")) {
      updateData.apiKey = encrypt(apiKey);
    } else if (apiKey === "") {
      // Allow clearing the key
      updateData.apiKey = null;
    }

    await prisma.user.update({
      where: { id: userId },
      data: updateData,
    });

    return NextResponse.json({ message: "Settings updated successfully" });
  } catch (error) {
    console.error("PATCH User Settings Error:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
