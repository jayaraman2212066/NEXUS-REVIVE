import { NextRequest } from "next/server";
import { prisma } from "@/lib/prisma";

export async function getSessionUser(req: NextRequest) {
  const token = req.cookies.get("session")?.value;
  if (!token) return null;

  const session = await prisma.session.findUnique({
    where: { token },
    include: { user: true },
  });

  if (!session || session.expiresAt < new Date()) return null;
  return session.user;
}
