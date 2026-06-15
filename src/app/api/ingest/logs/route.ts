import { NextResponse } from "next/server";
import { ChromaClient } from "chromadb";

const chroma = new ChromaClient({ path: "http://localhost:8000" });

export async function POST(req: Request) {
  try {
    const data = await req.json();
    const { logs } = data; // Array of { id, content, timestamp }
    
    if (!logs || !Array.isArray(logs)) {
      return NextResponse.json({ error: "Invalid log format" }, { status: 400 });
    }

    const collection = await chroma.getOrCreateCollection({ name: "chat_logs" });
    
    const ids = logs.map((l: any) => String(l.id));
    const documents = logs.map((l: any) => l.content);
    const metadatas = logs.map((l: any) => ({ timestamp: l.timestamp }));
    
    await collection.add({ ids, documents, metadatas });
    
    return NextResponse.json({ success: true, count: logs.length });
  } catch (error) {
    console.error("Ingest error:", error);
    return NextResponse.json({ error: "Failed to ingest logs" }, { status: 500 });
  }
}
