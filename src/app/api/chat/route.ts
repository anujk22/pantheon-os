import { prisma } from "@/lib/prisma";
import { createOpenAI } from "@ai-sdk/openai";
import { convertToModelMessages, streamText, type UIMessage } from "ai";

// Allow streaming responses up to 30 seconds
export const maxDuration = 30;

export async function POST(req: Request) {
  const { messages, id }: { messages: UIMessage[]; id?: string } = await req.json();
  const sessionId = id || "command-layer";

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

  const baseURL = normalizeOpenAIBaseUrl(user.llmBaseUrl);
  const apiKey = user.llmApiKey || "lm-studio";

  // Create a custom OpenAI provider instance using the user's config
  const customProvider = createOpenAI({
    baseURL,
    apiKey,
  });

  // Use a generic model name; most local providers like LM Studio ignore this 
  // or use the currently loaded model.
  const model = customProvider("local-model");

  const result = await streamText({
    model,
    system:
      "You are Athena, the primary AI assistant inside Pantheon OS. Be concise, useful, and honest. Do not claim calendars, cases, files, tools, automations, integrations, or memory are connected unless the user provides that data in the conversation. If a capability is not available in the current chat context, say that it is not connected yet and offer the next concrete step.",
    messages: await convertToModelMessages(messages),
  });

  return result.toUIMessageStreamResponse({
    originalMessages: messages,
    onError: (error) =>
      error instanceof Error
        ? `Athena could not reach the configured model: ${error.message}`
        : "Athena could not reach the configured model.",
    onFinish: async ({ messages }) => {
      await prisma.chatSession.upsert({
        where: { id: sessionId },
        update: { title: "Command Layer" },
        create: { id: sessionId, title: "Command Layer" },
      });

      await prisma.chatMessage.deleteMany({
        where: { sessionId },
      });

      if (messages.length === 0) return;

      const now = Date.now();
      await prisma.chatMessage.createMany({
        data: messages.map((message, index) => ({
          role: message.role,
          content: getMessageText(message),
          sessionId,
          createdAt: new Date(now + index),
        })),
      });
    },
  });
}

function normalizeOpenAIBaseUrl(baseUrl: string | null | undefined) {
  const trimmed = (baseUrl || "http://127.0.0.1:1234").trim().replace(/\/+$/, "");
  return trimmed.endsWith("/v1") ? trimmed : `${trimmed}/v1`;
}

function getMessageText(message: UIMessage) {
  return message.parts
    .filter((part) => part.type === "text")
    .map((part) => part.text)
    .join("");
}
