import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const caseId = searchParams.get("caseId");
  const startOfToday = new Date();
  startOfToday.setHours(0, 0, 0, 0);
  const endOfToday = new Date(startOfToday);
  endOfToday.setDate(endOfToday.getDate() + 1);

  const [briefing, events, activeCase] = await Promise.all([
    prisma.morningBriefing.findFirst({
      orderBy: { date: "desc" },
      select: { content: true, date: true },
    }),
    prisma.event.findMany({
      where: {
        date: {
          gte: startOfToday,
          lt: endOfToday,
        },
      },
      orderBy: { date: "asc" },
      take: 8,
      select: {
        id: true,
        title: true,
        date: true,
        source: true,
      },
    }),
    caseId
      ? prisma.case.findUnique({
          where: { id: caseId },
          include: {
            _count: {
              select: { tasks: true, artifacts: true, memories: true },
            },
          },
        })
      : prisma.case.findFirst({
          where: { status: "active" },
          orderBy: { updatedAt: "desc" },
          include: {
            _count: {
              select: { tasks: true, artifacts: true, memories: true },
            },
          },
        }),
  ]);

  return NextResponse.json({
    briefing,
    events,
    activeCase,
  });
}
