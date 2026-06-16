/* eslint-disable */
import { prisma } from "@/lib/prisma";
import { createOpenAI } from "@ai-sdk/openai";
import { convertToModelMessages, streamText, type UIMessage } from "ai";

// Allow streaming responses up to 30 seconds
export const maxDuration = 30;

export async function POST(req: Request) {
  const { messages: rawMessages, id }: { messages: UIMessage[]; id?: string } = await req.json();
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
    if (modelName === "local-model") modelName = process.env.LOCAL_LLM_MODEL || "local-model";
  }

  const customProvider = createOpenAI({
    baseURL,
    apiKey,
  });

  const model = customProvider.chat(modelName);

  // Fetch memory facts
  const memories = await prisma.memory.findMany({
    where: sessionId.startsWith("case-") ? {
      OR: [
        { caseId: null },
        { caseId: sessionId.replace("case-", "") }
      ]
    } : { caseId: null },
    orderBy: { createdAt: "desc" },
    take: 50
  });

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

  const baseSystemPrompt = `You are Athena, the primary AI assistant inside Pantheon OS. Be concise, useful, and honest. ${styleInstruction} Avoid giant unsolicited plans. Prefer a short answer, then ask whether the user wants deeper execution. Render clean Markdown when useful. Do not claim calendars, cases, files, tools, automations, integrations, or memory are connected unless the user provides that data in the conversation. If a capability is not available in the current chat context, say that it is not connected yet and offer the next concrete step.`;
  const userContext = `The user's name is ${user.name || "the user"}. Always refer to them respectfully.`;
  
  const memoryContext = memories.length > 0 
    ? `\n\nSYSTEM MEMORY (FACTS):\nThe following facts are stored in the user's Vault memory. You may reference them if relevant:\n${memories.map(m => `- ${m.content}`).join("\n")}` 
    : "";

  const conversationContext = recentSummaries.length > 0
    ? `\n\nRECENT CONVERSATION SUMMARIES:\n${recentSummaries.map(s => `- ${s.title}: ${s.summary}`).join("\n")}`
    : "";

  const customPrompt = user.systemPrompt && user.systemPrompt.trim() !== "" ? `\n\nUSER CUSTOM INSTRUCTIONS:\n${user.systemPrompt}` : "";

  const finalSystemPrompt = `${baseSystemPrompt}\n${userContext}${memoryContext}${conversationContext}${customPrompt}`;

  const result = await streamText({
    model,
    system: finalSystemPrompt,
    messages: await convertToModelMessages(messages),
  });

  return result.toUIMessageStreamResponse({
    originalMessages: messages,
    onError: (error) =>
      error instanceof Error
        ? `Athena could not reach the configured model: ${error.message}`
        : "Athena could not reach the configured model.",
    onFinish: async ({ messages }) => {
      let caseId: string | null = null;
      let sessionTitle = "Command Layer";
      
      if (sessionId.startsWith("case-")) {
        caseId = sessionId.replace("case-", "");
        sessionTitle = "Case Intelligence";
      }

      await prisma.chatSession.upsert({
        where: { id: sessionId },
        update: { title: getSessionTitle(messages, sessionTitle), caseId },
        create: { id: sessionId, title: sessionTitle, caseId },
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

      if (user.memoryMode !== "off") {
        const summary = summarizeMessages(messages);
        if (summary) {
          await prisma.chatSession.update({
            where: { id: sessionId },
            data: {
              title: getSessionTitle(messages, sessionTitle),
              summary,
              isSummarized: true,
            },
          });

          if (user.memoryMode === "summaries") {
            await prisma.memory.deleteMany({
              where: { sourceType: "chat_summary", sourceRef: sessionId },
            });
            await prisma.memory.create({
              data: {
                content: summary,
                memoryType: "conversation_summary",
                sourceType: "chat_summary",
                sourceRef: sessionId,
                confidence: 0.7,
                caseId,
              },
            });
          }
        }
      }
    },
  });
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

function getMessageText(message: UIMessage) {
  return message.parts
    ?.filter((part) => part.type === "text")
    .map((part) => (part as any).text)
    .join("")
    .trim() ?? "";
}

function getSessionTitle(messages: UIMessage[], fallback: string) {
  const firstUserMessage = messages.find((message) => message.role === "user");
  const text = firstUserMessage ? getMessageText(firstUserMessage) : "";
  if (!text) return fallback;

  return text.length > 48 ? `${text.slice(0, 45).trim()}...` : text;
}

function summarizeMessages(messages: UIMessage[]) {
  const textMessages = messages
    .filter((message) => message.role === "user" || message.role === "assistant")
    .map((message) => `${message.role === "user" ? "User" : "Athena"}: ${getMessageText(message)}`)
    .filter((text) => text.length > 10);

  if (textMessages.length < 2) return "";

  const joined = textMessages.join(" ");
  return joined.length > 700 ? `${joined.slice(0, 697).trim()}...` : joined;
}
