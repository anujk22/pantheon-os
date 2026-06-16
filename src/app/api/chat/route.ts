/* eslint-disable */
import { prisma } from "@/lib/prisma";
import { globalAgentMemoryType, routeAgent, type AgentProfile } from "@/lib/agents";
import { createOpenAI } from "@ai-sdk/openai";
import { convertToModelMessages, streamText, type UIMessage } from "ai";

// Allow streaming responses up to 30 seconds
export const maxDuration = 30;

export async function POST(req: Request) {
  const {
    messages: rawMessages,
    id,
    useMemoryContext = true,
    caseId,
  }: {
    messages: UIMessage[];
    id?: string;
    useMemoryContext?: boolean;
    caseId?: string | null;
  } = await req.json();
  const sessionId = id || "command-layer";

  // Ensure all messages have parts to prevent crashes in convertToModelMessages and getMessageText
  const messages = rawMessages.map((m: any) => {
    if (!m.parts && m.content) {
      return { ...m, parts: [{ type: "text" as const, text: m.content }] };
    }
    return m as UIMessage;
  });

  // Fetch the user's configuration
  const user = await prisma.user.findFirst({
    where: { email: "local-admin@pantheon.local" },
  });

  if (!user) {
    return new Response(
      "Pantheon OS is not onboarded. Open Settings and reset onboarding, then enter your LLM provider details.",
      { status: 400 }
    );
  }

  let baseURL = user.llmBaseUrl ? user.llmBaseUrl.trim() : "";
  let apiKey = user.llmApiKey ? user.llmApiKey.trim() : "";
  let modelName = user.llmModel && user.llmModel.trim() !== "" ? user.llmModel.trim() : "local-model";
  const activeAgent = routeAgent(getLatestUserText(messages));
  const isFirstAssistantTurn = messages.every((message) => message.role !== "assistant");
  const existingSession = await prisma.chatSession.findUnique({
    where: { id: sessionId },
    select: { caseId: true },
  }).catch(() => null);
  const sessionScope = getSessionScope(sessionId, caseId ?? existingSession?.caseId ?? null);

  if (user.llmProvider === "openai") {
    if (!baseURL || baseURL.includes("127.0.0.1") || baseURL.includes("localhost")) {
      baseURL = "https://api.openai.com/v1";
    }
    if (!apiKey) apiKey = process.env.OPENAI_API_KEY || "";
    if (modelName === "local-model") modelName = process.env.OPENAI_MODEL || "gpt-4o-mini";
  } else if (user.llmProvider === "gemini") {
    if (!baseURL || baseURL.includes("127.0.0.1") || baseURL.includes("localhost")) {
      baseURL = "https://generativelanguage.googleapis.com/v1beta/openai";
    }
    if (!apiKey) apiKey = process.env.GEMINI_API_KEY || "";
    if (modelName === "local-model") modelName = process.env.GEMINI_MODEL || "gemini-1.5-flash";
  } else {
    if (!baseURL) {
      baseURL = "http://127.0.0.1:1234/v1";
    } else {
      baseURL = baseURL.replace(/\/+$/, "");
      if (!baseURL.endsWith("/v1")) {
        baseURL = `${baseURL}/v1`;
      }
    }
    if (!apiKey) apiKey = "lm-studio";
    if (modelName === "local-model") modelName = process.env.LOCAL_LLM_MODEL || await resolveLocalModelName(baseURL, apiKey);
  }

  const customProvider = createOpenAI({
    baseURL,
    apiKey,
  });

  const model = customProvider.chat(modelName);

  // Fetch global, agent-specific, and legacy memory facts.
  const caseMemoryWhere = sessionScope.caseId
    ? [{ caseId: null }, { caseId: sessionScope.caseId }]
    : [{ caseId: null }];

  const [memories, attachedCase, caseArtifactCount] = await Promise.all([
    user.memoryMode === "off" || !useMemoryContext ? [] : prisma.memory.findMany({
      where: {
        AND: [
          { OR: caseMemoryWhere },
          {
            OR: [
              { memoryType: activeAgent.memoryType },
              { memoryType: globalAgentMemoryType },
              { memoryType: { not: { startsWith: "agent:" } } },
            ],
          },
        ],
      },
      orderBy: { createdAt: "desc" },
      take: 50
    }),
    sessionScope.caseId
      ? prisma.case.findUnique({
          where: { id: sessionScope.caseId },
          select: { id: true, title: true, status: true },
        })
      : null,
    sessionScope.caseId
      ? prisma.artifact.count({ where: { caseId: sessionScope.caseId } })
      : 0,
  ]);

  const recentSummaries = user.memoryMode === "off" ? [] : await prisma.chatSession.findMany({
    where: {
      id: { not: sessionId },
      summary: { not: null },
    },
    orderBy: { updatedAt: "desc" },
    take: 8,
    select: { title: true, summary: true },
  });

  const styleInstruction =
    user.responseStyle === "concise"
      ? "Default to short answers. Use bullets only when they improve scanability."
      : user.responseStyle === "operator"
        ? "Bias toward action when the user has already provided enough context, but still call out assumptions."
        : "Be considerate of the user's opinion. When the user asks a broad or preference-heavy question, ask 1-2 smart clarifying questions before giving a long plan.";

  const routeInstruction = isFirstAssistantTurn
    ? `Begin with one short sentence that identifies the routing decision, exactly in this shape: "Routed to ${activeAgent.name} (${activeAgent.role}) for this." Then continue naturally.`
    : "";

  const baseSystemPrompt = `${activeAgent.system}

You are currently responding as ${activeAgent.name} (${activeAgent.role}) inside Pantheon OS. Be concise, useful, and honest. ${styleInstruction} ${routeInstruction} Avoid giant unsolicited plans. Prefer a short answer, then ask whether the user wants deeper execution. Render clean Markdown when useful. If another Pantheon agent would be better suited, say so and hand off conceptually. Do not claim calendars, cases, files, tools, automations, integrations, or memory are connected unless the user provides that data in the conversation. If a capability is not available in the current chat context, say that it is not connected yet and offer the next concrete step.`;
  const userContext = `The user's name is ${user.name || "the user"}. Always refer to them respectfully.`;
  
  const memoryContext = memories.length > 0 
    ? `\n\nRELEVANT MEMORY:\nThe following memory is available to ${activeAgent.name}. Use it only when relevant:\n${memories.map(m => `- ${m.content}`).join("\n")}` 
    : "";

  const conversationContext = recentSummaries.length > 0
    ? `\n\nRECENT CONVERSATION SUMMARIES:\n${recentSummaries.map(s => `- ${s.title}: ${s.summary}`).join("\n")}`
    : "";

  const customPrompt = user.systemPrompt && user.systemPrompt.trim() !== "" ? `\n\nUSER CUSTOM INSTRUCTIONS:\n${user.systemPrompt}` : "";

  const finalSystemPrompt = `${baseSystemPrompt}\n${userContext}${memoryContext}${conversationContext}${customPrompt}`;

  await persistChatMessages({
    sessionId,
    messages,
    caseId: sessionScope.caseId,
    title: getSessionTitle(messages, sessionScope.title),
  });
  await recordChatLedger({
    sessionId,
    kind: "route_context",
    title: `Routed to ${activeAgent.name}`,
    detail: `${activeAgent.role}. Context scope: ${attachedCase ? `case "${attachedCase.title}"` : "global chat"}.`,
    payload: {
      agent: activeAgent.id,
      agentName: activeAgent.name,
      agentRole: activeAgent.role,
      memoryEnabled: user.memoryMode !== "off" && useMemoryContext,
      memoryCount: memories.length,
      recentSummaryCount: recentSummaries.length,
      case: attachedCase,
      caseArtifactCount,
    },
  });

  const result = await streamText({
    model,
    system: finalSystemPrompt,
    messages: await convertToModelMessages(messages),
  });

  return result.toUIMessageStreamResponse({
    originalMessages: messages,
    onError: (error) =>
      error instanceof Error
        ? `${activeAgent.name} could not reach the configured model (${modelName} at ${baseURL}): ${error.message}`
        : `${activeAgent.name} could not reach the configured model (${modelName} at ${baseURL}).`,
    onFinish: async ({ messages }) => {
      const sessionScope = getSessionScope(sessionId, caseId ?? existingSession?.caseId ?? null);
      const sessionTitle = getSessionTitle(messages, sessionScope.title);

      await persistChatMessages({
        sessionId,
        messages,
        caseId: sessionScope.caseId,
        title: sessionTitle,
      });

      if (user.memoryMode !== "off") {
        const summary = summarizeMessages(messages, activeAgent);
        if (summary) {
          await prisma.chatSession.update({
            where: { id: sessionId },
            data: {
              title: sessionTitle,
              summary,
              isSummarized: true,
            },
          });

          if (user.memoryMode === "summaries") {
            await proposeMemoryReview({
              activeAgent,
              sessionId,
              summary,
              caseId: sessionScope.caseId,
            });
          }
        }
      }
    },
  });
}

