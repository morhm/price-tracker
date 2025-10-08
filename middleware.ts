// middleware.ts
import { withAuth } from "next-auth/middleware";

export default withAuth({
  pages: {
    signIn: "/login", // where unauthenticated users are redirected
  },
});

export const config = {
  matcher: [
    "/dashboard/:path*",   // protect all routes under /dashboard
    "/api/:path*",
    "/tracker/:path*",
  ],
};