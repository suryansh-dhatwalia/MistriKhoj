import "dotenv/config";
import bcrypt from "bcrypt";
import { z } from "zod";
import { prisma } from "../lib/prisma.js";

const inputSchema = z.object({
  name: z.string().trim().min(2).max(120),
  email: z.string().trim().email().max(191).transform((email) => email.toLowerCase()),
  phone: z.string().trim().optional(),
  password: z
    .string()
    .min(8)
    .max(128)
    .regex(/[A-Z]/)
    .regex(/[a-z]/)
    .regex(/\d/),
});

async function createAdmin(): Promise<void> {
  const input = inputSchema.parse({
    name: process.env.ADMIN_NAME,
    email: process.env.ADMIN_EMAIL,
    phone: process.env.ADMIN_PHONE || undefined,
    password: process.env.ADMIN_PASSWORD,
  });

  const existing = await prisma.admin.findUnique({ where: { email: input.email } });
  if (existing) throw new Error("An administrator with this email already exists.");

  const passwordHash = await bcrypt.hash(input.password, 12);
  const admin = await prisma.admin.create({
    data: { name: input.name, email: input.email, phone: input.phone, passwordHash },
    select: { id: true, name: true, email: true },
  });

  console.log(`Administrator created: ${admin.name} (${admin.email}), ID ${admin.id}`);
}

createAdmin()
  .catch((error) => {
    console.error(error instanceof Error ? error.message : error);
    process.exitCode = 1;
  })
  .finally(async () => prisma.$disconnect());
