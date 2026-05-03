import { cookies } from "next/headers";
import { prisma } from "./prisma";
import bcrypt from "bcryptjs";

export async function hashPassword(password: string) {
  return bcrypt.hash(password, 10);
}

export async function verifyPassword(password: string, hash: string) {
  return bcrypt.compare(password, hash);
}

export async function getSession() {
  const cookieStore = await cookies();
  const sessionCookie = cookieStore.get("session");
  if (!sessionCookie) return null;

  try {
    const data = JSON.parse(
      Buffer.from(sessionCookie.value, "base64").toString("utf-8")
    );
    const user = await prisma.user.findUnique({ where: { id: data.userId } });
    if (!user) return null;
    return { id: user.id, name: user.name, email: user.email, role: user.role };
  } catch {
    return null;
  }
}

export function createSessionToken(userId: string) {
  return Buffer.from(JSON.stringify({ userId })).toString("base64");
}
