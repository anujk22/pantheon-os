import React from "react";
import { prisma } from "@/lib/prisma";
import SettingsForm from "./SettingsForm";

export const dynamic = "force-dynamic";

export default async function SettingsPage() {
  const user = await prisma.user.findFirst({
    where: { email: "local-admin@pantheon.local" },
  });

  return <SettingsForm initialData={user} />;
}
