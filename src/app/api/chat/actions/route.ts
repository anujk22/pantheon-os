import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";

type ChatActionKind =
  | "save_artifact"
  | "create_task"
  | "create_case"
  | "save_memory";

const executableKinds = new Set<ChatActionKind>([
  "save_artifact",
  "create_task",
  "create_case",
  "save_memory",
]);

export async function POST(req: Request) {
  try {
    const body = (await req.json()) as {
      sessionId?: string;
      kind?: ChatActionKind;
      title?: string;
      description?: string;
      createdBy?: string;
      payload?: Record<string, unknown>;
    };

    const sessionId = body.sessionId?.trim();
    const kind = body.kind;
    const title = body.title?.trim();

    if (!sessionId || !kind || !title || !executableKinds.has(kind)) {
      return NextResponse.json(
        { message: "sessionId, kind, and title are required." },
        { status: 400 }
      );
    }

    const session = await prisma.chatSession.findUnique({
      where: { id: sessionId },
      select: { id: true, caseId: true },
    });

    if (!session) {
      return NextResponse.json({ message: "Chat session not found." }, { status: 404 });
    }

    const payload = {
      ...body.payload,
      sourceChatSessionId: sessionId,
      caseId: (body.payload?.caseId as string | null | undefined) ?? session.caseId,
    };

    const action = await prisma.agentAction.create({
      data: {
        title,
        description: body.description,
        kind,
        sourceType: "chat",
        sourceRef: sessionId,
        payloadJson: JSON.stringify(payload),
        createdBy: body.createdBy || createdByForKind(kind),
      },
    });

    await prisma.chatLedgerEntry.create({
      data: {
        sessionId,
        kind: `proposed_${kind}`,
        title,
        detail: "Staged in Agency Queue for review before execution.",
        payloadJson: JSON.stringify({ actionId: action.id, payload }),
      },
    });

    return NextResponse.json({ actionId: action.id });
  } catch {
    return NextResponse.json(
      { message: "Could not stage chat action." },
      { status: 500 }
    );
  }
}

function createdByForKind(kind: ChatActionKind) {
  if (kind === "create_task") return "artemis";
  if (kind === "save_artifact") return "apollo";
  if (kind === "create_case") return "hermes";
  return "athena";
}
