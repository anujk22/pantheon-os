import { NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";
import { cookies } from "next/headers";

const prisma = new PrismaClient();

export async function POST(req: Request) {
  try {
    const { name } = await req.json();
    
    // Create the user
    await prisma.user.create({
      data: {
        name,
        email: "local-admin@pantheon.local", // placeholder
      }
    });

    // Set onboarding cookie
    (await cookies()).set("pantheon_onboarded", "true", {
      path: "/",
      maxAge: 60 * 60 * 24 * 365 * 10, // 10 years
      httpOnly: true,
      sameSite: "lax",
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: "Onboarding failed" }, { status: 500 });
  }
}
