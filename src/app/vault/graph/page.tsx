"use client";

import React from "react";
import dynamic from "next/dynamic";

const KnowledgeGraph = dynamic(
  () => import("@/components/module-d/KnowledgeGraph"),
  { ssr: false, loading: () => <div className="w-full h-full flex items-center justify-center bg-pantheon-bg text-pantheon-emerald-main">Rendering Constellations...</div> }
);

export default function VaultGraphPage() {
  return (
    <div className="h-full w-full p-8 flex flex-col">
      <header className="mb-6">
        <h1 className="font-serif text-3xl font-bold text-pantheon-text-primary">The Aether Graph</h1>
        <p className="text-sm text-pantheon-text-secondary mt-2">A 3D visualization of your localized Vector Database memories.</p>
      </header>
      
      <div className="flex-1 relative">
        <KnowledgeGraph />
      </div>
    </div>
  );
}
