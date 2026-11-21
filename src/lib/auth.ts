// =============================================================================
// Better Auth Server Configuration (Email + Password & Google OAuth)
// =============================================================================

import { betterAuth } from "better-auth";
import { prismaAdapter } from "better-auth/adapters/prisma";
import { prisma } from "@/lib/prisma";

export const auth = betterAuth({
  database: prismaAdapter(prisma, {
    provider: "postgresql",
  }),
  account: {
    accountLinking: {
      enabled: true,
      trustedProviders: ["google"],
    },
  },
  emailAndPassword: {
    enabled: true,
  },
  socialProviders: {
    google: {
      clientId: process.env.GOOGLE_CLIENT_ID || "",
      clientSecret: process.env.GOOGLE_CLIENT_SECRET || "",
    },
  },
  user: {
    additionalFields: {
      role: {
        type: "string",
        required: false,
        defaultValue: "user",
      },
      credits: {
        type: "number",
        required: false,
        defaultValue: 0,
      },
    },
  },
  session: {
    cookieCache: {
      enabled: false, // Ensure credit balance changes reflect immediately across sessions
    },
  },
});
