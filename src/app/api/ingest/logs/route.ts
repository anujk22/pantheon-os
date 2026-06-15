import { NextResponse } from "next/server";
import { ChromaClient } from "chromadb";

const chroma = new ChromaClient({ path: "http://localhost:8000" });

type LogEntry = {
  id: string | number;
  content: string;
  timestamp?: string | number;
};

export async function POST(req: Request) {
  try {
    const data: unknown = await req.json();
    
    if (!isLogPayload(data)) {
      return NextResponse.json({ error: "Invalid log format" }, { status: 400 });
    }

    const collection = await chroma.getOrCreateCollection({ name: "chat_logs" });
    
    const ids = data.logs.map((log) => String(log.id));
    const documents = data.logs.map((log) => log.content);
    const metadatas = data.logs.map((log) => ({ timestamp: log.timestamp ?? "" }));
    
    await collection.add({ ids, documents, metadatas });
    
    return NextResponse.json({ success: true, count: data.logs.length });
  } catch (error) {
    console.error("Ingest error:", error);
    return NextResponse.json({ error: "Failed to ingest logs" }, { status: 500 });
  }
}

function isLogPayload(data: unknown): data is { logs: LogEntry[] } {
  if (!data || typeof data !== "object" || !("logs" in data)) return false;
  const { logs } = data as { logs: unknown };
  return Array.isArray(logs) && logs.every(isLogEntry);
}

function isLogEntry(log: unknown): log is LogEntry {
  if (!log || typeof log !== "object") return false;
  const entry = log as Partial<LogEntry>;
  const hasId = typeof entry.id === "string" || typeof entry.id === "number";
  return hasId && typeof entry.content === "string";
}
