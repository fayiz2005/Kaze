import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";
import { randomBytes } from "crypto";
import nodemailer from "nodemailer";
import { sensitiveActionLimiter } from "@/lib/rateLimiter";

export async function POST(req: Request) {


  const ip = req.headers.get("x-forwarded-for")?.split(",")[0].trim() || "unknown";


  try {
    await sensitiveActionLimiter.consume(ip);
  } catch {
    return new Response(
      JSON.stringify({ message: "Too many requests. Please try again later." }),
      { status: 429 }
    );
  }

  const { email } = await req.json();

  if (!email) {
    return NextResponse.json({ error: "Email is required" }, { status: 400 });
  }

  const user = await prisma.user.findUnique({ where: { email } });
  if (!user) {

    return NextResponse.json({ message: "If this email exists, a reset link has been sent." });
  }

  const token = randomBytes(32).toString("hex");
  const expires = new Date(Date.now() + 1000 * 60 * 60); // 1 hour

  await prisma.passwordResetToken.create({
    data: { email, token, expires },
  });




  const resetUrl = `${process.env.NEXT_PUBLIC_APP_URL}/auth/reset-password-page?token=${token}`;



  const transporter = nodemailer.createTransport({
    service: "Gmail",
    auth: {
      user: process.env.EMAIL_USER,
      pass: process.env.EMAIL_PASS,
    },
  });

  await transporter.sendMail({
    to: email,
    from: process.env.EMAIL_FROM,
    subject: "Reset your password",
   html: `
  <div style="font-family: Arial, sans-serif; line-height: 1.5; color: #333;">
    <p>Hello,</p>
    <p>You requested to reset your password. Click the button below to proceed:</p>
    <a href="${resetUrl}"
       style="
         display: inline-block;
         padding: 12px 24px;
         margin: 20px 0;
         font-size: 16px;
         color: #fff;
         background-color: #212529;
         text-decoration: none;
         border-radius: 0.375rem;
         font-weight: 500;
       ">
      Reset Password
    </a>
    <p style="font-size: 14px; color: #adb5bd;">
      This link will expire in 1 hour. If you didn't request a password reset, please ignore this email.
    </p>
    <p>Thanks,<br />Your Company Team</p>
  </div>
`,

  });


  return NextResponse.json({ message: "Reset link sent if the email exists." });
}
