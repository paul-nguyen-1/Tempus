import { createAuthClient } from "better-auth/react";
export const authClient = createAuthClient({
  baseURL: process.env.NEXT_PUBLIC_BASE_URL,
  trustedOrigins: [process.env.VERCEL_URL!],
});

export const { signIn, signUp, signOut, useSession } = createAuthClient();
