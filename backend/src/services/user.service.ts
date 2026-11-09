import bcrypt from "bcrypt";
import { Prisma, User } from "@prisma/client";

import { UserRepository } from "../repositories/user.repository";
import { AppError } from "../errors/app.error";

export class UserService {
  private readonly repository: UserRepository;

  constructor() {
    this.repository = new UserRepository();
  }

  /**
   * Retourne les utilisateurs paginés.
   */
  async getAll(skip = 0, take = 10) {
    return this.repository.findAll(skip, take);
  }

  /**
   * Retourne un utilisateur par son identifiant.
   */
  async getById(id: string): Promise<User> {
    const user = await this.repository.findById(id);

    if (!user) {
      throw new AppError("Utilisateur introuvable.", 404);
    }

    return user;
  }

  /**
   * Retourne le profil de l'utilisateur connecté.
   */
  async getProfile(id: string) {
    const user = await this.repository.findProfile(id);

    if (!user) {
      throw new AppError("Utilisateur introuvable.", 404);
    }

    return user;
  }

  /**
   * Crée un utilisateur.
   */
  async create(data: Prisma.UserCreateInput): Promise<User> {
    const existingUser = await this.repository.findByEmail(
      data.email
    );

    if (existingUser) {
      throw new AppError(
        "Cet email est déjà utilisé.",
        409
      );
    }

    const hashedPassword = await bcrypt.hash(
      data.password,
      10
    );

    return this.repository.create({
      ...data,
      password: hashedPassword,
    });
  }

  /**
   * Met à jour un utilisateur.
   */
  async update(
    id: string,
    data: Prisma.UserUpdateInput
  ): Promise<User> {
    await this.getById(id);

    return this.repository.update(id, data);
  }

  /**
   * Supprime un utilisateur.
   */
  async delete(id: string): Promise<User> {
    await this.getById(id);

    return this.repository.delete(id);
  }
}