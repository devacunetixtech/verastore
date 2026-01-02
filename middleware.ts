import { withAuth } from "next-auth/middleware"
import { NextResponse } from "next/server"

export default withAuth(
  function middleware(req) {
    const token = req.nextauth.token
    const path = req.nextUrl.pathname

    console.log("[v0] Middleware - Path:", path, "Has token:", !!token, "Role:", token?.role)

    // Protect admin routes
    if (path.startsWith("/admin") && token?.role !== "admin") {
      return NextResponse.redirect(new URL("/", req.url))
    }

    return NextResponse.next()
  },
  {
    callbacks: {
      authorized: ({ token, req }) => {
        const path = req.nextUrl.pathname

        console.log("[v0] Authorization check - Path:", path, "Has token:", !!token)

        // Public paths
        if (
          path === "/" ||
          path.startsWith("/products") ||
          path.startsWith("/login") ||
          path.startsWith("/register") ||
          path.startsWith("/forgot-password") ||
          path.startsWith("/reset-password") ||
          path.startsWith("/verify-email") ||
          path.startsWith("/contact") ||
          path.startsWith("/faq")
        ) {
          return true
        }

        // Protected paths require authentication
        return !!token
      },
    },
  },
)

export const config = {
  matcher: [
    "/profile/:path*",
    "/orders/:path*",
    "/wishlist/:path*",
    "/cart/:path*",
    "/checkout/:path*",
    "/admin/:path*",
  ],
}
