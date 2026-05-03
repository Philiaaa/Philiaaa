import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getSession } from "@/lib/auth";

export async function GET() {
  const session = await getSession();
  if (!session) return NextResponse.json({ error: "Non autorisé" }, { status: 401 });

  const where =
    session.role === "INSPECTOR" ? { inspectorId: session.id } : {};

  const inspections = await prisma.inspection.findMany({
    where,
    include: {
      unit: { include: { property: true } },
      inspector: { select: { id: true, name: true, email: true } },
      rooms: { include: { photos: true } },
    },
    orderBy: { scheduledAt: "asc" },
  });

  return NextResponse.json(inspections);
}

export async function POST(req: NextRequest) {
  const session = await getSession();
  if (!session || session.role !== "MANAGER") {
    return NextResponse.json({ error: "Non autorisé" }, { status: 403 });
  }

  const { type, unitId, inspectorId, scheduledAt, notes } = await req.json();

  const inspection = await prisma.inspection.create({
    data: {
      type,
      unitId,
      inspectorId: inspectorId || null,
      scheduledAt: scheduledAt ? new Date(scheduledAt) : null,
      notes,
      status: inspectorId ? "ASSIGNED" : "PENDING",
    },
    include: {
      unit: { include: { property: true } },
      inspector: { select: { id: true, name: true, email: true } },
    },
  });

  return NextResponse.json(inspection, { status: 201 });
}
