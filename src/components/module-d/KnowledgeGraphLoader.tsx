"use client";

import dynamic from "next/dynamic";
import type { KnowledgeGraphMemory } from "./KnowledgeGraph";

const KnowledgeGraph = dynamic(() => import("./KnowledgeGraph"), {
  ssr: false,
  loading: () => (
    <div className="stone-card flex h-full items-center justify-center text-[var(--accent-green)]">
      Loading memory graph...
    </div>
  ),
});

export function KnowledgeGraphLoader({
  memories,
}: {
  memories: KnowledgeGraphMemory[];
}) {
  return <KnowledgeGraph memories={memories} />;
}
