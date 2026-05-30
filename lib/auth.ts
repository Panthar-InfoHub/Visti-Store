import { prisma } from "@/prisma/db";
import { betterAuth } from "better-auth";
import { prismaAdapter } from "better-auth/adapters/prisma";
import { USER_ROLE } from "@/prisma/generated/prisma";
import { sendMail } from "@/lib/send-mail";
import { ResetPasswordEmailTemplate } from "@/templates/Email";

export const auth = betterAuth({
  database: prismaAdapter(prisma, {
    provider: "postgresql",
  }),
  trustedOrigins: ["https://vyomtics.com", "https://vyomtics.vercel.app", "http://localhost:3000","http://192.168.1.15:3000"],
  emailAndPassword: {
    enabled: true,
    requireEmailVerification: false,
    sendResetPassword: async ({ user, url }) => {
      try {
        const emailContent = ResetPasswordEmailTemplate({ link: new URL(url) });
        await sendMail(user.email, emailContent);
        console.log(`✅ Password reset email sent to ${user.email}`);
      } catch (error) {
        console.error(`❌ Failed to send password reset email to ${user.email}:`, error);
        console.log(`\n🔑 PASSWORD RESET URL (copy this link): ${url}\n`);
        return;
      }
    },
  },
  socialProviders: {
    google: {
      clientId: process.env.GOOGLE_CLIENT_ID!,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
    },
  },
  user: {
    deleteUser: {
      enabled: true,
    },
    additionalFields: {
      role: {
        type: [USER_ROLE.USER, USER_ROLE.ADMIN],
        input: false,
      },
    },
  },
  databaseHooks: {
    user: {
      create: {
        before: async (user) => {
          const ADMIN_EMAILS = process.env.ADMIN_EMAILS?.split(",") || [];

          // Mark all users as verified by default
          const userData = {
            ...user,
            emailVerified: true,
          };

          if (ADMIN_EMAILS.includes(user.email)) {
            return { data: { ...userData, role: USER_ROLE.ADMIN } };
          }
          return { data: userData };
        },
      },
    },
  },
  session: {
    cookieCache: {
      enabled: true,
      maxAge: 60 * 60 * 24, // 1 day
    },
  },
});

export type Session = typeof auth.$Infer.Session;
