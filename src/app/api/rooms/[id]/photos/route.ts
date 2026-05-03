import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getSession } from "@/lib/auth";
import { writeFile, mkdir } from "fs/promises";
import path from "path";

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await getSession();
  if (!session) return NextResponse.json({ error: "Non autorisé" }, { status: 401 });

  const { id: roomId } = await params;

  const room = await prisma.inspectionRoom.findUnique({
    where: { id: roomId },
    include: { inspection: true },
  });
  if (!room) return NextResponse.json({ error: "Pièce introuvable" }, { status: 404 });

  if (
    session.role === "INSPECTOR" &&
    room.inspection.inspectorId !== session.id
  ) {
    return NextResponse.json({ error: "Non autorisé" }, { status: 403 });
  }

  const formData = await req.formData();
  const file = formData.get("file") as File;
  const caption = formData.get("caption") as string | null;

  if (!file) return NextResponse.json({ error: "Aucun fichier" }, { status: 400 });

  const bytes = await file.arrayBuffer();
  const buffer = Buffer.from(bytes);

  const uploadDir = path.join(process.cwd(), "public", "uploads");
  await mkdir(uploadDir, { recursive: true });

  const ext = file.name.split(".").pop() || "jpg";
  const filename = `${Date.now()}-${Math.random().toString(36).slice(2)}.${ext}`;
  await writeFile(path.join(uploadDir, filename), buffer);

  const photo = await prisma.photo.create({
    data: {
      url: `/uploads/${filename}`,
      caption: caption || null,
      roomId,
    },
  });

  return NextResponse.json(photo, { status: 201 });
}
