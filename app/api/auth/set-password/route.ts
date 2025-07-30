import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import bcrypt from "bcryptjs";
import { sensitiveActionLimiter } from "@/lib/rateLimiter";
import { passwordSchema } from "@/lib/passwordSchema";

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

  try {
    const body = await req.json();

    const { token, password } = body;

    if (!token || !password) {
      return NextResponse.json({ message: "Invalid token or password." }, { status: 400 });
    }

    // ✅ Password strength check with Zod
    const parsed = passwordSchema.safeParse(password);
    if (!parsed.success) {
      const msg = parsed.error.issues[0]?.message || "Password does not meet requirements.";
      return NextResponse.json({ message: msg }, { status: 400 });
    }

    const invitation = await prisma.invitation.findFirst({
      where: { token },
    });

if (!invitation || invitation.used || (invitation.expiresAt && invitation.expiresAt < new Date())) {
  return NextResponse.json({ message: "Invalid or expired token." }, { status: 400 });
}


    const hashedPassword = await bcrypt.hash(password, 10);

    await prisma.$transaction([
      prisma.user.create({
        data: {
          email: invitation.email,
          hashedPassword,
          emailVerified: new Date(),
          role: "ADMIN", 
        },
      }),
      prisma.invitation.update({
        where: { id: invitation.id },
        data: { used: true },
      }),
    ]);

    return NextResponse.json({ message: "Password set successfully!" });
  } catch (error) {
    console.error("Set password error:", error);
    return NextResponse.json({ message: "Something went wrong." }, { status: 500 });
  }
}
