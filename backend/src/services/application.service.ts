import {
  ApplicationStatus,
  Prisma,
} from "@prisma/client";

import { ApplicationRepository } from "../repositories/application.repository";
import { AppError } from "../errors/app.error";

export class ApplicationService {
  private readonly repository: ApplicationRepository;

  constructor() {
    this.repository = new ApplicationRepository();
  }

  /**
   * Retourne les candidatures paginées.
   */
  async getAll(skip = 0, take = 10) {
    return this.repository.findAll(skip, take);
  }

  /**
   * Retourne une candidature par son identifiant.
   */
  async getById(id: string) {
    const application = await this.repository.findById(id);

    if (!application) {
      throw new AppError("Candidature introuvable.", 404);
    }

    return application;
  }

  /**
   * Crée une candidature.
   */
  async create(data: Prisma.ApplicationCreateInput) {
    return this.repository.create(data);
  }

  /**
   * Met à jour une candidature.
   */
  async update(
    id: string,
    data: Prisma.ApplicationUpdateInput
  ) {
    await this.getById(id);

    return this.repository.update(id, data);
  }

  /**
   * Met à jour le statut d'une candidature.
   */
  async updateStatus(
    id: string,
    status: ApplicationStatus
  ) {
    await this.getById(id);

    return this.repository.updateStatus(id, status);
  }

  /**
   * Supprime une candidature.
   */
  async delete(id: string) {
    await this.getById(id);

    return this.repository.delete(id);
  }
}