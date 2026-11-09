import { Job, Prisma } from "@prisma/client";

import { prisma } from "../config/prisma";

export class JobRepository {
  /**
   * Retourne les offres d'emploi paginées.
   */
  async findAll(skip = 0, take = 10) {
    const [items, total] = await Promise.all([
      prisma.job.findMany({
        skip,
        take,
        orderBy: {
          createdAt: "desc",
        },
      }),

      prisma.job.count(),
    ]);

    return {
      items,
      total,
    };
  }

  /**
   * Retourne une offre par son identifiant.
   */
  async findById(id: string): Promise<Job | null> {
    return prisma.job.findUnique({
      where: {
        id,
      },
    });
  }

  /**
   * Crée une offre.
   */
  async create(
    data: Prisma.JobCreateInput
  ): Promise<Job> {
    return prisma.job.create({
      data,
    });
  }

  /**
   * Met à jour une offre.
   */
  async update(
    id: string,
    data: Prisma.JobUpdateInput
  ): Promise<Job> {
    return prisma.job.update({
      where: {
        id,
      },
      data,
    });
  }

  /**
   * Supprime une offre.
   */
  async delete(id: string): Promise<Job> {
    return prisma.job.delete({
      where: {
        id,
      },
    });
  }
}