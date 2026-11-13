package com.example.notes.auth;

/**
 * Utilisateur stocké côté serveur. Le mot de passe n'est jamais conservé en
 * clair : seul son hash (BCrypt) est enregistré.
 */
public record User(
        String id,
        String firstName,
        String lastName,
        String email,
        String passwordHash) {
}
