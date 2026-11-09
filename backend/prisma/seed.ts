import bcrypt from "bcrypt";
import {
  PrismaClient,
  Role,
  ApplicationStatus,
} from "@prisma/client";

const prisma = new PrismaClient();

async function main() {
  console.log("🌱 Début du seed...");

  // Nettoyage de la base
  await prisma.application.deleteMany();
  await prisma.job.deleteMany();
  await prisma.candidate.deleteMany();
  await prisma.user.deleteMany();

  // Hachage du mot de passe
  const hashedPassword = await bcrypt.hash("password123", 10);

  // Création du recruteur
  const recruiter = await prisma.user.create({
    data: {
      firstName: "Alice",
      lastName: "Diallo",
      email: "alice@souverainrecrut.com",
      password: hashedPassword,
      role: Role.RECRUITER,
    },
  });

  // Création d'un candidat
  const candidate = await prisma.candidate.create({
    data: {
      fullName: "Mamadou Bah",
      email: "mamadou@example.com",
      phone: "+224620000001",
    },
  });

  // Création d'une offre
  const job = await prisma.job.create({
    data: {
      title: "Développeur Full Stack",
      description: "Node.js / React",
      location: "Conakry",
      company: "SouverainTech",
      recruiterId: recruiter.id,
    },
  });

  // Création d'une candidature
  await prisma.application.create({
    data: {
      candidateId: candidate.id,
      jobId: job.id,
      status: ApplicationStatus.PENDING,
    },
  });

  console.log("✅ Seed terminé.");
}

main()
  .catch((error) => {
    console.error(error);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });