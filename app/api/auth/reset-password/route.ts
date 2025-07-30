import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import { sensitiveActionLimiter } from "@/lib/rateLimiter";
import { passwordSchema } from "@/lib/passwordSchema";

export async function POST(req: Request) {
  const ip = req.headers.get("x-forwarded-for")?.split(",")[0].trim() || "unknown";

  try {
    await sensitiveActionLimiter.consume(ip);
  } catch {
    return NextResponse.json(
      { error: "Too many reset attempts. Please try again later." },
      { status: 429 }
    );
  }

  const { token, password } = await req.json();


  if (!token || !password) {
    console.log("[reset-password] Missing token or password");
    return NextResponse.json({ error: "Missing token or password" }, { status: 400 });
  }


  const parsed = passwordSchema.safeParse(password);
  if (!parsed.success) {
    const msg = parsed.error.issues[0]?.message || "Invalid password format";
    return NextResponse.json({ error: msg }, { status: 400 });
  }

  const resetRecord = await prisma.passwordResetToken.findUnique({ where: { token } });

  if (!resetRecord) {
    return NextResponse.json({ error: "Invalid or expired token" }, { status: 400 });
  }

  if (resetRecord.expires < new Date()) {
    return NextResponse.json({ error: "Token has expired" }, { status: 400 });
  }
  

  try {
    const hashed = await bcrypt.hash(password, 10);

    await prisma.user.update({
      where: { email: resetRecord.email },
      data: { hashedPassword: hashed },
    });

    await prisma.passwordResetToken.delete({ where: { token } });

    console.log("[reset-password] Password updated for:", resetRecord.email);
    return NextResponse.json({ message: "Password reset successful." });
  } catch (err) {
    console.error("[reset-password] Error updating password:", err);
    return NextResponse.json({ error: "Could not update password" }, { status: 500 });
  }
}
