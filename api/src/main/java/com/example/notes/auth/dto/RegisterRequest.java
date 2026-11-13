package com.example.notes.auth.dto;

import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;

/**
 * Corps de la requête POST /auth/register.
 * Correspond au schéma RegisterRequest du contrat (openapi.yaml).
 */
public record RegisterRequest(
        @NotBlank String firstName,
        @NotBlank String lastName,
        @NotBlank @Email String email,
        @NotBlank @Size(min = 8) String password) {
}
