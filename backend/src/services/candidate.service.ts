import { Prisma } from "@prisma/client";

import { CandidateRepository } from "../repositories/candidate.repository";
import { AppError } from "../errors/app.error";

export class CandidateService {
  private readonly repository: CandidateRepository;

  constructor() {
    this.repository = new CandidateRepository();
  }

  /**
   * Retourne les candidats paginés.
   */
  async getAll(skip = 0, take = 10) {
    return this.repository.findAll(skip, take);
  }

  /**
   * Retourne un candidat par son identifiant.
   */
  async getById(id: string) {
    const candidate = await this.repository.findById(id);

    if (!candidate) {
      throw new AppError("Candidat introuvable.", 404);
    }

    return candidate;
  }

  /**
   * Crée un candidat.
   */
  async create(data: Prisma.CandidateCreateInput) {
    const existingCandidate = await this.repository.findByEmail(
      data.email
    );

    if (existingCandidate) {
      throw new AppError(
        "Un candidat avec cet email existe déjà.",
        409
      );
    }

    return this.repository.create(data);
  }

  /**
   * Met à jour un candidat.
   */
  async update(
    id: string,
    data: Prisma.CandidateUpdateInput
  ) {
    await this.getById(id);

    return this.repository.update(id, data);
  }

  /**
   * Supprime un candidat.
   */
  async delete(id: string) {
    await this.getById(id);

    return this.repository.delete(id);
  }
}