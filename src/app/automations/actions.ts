"use server";

import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/prisma";

export async function createEvent(formData: FormData) {
  const title = String(formData.get("title") ?? "").trim();
  const description = String(formData.get("description") ?? "").trim();
  const dateValue = String(formData.get("date") ?? "");

  if (!title || !dateValue) return;

  await prisma.event.create({
    data: {
      title,
      description: description || null,
      date: new Date(dateValue),
      source: "manual",
    },
  });

  revalidateCadence();
}

export async function deleteEvent(formData: FormData) {
  const id = String(formData.get("id") ?? "");
  if (!id) return;

  await prisma.event.delete({ where: { id } });
  revalidateCadence();
}

export async function importIcsCalendar(formData: FormData) {
  const url = String(formData.get("icsUrl") ?? "").trim();
  if (!url) return;

  const response = await fetch(url, { cache: "no-store" });
  if (!response.ok) {
    throw new Error(`ICS import failed: ${response.status}`);
  }

  const text = await response.text();
  const events = parseIcsEvents(text);

  for (const event of events) {
    const existing = event.externalId
      ? await prisma.event.findFirst({
          where: { externalId: event.externalId, source: "ics" },
          select: { id: true },
        })
      : null;

    if (existing) {
      await prisma.event.update({
        where: { id: existing.id },
        data: {
          title: event.title,
          description: event.description,
          date: event.date,
        },
      });
    } else {
      await prisma.event.create({
        data: {
          title: event.title,
          description: event.description,
          date: event.date,
          source: "ics",
          externalId: event.externalId,
        },
      });
    }
  }

  revalidateCadence();
}

export async function generateMorningBrief() {
  const user = await prisma.user.findFirst({
    where: { email: "local-admin@pantheon.local" },
  });

  if (!user) return;

  const now = new Date();
  const tomorrow = new Date(now);
  tomorrow.setDate(tomorrow.getDate() + 1);
  tomorrow.setHours(23, 59, 59, 999);

  const nextWeek = new Date(now);
  nextWeek.setDate(nextWeek.getDate() + 7);

  const [tasks, events, inboxItems, cases, memories] = await Promise.all([
    prisma.task.findMany({
      where: {
        OR: [
          { status: { not: "done" } },
          { dueDate: { gte: now, lte: nextWeek } },
        ],
      },
      orderBy: [{ dueDate: "asc" }, { updatedAt: "desc" }],
      take: 12,
    }),
    prisma.event.findMany({
      where: { date: { gte: now, lte: tomorrow } },
      orderBy: { date: "asc" },
      take: 12,
    }),
    prisma.inboxItem.findMany({
      where: { status: "untriaged" },
      orderBy: { createdAt: "desc" },
      take: 8,
    }),
    prisma.case.findMany({
      where: { status: "active" },
      orderBy: { updatedAt: "desc" },
      take: 6,
    }),
    prisma.memory.findMany({
      orderBy: { updatedAt: "desc" },
      take: 10,
    }),
  ]);

  const prompt = `You are Athena preparing a local Morning Brief for ${user.name || "the user"}.

Use only the local records below. Do not invent calendar events, deadlines, integrations, or agent activity.

Tasks:
${JSON.stringify(tasks)}

Events through tomorrow:
${JSON.stringify(events)}

Untriaged inbox:
${JSON.stringify(inboxItems)}

Active cases:
${JSON.stringify(cases)}

Recent memory:
${JSON.stringify(memories)}

Write a concise brief with:
1. Today focus
2. Schedule and deadlines
3. Open loops worth triaging
4. One suggested next action`;

  const { baseURL, apiKey, modelName } = await resolveModel(user);

  const response = await fetch(`${baseURL}/chat/completions`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      ...(apiKey ? { Authorization: `Bearer ${apiKey}` } : {}),
    },
    body: JSON.stringify({
      model: modelName,
      messages: [{ role: "user", content: prompt }],
      temperature: 0.4,
      max_tokens: 900,
    }),
    signal: AbortSignal.timeout(60000),
  });

  if (!response.ok) {
    throw new Error(`Morning Brief failed: ${response.status}`);
  }

  const data = await response.json();
  const message = data?.choices?.[0]?.message;
  const content = message?.content || message?.reasoning_content;

  if (!content) {
    throw new Error("Morning Brief failed: the model returned no content.");
  }

  const startOfToday = new Date();
  startOfToday.setHours(0, 0, 0, 0);

  await prisma.morningBriefing.upsert({
    where: { date: startOfToday },
    update: { content },
    create: { date: startOfToday, content },
  });

  const sourceRef = startOfToday.toISOString();
  const existingAction = await prisma.agentAction.findFirst({
    where: {
      kind: "save_memory",
      sourceType: "cadence",
      sourceRef,
    },
    select: { id: true },
  });

  const actionData = {
      title: "Review Morning Brief",
      description: "Athena generated a local Morning Brief from current tasks, events, inbox, cases, and memory.",
      kind: "save_memory",
      sourceType: "cadence",
      sourceRef,
      payloadJson: JSON.stringify({
        content,
        type: "briefing",
      }),
      createdBy: "athena",
  };

  if (existingAction) {
    await prisma.agentAction.update({
      where: { id: existingAction.id },
      data: actionData,
    });
  } else {
    await prisma.agentAction.create({ data: actionData });
  }

  revalidateCadence();
}

