// middleware.ts
import { withAuth } from "next-auth/middleware";

export default withAuth({
  pages: {
    signIn: "/login", // where unauthenticated users are redirected
  },
});

export const config = {
  matcher: [
    "/dashboard/:path*",
    "/api/trackers/((?!scrape).*)",
    "/tracker/:path*",
    // Don't protect /api/auth/* - NextAuth needs these public
    // Don't protect /api/trackers/scrape - uses CRON_SECRET auth
  ],
};