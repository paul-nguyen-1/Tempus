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
  baseURL: process.env.BETTER_AUTH_URL || "https://tempus-swart.vercel.app",
  trustedOrigins: [
    process.env.BETTER_AUTH_URL as string,
    "http://localhost:3000",
  ],
  secret: process.env.BETTER_AUTH_SECRET as string,
});
