import { Candidate, Prisma } from "@prisma/client";

import { prisma } from "../config/prisma";

export class CandidateRepository {
  /**
   * Retourne les candidats paginés.
   */
  async findAll(skip = 0, take = 10) {
    const [items, total] = await Promise.all([
      prisma.candidate.findMany({
        skip,
        take,
        orderBy: {
          createdAt: "desc",
        },
      }),

      prisma.candidate.count(),
    ]);

    return {
      items,
      total,
    };
  }

  /**
   * Retourne un candidat par son identifiant.
   */
  async findById(id: string): Promise<Candidate | null> {
    return prisma.candidate.findUnique({
      where: {
        id,
      },
    });
  }

  /**
   * Retourne un candidat par son email.
   */
  async findByEmail(email: string): Promise<Candidate | null> {
    return prisma.candidate.findUnique({
      where: {
        email,
      },
    });
  }

  /**
   * Crée un candidat.
   */
  async create(
    data: Prisma.CandidateCreateInput
  ): Promise<Candidate> {
    return prisma.candidate.create({
      data,
    });
  }

  /**
   * Met à jour un candidat.
   */
  async update(
    id: string,
    data: Prisma.CandidateUpdateInput
  ): Promise<Candidate> {
    return prisma.candidate.update({
      where: {
        id,
      },
      data,
    });
  }

  /**
   * Supprime un candidat.
   */
  async delete(id: string): Promise<Candidate> {
    return prisma.candidate.delete({
      where: {
        id,
      },
    });
  }
}