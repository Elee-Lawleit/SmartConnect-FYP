import { authMiddleware } from "@clerk/nextjs"

export default authMiddleware({
  publicRoutes: ["/marketplace", "/marketplace/create"],
})

export const config = {
  matcher: [
    "/",
    "/((?!_next/static|_next/image|favicon.ico|ws://|wss://|api/trpc).*)",
  ],
}
