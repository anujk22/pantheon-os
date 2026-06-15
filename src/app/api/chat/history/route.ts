import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";

export async function GET() {
  try {
    const sessions = await prisma.chatSession.findMany({
      orderBy: { updatedAt: "desc" },
      take: 20,
    });
    return NextResponse.json(sessions);
  } catch (error) {
    console.error("Failed to fetch chat history:", error);
    return new NextResponse("Internal Error", { status: 500 });
  }
}
