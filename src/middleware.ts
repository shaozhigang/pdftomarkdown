import createMiddleware from "next-intl/middleware";
import { routing } from "./i18n/routing";

export default createMiddleware(routing);

export const config = {
  matcher: [
    // Match all pathnames except for
    // - _next (Next.js internals)
    // - api (API routes)
    // - static files (e.g. /favicon.ico, /robots.txt)
    "/((?!_next|api|.*\\..*).*)",
  ],
};
