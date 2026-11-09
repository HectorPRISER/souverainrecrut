import {
  Application,
  ApplicationStatus,
  Prisma,
} from "@prisma/client";

import { prisma } from "../config/prisma";

export class ApplicationRepository {
  /**
   * Retourne les candidatures paginées.
   */
  async findAll(skip = 0, take = 10) {
    const [items, total] = await Promise.all([
      prisma.application.findMany({
        skip,
        take,
        orderBy: {
          createdAt: "desc",
        },
        include: {
          candidate: true,
          job: true,
        },
      }),

      prisma.application.count(),
    ]);

    return {
      items,
      total,
    };
  }

  /**
   * Retourne une candidature par son identifiant.
   */
  async findById(id: string): Promise<Application | null> {
    return prisma.application.findUnique({
      where: {
        id,
      },
      include: {
        candidate: true,
        job: true,
      },
    });
  }

  /**
   * Crée une candidature.
   */
  async create(
    data: Prisma.ApplicationCreateInput
  ): Promise<Application> {
    return prisma.application.create({
      data,
      include: {
        candidate: true,
        job: true,
      },
    });
  }

  /**
   * Met à jour une candidature.
   */
  async update(
    id: string,
    data: Prisma.ApplicationUpdateInput
  ): Promise<Application> {
    return prisma.application.update({
      where: {
        id,
      },
      data,
      include: {
        candidate: true,
        job: true,
      },
    });
  }

  /**
   * Met à jour uniquement le statut.
   */
  async updateStatus(
    id: string,
    status: ApplicationStatus
  ): Promise<Application> {
    return prisma.application.update({
      where: {
        id,
      },
      data: {
        status,
      },
      include: {
        candidate: true,
        job: true,
      },
    });
  }

  /**
   * Supprime une candidature.
   */
  async delete(id: string): Promise<Application> {
    return prisma.application.delete({
      where: {
        id,
      },
    });
  }
}