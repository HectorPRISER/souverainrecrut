import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import { Role } from "@prisma/client";

import { prisma } from "../src/config/prisma";

export const PASSWORD = "password123";

export async function resetDb(): Promise<void> {
  await prisma.application.deleteMany();
  await prisma.job.deleteMany();
  await prisma.candidate.deleteMany();
  await prisma.user.deleteMany();
}

let counter = 0;
const unique = () => `${Date.now()}-${++counter}`;

export async function createUser(role: Role = Role.RECRUITER, email?: string) {
  const user = await prisma.user.create({
    data: {
      firstName: "Test",
      lastName: role,
      email: email ?? `user-${unique()}@example.com`,
      password: await bcrypt.hash(PASSWORD, 4),
      role,
    },
  });
  return user;
}

export function tokenFor(user: { id: string; role: Role }): string {
  return jwt.sign({ id: user.id, role: user.role }, process.env.JWT_SECRET!, {
    expiresIn: "1h",
  });
}

export const bearer = (user: { id: string; role: Role }) => ({
  Authorization: `Bearer ${tokenFor(user)}`,
});

export async function createCandidate(email?: string) {
  return prisma.candidate.create({
    data: { fullName: "Mamadou Bah", email: email ?? `cand-${unique()}@example.com` },
  });
}

export async function createJob(recruiterId: string) {
  return prisma.job.create({
    data: {
      title: "Développeur Node",
      description: "Backend Express et Prisma",
      location: "Rennes",
      company: "SouverainTech",
      recruiterId,
    },
  });
}

export async function createApplication(candidateId: string, jobId: string) {
  return prisma.application.create({ data: { candidateId, jobId } });
}
