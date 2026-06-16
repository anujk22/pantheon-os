import { prisma } from "@/lib/prisma";

export async function createCaseRecord(data: {
  title: string;
  description?: string | null;
}) {
  const title = data.title.trim();
  const description = data.description?.trim() || null;

  if (title.length < 2) {
    return { message: "Add a case title with at least 2 characters." };
  }

  const caseItem = await prisma.case.create({
    data: {
      title,
      description,
      status: "active",
    },
    select: { id: true },
  });

  return { caseId: caseItem.id };
}
