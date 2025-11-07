import { createAuthClient } from "better-auth/react";

export const authClient = createAuthClient({
  baseURL: "https://tempus-swart.vercel.app/api/auth",
});

export const { signIn, signUp, signOut, useSession } = authClient;
