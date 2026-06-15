"use server";

import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";

export async function createCase(data: { title: string; description?: string }) {
  await prisma.case.create({
    data: {
      title: data.title,
      description: data.description,
      status: "active",
    },
  });
  revalidatePath("/cases");
}
