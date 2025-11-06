import { createAuthClient } from "better-auth/react";

const baseURL = process.env.NEXT_PUBLIC_AUTH_BASE_URL ?? "/api/auth";

const authClient = createAuthClient({
  baseURL,
});

export const { signIn, signUp, signOut, useSession } = authClient;
