"use server";

import { cookies } from "next/headers";
import { redirect } from "next/navigation";

export async function resetOnboarding() {
  const cookieStore = await cookies();
  cookieStore.delete("pantheon_onboarded");
  redirect("/onboarding");
}
