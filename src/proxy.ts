import { NextResponse } from "next/server"
import type { NextRequest } from "next/server"
import { getToken } from "next-auth/jwt"

const publicRoutes = ["/sign-in", "/sign-up"]

export async function proxy(request: NextRequest) {
  const token = await getToken({ req: request, secret: process.env.AUTH_SECRET })
  const path = request.nextUrl.pathname

  const isPublic = publicRoutes.some((r) => path.startsWith(r))
  const isOnboarding = path.startsWith("/onboarding")

  if (!token && !isPublic) {
    return NextResponse.redirect(new URL("/sign-in", request.url))
  }

  if (token && isPublic) {
    return NextResponse.redirect(new URL("/", request.url))
  }

  if (token && !token.onboardingCompleted && !isOnboarding) {
    return NextResponse.redirect(new URL("/onboarding", request.url))
  }

  if (token && token.onboardingCompleted && isOnboarding) {
    return NextResponse.redirect(new URL("/", request.url))
  }

  return NextResponse.next()
}

export const config = {
  matcher: [
    "/((?!api|_next/static|_next/image|favicon.ico|sitemap.xml|robots.txt).*)",
  ],
}
