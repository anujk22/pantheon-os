import { prisma } from "../lib/prisma";
import { ChromaClient } from "chromadb";
import axios from "axios";

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
      // 2. Fetch the user's configuration
      const user = await prisma.user.findFirst({
        where: { email: "local-admin@pantheon.local" },
      });

      let baseURL = "http://localhost:8080/v1";
      let apiKey = "";
      let modelName = "local-model";

      if (user) {
        const userBaseURL = user.llmBaseUrl ? user.llmBaseUrl.trim() : "";
        const userApiKey = user.llmApiKey ? user.llmApiKey.trim() : "";

        if (user.llmProvider === "openai") {
          baseURL = (!userBaseURL || userBaseURL.includes("127.0.0.1") || userBaseURL.includes("localhost"))
            ? "https://api.openai.com/v1"
            : userBaseURL;
          apiKey = userApiKey || process.env.OPENAI_API_KEY || "";
          modelName = process.env.OPENAI_MODEL || "gpt-4o-mini";
        } else if (user.llmProvider === "gemini") {
          baseURL = (!userBaseURL || userBaseURL.includes("127.0.0.1") || userBaseURL.includes("localhost"))
            ? "https://generativelanguage.googleapis.com/v1beta/openai"
            : userBaseURL;
          apiKey = userApiKey || process.env.GEMINI_API_KEY || "";
          modelName = process.env.GEMINI_MODEL || "gemini-1.5-flash";
        } else {
          baseURL = userBaseURL || "http://127.0.0.1:1234/v1";
          baseURL = baseURL.replace(/\/+$/, "");
          if (!baseURL.endsWith("/v1")) {
            baseURL = `${baseURL}/v1`;
          }
          apiKey = userApiKey || "lm-studio";
          modelName = process.env.LOCAL_LLM_MODEL || "local-model";
        }
      }

      // Call LLM for compression
      const response = await axios.post(
        `${baseURL}/chat/completions`,
        {
          model: modelName,
          messages: [{ role: "system", content: prompt }],
          temperature: 0.3
        },
        {
          headers: apiKey ? { Authorization: `Bearer ${apiKey}` } : {}
        }
      );

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
