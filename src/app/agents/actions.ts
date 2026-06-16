"use server";

import { revalidatePath } from "next/cache";
import {
  executeAgentAction,
  proposeChatReviewActions,
  proposeInboxActions,
  rejectAgentAction,
} from "@/lib/agency";
import { prisma } from "@/lib/prisma";

export async function generateAgentActions() {
  await Promise.all([proposeInboxActions(), proposeChatReviewActions()]);
  revalidateAgencyPaths();
}

export async function executeAction(formData: FormData) {
  const id = String(formData.get("id") ?? "");
  if (!id) return;

  await executeAgentAction(id);
  revalidateAgencyPaths();
}

export async function rejectAction(formData: FormData) {
  const id = String(formData.get("id") ?? "");
  if (!id) return;

  await rejectAgentAction(id);
  revalidateAgencyPaths();
}

export async function executeAllPendingActions() {
  const pendingActions = await prisma.agentAction.findMany({
    where: {
      status: "pending",
      kind: {
        in: ["create_task", "save_artifact", "save_memory", "create_case", "archive_inbox"],
      },
    },
    orderBy: { createdAt: "asc" },
    select: { id: true },
  });

  for (const action of pendingActions) {
    await executeAgentAction(action.id);
  }

  revalidateAgencyPaths();
}

function revalidateAgencyPaths() {
  revalidatePath("/agents");
  revalidatePath("/inbox");
  revalidatePath("/cases");
  revalidatePath("/artifacts");
  revalidatePath("/vault");
}
