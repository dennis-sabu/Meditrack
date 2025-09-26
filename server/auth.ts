
import {
  type DefaultSession,
  type NextAuthOptions,
  User,
  getServerSession,
} from 'next-auth'
import GoogleProvider, { type GoogleProfile } from "next-auth/providers/google";
// import type { UserZodType } from "@/lib/validator";
import { isAdminEmail, UserZodType } from "@/lib/validator";
import { env } from "@/env";
import { db } from "./db";
import Credentials from "next-auth/providers/credentials";
import { z } from "zod";
import { api } from "@/utils/server";
import { Elsie_Swash_Caps } from 'next/font/google';
import { Adapter } from 'next-auth/adapters';
import { and, eq } from 'drizzle-orm';
import { compare } from 'bcrypt';
import { CarTaxiFront } from 'lucide-react';
import { users } from './db/schema';

/**
 * Module augmentation for `next-auth` types. Allows us to add custom properties to the `session`
 * object and keep type safety.
 *
 * @see https://next-auth.js.org/getting-started/typescript#module-augmentation
 */
declare module "next-auth" {

  interface User {
    name: string;
    email: string;
    image: string | null;
    phone: string | null;
    id: number;
    role: "ADMIN" | "HOSPITAL_ADMIN" | "DOCTOR" | "PATIENT";
    loginType: "Google" | "Credentials"
  }

  interface Session extends DefaultSession {
    user: {
      id: number;
      role: User['role'];
    } & DefaultSession["user"] &
    UserZodType;
  }

}

declare module "next-auth" {
  interface Profile {
    given_name?: string;
    family_name?: string;
  }
}
/**
 * Options for NextAuth.js used to configure adapters, providers, callbacks, etc.
 *
 * @see https://next-auth.js.org/configuration/options
 */


export const authOptions: NextAuthOptions = {
  // session: { strategy: 'database' },
  session: {
    strategy: "jwt", // Using JWT for session
  },
  providers: [
    GoogleProvider({
      clientId: env.GOOGLE_CLIENT_ID,
      clientSecret: env.GOOGLE_CLIENT_SECRET,
      id: "google",
      name: "Google",
      authorization: {
        params: {
          prompt: "select_account",
          access_type: "offline",
          response_type: "code",
        },
      },
      // biome-ignore lint/suspicious/useAwait: <explanation>
      profile: async (profile: GoogleProfile, tokens): Promise<User> => {
        let existingUser = await db.query.users.findFirst({ where: (users) => eq(users.email, profile.email) });

        if (!existingUser) {
          // Register the new user
          const { user: newUser } = await api.auth.googleLoginRegister({
            id: profile?.sub ?? '',
            email: profile.email,
            image: profile.picture,
            role: "PATIENT",
            name: profile?.name?.split(" ")[0] ?? profile?.given_name ?? '',
            phone: '',
          });

          if (!newUser) throw new Error("User creation failed");

          existingUser = newUser;
        }

        // Derive name parts and username to satisfy the augmented User type
        const fullName = existingUser.name ?? profile?.name ?? '';
        const given = profile?.given_name ?? fullName.split(' ')[0] ?? '';

        return {
          id: existingUser.id,
          email: existingUser.email,
          name: fullName,
          phone: existingUser.phone ?? '',
          image: existingUser.image ?? '',
          loginType: existingUser.loginType as User['loginType'],
          role: existingUser.role as User['role'],
        } as User;
      },
    }),
    Credentials({
      credentials: {
        email: { label: "Username", type: "text", placeholder: "jsmith" },
        password: { label: "Password", type: "password" }
      },

      async authorize(credentials, req) {

        const parsedCredentials = z
          .object({ email: z.string().email(), password: z.string().min(6) })
          .safeParse(credentials);
        if (parsedCredentials.success) {
          if (isAdminEmail(parsedCredentials.data.email)) {
            const admin = await db.query.users.findFirst({
              where: eq(users.email, parsedCredentials.data.email),
            });
            const update = await db.update(users).set({
              lastLogin: new Date()
            }).where(eq(users.email, admin?.email ?? ''));
            if (!admin || !await compare(parsedCredentials.data.password, admin?.passwordHash ?? '')) {
              return null;
            }

            return {
              id: admin.id,
              email: admin.email,
              name: admin.name,
              loginType: 'Credentials',
              phone: '',
              image: '',
              role: admin.role as User['role'],
            }
          }
          const data = await api.auth.loginwithEmail({ email: parsedCredentials.data.email, password: parsedCredentials.data.password });
          if (data != null) {
            return {
              id: data.user.id,
              email: data.user.email,
              name: data.user.name,
              loginType: 'Credentials',
              phone: data.user.phone ?? '',
              image: data.user.image ?? '',
              role: data.user.role as User['role'],
            };
          }
        }
        return null;
      }
    }),
  ],
  pages: {
    signIn: "/signin",
    error: '/auth/error',
  },
  theme: {
    colorScheme: "dark",
    buttonText: "black",
    brandColor: "white",
    // logo: "/asthra.svg",
  },
  callbacks: {
    async signIn({ user: duser, account, profile }) {
      if (isAdminEmail(duser.email)) {
        return true
      }
      if (account?.provider === "google") {
        const existingUser = await db.query.users.findFirst({
          where: eq(users.email, profile?.email ?? ''),
        });

        if (existingUser) {
          if (existingUser.loginType !== "Google") {
            await db.update(users)
              .set({ loginType: "Google" })
              .where(eq(users.id, existingUser.id));
          }

          // Ensure an OAuth account is linked
        }
      }
      return true;
    },
    async jwt({ token, user, trigger, session }) {
      if (user) {
        token.id = user.id;
        token.email = user.email;
        token.name = user.name;
        token.phone = user.phone;
        token.role = user.role;
        token.image = user.image;
        if (trigger === "update" && session?.role) {
          token.role = session.role
        }
        return { ...token, ...user }
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
        session.user.role = token.role as User['role'];
        return {
          ...session,
          user: {
            ...session.user,
            id: token.id as string,
            email: token.email as string,
            firstName: token.firstName as string,
            lastName: token.lastName as string,
            phone: token.phone as string,
            username: token.username as string,
            position: token.position as string,
            image: token.image as string,
            role: token.role as User['role'],
          }
        }
      }
      return session;
    },
  },
  secret: env.NEXTAUTH_SECRET,
};
/**
 * Wrapper for `getServerSession` so that you don't need to import the `authOptions` in every file.
 *
 * @see https://next-auth.js.org/configuration/nextjs
 */
export const getServerAuthSession = () => getServerSession(authOptions);
