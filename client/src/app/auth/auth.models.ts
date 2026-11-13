/**
 * Types partagés avec le contrat d'API (openapi.yaml, section Authentification).
 */

export interface RegisterRequest {
  firstName: string;
  lastName: string;
  email: string;
  password: string;
}

export interface UserResponse {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
}

export interface AuthResponse {
  accessToken: string;
  tokenType: string;
  user: UserResponse;
}

/** Schéma Error du contrat. */
export interface ApiError {
  message: string;
}
