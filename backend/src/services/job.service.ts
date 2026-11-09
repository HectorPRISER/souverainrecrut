import { Prisma } from "@prisma/client";

import { JobRepository } from "../repositories/job.repository";
import { AppError } from "../errors/app.error";

export class JobService {
  private readonly repository: JobRepository;

  constructor() {
    this.repository = new JobRepository();
  }

  /**
   * Retourne les offres d'emploi paginées.
   */
  async getAll(skip = 0, take = 10) {
    return this.repository.findAll(skip, take);
  }

  /**
   * Retourne une offre par son identifiant.
   */
  async getById(id: string) {
    const job = await this.repository.findById(id);

    if (!job) {
      throw new AppError("Offre introuvable.", 404);
    }

    return job;
  }

  /**
   * Crée une offre d'emploi.
   */
  async create(data: Prisma.JobCreateInput) {
    return this.repository.create(data);
  }

  /**
   * Met à jour une offre d'emploi.
   */
  async update(
    id: string,
    data: Prisma.JobUpdateInput
  ) {
    await this.getById(id);

    return this.repository.update(id, data);
  }

  /**
   * Supprime une offre d'emploi.
   */
  async delete(id: string) {
    await this.getById(id);

    return this.repository.delete(id);
  }
}