import NextAuth from "next-auth";
import Credentials from "next-auth/providers/credentials";
import bcrypt from "bcrypt";
import type { RowDataPacket } from "mysql2";
import { pool } from "@/lib/db";

type UserRow = RowDataPacket & {
  id: number;
  email: string;
  password_hash: string;
  name: string;
  is_admin: number;
};

export const { handlers, auth, signIn, signOut } = NextAuth({
  session: { strategy: "jwt" },
  pages: { signIn: "/login" },
  trustHost: true,
  providers: [
    Credentials({
      credentials: {
        email: {},
        password: {},
      },
      async authorize(credentials) {
        const email = credentials?.email;
        const password = credentials?.password;
        if (typeof email !== "string" || typeof password !== "string") return null;

        const [rows] = await pool.query<UserRow[]>(
          "SELECT id, email, password_hash, name, is_admin FROM users WHERE email = ? LIMIT 1",
          [email]
        );
        const user = rows[0];
        if (!user) return null;

        const validPassword = await bcrypt.compare(password, user.password_hash);
        if (!validPassword) return null;

        return {
          id: String(user.id),
          email: user.email,
          name: user.name,
          isAdmin: Boolean(user.is_admin),
        };
      },
    }),
  ],
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.id = user.id as string;
        token.isAdmin = user.isAdmin as boolean;
      }
      return token;
    },
    async session({ session, token }) {
      session.user.id = token.id as string;
      session.user.isAdmin = token.isAdmin as boolean;
      return session;
    },
  },
});
