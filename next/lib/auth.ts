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
  basePath: "/api/auth",
  trustedOrigins: ["http://localhost:3000", "https://tempus-swart.vercel.app"],
  secret: process.env.AUTH_SECRET,
});
