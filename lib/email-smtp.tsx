import "server-only";
import nodemailer from "nodemailer";
import { render } from "@react-email/render";

import EmailVerification from "@/emails/EmailVerification";
import PasswordReset from "@/emails/PasswordReset";
import WelcomeEmail from "@/emails/Welcome";
import { getBaseUrl } from "@/lib/utils";

let transporter: nodemailer.Transporter | null = null;

const getTransporter = () => {
  if (!transporter) {
    if (!process.env.SMTP_HOST || !process.env.SMTP_USER || !process.env.SMTP_PASS) {
      console.warn("SMTP credentials not configured - emails will be logged to console");
      return null;
    }

    transporter = nodemailer.createTransport({
      host: process.env.SMTP_HOST,
      port: parseInt(process.env.SMTP_PORT || "587"),
      secure: false, // true for 465, false for other ports
      auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASS,
      },
    });
  }
  return transporter;
};

type EmailParams = {
  email: string;
  token: string;
  firstName?: string | null;
};

export async function sendVerificationEmail({ email, token, firstName }: EmailParams) {
  const verificationUrl = `${getBaseUrl()}/auth/verify-email/${token}`;
  const smtp = getTransporter();

  if (!smtp) {
    console.log(`[DEV] Verification email for ${email}:\n${verificationUrl}`);
    return;
  }

  try {
    const html = render(
      <EmailVerification firstName={firstName} actionUrl={verificationUrl} />,
    );

    const result = await smtp.sendMail({
      from: process.env.SMTP_FROM || process.env.SMTP_USER,
      to: email,
      subject: "Verify your Make It Possible account",
      html,
    });

    console.log(`✓ Verification email sent to ${email}:`, result.messageId);
  } catch (error) {
    console.error(`✗ Failed to send verification email to ${email}:`, error);
    throw error;
  }
}

export async function sendPasswordResetEmail({ email, token, firstName }: EmailParams) {
  const resetUrl = `${getBaseUrl()}/auth/reset-password/${token}`;
  const smtp = getTransporter();

  if (!smtp) {
    console.log(`[DEV] Password reset email for ${email}:\n${resetUrl}`);
    return;
  }

  try {
    const html = render(<PasswordReset firstName={firstName} actionUrl={resetUrl} />);

    const result = await smtp.sendMail({
      from: process.env.SMTP_FROM || process.env.SMTP_USER,
      to: email,
      subject: "Reset your Make It Possible password",
      html,
    });

    console.log(`✓ Password reset email sent to ${email}:`, result.messageId);
  } catch (error) {
    console.error(`✗ Failed to send password reset email to ${email}:`, error);
    throw error;
  }
}

export async function sendWelcomeEmail(email: string, firstName?: string | null) {
  const smtp = getTransporter();

  if (!smtp) {
    console.log(`[DEV] Welcome email for ${email}`);
    return;
  }

  try {
    const html = render(<WelcomeEmail firstName={firstName} />);

    const result = await smtp.sendMail({
      from: process.env.SMTP_FROM || process.env.SMTP_USER,
      to: email,
      subject: "Welcome to Make It Possible",
      html,
    });

    console.log(`✓ Welcome email sent to ${email}:`, result.messageId);
  } catch (error) {
    console.error(`✗ Failed to send welcome email to ${email}:`, error);
    throw error;
  }
}
