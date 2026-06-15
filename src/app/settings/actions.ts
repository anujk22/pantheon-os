"use server";

import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";

export async function resetOnboarding() {
  const cookieStore = await cookies();
  cookieStore.delete("pantheon_onboarded");
  redirect("/onboarding");
}

export async function updateSettings(data: {
  name: string;
  image?: string;
  systemPrompt?: string;
  llmProvider: string;
  llmBaseUrl: string;
  llmApiKey: string;
  llmModel?: string;
}) {
  await prisma.user.upsert({
    where: { email: "local-admin@pantheon.local" },
    update: {
      name: data.name,
      image: data.image,
      systemPrompt: data.systemPrompt,
      llmProvider: data.llmProvider,
      llmBaseUrl: data.llmBaseUrl,
      llmApiKey: data.llmApiKey,
      llmModel: data.llmModel,
    },
    create: {
      email: "local-admin@pantheon.local",
      name: data.name,
      image: data.image,
      systemPrompt: data.systemPrompt,
      llmProvider: data.llmProvider,
      llmBaseUrl: data.llmBaseUrl,
      llmApiKey: data.llmApiKey,
      llmModel: data.llmModel,
    },
  });
}
