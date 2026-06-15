import { prisma } from "../lib/prisma";
import axios from "axios";

async function runDreamCadence() {
  console.log("Starting Dream Cadence...");
  
  // 1. Fetch Prisma Data for tomorrow
  const tomorrow = new Date();
  tomorrow.setDate(tomorrow.getDate() + 1);
  const endOfTomorrow = new Date(tomorrow);
  endOfTomorrow.setHours(23, 59, 59, 999);

  const tasks = await prisma.task.findMany({
    where: {
      dueDate: {
        gte: new Date(),
        lte: endOfTomorrow,
      },
    },
  });

  const events = await prisma.event.findMany({
    where: {
      date: {
        gte: new Date(),
        lte: endOfTomorrow,
      },
    },
  });

  // 2. Fetch Vector DB Data (simulate recent 24h context retrieval)
  const recentMessages = await prisma.chatMessage.findMany({
    where: {
      createdAt: {
        gte: new Date(Date.now() - 24 * 60 * 60 * 1000), // Last 24 hours
      },
    },
  });

  // 3. Construct prompt
  const prompt = `
    You are the central intelligence of Project Pantheon.
    Here are the tasks due by tomorrow: ${JSON.stringify(tasks)}
    Here are the events by tomorrow: ${JSON.stringify(events)}
    Here is the recent context from the last 24 hours: ${JSON.stringify(recentMessages.slice(-20))}
    
    Synthesize this into a cohesive, encouraging 3-paragraph "Morning Briefing" for the user.
  `;

  try {
    // 4. Call local LLM
    const response = await axios.post("http://localhost:8080/v1/chat/completions", {
      model: "local-model",
      messages: [{ role: "system", content: prompt }],
      temperature: 0.7
    });

    const content = response.data?.choices?.[0]?.message?.content;

    if (!content) {
      throw new Error("Local LLM returned no briefing content.");
    }

    // 5. Save to MorningBriefing
    // We use an upsert to avoid Unique constraint failure on 'date' if run multiple times
    const startOfToday = new Date();
    startOfToday.setHours(0, 0, 0, 0);

    await prisma.morningBriefing.upsert({
      where: { date: startOfToday },
      update: { content },
      create: {
        date: startOfToday,
        content,
      }
    });
    
    console.log("Dream Cadence completed successfully.");
  } catch (error) {
    console.error("Dream Cadence failed to contact local LLM or save:", error);
  }
}

runDreamCadence()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
