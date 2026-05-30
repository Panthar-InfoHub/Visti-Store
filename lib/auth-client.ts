import { createAuthClient } from "better-auth/react";
import { inferAdditionalFields } from "better-auth/client/plugins";
import type { auth } from "@/lib/auth";

export const authClient = createAuthClient({
  /** The base URL of the server (optional if you're using the same domain) */
  plugins: [inferAdditionalFields<typeof auth>()],
});

// @ts-ignore - forgetPassword and resetPassword are provided by emailAndPassword provider but type inference might fail
export const { signIn, signUp, useSession, signOut, forgetPassword, resetPassword } = authClient;
