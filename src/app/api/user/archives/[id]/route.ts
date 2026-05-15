import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import { prisma } from "@/lib/prisma";

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await getServerSession(authOptions);

  if (!session || !session.user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const { id: paramId } = await params;
    const archive = await prisma.userArchive.findFirst({
      where: {
        id: parseInt(paramId),
        userId: parseInt((session.user as any).id),
      },
    });

    if (!archive) {
      return NextResponse.json({ error: "Archive not found" }, { status: 404 });
    }

    return NextResponse.json(archive);
  } catch (error) {
    console.error("GET Single Archive Error:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}

export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await getServerSession(authOptions);

  if (!session || !session.user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const body = await req.json();
    const { name, content, isDefault } = body;
    const userId = parseInt((session.user as any).id);
    const { id: paramId } = await params;
    const archiveId = parseInt(paramId);

    // Verify ownership
    const existing = await prisma.userArchive.findFirst({
      where: { id: archiveId, userId },
    });

    if (!existing) {
      return NextResponse.json({ error: "Archive not found" }, { status: 404 });
    }

    // If setting as default, unset other defaults
    if (isDefault) {
      await prisma.userArchive.updateMany({
        where: { userId, isDefault: true, id: { not: archiveId } },
        data: { isDefault: false },
      });
    }

    const archive = await prisma.userArchive.update({
      where: { id: archiveId },
      data: {
        name: name ?? undefined,
        content: content ?? undefined,
        isDefault: isDefault ?? undefined,
      },
    });

    return NextResponse.json(archive);
  } catch (error) {
    console.error("PATCH Archive Error:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}

export async function DELETE(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await getServerSession(authOptions);

  if (!session || !session.user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const userId = parseInt((session.user as any).id);
    const { id: paramId } = await params;
    const archiveId = parseInt(paramId);

    // Verify ownership
    const existing = await prisma.userArchive.findFirst({
      where: { id: archiveId, userId },
    });

    if (!existing) {
      return NextResponse.json({ error: "Archive not found" }, { status: 404 });
    }

    await prisma.userArchive.delete({
      where: { id: archiveId },
    });

    return NextResponse.json({ message: "Archive deleted successfully" });
  } catch (error) {
    console.error("DELETE Archive Error:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
