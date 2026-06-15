/* eslint-disable @typescript-eslint/no-require-imports */
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient({});

async function main() {
  try {
    await prisma.user.upsert({
      where: { email: "local-admin@pantheon.local" },
      update: {
        name: "Test",
        llmProvider: "lmstudio",
        llmBaseUrl: "http://localhost:1234/v1",
        llmApiKey: ""
      },
      create: {
        name: "Test",
        email: "local-admin@pantheon.local",
        llmProvider: "lmstudio",
        llmBaseUrl: "http://localhost:1234/v1",
        llmApiKey: ""
      }
    });
    console.log("Success");
  } catch (error) {
    console.error("Error:", error);
  }
}

main();
