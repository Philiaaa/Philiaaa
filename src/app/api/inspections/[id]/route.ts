import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getSession } from "@/lib/auth";

export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await getSession();
  if (!session) return NextResponse.json({ error: "Non autorisé" }, { status: 401 });

  const { id } = await params;
  const inspection = await prisma.inspection.findUnique({
    where: { id },
    include: {
      unit: { include: { property: true } },
      inspector: { select: { id: true, name: true, email: true } },
      rooms: { include: { photos: true }, orderBy: { createdAt: "asc" } },
    },
  });

  if (!inspection) return NextResponse.json({ error: "Introuvable" }, { status: 404 });

  if (
    session.role === "INSPECTOR" &&
    inspection.inspectorId !== session.id
  ) {
    return NextResponse.json({ error: "Non autorisé" }, { status: 403 });
  }

  return NextResponse.json(inspection);
}

export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await getSession();
  if (!session) return NextResponse.json({ error: "Non autorisé" }, { status: 401 });

  const { id } = await params;
  const body = await req.json();

  const inspection = await prisma.inspection.findUnique({ where: { id } });
  if (!inspection) return NextResponse.json({ error: "Introuvable" }, { status: 404 });

  if (session.role === "INSPECTOR" && inspection.inspectorId !== session.id) {
    return NextResponse.json({ error: "Non autorisé" }, { status: 403 });
  }

  const data: Record<string, unknown> = {};

  if (session.role === "MANAGER") {
    if (body.inspectorId !== undefined) {
      data.inspectorId = body.inspectorId;
      data.status = body.inspectorId ? "ASSIGNED" : "PENDING";
    }
    if (body.scheduledAt !== undefined) data.scheduledAt = body.scheduledAt ? new Date(body.scheduledAt) : null;
    if (body.notes !== undefined) data.notes = body.notes;
    if (body.status !== undefined) data.status = body.status;
  }

  if (session.role === "INSPECTOR") {
    if (body.status === "IN_PROGRESS" || body.status === "COMPLETED") {
      data.status = body.status;
      if (body.status === "COMPLETED") data.completedAt = new Date();
    }
    if (body.notes !== undefined) data.notes = body.notes;
  }

  const updated = await prisma.inspection.update({
    where: { id },
    data,
    include: {
      unit: { include: { property: true } },
      inspector: { select: { id: true, name: true, email: true } },
      rooms: { include: { photos: true } },
    },
  });

  return NextResponse.json(updated);
}
