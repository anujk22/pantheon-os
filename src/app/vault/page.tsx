import React from "react";
import { prisma } from "@/lib/prisma";
import VaultClient from "./VaultClient";

export const dynamic = "force-dynamic";

export default async function VaultPage() {
  const memories = await prisma.memory.findMany({
    orderBy: { createdAt: "desc" },
  });

  return <VaultClient memories={memories} />;
}
