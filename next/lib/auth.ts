import { betterAuth } from "better-auth";
import { prismaAdapter } from "better-auth/adapters/prisma";
import prisma from "./prisma";

export const auth = betterAuth({
  database: prismaAdapter(prisma, {
    provider: "postgresql",
  }),
  emailAndPassword: {
    enabled: true,
  },
  baseURL: process.env.BETTER_AUTH_URL as string,
  trustedOrigins: [
    "http://localhost:3000",
    process.env.BETTER_AUTH_URL as string,
    "https://*.vercel.app",
  ],
  secret: process.env.AUTH_SECRET,
});
