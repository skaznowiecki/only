import { auth } from "@/lib/auth"
import { getDb } from "@/lib/db"
import { users } from "@/lib/db/schema"
import { eq } from "drizzle-orm"
import { getToken, encode } from "next-auth/jwt"
import { cookies } from "next/headers"
import { NextResponse } from "next/server"
import type { NextRequest } from "next/server"

export async function POST(request: NextRequest) {
  const session = await auth()
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Not authenticated" }, { status: 401 })
  }

  const body = await request.json()
  const userType = body.userType

  if (userType !== "creator" && userType !== "fan") {
    return NextResponse.json({ error: "Invalid user type" }, { status: 400 })
  }

  const db = getDb()
  await db
    .update(users)
    .set({ userType, onboardingCompleted: true })
    .where(eq(users.id, session.user.id))

  // Refresh the JWT cookie with updated data
  const secret = process.env.AUTH_SECRET!
  const token = await getToken({ req: request, secret })

  if (token) {
    token.onboardingCompleted = true
    token.userType = userType

    const cookieName = process.env.NODE_ENV === "production"
      ? "__Secure-authjs.session-token"
      : "authjs.session-token"

    const encoded = await encode({ token, secret, salt: cookieName })
    const cookieStore = await cookies()
    cookieStore.set(cookieName, encoded, {
      httpOnly: true,
      sameSite: "lax",
      path: "/",
      secure: process.env.NODE_ENV === "production",
    })
  }

  return NextResponse.json({ ok: true })
}
