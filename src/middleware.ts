import { authMiddleware } from "@clerk/nextjs"

// This example protects all routes including api/trpc routes
// Please edit this to allow other routes to be public as needed.
// See https://clerk.com/docs/references/nextjs/auth-middleware for more information about configuring your Middleware
const middleware = authMiddleware({
  publicRoutes: ["/marketplace", "/marketplace/create"],
})

export default (req, res, next) => {
  // Check if it's a WebSocket request to '/api/trpc'
  if (req.url === "/api/trpc" && req.headers.upgrade === "websocket") {
    // Skip authentication middleware for WebSocket requests to '/api/trpc'
    return next()
  }

  // Apply authentication middleware for other requests
  return middleware(req, res, next)
}

export const config = {
  matcher: [
    "/((?!.+\\.[\\w]+$|_next).*)",
    "/",
    "/(api|trpc)(.*)",
  ],
}
