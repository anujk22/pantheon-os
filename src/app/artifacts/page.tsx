import React from "react";
import { prisma } from "@/lib/prisma";
import ArtifactsClient from "./ArtifactsClient";

export const dynamic = "force-dynamic";

export default async function ArtifactsPage() {
  const artifacts = await prisma.artifact.findMany({
    orderBy: { createdAt: "desc" },
  });

  return <ArtifactsClient artifacts={artifacts} />;
}
