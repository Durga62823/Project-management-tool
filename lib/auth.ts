import { PrismaAdapter } from "@auth/prisma-adapter";
import { type NextAuthConfig } from "next-auth";
import NextAuth from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
import GitHub from "next-auth/providers/github";
import Google from "next-auth/providers/google";

import { prisma } from "@/lib/prisma";
import { logger } from "@/lib/logger";
import { getRedis } from "@/lib/redis";
import { getRequestIp, getRequestUserAgent } from "@/lib/request";
import { signInSchema } from "@/lib/validations/auth";

const REMEMBERED_MAX_AGE = 60 * 60 * 24 * 30; // 30 days
const DEFAULT_MAX_AGE = 60 * 60 * 24 * 7; // 7 days

const authConfig: NextAuthConfig = {
  trustHost: true,
  secret: process.env.NEXTAUTH_SECRET,
  debug: false,
  adapter: PrismaAdapter(prisma) as any,
  session: {
    strategy: "jwt",
    maxAge: REMEMBERED_MAX_AGE,
  },
  pages: {
    signIn: "/auth/login",
    signOut: "/auth/login",
    error: "/auth/login",
    verifyRequest: "/auth/verify-email",
  },
  useSecureCookies: process.env.NODE_ENV === "production",
  providers: [
    CredentialsProvider({
      name: "Credentials",
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" },
        rememberMe: { label: "Remember Me", type: "checkbox" },
      },
      async authorize(credentials) {
        const parsed = signInSchema.safeParse({
          email: credentials?.email,
          password: credentials?.password,
          rememberMe: credentials?.rememberMe === "true" || credentials?.rememberMe === true,
        });

        if (!parsed.success) {
          throw new Error("Invalid credentials");
        }

        let user;
        try {
          user = await prisma.user.findUnique({
            where: { email: parsed.data.email },
          });
        } catch (error) {
          logger.error(
            {
              provider: "credentials",
              cause: error instanceof Error ? error.message : String(error),
            },
            "Authentication database unavailable"
          );
          throw new Error("Authentication service unavailable");
        }

        if (!user || !user.password) {
          throw new Error("Invalid credentials");
        }

        const { verifyPassword } = await import("@/lib/auth-utils");
        const isValidPassword = await verifyPassword(parsed.data.password, user.password);
        if (!isValidPassword) {
          throw new Error("Invalid credentials");
        }

        if (!user.emailVerified) {
          throw new Error("Email not verified");
        }

        return {
          id: user.id,
          email: user.email,
          name: user.firstName ?? user.name ?? `${user.firstName ?? ""} ${user.lastName ?? ""}`.trim(),
          image: user.image,
          status: user.status,
          role: user.role as any,
          rememberMe: parsed.data.rememberMe,
        };
      },
    }),
    Google({
      clientId: process.env.GOOGLE_CLIENT_ID ?? "",
      clientSecret: process.env.GOOGLE_CLIENT_SECRET ?? "",
      allowDangerousEmailAccountLinking: true,
      profile(profile) {
        return {
          id: profile.sub,
          name: profile.name,
          email: profile.email,
          image: profile.picture,
          emailVerified: profile.email_verified ? new Date() : null,
          role: "EMPLOYEE" as any,
        };
      },
    }),
    GitHub({
      clientId: process.env.GITHUB_CLIENT_ID ?? "",
      clientSecret: process.env.GITHUB_CLIENT_SECRET ?? "",
      allowDangerousEmailAccountLinking: true,
    }),
  ],
  callbacks: {
    async signIn({ user, account, profile }) {
      if (account && account.provider !== "credentials") {
        const email = user.email || profile?.email;
        if (!email) return false;

        const existingUser = await prisma.user.findUnique({ where: { email } });
        const profileImage = (profile as any)?.image ?? (profile as any)?.picture;
        const profileName = (profile as any)?.name;

        if (existingUser) {
          await prisma.user.update({
            where: { id: existingUser.id },
            data: {
              emailVerified: new Date(),
              image: user.image || profileImage || existingUser.image,
              name: user.name || profileName || existingUser.name,
            },
          });
        }
      }

      return true;
    },
    async jwt({ token, user, account }) {
      if (user) {
        token.id = user.id as string;
        token.status = (user as { status?: string }).status ?? token.status;
        token.role = (user as { role?: any }).role ?? token.role;
        token.rememberMe = (user as { rememberMe?: boolean }).rememberMe ?? false;
        token.picture = user.image ?? token.picture;
        const now = Math.floor(Date.now() / 1000);
        token.sessionExpiresAt = now + (token.rememberMe ? REMEMBERED_MAX_AGE : DEFAULT_MAX_AGE);
      }

      if (account) {
        token.provider = account.provider;

        if (account.provider !== "credentials" && token.sub) {
          const dbUser = await prisma.user.findUnique({
            where: { id: token.sub },
            select: { role: true, status: true },
          });

          if (dbUser) {
            token.role = dbUser.role;
            token.status = dbUser.status;
          }
        }
      }

      return token;
    },
    async session({ session, token }) {
      if (session.user && token.sub) {
        session.user.id = token.sub;
        session.user.status = token.status as string;
        session.user.role = token.role as any;
        session.user.image = token.picture as string | undefined;
      }

      session.rememberMe = Boolean(token.rememberMe);
      const expiration =
        (token.sessionExpiresAt as number | undefined) ?? Math.floor(Date.now() / 1000) + DEFAULT_MAX_AGE;
      session.expires = new Date(expiration * 1000).toISOString() as any;
      return session;
    },
    async authorized({ auth }) {
      return !!auth?.user;
    },
    async redirect({ url, baseUrl }) {
      if (url.startsWith("/")) {
        return `${baseUrl}${url}`;
      }
      if (new URL(url).origin === baseUrl) {
        return url;
      }
      return baseUrl;
    },
  },
  events: {
    async signIn({ user }) {
      try {
        if (!user.id) {
          return;
        }

        const ip = await getRequestIp();
        const userAgent = await getRequestUserAgent();

        await prisma.user.update({
          where: { id: user.id },
          data: {
            lastLogin: new Date(),
            lastLoginIp: ip,
            lastLoginUserAgent: userAgent,
          },
        });

        try {
          const redis = getRedis();
          if (redis) {
            await redis.set(
              `session:last:${user.id}`,
              {
                lastLogin: new Date().toISOString(),
                ip,
                userAgent,
              },
              {
                ex: REMEMBERED_MAX_AGE,
              }
            );
          }
        } catch (redisError) {
          console.warn("Redis unavailable, skipping session cache:", redisError);
        }
      } catch (error) {
        console.error("Failed to persist login metadata:", error);
      }
    },
  },
};

export const { handlers, auth, signIn, signOut } = NextAuth(authConfig);