async function resolveLocalModelName(baseURL: string, apiKey: string) {
  try {
    const response = await fetch(`${baseURL.replace(/\/+$/, "")}/models`, {
      headers: apiKey ? { Authorization: `Bearer ${apiKey}` } : undefined,
    });
    if (!response.ok) return "local-model";

    const data = await response.json();
    const candidates = data?.data
      ?.map((model: { id?: unknown }) => model.id)
      .filter((id: unknown): id is string => typeof id === "string" && id.trim() !== "")
      .filter((id: string) => !isEmbeddingModelId(id));

    for (const candidate of candidates ?? []) {
      if (await probeLocalChatModel(baseURL, apiKey, candidate)) {
        return candidate;
      }
    }

    return candidates?.[0] ?? "local-model";
  } catch {
    return "local-model";
  }
}

function isEmbeddingModelId(modelId: string) {
  const normalized = modelId.toLowerCase();
  return normalized.includes("embed") || normalized.includes("embedding");
}

async function probeLocalChatModel(baseURL: string, apiKey: string, modelName: string) {
  try {
    const response = await fetch(`${baseURL.replace(/\/+$/, "")}/chat/completions`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        ...(apiKey ? { Authorization: `Bearer ${apiKey}` } : {}),
      },
      body: JSON.stringify({
        model: modelName,
        messages: [{ role: "user", content: "Reply with OK." }],
        max_tokens: 64,
        stream: false,
      }),
      signal: AbortSignal.timeout(5000),
    });

    if (!response.ok) return false;
    const data = await response.json();
    const message = data?.choices?.[0]?.message;
    return Boolean(message?.content || message?.reasoning_content);
  } catch {
    return false;
  }
}