function parseIcsEvents(text: string) {
  const unfolded = text.replace(/\r?\n[ \t]/g, "");
  const blocks = unfolded.match(/BEGIN:VEVENT[\s\S]*?END:VEVENT/g) ?? [];
  const now = new Date();
  const horizon = new Date(now);
  horizon.setDate(horizon.getDate() + 60);

  return blocks
    .map((block) => {
      const title = readIcsField(block, "SUMMARY") || "Untitled calendar event";
      const description = readIcsField(block, "DESCRIPTION");
      const externalId = readIcsField(block, "UID") || undefined;
      const dateRaw = readIcsField(block, "DTSTART");
      const date = dateRaw ? parseIcsDate(dateRaw) : null;

      if (!date || date < now || date > horizon) return null;

      return {
        title,
        description,
        externalId,
        date,
      };
    })
    .filter((event): event is NonNullable<typeof event> => Boolean(event));
}

function readIcsField(block: string, field: string) {
  const line = block
    .split(/\r?\n/)
    .find((candidate) => candidate.startsWith(`${field}:`) || candidate.startsWith(`${field};`));
  if (!line) return null;

  const value = line.slice(line.indexOf(":") + 1);
  return value
    .replaceAll("\\n", "\n")
    .replaceAll("\\,", ",")
    .replaceAll("\\;", ";")
    .trim();
}

function parseIcsDate(value: string) {
  if (/^\d{8}$/.test(value)) {
    const year = Number(value.slice(0, 4));
    const month = Number(value.slice(4, 6)) - 1;
    const day = Number(value.slice(6, 8));
    return new Date(year, month, day, 9, 0, 0);
  }

  const match = value.match(/^(\d{4})(\d{2})(\d{2})T(\d{2})(\d{2})(\d{2})(Z?)$/);
  if (!match) return null;

  const [, year, month, day, hour, minute, second, zulu] = match;
  const parts = [
    Number(year),
    Number(month) - 1,
    Number(day),
    Number(hour),
    Number(minute),
    Number(second),
  ] as const;

  return zulu
    ? new Date(Date.UTC(...parts))
    : new Date(parts[0], parts[1], parts[2], parts[3], parts[4], parts[5]);
}

function revalidateCadence() {
  revalidatePath("/automations");
  revalidatePath("/integrations");
  revalidatePath("/agents");
}

async function resolveModel(user: {
  llmProvider: string | null;
  llmBaseUrl: string | null;
  llmApiKey: string | null;
  llmModel: string | null;
}) {
  let baseURL = user.llmBaseUrl?.trim() || "";
  let apiKey = user.llmApiKey?.trim() || "";
  let modelName = user.llmModel?.trim() || "local-model";

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
    baseURL = baseURL || "http://127.0.0.1:1234/v1";
    baseURL = baseURL.replace(/\/+$/, "");
    if (!baseURL.endsWith("/v1")) baseURL = `${baseURL}/v1`;
    if (!apiKey) apiKey = "lm-studio";
    if (modelName === "local-model") modelName = process.env.LOCAL_LLM_MODEL || await resolveLocalModelName(baseURL, apiKey);
  }

  return { baseURL, apiKey, modelName };
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
