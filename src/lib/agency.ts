import { prisma } from "@/lib/prisma";
import { classifyInboxText } from "@/lib/inbox";

export type AgentActionPayload = {
  title?: string;
  body?: string;
  content?: string;
  type?: string;
  caseId?: string | null;
  inboxItemId?: string;
  sourceChatSessionId?: string;
  taskCandidates?: Array<{ title: string; description?: string }>;
  artifactCandidates?: Array<{ title: string; type?: string; content: string }>;
  memoryCandidates?: Array<{ content: string; memoryType?: string }>;
  suggestedAgents?: string[];
};

type ProposedAction = {
  title: string;
  description: string;
  kind: string;
  createdBy: string;
  sourceType: string;
  sourceRef?: string;
  payload: AgentActionPayload;
};

export async function proposeInboxActions(limit = 30) {
  const items = await prisma.inboxItem.findMany({
    where: { status: "untriaged" },
    orderBy: { createdAt: "desc" },
    take: limit,
  });

  const proposals = items.map((item): ProposedAction => {
    const classification = classifyInboxText(item.body);
    const destination =
      item.suggestedDestination === "unknown"
        ? classification.destination
        : item.suggestedDestination;

    if (destination === "task") {
      return {
        title: `Create task: ${item.title}`,
        description: "Athena found task-shaped language in an untriaged inbox item.",
        kind: "create_task",
        createdBy: "artemis",
        sourceType: "inbox",
        sourceRef: item.id,
        payload: {
          inboxItemId: item.id,
          title: item.title,
          body: item.body,
          caseId: item.caseId,
        },
      };
    }

    if (destination === "artifact") {
      return {
        title: `Save artifact: ${item.title}`,
        description: "Athena found durable reference material in an untriaged inbox item.",
        kind: "save_artifact",
        createdBy: "apollo",
        sourceType: "inbox",
        sourceRef: item.id,
        payload: {
          inboxItemId: item.id,
          title: item.title,
          content: item.body,
          type: "text",
          caseId: item.caseId,
        },
      };
    }

    if (destination === "memory") {
      return {
        title: `Review memory: ${item.title}`,
        description: "Athena found a preference or durable fact that should be reviewed before saving.",
        kind: "save_memory",
        createdBy: "athena",
        sourceType: "inbox",
        sourceRef: item.id,
        payload: {
          inboxItemId: item.id,
          content: item.body,
          type: "note",
          caseId: item.caseId,
        },
      };
    }

    if (destination === "case") {
      return {
        title: `Create case: ${item.title}`,
        description: "Athena found project-shaped context that can become a case workspace.",
        kind: "create_case",
        createdBy: "hermes",
        sourceType: "inbox",
        sourceRef: item.id,
        payload: {
          inboxItemId: item.id,
          title: item.title,
          body: item.body,
        },
      };
    }

    return {
      title: `Archive low-signal capture: ${item.title}`,
      description: "Athena did not find a strong task, artifact, memory, or case signal.",
      kind: "archive_inbox",
      createdBy: "athena",
      sourceType: "inbox",
      sourceRef: item.id,
      payload: {
        inboxItemId: item.id,
        title: item.title,
        body: item.body,
      },
    };
  });

  return createMissingActions(proposals);
}

export async function proposeChatReviewActions(limit = 10) {
  const sessions = await prisma.chatSession.findMany({
    where: { isSummarized: false },
    include: {
      messages: {
        orderBy: { createdAt: "asc" },
        take: 20,
      },
    },
    orderBy: { updatedAt: "desc" },
    take: limit,
  });

  const proposals = sessions
    .filter((session) => session.messages.length >= 4)
    .map((session): ProposedAction => ({
      title: `Summarize chat: ${session.title}`,
      description: "Athena found an unsummarized conversation with enough context to review.",
      kind: "save_artifact",
      createdBy: "apollo",
      sourceType: "chat",
      sourceRef: session.id,
      payload: {
        sourceChatSessionId: session.id,
        title: `${session.title} summary`,
        type: "text",
        content: session.messages
          .map((message) => `${message.role.toUpperCase()}: ${message.content}`)
          .join("\n\n"),
      },
    }));

  return createMissingActions(proposals);
}

async function createMissingActions(proposals: ProposedAction[]) {
  let created = 0;

  for (const proposal of proposals) {
    const existing = await prisma.agentAction.findFirst({
      where: {
        kind: proposal.kind,
        sourceType: proposal.sourceType,
        sourceRef: proposal.sourceRef ?? null,
        status: { in: ["pending", "approved", "executed"] },
      },
      select: { id: true },
    });

    if (existing) continue;

    await prisma.agentAction.create({
      data: {
        title: proposal.title,
        description: proposal.description,
        kind: proposal.kind,
        sourceType: proposal.sourceType,
        sourceRef: proposal.sourceRef,
        payloadJson: JSON.stringify(proposal.payload),
        createdBy: proposal.createdBy,
      },
    });

    created += 1;
  }

  return created;
}

