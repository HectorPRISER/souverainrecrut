export type ApplicationStatus =
  | "PENDING"
  | "REVIEWED"
  | "ACCEPTED"
  | "REJECTED";

export interface Application {
  id: string;

  candidateId: string;

  jobId: string;

  status: ApplicationStatus;

  createdAt: string;

  updatedAt: string;
}

/**
 * Liste des candidatures.
 */
export interface ApplicationsResponse {
  success: boolean;

  data: Application[];

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
export interface CreateApplicationRequest {
  candidateId: string;

  jobId: string;

  status?: ApplicationStatus;
}

/**
 * Modification.
 */
export interface UpdateApplicationRequest {
  candidateId?: string;

  jobId?: string;

  status?: ApplicationStatus;
}

/**
 * Utilisé par React Hook Form.
 */
export interface ApplicationFormData {
  candidateId: string;

  jobId: string;

  status: ApplicationStatus;
}

/**
 * Réponse API.
 */
export interface ApplicationResponse {
  success: boolean;

  data: Application;
}