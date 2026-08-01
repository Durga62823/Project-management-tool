"use server";

import { addHours } from "date-fns";
import { AuthError } from "next-auth";
import { revalidatePath } from "next/cache";

import { prisma } from "@/lib/prisma";
import { logger } from "@/lib/logger";
import { checkRateLimit } from "@/lib/rate-limit";
import { signIn } from "@/lib/auth";
import { signInSchema, signUpSchema, verifyEmailOtpSchema } from "@/lib/validations/auth";
import { sanitizeInput } from "@/lib/utils";
import { generateOtp, hashPassword } from "@/lib/auth-utils";

export type ActionResponse<T = unknown> =
  | { success: true; data?: T; message?: string }
  | { success: false; error: string };

export async function registerUser(payload: unknown): Promise<ActionResponse> {
  const parsed = signUpSchema.safeParse(payload);
  if (!parsed.success) {
    return {
      success: false,
      error: parsed.error.errors[0]?.message ?? "Invalid input",
    };
  }

  const { firstName, lastName, email, password } = parsed.data;
  const sanitizedEmail = sanitizeInput(email).toLowerCase();

  const rateLimit = await checkRateLimit(`register:${sanitizedEmail}`);
  if (!rateLimit.success) {
    return {
      success: false,
      error: "Too many attempts. Please wait a minute.",
    };
  }

  const existing = await prisma.user.findUnique({
    where: { email: sanitizedEmail },
  });
  if (existing) {
    return { success: false, error: "Email already exists" };
  }

  const hashedPassword = await hashPassword(password);
  const user = await prisma.user.create({
    data: {
      email: sanitizedEmail,
      firstName: sanitizeInput(firstName),
      lastName: sanitizeInput(lastName),
      name: `${sanitizeInput(firstName)} ${sanitizeInput(lastName)}`.trim(),
      password: hashedPassword,
      role: "EMPLOYEE",
      status: "ACTIVE",
    },
  });

  const otp = generateOtp();
  await prisma.verificationToken.create({
    data: {
      identifier: sanitizedEmail,
      token: otp,
      expires: addHours(new Date(), 24),
    },
  });

  const { sendVerificationEmail } = await import("@/lib/email-smtp");
  await sendVerificationEmail({
    email: sanitizedEmail,
    token: otp,
    firstName: user.firstName,
  });

  return {
    success: true,
    message: "Account created. Check your inbox for your 6-digit OTP.",
  };
}

export async function loginUser(payload: unknown): Promise<ActionResponse> {
  const parsed = signInSchema.safeParse(payload);
  if (!parsed.success) {
    return {
      success: false,
      error: parsed.error.errors[0]?.message ?? "Invalid input",
    };
  }

  try {
    await signIn("credentials", {
      email: parsed.data.email,
      password: parsed.data.password,
      rememberMe: parsed.data.rememberMe,
      redirect: false,
    });

    // Fetch user role to return for role-based redirect
    const user = await prisma.user.findUnique({
      where: { email: parsed.data.email },
      select: { role: true, id: true, email: true },
    });

    return {
      success: true,
      message: "Welcome back",
      data: { role: user?.role || "EMPLOYEE" },
    };
  } catch (error) {
    if (error instanceof AuthError) {
      const wrappedCauseMessage =
        (error as { cause?: { err?: { message?: string }; message?: string } }).cause?.err?.message ??
        (error as { cause?: { err?: { message?: string }; message?: string } }).cause?.message ??
        "";

      if (wrappedCauseMessage.toLowerCase().includes("email not verified")) {
        return {
          success: false,
          error: "Confirm your email before logging in",
        };
      }

      switch (error.type) {
        case "CredentialsSignin":
          return { success: false, error: "Invalid credentials" };
        case "AccessDenied":
          return {
            success: false,
            error: "Confirm your email before logging in",
          };
        case "CallbackRouteError":
          return { success: false, error: "Invalid credentials" };
        default:
          logger.error(error, "Auth error");
          return { success: false, error: "Unable to log in" };
      }
    }

    logger.error(error, "Unexpected login error");
    return { success: false, error: "Unexpected error" };
  }
}

export async function resendVerificationEmail(
  email: string
): Promise<ActionResponse> {
  const sanitizedEmail = sanitizeInput(email).toLowerCase();
  const user = await prisma.user.findUnique({
    where: { email: sanitizedEmail },
  });

  if (!user) {
    return { success: false, error: "Account not found" };
  }

  if (user.emailVerified) {
    return { success: false, error: "Email already verified" };
  }

  await prisma.verificationToken.deleteMany({
    where: { identifier: sanitizedEmail },
  });
  const otp = generateOtp();
  await prisma.verificationToken.create({
    data: {
      identifier: sanitizedEmail,
      token: otp,
      expires: addHours(new Date(), 24),
    },
  });

  const { sendVerificationEmail } = await import("@/lib/email-smtp");
  await sendVerificationEmail({
    email: sanitizedEmail,
    token: otp,
    firstName: user.firstName,
  });
  return { success: true, message: "Verification OTP sent" };
}

export async function verifyEmailOtp(payload: unknown): Promise<ActionResponse> {
  const parsed = verifyEmailOtpSchema.safeParse(payload);
  if (!parsed.success) {
    return {
      success: false,
      error: parsed.error.errors[0]?.message ?? "Invalid input",
    };
  }

  const email = sanitizeInput(parsed.data.email).toLowerCase();
  const otp = parsed.data.otp.trim();

  // Use findFirst because `token` alone is not a unique field —
  // the table has a composite PK [identifier, token].
  const storedToken = await prisma.verificationToken.findFirst({
    where: { token: otp },
  });
  if (!storedToken || storedToken.identifier !== email) {
    return { success: false, error: "Invalid OTP" };
  }

  if (storedToken.expires < new Date()) {
    await prisma.verificationToken.delete({ where: { token: otp } });
    return { success: false, error: "OTP expired" };
  }

  const user = await prisma.user.update({
    where: { email },
    data: { emailVerified: new Date() },
  });

  await prisma.verificationToken.deleteMany({
    where: { identifier: email },
  });

  const { sendWelcomeEmail } = await import("@/lib/email-smtp");
  await sendWelcomeEmail(user.email, user.firstName);
  return { success: true, message: "Email verified" };
}
