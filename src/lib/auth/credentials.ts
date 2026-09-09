import { prisma } from "@/lib/db";
import { verifyPassword } from "@/lib/auth/password";

export async function authenticateUser(email: string, password: string) {
  const user = await prisma.user.findFirst({
    where: { email: email.toLowerCase(), deletedAt: null },
  });
  const valid = user ? await verifyPassword(password, user.passwordHash) : false;
  if (!user || !valid || !user.active) return null;
  return user;
}
