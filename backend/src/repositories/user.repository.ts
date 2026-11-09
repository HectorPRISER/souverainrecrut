import { Prisma, User } from "@prisma/client";

import { prisma } from "../config/prisma";

export class UserRepository {
  /**
   * Retourne les utilisateurs paginés.
   */
  async findAll(skip = 0, take = 10) {
    const [items, total] = await Promise.all([
      prisma.user.findMany({
        skip,
        take,
        orderBy: {
          createdAt: "desc",
        },
      }),

      prisma.user.count(),
    ]);

    return {
      items,
      total,
    };
  }

  /**
   * Retourne un utilisateur par son identifiant.
   */
  async findById(id: string): Promise<User | null> {
    return prisma.user.findUnique({
      where: {
        id,
      },
    });
  }

  /**
   * Retourne un utilisateur par son email.
   */
  async findByEmail(email: string): Promise<User | null> {
    return prisma.user.findUnique({
      where: {
        email,
      },
    });
  }

  /**
   * Retourne le profil d'un utilisateur
   * sans exposer son mot de passe.
   */
  async findProfile(id: string) {
    return prisma.user.findUnique({
      where: {
        id,
      },
      select: {
        id: true,
        firstName: true,
        lastName: true,
        email: true,
        role: true,
        createdAt: true,
        updatedAt: true,
      },
    });
  }

  /**
   * Crée un utilisateur.
   */
  async create(data: Prisma.UserCreateInput): Promise<User> {
    return prisma.user.create({
      data,
    });
  }

  /**
   * Met à jour un utilisateur.
   */
  async update(
    id: string,
    data: Prisma.UserUpdateInput
  ): Promise<User> {
    return prisma.user.update({
      where: {
        id,
      },
      data,
    });
  }

  /**
   * Supprime un utilisateur.
   */
  async delete(id: string): Promise<User> {
    return prisma.user.delete({
      where: {
        id,
      },
    });
  }
}