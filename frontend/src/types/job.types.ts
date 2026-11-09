export interface Job {
  id: string;

  title: string;

  description: string;

  location: string;

  company: string;

  recruiterId: string;

  createdAt: string;

  updatedAt: string;
}

/**
 * Liste des offres.
 */
export interface JobsResponse {
  success: boolean;

  data: Job[];

  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

/**
 * Création.
 */
export interface CreateJobRequest {
  title: string;

  description: string;

  location: string;

  company: string;

  recruiterId: string;
}

/**
 * Modification.
 */
export interface UpdateJobRequest {
  title?: string;

  description?: string;

  location?: string;

  company?: string;

  recruiterId?: string;
}

/**
 * Utilisé par React Hook Form.
 */
export interface JobFormData {
  title: string;

  description: string;

  location: string;

  company: string;

  recruiterId: string;
}

/**
 * Réponse API.
 */
export interface JobResponse {
  success: boolean;

  data: Job;
}