import { createAuthClient } from "better-auth/react";

const baseURL = process.env.NEXT_PUBLIC_BASE_URL as string;

const authClient = createAuthClient({
  baseURL,
});

export const { signIn, signUp, signOut, useSession } = authClient;
