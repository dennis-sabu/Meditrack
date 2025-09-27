import {
  type DefaultSession,
  type NextAuthOptions,
  User,
  getServerSession,
} from "next-auth";
import Credentials from "next-auth/providers/credentials";
import { z } from "zod";
import { compare } from "bcrypt";
import { env } from "@/env";
import { db } from "./db";
import { users } from "./db/schema";
import { eq } from "drizzle-orm";

/* ------------------ TYPES ------------------ */
declare module "next-auth" {
  interface User {
    id: number;
    name: string;
    email: string;
    image: string | null;
    phone: string | null;
    role: "PATIENT";
    loginType: "Credentials" | "Google";
    isVerified: boolean;
    governmentId: string | null;
  }

  interface Session extends DefaultSession {
    user: {
      id: number;
      role: User["role"];
      phone: string | null;
      image: string | null;
    } & DefaultSession["user"];
  }
}

/* ------------------ CONFIG ------------------ */
export const authOptions: NextAuthOptions = {
  session: { strategy: "jwt" },

  providers: [
    Credentials({
      credentials: {
        email: { label: "Email", type: "text" },
        password: { label: "Password", type: "password" },
      },
      async authorize(credentials, req) {
        const parsed = z
          .object({ email: z.string().email(), password: z.string().min(6) })
          .safeParse(credentials);
        if (!parsed.success) return null;

        const user = await db.query.users.findFirst({
          where: eq(users.email, parsed.data.email),
        });
        if (!user) return null;

        // Auto-verify the first super admin
        const isPasswordValid = await compare(
          parsed.data.password,
          user.passwordHash ?? ""
        );
        if (!isPasswordValid) return null;

        return user as unknown as User;

        // ADMIN always allowed
        // HOSPITAL & DOCTOR must be verified
        // if (!user.isVerified) {
        //   throw new Error(`Account not verified by Super Admin - ${user.name+user.isActive,user.isVerified}`, { cause: "UNVERIFIED" });
        // }

      },
    }),
  ],

  pages: {
    signIn: "/signin",
    error: "/signin/error",
  },

  callbacks: {
    async signIn({ user }) {
      if (!user) return false;

      // Hospital & Doctor require verification
      // if (!user.isVerified) return false;

      return true;
    },

    async jwt({ token, user }) {
      if (user) {
        token.id = user.id;
        token.email = user.email;
        token.name = user.name;
        token.phone = user.phone;
        token.role = user.role;
        token.image = user.image;
      }
      return token;
    },

    async session({ session, token }) {
      if (session.user) {
        session.user.id = token.id as number;
        session.user.email = token.email as string;
        session.user.name = token.name as string;
        session.user.phone = token.phone as string;
        session.user.image = token.image as string;
        session.user.role = token.role as User["role"];
      }
      return session;
    },
  },

  secret: env.NEXTAUTH_SECRET,
};

export const getServerAuthSession = () => getServerSession(authOptions);
