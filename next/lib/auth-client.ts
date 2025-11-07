import { createAuthClient } from "better-auth/react";

export const authClient = createAuthClient({
  baseURL: "https://tempus-swart.vercel.app/",
});

export const { signIn, signUp, signOut, useSession } = authClient;
