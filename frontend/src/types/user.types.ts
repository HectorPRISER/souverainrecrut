export type UserRole =
  | "ADMIN"
  | "RECRUITER";

export interface User {
  id: string;

  firstName: string;

  lastName: string;

  email: string;

  role: UserRole;

  createdAt: string;

  updatedAt: string;
}

/**
 * Réponse de la liste des utilisateurs.
 */
export interface UsersResponse {
  success: boolean;

  data: User[];

  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

/**
 * Création d'un utilisateur.
 */
export interface CreateUserRequest {
  firstName: string;

  lastName: string;

  email: string;

  password: string;

  role: UserRole;
}

/**
 * Modification d'un utilisateur.
 * Le mot de passe devient optionnel.
 */
export interface UpdateUserRequest {
  firstName: string;

  lastName: string;

  email: string;

  password?: string;

  role: UserRole;
}

/**
 * Utilisé par React Hook Form.
 */
export interface UserFormData {
  firstName: string;

  lastName: string;

  email: string;

  password?: string;

  role: UserRole;
}

/**
 * Réponse API pour un utilisateur.
 */
export interface UserResponse {
  success: boolean;

  data: User;
}