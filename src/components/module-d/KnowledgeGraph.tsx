"use client";

import React, { useMemo } from 'react';
import ForceGraph3D from 'react-force-graph-3d';

export default function KnowledgeGraph() {
  const gData = useMemo(() => {
    // Generate some mock knowledge graph data for Pantheon Memory
    const nodes = [
      { id: 'Agentic OS', group: 1, val: 20, color: '#2A4D3E' },
      { id: 'Prisma DB', group: 2, val: 10, color: '#4A7A60' },
      { id: 'Next.js', group: 2, val: 10, color: '#4A7A60' },
      { id: 'Electron', group: 2, val: 10, color: '#4A7A60' },
      { id: 'Athena', group: 3, val: 15, color: '#C5A059' },
      { id: 'Apollo', group: 3, val: 15, color: '#C5A059' },
      { id: 'Zeus', group: 3, val: 25, color: '#1F2924' },
      { id: 'Memory 12', group: 4, val: 5, color: '#D8D8D0' },
      { id: 'Memory 14', group: 4, val: 5, color: '#D8D8D0' },
    ];

    const links = [
      { source: 'Agentic OS', target: 'Prisma DB' },
      { source: 'Agentic OS', target: 'Next.js' },
      { source: 'Agentic OS', target: 'Electron' },
      { source: 'Agentic OS', target: 'Zeus' },
      { source: 'Athena', target: 'Agentic OS' },
      { source: 'Apollo', target: 'Agentic OS' },
      { source: 'Memory 12', target: 'Athena' },
      { source: 'Memory 14', target: 'Apollo' },
    ];

    return { nodes, links };
  }, []);

  return (
    <div className="w-full h-full rounded-2xl overflow-hidden border border-pantheon-border shadow-inner bg-pantheon-bg relative">
      <div className="absolute top-4 left-4 z-10 bg-pantheon-surface/80 backdrop-blur px-4 py-2 rounded-lg border border-pantheon-border shadow-sm">
        <h3 className="font-serif font-bold text-pantheon-text-primary text-sm">Neural Constellation</h3>
        <p className="text-[10px] text-pantheon-text-secondary uppercase tracking-widest">3D Vector Memory Graph</p>
      </div>
      
      <ForceGraph3D
        graphData={gData}
        backgroundColor="#F4F4F0"
        nodeLabel="id"
        nodeColor="color"
        linkColor={() => 'rgba(42, 77, 62, 0.2)'}
        linkWidth={1}
      />
    </div>
  );
}
