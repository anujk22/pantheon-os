import React from "react";
import { prisma } from "@/lib/prisma";
import type { KnowledgeGraphMemory } from "@/components/module-d/KnowledgeGraph";
import { KnowledgeGraphLoader } from "@/components/module-d/KnowledgeGraphLoader";

export const dynamic = "force-dynamic";

export default async function VaultGraphPage() {
  const memories = await prisma.memory.findMany({
    include: { case: true },
    orderBy: { updatedAt: "desc" },
    take: 200,
  });

  const graphMemories: KnowledgeGraphMemory[] = memories.map((memory) => ({
    id: memory.id,
    content: memory.content,
    memoryType: memory.memoryType,
    caseTitle: memory.case?.title ?? null,
  }));

  return (
    <div className="stone-panel architectural-corners flex h-full w-full flex-col overflow-hidden p-6">
      <header className="relative z-10 mb-6">
        <h1 className="font-serif text-3xl font-semibold tracking-[0.08em] text-[var(--text-primary)]">
          MEMORY GRAPH
        </h1>
        <p className="mt-2 text-sm text-[var(--text-muted)]">
          A visualization of saved local memories. Only persisted memory records are rendered.
        </p>
      </header>

      <div className="relative z-10 min-h-0 flex-1">
        <KnowledgeGraphLoader memories={graphMemories} />
      </div>
    </div>
  );
}
