"use server";

import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";

export async function createMemory(data: { content: string; memoryType?: string; sourceType?: string }) {
  await prisma.memory.create({
    data: {
      content: data.content,
      memoryType: data.memoryType || "fact",
      sourceType: data.sourceType || "manual",
    },
  });
  revalidatePath("/vault");
}

export async function deleteMemory(id: string) {
  await prisma.memory.delete({
    where: { id },
  });
  revalidatePath("/vault");
}
