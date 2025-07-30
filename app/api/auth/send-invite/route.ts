import { prisma } from "@/lib/prisma";
import { randomBytes } from "crypto";
import nodemailer from "nodemailer";
import { sensitiveActionLimiter } from "@/lib/rateLimiter";


function generateToken(): string {
  return randomBytes(32).toString("hex");
}

async function generateUniqueToken(maxRetries = 5): Promise<string> {
  for (let i = 0; i < maxRetries; i++) {
    const token = generateToken();
    const existing = await prisma.invitation.findUnique({ where: { token } });
    if (!existing) {
      return token;
    }
  }
  throw new Error("Could not generate unique token after max retries");
}



export async function POST(req: Request) {
  const ip = req.headers.get("x-forwarded-for")?.split(",")[0].trim() || "unknown";

  try {
    await sensitiveActionLimiter.consume(ip);
  } catch {
    return new Response(
      JSON.stringify({ message: "Too many invite requests. Please try again later." }),
      { status: 429 }
    );
  }

  try {
    const { email } = await req.json();

    if (!email || !email.includes("@")) {
      return new Response(JSON.stringify({ message: "Invalid email." }), { status: 400 });
    }

    // 🚫 Check if user already exists
    const existingUser = await prisma.user.findUnique({
      where: { email },
    });

    if (existingUser) {
      return new Response(
        JSON.stringify({ message: "User with this email already exists." }),
        { status: 400 }
      );
    }

    const token = await generateUniqueToken();
    const expiresAt = new Date(Date.now() + 1000 * 60 * 60); // 1 hour

    await prisma.invitation.upsert({
      where: { email },
      update: { token, used: false, expiresAt },
      create: { email, token, expiresAt },
    });

    const link = `${process.env.NEXT_PUBLIC_BASE_URL}/auth/set-password?token=${token}`;

    const transporter = nodemailer.createTransport({
      service: "gmail",
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS,
      },
    });

    await transporter.sendMail({
      from: `"Admin Panel" <${process.env.EMAIL_FROM}>`,
      to: email,
      subject: "You're invited!",
      html: `
        <h2>You've been invited to join the Admin Panel</h2>
        <p>Click the link below to set your password and activate your account:</p>
        <a href="${link}">${link}</a>
        <p>This link will expire in 1 hour and can only be used once.</p>
      `,
    });

    return new Response(
      JSON.stringify({ message: "Invitation sent successfully." }),
      { status: 200 }
    );

  } catch (error) {
    console.error("Invite Error:", error);
    return new Response(JSON.stringify({ message: "Failed to send invite." }), { status: 500 });
  }
}
