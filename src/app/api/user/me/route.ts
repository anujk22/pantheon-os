/* eslint-disable */
import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";

export async function GET() {
  try {
    const user = await prisma.user.findUnique({
      where: { email: "local-admin@pantheon.local" },
    });
    return NextResponse.json(user || { name: "System Admin" });
  } catch (error) {
    return NextResponse.json({ name: "System Admin" });
  }
}
