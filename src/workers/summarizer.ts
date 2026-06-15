import { PrismaClient } from "@prisma/client";
import { ChromaClient } from "chromadb";
import axios from "axios";

const prisma = new PrismaClient();
// Use the env var or default for chroma connection
const chroma = new ChromaClient({ path: process.env.CHROMA_URL || "http://localhost:8000" });

async function runMemoryCompression() {
  console.log("Initiating Memory Compression sequence...");

  // Find sessions that haven't been summarized and have at least 1 message
  // In a real scenario, you'd add a time condition (e.g. updatedAt < 1 hour ago)
  const sessionsToCompress = await prisma.chatSession.findMany({
    where: {
      isSummarized: false,
    },
    include: {
      messages: {
        orderBy: { createdAt: "asc" }
      }
    }
  });

  if (sessionsToCompress.length === 0) {
    console.log("No memory blocks require compression at this time.");
    return;
  }

  for (const session of sessionsToCompress) {
    if (session.messages.length === 0) continue;

    console.log(`Compressing session: ${session.id} (${session.messages.length} messages)`);

    // 1. Format raw dialogue
    const dialogue = session.messages.map(m => `${m.role.toUpperCase()}: ${m.content}`).join("\n");

    const prompt = `
      You are Pantheon's Memory Compression Engine.
      Compress the following raw conversation logs into a highly dense, factual summary. 
      Retain all technical decisions, tasks, URLs, and data points, but eliminate pleasantries and conversational filler.
      
      Raw Logs:
      ${dialogue}
      
      Dense Summary:
    `;

    try {
      // 2. Call local LLM for compression
      const llmUrl = process.env.LOCAL_LLM_URL || "http://localhost:8080/v1/chat/completions";
      const response = await axios.post(llmUrl, {
        model: "local-model",
        messages: [{ role: "system", content: prompt }],
        temperature: 0.3
      });

      const compressedText = response.data?.choices?.[0]?.message?.content;

      if (!compressedText) throw new Error("LLM returned empty compression");

      // 3. Embed the compressed summary into ChromaDB
      const collection = await chroma.getOrCreateCollection({ name: "pantheon_memories" });
      await collection.add({
        ids: [`summary_${session.id}`],
        documents: [compressedText],
        metadatas: [{ sessionId: session.id, timestamp: Date.now(), type: "compressed_summary" }]
      });

      // 4. Update Prisma (Mark as summarized and save summary text)
      await prisma.chatSession.update({
        where: { id: session.id },
        data: {
          isSummarized: true,
          summary: compressedText
        }
      });

      // 5. Delete raw logs to save local disk space (as requested for high optimization)
      await prisma.chatMessage.deleteMany({
        where: { sessionId: session.id }
      });

      console.log(`✅ Successfully compressed and embedded session ${session.id}. Raw logs purged.`);
    } catch (error) {
      console.error(`❌ Failed to compress session ${session.id}:`, error);
    }
  }
}

// Run the script
runMemoryCompression()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
