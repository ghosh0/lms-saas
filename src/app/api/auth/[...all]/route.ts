// =============================================================================
// Better Auth Next.js API Catch-all Route Handler
// =============================================================================

import { auth } from "@/lib/auth";
import { toNextJsHandler } from "better-auth/next-js";

export const { GET, POST } = toNextJsHandler(auth);

