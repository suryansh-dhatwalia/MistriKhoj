import { app } from "./app.js";
import { env } from "./config/env.js";
import { prisma } from "./lib/prisma.js";

async function startServer(): Promise<void> {
  await prisma.$connect();

  const server = app.listen(env.PORT, () => {
    console.log(`MistriKhoj API is running at http://localhost:${env.PORT}`);
  });

  const shutdown = async (signal: string) => {
    console.log(`${signal} received. Closing the API...`);
    server.close(async () => {
      await prisma.$disconnect();
      process.exit(0);
    });
  };

  process.on("SIGINT", () => void shutdown("SIGINT"));
  process.on("SIGTERM", () => void shutdown("SIGTERM"));
}

startServer().catch(async (error) => {
  console.error("The API could not start:", error);
  await prisma.$disconnect();
  process.exit(1);
});
