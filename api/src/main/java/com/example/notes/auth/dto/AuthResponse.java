package com.example.notes.auth.dto;

/**
 * Réponse renvoyée après une authentification réussie.
 * Correspond au schéma AuthResponse du contrat (openapi.yaml).
 */
public record AuthResponse(
        String accessToken,
        String tokenType,
        UserResponse user) {
}
