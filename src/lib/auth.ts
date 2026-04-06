import NextAuth from "next-auth"
import Google from "next-auth/providers/google"
import Twitter from "next-auth/providers/twitter"
import Credentials from "next-auth/providers/credentials"
import { DrizzleAdapter } from "@auth/drizzle-adapter"
import { getDb } from "@/lib/db"
import { users } from "@/lib/db/schema"
import { eq } from "drizzle-orm"
import bcrypt from "bcryptjs"

import type { DefaultSession } from "next-auth"

declare module "next-auth" {
  interface Session {
    user: {
      id: string
      username: string | null
      userType: "creator" | "fan" | null
      onboardingCompleted: boolean
    } & DefaultSession["user"]
  }

  interface User {
    username?: string | null
    userType?: "creator" | "fan" | null
    onboardingCompleted?: boolean
  }
}

declare module "next-auth/jwt" {
  interface JWT {
    id?: string
    username?: string | null
    userType?: "creator" | "fan" | null
    onboardingCompleted?: boolean
  }
}

export const { handlers, auth, signIn, signOut } = NextAuth({
  adapter: DrizzleAdapter(getDb()),
  session: {
    strategy: "jwt",
    maxAge: 30 * 24 * 60 * 60, // 30 days
  },
  pages: {
    signIn: "/sign-in",
  },
  providers: [
    Google({
      allowDangerousEmailAccountLinking: true,
    }),
    Twitter({
      allowDangerousEmailAccountLinking: true,
    }),
    Credentials({
      credentials: {
        email: {},
        password: {},
      },
      async authorize(credentials) {
        const email = credentials.email as string
        const password = credentials.password as string

        if (!email || !password) return null

        const db = getDb()
        const [user] = await db
          .select()
          .from(users)
          .where(eq(users.email, email))

        if (!user || !user.passwordHash) return null

        const isValid = await bcrypt.compare(password, user.passwordHash)
        if (!isValid) return null

        return {
          id: user.id,
          name: user.name,
          email: user.email,
          image: user.image,
        }
      },
    }),
  ],
  callbacks: {
    async jwt({ token, user, trigger }) {
      if (user) {
        token.id = user.id
      }
      if (user || trigger === "update") {
        const db = getDb()
        const [dbUser] = await db
          .select({ onboardingCompleted: users.onboardingCompleted, username: users.username, userType: users.userType })
          .from(users)
          .where(eq(users.id, token.id as string))
        if (dbUser) {
          token.onboardingCompleted = dbUser.onboardingCompleted
          token.username = dbUser.username
          token.userType = dbUser.userType
        }
      }
      return token
    },
    async session({ session, token }) {
      session.user.id = token.id as string
      session.user.username = token.username as string | null
      session.user.userType = token.userType ?? null
      session.user.onboardingCompleted = token.onboardingCompleted ?? false
      return session
    },
  },
})
