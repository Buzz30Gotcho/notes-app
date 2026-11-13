package com.example.notes.auth.dto;

/**
 * Représentation publique d'un utilisateur (sans mot de passe).
 * Correspond au schéma User du contrat (openapi.yaml).
 */
public record UserResponse(
        String id,
        String firstName,
        String lastName,
        String email) {
}
