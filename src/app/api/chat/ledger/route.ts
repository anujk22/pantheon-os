import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const sessionId = searchParams.get("sessionId");

  if (!sessionId) {
    return NextResponse.json({ message: "sessionId is required." }, { status: 400 });
  }

  const entries = await prisma.chatLedgerEntry.findMany({
    where: { sessionId },
    orderBy: { createdAt: "desc" },
    take: 60,
  });

  return NextResponse.json(entries);
}