export async function executeAgentAction(id: string) {
  const action = await prisma.agentAction.findUnique({ where: { id } });
  if (!action) return;
  if (!["pending", "approved", "failed"].includes(action.status)) return;

  const payload = parsePayload(action.payloadJson);
  const now = new Date();

  try {
    let result: unknown;

    if (action.kind === "create_task") {
      const task = await prisma.task.create({
        data: {
          title: payload.title || action.title,
          description: payload.body || action.description,
          caseId: payload.caseId || undefined,
          sourceInboxItemId: payload.inboxItemId,
        },
      });
      result = { taskId: task.id };
      await markInboxTriaged(payload.inboxItemId, "task", now);
    } else if (action.kind === "save_artifact") {
      const artifact = await prisma.artifact.create({
        data: {
          title: payload.title || action.title,
          type: payload.type || "text",
          content: payload.content || payload.body || action.description || "",
          caseId: payload.caseId || undefined,
          sourceInboxItemId: payload.inboxItemId,
        },
      });
      result = { artifactId: artifact.id };
      await markInboxTriaged(payload.inboxItemId, "artifact", now);
    } else if (action.kind === "save_memory") {
      const memory = await prisma.memory.create({
        data: {
          content: payload.content || payload.body || action.description || "",
          memoryType: payload.type || "note",
          sourceType: action.sourceType,
          sourceRef: action.sourceRef,
          caseId: payload.caseId || undefined,
          sourceInboxItemId: payload.inboxItemId,
        },
      });
      result = { memoryId: memory.id };
      await markInboxTriaged(payload.inboxItemId, "memory", now);
    } else if (action.kind === "create_case") {
      const caseItem = await prisma.case.create({
        data: {
          title: payload.title || action.title,
          description: payload.body || action.description,
        },
      });
      const tasks = payload.taskCandidates?.length
        ? await prisma.task.createMany({
            data: payload.taskCandidates.map((task) => ({
              title: task.title,
              description: task.description,
              caseId: caseItem.id,
            })),
          })
        : null;
      const artifacts = payload.artifactCandidates?.length
        ? await prisma.artifact.createMany({
            data: payload.artifactCandidates.map((artifact) => ({
              title: artifact.title,
              type: artifact.type || "text",
              content: artifact.content,
              caseId: caseItem.id,
            })),
          })
        : null;
      const memories = payload.memoryCandidates?.length
        ? await prisma.memory.createMany({
            data: payload.memoryCandidates.map((memory) => ({
              content: memory.content,
              memoryType: memory.memoryType || "note",
              sourceType: action.sourceType,
              sourceRef: action.sourceRef,
              caseId: caseItem.id,
            })),
          })
        : null;
      result = {
        caseId: caseItem.id,
        tasksCreated: tasks?.count || 0,
        artifactsCreated: artifacts?.count || 0,
        memoriesCreated: memories?.count || 0,
        suggestedAgents: payload.suggestedAgents || [],
      };
      if (payload.inboxItemId) {
        await prisma.inboxItem.update({
          where: { id: payload.inboxItemId },
          data: {
            caseId: caseItem.id,
            status: "triaged",
            suggestedDestination: "case",
            triagedAt: now,
          },
        });
      }
    } else if (action.kind === "archive_inbox") {
      await markInboxTriaged(payload.inboxItemId, "archive", now);
      result = { inboxItemId: payload.inboxItemId, archived: true };
    } else {
      throw new Error(`Action kind "${action.kind}" is proposal-only.`);
    }

    await prisma.agentAction.update({
      where: { id },
      data: {
        status: "executed",
        approvedAt: action.approvedAt || now,
        executedAt: now,
        resultJson: JSON.stringify(result),
        error: null,
      },
    });
  } catch (error) {
    await prisma.agentAction.update({
      where: { id },
      data: {
        status: "failed",
        error: error instanceof Error ? error.message : "Action failed.",
      },
    });
  }
}

export async function rejectAgentAction(id: string) {
  await prisma.agentAction.update({
    where: { id },
    data: { status: "rejected" },
  });
}

function parsePayload(value: string): AgentActionPayload {
  try {
    return JSON.parse(value) as AgentActionPayload;
  } catch {
    return {};
  }
}

async function markInboxTriaged(
  inboxItemId: string | undefined,
  destination: string,
  triagedAt: Date
) {
  if (!inboxItemId) return;

  await prisma.inboxItem.update({
    where: { id: inboxItemId },
    data: {
      status: destination === "archive" ? "archived" : "triaged",
      suggestedDestination: destination,
      triagedAt,
    },
  });
}