function serializeMessage(message: UIMessage) {
  const hasNonText = message.parts?.some(p => p.type !== "text");
  if (hasNonText) {
    return JSON.stringify(message.parts);
  }
  return message.parts
    .filter((part) => part.type === "text")
    .map((part) => (part as any).text)
    .join("");
}

function getSessionScope(sessionId: string, attachedCaseId: string | null) {
  if (sessionId.startsWith("case-")) {
    return {
      caseId: sessionId.replace("case-", ""),
      title: "Case Intelligence",
    };
  }

  return {
    caseId: attachedCaseId,
    title: "Command Layer",
  };
}

async function persistChatMessages({
  sessionId,
  messages,
  caseId,
  title,
}: {
  sessionId: string;
  messages: UIMessage[];
  caseId: string | null;
  title: string;
}) {
  await prisma.chatSession.upsert({
    where: { id: sessionId },
    update: { title, caseId },
    create: { id: sessionId, title, caseId },
  });

  await prisma.chatMessage.deleteMany({
    where: { sessionId },
  });

  if (messages.length === 0) return;

  const now = Date.now();
  await prisma.chatMessage.createMany({
    data: messages.map((message, index) => ({
      role: message.role,
      content: serializeMessage(message),
      sessionId,
      createdAt: new Date(now + index),
    })),
  });
}

function getMessageText(message: UIMessage) {
  return message.parts
    ?.filter((part) => part.type === "text")
    .map((part) => (part as any).text)
    .join("")
    .trim() ?? "";
}

function getLatestUserText(messages: UIMessage[]) {
  const latestUserMessage = [...messages].reverse().find((message) => message.role === "user");
  return latestUserMessage ? getMessageText(latestUserMessage) : "";
}

function getSessionTitle(messages: UIMessage[], fallback: string) {
  const firstUserMessage = messages.find((message) => message.role === "user");
  const text = firstUserMessage ? getMessageText(firstUserMessage) : "";
  if (!text) return fallback;

  return text.length > 48 ? `${text.slice(0, 45).trim()}...` : text;
}

function summarizeMessages(messages: UIMessage[], activeAgent: AgentProfile) {
  const textMessages = messages
    .filter((message) => message.role === "user" || message.role === "assistant")
    .map((message) => `${message.role === "user" ? "User" : activeAgent.name}: ${getMessageText(message)}`)
    .filter((text) => text.length > 10);

  if (textMessages.length < 2) return "";

  const joined = textMessages.join(" ");
  return joined.length > 700 ? `${joined.slice(0, 697).trim()}...` : joined;
}

async function recordChatLedger({
  sessionId,
  kind,
  title,
  detail,
  payload,
}: {
  sessionId: string;
  kind: string;
  title: string;
  detail?: string;
  payload?: unknown;
}) {
  await prisma.chatLedgerEntry.create({
    data: {
      sessionId,
      kind,
      title,
      detail,
      payloadJson: payload ? JSON.stringify(payload) : undefined,
    },
  });
}

async function proposeMemoryReview({
  activeAgent,
  sessionId,
  summary,
  caseId,
}: {
  activeAgent: AgentProfile;
  sessionId: string;
  summary: string;
  caseId: string | null;
}) {
  const existing = await prisma.agentAction.findFirst({
    where: {
      kind: "save_memory",
      sourceType: "chat",
      sourceRef: sessionId,
      status: { in: ["pending", "approved", "executed"] },
    },
    select: { id: true },
  });

  if (existing) return;

  const action = await prisma.agentAction.create({
    data: {
      title: `Review memory from chat`,
      description: `${activeAgent.name} found a possible durable memory. Approve before saving to Memory.`,
      kind: "save_memory",
      sourceType: "chat",
      sourceRef: sessionId,
      createdBy: activeAgent.id,
      payloadJson: JSON.stringify({
        content: `${activeAgent.name} memory (${activeAgent.summaryFocus}): ${summary}`,
        type: activeAgent.memoryType,
        caseId,
        sourceChatSessionId: sessionId,
      }),
    },
  });

  await recordChatLedger({
    sessionId,
    kind: "memory_review_proposed",
    title: "Memory review proposed",
    detail: "A durable memory candidate was staged in Agency Queue for approval.",
    payload: { actionId: action.id, agent: activeAgent.id },
  });
}
