import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { hashPassword } from "@/lib/auth";

export async function GET() {
  return POST();
}

export async function POST() {
  const existing = await prisma.user.findUnique({ where: { email: "gestionnaire@vaillere.com" } });
  if (existing) {
    return NextResponse.json({ message: "Données déjà initialisées" });
  }

  const managerPassword = await hashPassword("vaillere2024");
  const inspectorPassword = await hashPassword("inspect123");

  const manager = await prisma.user.create({
    data: {
      name: "Gestionnaire Vaillère",
      email: "gestionnaire@vaillere.com",
      password: managerPassword,
      role: "MANAGER",
    },
  });

  const inspector1 = await prisma.user.create({
    data: {
      name: "Jean Tremblay",
      email: "jean@inspecteur.com",
      password: inspectorPassword,
      role: "INSPECTOR",
    },
  });

  const inspector2 = await prisma.user.create({
    data: {
      name: "Marie Côté",
      email: "marie@inspecteur.com",
      password: inspectorPassword,
      role: "INSPECTOR",
    },
  });

  const property1 = await prisma.property.create({
    data: {
      name: "Immeuble des Érables",
      address: "123 rue des Érables",
      city: "Montréal",
      units: {
        create: [
          { number: "101", floor: 1 },
          { number: "102", floor: 1 },
          { number: "201", floor: 2 },
          { number: "202", floor: 2 },
          { number: "301", floor: 3 },
        ],
      },
    },
    include: { units: true },
  });

  const property2 = await prisma.property.create({
    data: {
      name: "Résidence du Parc",
      address: "456 avenue du Parc",
      city: "Laval",
      units: {
        create: [
          { number: "1A", floor: 1 },
          { number: "1B", floor: 1 },
          { number: "2A", floor: 2 },
        ],
      },
    },
    include: { units: true },
  });

  await prisma.inspection.create({
    data: {
      type: "ENTREE",
      status: "ASSIGNED",
      scheduledAt: new Date(Date.now() + 2 * 24 * 60 * 60 * 1000),
      unitId: property1.units[0].id,
      inspectorId: inspector1.id,
    },
  });

  await prisma.inspection.create({
    data: {
      type: "ROUTINE",
      status: "PENDING",
      scheduledAt: new Date(Date.now() + 5 * 24 * 60 * 60 * 1000),
      unitId: property1.units[2].id,
    },
  });

  await prisma.inspection.create({
    data: {
      type: "SORTIE",
      status: "PENDING",
      scheduledAt: new Date(Date.now() + 1 * 24 * 60 * 60 * 1000),
      unitId: property2.units[0].id,
    },
  });

  return NextResponse.json({
    message: "Données initialisées avec succès",
    comptes: [
      { role: "Gestionnaire", email: "gestionnaire@vaillere.com", password: "vaillere2024" },
      { role: "Inspecteur", email: "jean@inspecteur.com", password: "inspect123" },
      { role: "Inspecteur", email: "marie@inspecteur.com", password: "inspect123" },
    ],
    manager: manager.id,
    inspectors: [inspector1.id, inspector2.id],
  });
}
