import NextAuth from "next-auth";
import Credentials from "next-auth/providers/credentials";
import { env } from "@/lib/env";
import { loginSchema } from "@/lib/validation/schemas";
import { authenticateUser } from "@/lib/auth/credentials";

/**
 * Auth.js (NextAuth v5) is the session provider. Credentials check the same
 * Prisma users.password_hash as the journal_session cookie used by REST APIs.
 * Mounted at /api/authjs so Auth.js CSRF does not collide with /api/auth/csrf.
 */
export const { handlers, auth, signIn, signOut } = NextAuth({
  trustHost: true,
  secret: env.AUTH_SECRET,
  basePath: "/api/authjs",
  pages: { signIn: "/login" },
  session: {
    strategy: "jwt",
    maxAge: env.AUTH_SESSION_TTL_HOURS * 60 * 60,
  },
  providers: [
    Credentials({
      name: "Editorial login",
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" },
      },
      async authorize(credentials) {
        const parsed = loginSchema.safeParse(credentials);
        if (!parsed.success) return null;
        const user = await authenticateUser(parsed.data.email, parsed.data.password);
        if (!user) return null;
        return {
          id: user.id,
          email: user.email,
          name: user.name,
          role: user.role,
        };
      },
    }),
  ],
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.sub = user.id;
        token.email = user.email;
        token.role = user.role;
      }
      return token;
    },
    async session({ session, token }) {
      if (session.user) {
        session.user.id = token.sub ?? "";
        session.user.role = typeof token.role === "string" ? token.role : "";
      }
      return session;
    },
  },
});
