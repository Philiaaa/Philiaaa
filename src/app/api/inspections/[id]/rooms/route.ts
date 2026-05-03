import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getSession } from "@/lib/auth";

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await getSession();
  if (!session) return NextResponse.json({ error: "Non autorisé" }, { status: 401 });

  const { id } = await params;
  const inspection = await prisma.inspection.findUnique({ where: { id } });
  if (!inspection) return NextResponse.json({ error: "Introuvable" }, { status: 404 });

  if (session.role === "INSPECTOR" && inspection.inspectorId !== session.id) {
    return NextResponse.json({ error: "Non autorisé" }, { status: 403 });
  }

  const { name, condition, notes } = await req.json();

  const room = await prisma.inspectionRoom.create({
    data: { name, condition: condition || null, notes: notes || null, inspectionId: id },
    include: { photos: true },
  });

  return NextResponse.json(room, { status: 201 });
}

export async function PUT(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await getSession();
  if (!session) return NextResponse.json({ error: "Non autorisé" }, { status: 401 });

  const { id } = await params;
  const inspection = await prisma.inspection.findUnique({ where: { id } });
  if (!inspection) return NextResponse.json({ error: "Introuvable" }, { status: 404 });

  if (session.role === "INSPECTOR" && inspection.inspectorId !== session.id) {
    return NextResponse.json({ error: "Non autorisé" }, { status: 403 });
  }

  const { roomId, condition, notes } = await req.json();

  const room = await prisma.inspectionRoom.update({
    where: { id: roomId },
    data: { condition: condition ?? undefined, notes: notes ?? undefined },
    include: { photos: true },
  });

  return NextResponse.json(room);
}
