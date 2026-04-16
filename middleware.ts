// proxy.ts at project root
import { clerkMiddleware } from "@clerk/nextjs/server";

// Runs Clerk middleware on matched routes
export default clerkMiddleware();

export const config = {
  matcher: [
    "/api(.*)",        // protects all API routes
    "/dashboard(.*)",  // protects dashboard pages
  ],
};