"use server";

import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";

export async function createArtifact(data: { title: string; type: string; content: string }) {
  await prisma.artifact.create({
    data: {
      title: data.title,
      type: data.type,
      content: data.content,
    },
  });
  revalidatePath("/artifacts");
}

export async function deleteArtifact(id: string) {
  await prisma.artifact.delete({
    where: { id },
  });
  revalidatePath("/artifacts");
}
