/* eslint-disable */
import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";

export async function GET(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const session = await prisma.chatSession.findUnique({
      where: { id },
      include: {
        messages: {
          orderBy: { createdAt: "asc" },
        },
      },
    });

    if (!session) {
      return new NextResponse("Session not found", { status: 404 });
    }

    const initialMessages = session.messages.map((msg) => {
      let parts: any[] = [];
      try {
        if (msg.content.trim().startsWith("[{") && msg.content.trim().endsWith("}]")) {
          parts = JSON.parse(msg.content);
        } else {
          parts = [{ type: "text", text: msg.content }];
        }
      } catch (e) {
        parts = [{ type: "text", text: msg.content }];
      }

      return {
        id: msg.id,
        role: msg.role as any,
        content: msg.content.trim().startsWith("[{") ? parts.filter(p => p.type === 'text').map(p => p.text).join('') : msg.content,
        parts: parts,
      };
    });

    return NextResponse.json({ session, messages: initialMessages });
  } catch (error) {
    console.error("Failed to fetch session:", error);
    return new NextResponse("Internal Error", { status: 500 });
  }
}

export async function DELETE(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    await prisma.chatSession.delete({
      where: { id },
    });
    return new NextResponse("Deleted", { status: 200 });
  } catch (error) {
    console.error("Failed to delete session:", error);
    return new NextResponse("Internal Error", { status: 500 });
  }
}

export async function PATCH(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const body = await req.json();
    const data: { folder?: string | null; caseId?: string | null } = {};

    if ("folder" in body) data.folder = body.folder;
    if ("caseId" in body) data.caseId = body.caseId || null;

    const session = await prisma.chatSession.update({
      where: { id },
      data,
    });

    if ("caseId" in body) {
      await prisma.chatLedgerEntry.create({
        data: {
          sessionId: id,
          kind: "case_attached",
          title: body.caseId ? "Attached case context" : "Cleared case context",
          detail: body.caseId
            ? "Future turns can use this case as their local work container."
            : "Future turns will use global chat context unless another case is attached.",
          payloadJson: JSON.stringify({ caseId: body.caseId || null }),
        },
      });
    }

    return NextResponse.json(session);
  } catch (error) {
    console.error("Failed to update session:", error);
    return new NextResponse("Internal Error", { status: 500 });
  }
}
