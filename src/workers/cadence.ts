import { prisma } from "../lib/prisma";
import axios from "axios";

async function runDreamCadence() {
  console.log("Starting Dream Cadence...");
  
  // 1. Fetch Prisma Data for tomorrow
  const tomorrow = new Date();
  tomorrow.setDate(tomorrow.getDate() + 1);
  const endOfTomorrow = new Date(tomorrow);
  endOfTomorrow.setHours(23, 59, 59, 999);

  const tasks = await prisma.task.findMany({
    where: {
      dueDate: {
        gte: new Date(),
        lte: endOfTomorrow,
      },
    },
  });

  const events = await prisma.event.findMany({
    where: {
      date: {
        gte: new Date(),
        lte: endOfTomorrow,
      },
    },
  });

  // 2. Fetch Vector DB Data (simulate recent 24h context retrieval)
  const recentMessages = await prisma.chatMessage.findMany({
    where: {
      createdAt: {
        gte: new Date(Date.now() - 24 * 60 * 60 * 1000), // Last 24 hours
      },
    },
  });

  // 3. Construct prompt
  const prompt = `
    You are the central intelligence of Project Pantheon.
    Here are the tasks due by tomorrow: ${JSON.stringify(tasks)}
    Here are the events by tomorrow: ${JSON.stringify(events)}
    Here is the recent context from the last 24 hours: ${JSON.stringify(recentMessages.slice(-20))}
    
    Synthesize this into a cohesive, encouraging 3-paragraph "Morning Briefing" for the user.
  `;

  try {
    // 4. Fetch the user's configuration
    const user = await prisma.user.findFirst({
      where: { email: "local-admin@pantheon.local" },
    });

    let baseURL = "http://localhost:8080/v1";
    let apiKey = "";
    let modelName = "local-model";

    if (user) {
      const userBaseURL = user.llmBaseUrl ? user.llmBaseUrl.trim() : "";
      const userApiKey = user.llmApiKey ? user.llmApiKey.trim() : "";

      if (user.llmProvider === "openai") {
        baseURL = (!userBaseURL || userBaseURL.includes("127.0.0.1") || userBaseURL.includes("localhost"))
          ? "https://api.openai.com/v1"
          : userBaseURL;
        apiKey = userApiKey || process.env.OPENAI_API_KEY || "";
        modelName = process.env.OPENAI_MODEL || "gpt-4o-mini";
      } else if (user.llmProvider === "gemini") {
        baseURL = (!userBaseURL || userBaseURL.includes("127.0.0.1") || userBaseURL.includes("localhost"))
          ? "https://generativelanguage.googleapis.com/v1beta/openai"
          : userBaseURL;
        apiKey = userApiKey || process.env.GEMINI_API_KEY || "";
        modelName = process.env.GEMINI_MODEL || "gemini-1.5-flash";
      } else {
        baseURL = userBaseURL || "http://127.0.0.1:1234/v1";
        baseURL = baseURL.replace(/\/+$/, "");
        if (!baseURL.endsWith("/v1")) {
          baseURL = `${baseURL}/v1`;
        }
        apiKey = userApiKey || "lm-studio";
        modelName = process.env.LOCAL_LLM_MODEL || await resolveLocalModelName(baseURL, apiKey);
      }
    }

    // Call LLM
    const response = await axios.post(
      `${baseURL}/chat/completions`,
      {
        model: modelName,
        messages: [{ role: "system", content: prompt }],
        temperature: 0.7
      },
      {
        headers: apiKey ? { Authorization: `Bearer ${apiKey}` } : {}
      }
    );

    const message = response.data?.choices?.[0]?.message;
    const content = message?.content || message?.reasoning_content;

    if (!content) {
      throw new Error("LLM returned no briefing content.");
    }

    // 5. Save to MorningBriefing
    // We use an upsert to avoid Unique constraint failure on 'date' if run multiple times
    const startOfToday = new Date();
    startOfToday.setHours(0, 0, 0, 0);

    await prisma.morningBriefing.upsert({
      where: { date: startOfToday },
      update: { content },
      create: {
        date: startOfToday,
        content,
      }
    });
    
    console.log("Dream Cadence completed successfully.");
  } catch (error) {
    console.error("Dream Cadence failed to contact local LLM or save:", error);
  }
}

runDreamCadence()
  .catch(console.error)
  .finally(() => prisma.$disconnect());

async function resolveLocalModelName(baseURL: string, apiKey: string) {
  try {
    const response = await axios.get(`${baseURL.replace(/\/+$/, "")}/models`, {
      headers: apiKey ? { Authorization: `Bearer ${apiKey}` } : undefined,
      timeout: 5000,
    });
    const candidates = response.data?.data
      ?.map((model: { id?: unknown }) => model.id)
      .filter((id: unknown): id is string => typeof id === "string" && id.trim() !== "")
      .filter((id: string) => !id.toLowerCase().includes("embed"));

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

async function probeLocalChatModel(baseURL: string, apiKey: string, modelName: string) {
  try {
    const response = await axios.post(
      `${baseURL.replace(/\/+$/, "")}/chat/completions`,
      {
        model: modelName,
        messages: [{ role: "user", content: "Reply with OK." }],
        max_tokens: 64,
        stream: false,
      },
      {
        headers: apiKey ? { Authorization: `Bearer ${apiKey}` } : undefined,
        timeout: 5000,
      }
    );
    const message = response.data?.choices?.[0]?.message;
    return Boolean(message?.content || message?.reasoning_content);
  } catch {
    return false;
  }
}
