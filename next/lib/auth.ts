import { PrismaClient } from "@/app/generated/prisma/client";
import { betterAuth } from "better-auth";
import { prismaAdapter } from "better-auth/adapters/prisma";

const prisma = new PrismaClient();

export const auth = betterAuth({
  database: prismaAdapter(prisma, {
    provider: "postgresql",
  }),
  emailAndPassword: {
    enabled: true,
  },
  trustedOrigins: [
    "http://localhost:3000",
    process.env.BETTER_AUTH_URL as string,
    "https://*.vercel.app",
  ],
});
