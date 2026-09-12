import { app } from "./app.js";
import { env } from "./config/env.js";
import { prisma } from "./lib/prisma.js";

async function startServer(): Promise<void> {
  await prisma.$connect();

  const server = app.listen(env.PORT);
  await new Promise<void>((resolve, reject) => {
    server.once("listening", resolve);
    server.once("error", reject);
  });
  console.log(`MistriKhoj API is running on port ${env.PORT}`);

  let isShuttingDown = false;
  const shutdown = async (signal: string) => {
    if (isShuttingDown) return;
    isShuttingDown = true;
    console.log(`${signal} received. Closing the API...`);

    const forceShutdownTimer = setTimeout(() => {
      console.error("Graceful shutdown timed out; forcing exit.");
      server.closeAllConnections();
      process.exit(1);
    }, env.SHUTDOWN_TIMEOUT_MS);
    forceShutdownTimer.unref();

    server.close(async (error) => {
      clearTimeout(forceShutdownTimer);
      await prisma.$disconnect();
      process.exit(error ? 1 : 0);
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
