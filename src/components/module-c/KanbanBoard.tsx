"use client";

import React, { useState, useEffect } from "react";
import { DragDropContext, Droppable, Draggable, DropResult } from "@hello-pangea/dnd";
import { GripVertical, Plus } from "lucide-react";

type Task = { id: string; content: string };
type Columns = {
  [key: string]: {
    name: string;
    items: Task[];
  };
};

const initialColumns: Columns = {
  todo: { name: "To Do", items: [{ id: "t1", content: "Design architecture" }, { id: "t2", content: "Set up Prisma" }] },
  inProgress: { name: "In Progress", items: [{ id: "t3", content: "Scaffold Next.js" }] },
  done: { name: "Done", items: [] },
};

export function KanbanBoard({ caseId }: { caseId: string }) {
  const [columns, setColumns] = useState<Columns>(initialColumns);
  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    const frame = requestAnimationFrame(() => setIsMounted(true));
    return () => cancelAnimationFrame(frame);
  }, []);

  const onDragEnd = (result: DropResult) => {
    if (!result.destination) return;
    const { source, destination } = result;

    if (source.droppableId !== destination.droppableId) {
      const sourceColumn = columns[source.droppableId];
      const destColumn = columns[destination.droppableId];
      const sourceItems = [...sourceColumn.items];
      const destItems = [...destColumn.items];
      const [removed] = sourceItems.splice(source.index, 1);
      destItems.splice(destination.index, 0, removed);
      setColumns({
        ...columns,
        [source.droppableId]: { ...sourceColumn, items: sourceItems },
        [destination.droppableId]: { ...destColumn, items: destItems },
      });
      // In production, sync to /api/cases/[caseId]/tasks
    } else {
      const column = columns[source.droppableId];
      const copiedItems = [...column.items];
      const [removed] = copiedItems.splice(source.index, 1);
      copiedItems.splice(destination.index, 0, removed);
      setColumns({
        ...columns,
        [source.droppableId]: { ...column, items: copiedItems },
      });
    }
  };

  if (!isMounted) return null;

  return (
    <div data-case-id={caseId} className="h-full w-full bg-pantheon-onyx/50 rounded-xl p-4 overflow-x-auto flex space-x-4 custom-scrollbar">
      <DragDropContext onDragEnd={onDragEnd}>
        {Object.entries(columns).map(([columnId, column]) => {
          return (
            <div key={columnId} className="flex flex-col min-w-[280px]">
              <div className="flex items-center justify-between mb-4">
                <h2 className="font-serif font-semibold text-pantheon-marble">{column.name}</h2>
                <button className="text-pantheon-marble-muted hover:text-pantheon-emerald-400">
                  <Plus className="w-4 h-4" />
                </button>
              </div>
              
              <Droppable droppableId={columnId}>
                {(provided, snapshot) => (
                  <div
                    {...provided.droppableProps}
                    ref={provided.innerRef}
                    className={`flex-1 p-2 rounded-lg transition-colors ${
                      snapshot.isDraggingOver ? "bg-pantheon-emerald-900/20" : "bg-pantheon-obsidian/40"
                    }`}
                  >
                    {column.items.map((item, index) => (
                      <Draggable key={item.id} draggableId={item.id} index={index}>
                        {(provided, snapshot) => (
                          <div
                            ref={provided.innerRef}
                            {...provided.draggableProps}
                            className={`mb-3 p-3 rounded-md bg-pantheon-onyx-light border flex items-start gap-2 shadow-sm ${
                              snapshot.isDragging ? "border-pantheon-emerald-500 shadow-pantheon-emerald-500/20" : "border-pantheon-emerald-900/50 hover:border-pantheon-emerald-800"
                            }`}
                          >
                            <div {...provided.dragHandleProps} className="text-pantheon-marble-muted hover:text-pantheon-marble mt-0.5">
                              <GripVertical className="w-4 h-4" />
                            </div>
                            <p className="text-sm text-pantheon-marble flex-1">{item.content}</p>
                          </div>
                        )}
                      </Draggable>
                    ))}
                    {provided.placeholder}
                  </div>
                )}
              </Droppable>
            </div>
          );
        })}
      </DragDropContext>
    </div>
  );
}
