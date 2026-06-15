import { NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

export async function GET(req: Request, context: { params: Promise<{ case_id: string }> }) {
  try {
    const { case_id } = await context.params;
    const tasks = await prisma.task.findMany({
      where: { caseId: case_id },
      orderBy: { createdAt: 'asc' }
    });
    return NextResponse.json({ tasks });
  } catch (error) {
    return NextResponse.json({ error: "Failed to fetch tasks" }, { status: 500 });
  }
}

export async function POST(req: Request, context: { params: Promise<{ case_id: string }> }) {
  try {
    const { case_id } = await context.params;
    const { title, status, description } = await req.json();
    const task = await prisma.task.create({
      data: {
        title,
        status: status || "todo",
        description,
        caseId: case_id,
      }
    });
    return NextResponse.json({ task });
  } catch (error) {
    return NextResponse.json({ error: "Failed to create task" }, { status: 500 });
  }
}
