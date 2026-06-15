import { prisma } from "./src/lib/prisma";

async function main() {
  try {
    const res = await prisma.user.upsert({
      where: { email: "local-admin@pantheon.local" },
      update: { name: "Anuj" },
      create: { name: "Anuj", email: "local-admin@pantheon.local" }
    });
    console.log("Success", res);
  } catch (error) {
    console.error("Error:", error);
  }
}
main();
