"use client";

import React, { useMemo } from "react";
import ForceGraph3D from "react-force-graph-3d";
import { Brain } from "lucide-react";

export type KnowledgeGraphMemory = {
  id: string;
  content: string;
  memoryType: string;
  caseTitle: string | null;
};

export default function KnowledgeGraph({
  memories,
}: {
  memories: KnowledgeGraphMemory[];
}) {
  const graphData = useMemo(() => {
    const nodes = memories.map((memory) => ({
      id: memory.id,
      label: memory.content.slice(0, 80),
      group: memory.memoryType,
      val: 6,
      color: memory.caseTitle ? "#34543f" : "#ae9064",
    }));

    const links = memories
      .filter((memory) => memory.caseTitle)
      .map((memory) => ({
        source: memory.id,
        target: `case:${memory.caseTitle}`,
      }));

    const caseNodes = Array.from(
      new Set(memories.map((memory) => memory.caseTitle).filter(Boolean))
    ).map((caseTitle) => ({
      id: `case:${caseTitle}`,
      label: String(caseTitle),
      group: "case",
      val: 10,
      color: "#20382b",
    }));

    return { nodes: [...caseNodes, ...nodes], links };
  }, [memories]);

  if (memories.length === 0) {
    return (
      <div className="stone-card flex h-full items-center justify-center p-8 text-center">
        <div className="max-w-md">
          <Brain className="mx-auto mb-4 h-10 w-10 text-[var(--accent-green)]" />
          <h2 className="font-serif text-2xl text-[var(--text-primary)]">
            No memories saved
          </h2>
          <p className="mt-2 text-sm leading-relaxed text-[var(--text-muted)]">
            The graph will render only after real memories are saved from Inbox
            triage or another memory workflow.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="h-full w-full overflow-hidden rounded-2xl border border-[var(--border-stone)] bg-[var(--bg-marble)] shadow-inner">
      <ForceGraph3D
        graphData={graphData}
        backgroundColor="#fbf8f1"
        nodeLabel="label"
        nodeColor="color"
        linkColor={() => "rgba(52, 84, 63, 0.25)"}
        linkWidth={1}
      />
    </div>
  );
}
