"use server";

import { createCaseRecord } from "@/lib/cases";
import { revalidatePath } from "next/cache";

export type CreateCaseState = {
  caseId?: string;
  message?: string;
};

export async function createCase(
  _prevState: CreateCaseState,
  formData: FormData
): Promise<CreateCaseState> {
  const title = String(formData.get("title") ?? "").trim();
  const description = String(formData.get("description") ?? "").trim();

  const result = await createCaseRecord({ title, description });
  revalidatePath("/cases");
  return result;
}
