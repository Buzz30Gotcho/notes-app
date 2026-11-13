package com.example.notes.auth;

import java.util.Optional;

/**
 * Abstraction du stockage des utilisateurs. Permet de remplacer l'implémentation
 * en mémoire par une base de données (JPA/PostgreSQL) sans toucher au service.
 */
public interface UserRepository {

    boolean existsByEmail(String email);

    User save(User user);

    Optional<User> findByEmail(String email);
}
