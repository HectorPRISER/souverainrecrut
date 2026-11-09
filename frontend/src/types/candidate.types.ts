export interface Candidate {
  id: string;

  fullName: string;

  email: string;

  phone?: string;

  createdAt: string;

  updatedAt: string;
}

/**
 * Réponse de la liste des candidats.
 */
export interface CandidatesResponse {
  success: boolean;

  data: Candidate[];

  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

/**
 * Création d'un candidat.
 */
export interface CreateCandidateRequest {
  fullName: string;

  email: string;

  phone?: string;
}

/**
 * Modification d'un candidat.
 */
export interface UpdateCandidateRequest {
  fullName?: string;

  email?: string;

  phone?: string;
}

/**
 * Utilisé par React Hook Form.
 */
export interface CandidateFormData {
  fullName: string;

  email: string;

  phone?: string;
}

/**
 * Réponse API pour un candidat.
 */
export interface CandidateResponse {
  success: boolean;

  data: Candidate;
}